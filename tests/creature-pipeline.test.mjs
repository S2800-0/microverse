import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pngDimensions,validateCreatureRequest,applyCutoutMask} from '../src/creature/contract.js';
import {createBudget} from '../server/creature-budget.mjs';
import {createCreaturePipeline} from '../server/creature-pipeline.mjs';
import {createMetaProvider,parseSamResponse} from '../server/meta-provider.mjs';
import {createCreatureApi} from '../server/creature-api.mjs';
import {createPreviewServer} from '../scripts/preview.mjs';

// Header-only fixtures exercise transport/schema validation, not browser decoding.
function png(width=2,height=2){const h=Buffer.alloc(33);Buffer.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82]).copy(h);h.writeUInt32BE(width,16);h.writeUInt32BE(height,20);return `data:image/png;base64,${h.toString('base64')}`;}
const input=()=>({image:png(),profile:'dog',appearance:'black sunglasses',consent:true});
const mask=()=>({width:2,height:2,bounds:{left:0,top:0,right:2,bottom:2},data:Buffer.from([0,1,1,0]).toString('base64')});
function fakeProvider(){let paint=0,segment=0;return {get calls(){return {paint,segment};},async paint(){paint++;return png();},async segment(){segment++;return mask();}};}
const wire="<0f>0<|box;x1=211;y1=228;x2=270;y2=254;w=320;h=334|><|mask;x=0;y=0;data=27,60,~!!!!M!0c[0o91w?q1!pIH4pPRVp2B3'7`e.ioeAf6-k/#Xd8%dX9x(|>";
const sam=text=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text}]}]});

test('generation requires a supported role, processed PNG, bounded notes and explicit image consent',()=>{
  assert.equal(validateCreatureRequest(input()).profile,'dog');
  for(const change of [{consent:false},{profile:'penguin'},{image:'https://example.com/photo.png'},{image:png(641,1)},{appearance:'x'.repeat(121)},{apiKey:'secret'}])assert.throws(()=>validateCreatureRequest({...input(),...change}));
  assert.throws(()=>pngDimensions(png(5000,5000)),/dimensions/);
});
test('local cutout places a cropped row-major mask into source bounds and retains existing alpha',()=>{
  const pixels=new Uint8ClampedArray(4*3*4).fill(100);
  const m={width:2,height:1,bounds:{left:1,top:1,right:3,bottom:2},data:Buffer.from([1,0]).toString('base64')};
  applyCutoutMask(pixels,4,3,m);
  assert.equal(pixels[(1*4+1)*4+3],100);assert.equal(pixels[(1*4+2)*4+3],0);assert.equal(pixels[3],0);
  assert.equal(pixels[0],100); // RGB is preserved; only alpha is cut.
  assert.throws(()=>applyCutoutMask(pixels,4,3,{...m,data:Buffer.from([1,9]).toString('base64')}),/malformed/);
  assert.throws(()=>applyCutoutMask(pixels,4,3,{...m,bounds:{...m.bounds,right:5}}),/align/);
});
test('default/credit-paused pipelines never reserve or contact the provider',async()=>{
  const provider=fakeProvider();let reservations=0;const budget={async reserve(){reservations++;}};
  for(const settings of [{},{enabled:true},{creditsConfirmed:true}]){
    const p=createCreaturePipeline({provider,budget,...settings});assert.equal(p.status().enabled,false);await assert.rejects(p.run(input()),/paused/);
  }
  assert.equal(reservations,0);assert.deepEqual(provider.calls,{paint:0,segment:0});
});
test('the durable ledger reserves the complete job and a restarted budget cannot spend it again',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'microverse-budget-')),path=join(dir,'ledger.json');
  try{
    const b=createBudget({path,capMicroUsd:12500});await b.reserve('a'.repeat(64));
    await assert.rejects(createBudget({path,capMicroUsd:12500}).reserve('b'.repeat(64)),/exhausted/);
    const ledger=JSON.parse(await readFile(path,'utf8'));assert.equal(ledger.reservedMicroUsd,12500);assert.equal(ledger.attempts.length,1);
    assert(!JSON.stringify(ledger).includes('sunglasses'));
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('concurrent reservations cannot exceed the cap; a malformed ledger fails closed',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'microverse-budget-')),path=join(dir,'ledger.json');
  try{
    const a=createBudget({path,capMicroUsd:12500}),b=createBudget({path,capMicroUsd:12500});
    const results=await Promise.allSettled([a.reserve('a'.repeat(64)),b.reserve('b'.repeat(64))]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
    await writeFile(path,'{"version":1,"reservedMicroUsd":0,"attempts":[{}]}');
    await assert.rejects(a.reserve('c'.repeat(64)),/Invalid/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('successful repeated requests reuse cached image/mask without paying or calling again',async()=>{
  const provider=fakeProvider();let reservations=0;
  const p=createCreaturePipeline({enabled:true,creditsConfirmed:true,provider,budget:{async reserve(){reservations++;return {reservedMicroUsd:12500};}}});
  const first=await p.run(input());first.mask.data='mutated';
  const second=await p.run(input());assert.equal(second.cached,true);assert.equal(second.mask.data,mask().data);
  assert.equal(reservations,1);assert.deepEqual(provider.calls,{paint:1,segment:1});
  await p.run({...input(),appearance:'red collar'});assert.equal(reservations,2);
});
test('simultaneous identical requests share one job and a different image cannot start another',async()=>{
  let release;const gate=new Promise(resolve=>{release=resolve;});const provider=fakeProvider(),paint=provider.paint;provider.paint=async()=>{await gate;return paint();};let reservations=0;
  const p=createCreaturePipeline({enabled:true,creditsConfirmed:true,provider,budget:{async reserve(){reservations++;return {};}}});
  const a=p.run(input()),b=p.run(input());await assert.rejects(p.run({...input(),appearance:'different'}),/Another/);release();
  assert.deepEqual(await a,await b);assert.equal(reservations,1);assert.deepEqual(provider.calls,{paint:1,segment:1});
});
test('provider failure keeps the reservation and never retries or proceeds to segmentation',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'microverse-budget-')),path=join(dir,'ledger.json');let calls=0,segments=0;
  try{
    const p=createCreaturePipeline({enabled:true,creditsConfirmed:true,budget:createBudget({path,capMicroUsd:12500}),provider:{async paint(){calls++;throw new Error('inference failed');},async segment(){segments++;}}});
    await assert.rejects(p.run(input()),/inference/);await assert.rejects(p.run(input()),/exhausted/);
    assert.equal(calls,1);assert.equal(segments,0);assert.equal(JSON.parse(await readFile(path,'utf8')).reservedMicroUsd,12500);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('the actual SAM parser decodes a cropped official-format mask and rejects ambiguous/empty/malformed output',async()=>{
  const parsed=await parseSamResponse(sam(wire),320,334);
  assert.deepEqual(parsed.bounds,{left:211,top:228,right:271,bottom:255});assert.equal(parsed.width,60);assert.equal(Buffer.from(parsed.data,'base64').length,1620);
  for(const response of [sam(''),sam('not segmentation'),sam(wire+','+wire.slice(4).replace(/^0/,'1')),sam(wire.replace('~!!!!M','!broken')), {...sam(wire),status:'incomplete'}])await assert.rejects(parseSamResponse(response,320,334));
  await assert.rejects(parseSamResponse(sam(wire),20,20),/align/);
});
test('Meta requests use fixed model/routes, one image, no search tools, no redirects and no response storage for SAM',async()=>{
  const requests=[];
  const provider=createMetaProvider({apiKey:'test-only-not-a-real-key',fetchImpl:async(url,options)=>{
    requests.push({url,options,body:JSON.parse(options.body)});
    return new Response(JSON.stringify(url.endsWith('/images/edits')?{data:[{b64_json:png(320,334).slice(22)}]}:sam(wire)),{status:200});
  }});
  const image=await provider.paint(input(),AbortSignal.timeout(1000));const result=await provider.segment(image,'dog',AbortSignal.timeout(1000));
  assert.equal(result.width,60);assert.equal(requests.length,2);assert.equal(requests[0].url,'https://api.meta.ai/v1/images/edits');
  assert.equal(requests[0].options.redirect,'error');assert.equal(requests[0].body.n,1);assert.equal(requests[0].body.model,'muse-image-1.0');
  assert.deepEqual(Object.values(requests[0].body.tool_enablement),[false,false,false]);assert.match(requests[0].body.prompt,/sunglasses/);
  assert.equal(requests[1].body.model,'sam-3.1');assert.equal(requests[1].body.store,false);assert.equal(requests[1].body.metadata.mask_encoding,'one_bit');
});
test('provider HTTP errors are sanitized and are not retried',async()=>{
  let calls=0;const p=createMetaProvider({apiKey:'secret',fetchImpl:async()=>{calls++;return new Response('secret upstream body',{status:402});}});
  await assert.rejects(p.paint(input()),e=>e.message.includes('402')&&!e.message.includes('secret'));assert.equal(calls,1);
});
test('local API requires same origin, a session token and consent; private server files are unavailable',async()=>{
  const provider=fakeProvider();let reservations=0;
  const pipeline=createCreaturePipeline({enabled:true,creditsConfirmed:true,provider,budget:{async reserve(){reservations++;return {};}}});
  const server=createPreviewServer({creatureApi:createCreatureApi(pipeline)});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    const status=await fetch(base+'/api/creature/status').then(r=>r.json());assert.equal(status.enabled,true);assert(!JSON.stringify(status).includes('apiKey'));
    const send=(headers,body=input())=>fetch(base+'/api/creature/generate',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
    assert.equal((await send({})).status,403);
    assert.equal((await send({Origin:'https://example.com','X-Microverse-Session':status.session})).status,403);
    assert.equal((await send({Origin:base,'X-Microverse-Session':'é'.repeat(48)})).status,403);
    const headers={Origin:base,'X-Microverse-Session':status.session};
    assert.equal((await send(headers,{...input(),consent:false})).status,400);assert.equal(reservations,0);
    assert.equal((await send(headers)).status,200);assert.equal(reservations,1);
    assert.equal((await send(headers)).status,200);assert.equal(reservations,1);
    for(const path of ['/server/meta-provider.mjs','/.env','/runtime/meta-budget.json'])assert.equal((await fetch(base+path)).status,404);
  }finally{await new Promise(r=>server.close(r));}
});
