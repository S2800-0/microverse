import{test}from'node:test';import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';import{createHash}from'node:crypto';
import{PLACE_LABELS,unionMasks,decodePlaceLayers,validatePlaceRecord}from'../src/place/contract.js';
import{createPlaceService}from'../server/place-service.mjs';import{createMetaProvider,parseSamMasks,parseSamResponse}from'../server/meta-provider.mjs';
import{createForestController}from'../src/scene/controller.ts';import{createExperiment,experimentFromReplay}from'../src/scene/experiment.ts';
import{modelOnlyReplay,worksheetHtml,buildEvidence}from'../src/investigation/evidence.js';
import{createPreviewServer}from'../scripts/preview.mjs';import{createCreatureApi}from'../server/creature-api.mjs';
const data=values=>Buffer.from(values).toString('base64');
const mask=values=>({width:2,height:2,bounds:{left:0,top:0,right:2,bottom:2},data:data(values)});
const layers=()=>[{key:'grass',objects:1,data:data([1,1,0,0])},{key:'tree',objects:1,data:data([0,1,1,0])},{key:'water',objects:1,data:data([0,0,1,0])}];
function png(){const b=Buffer.alloc(33);Buffer.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82]).copy(b);b.writeUInt32BE(2,16);b.writeUInt32BE(2,20);return 'data:image/png;base64,'+b.toString('base64');}
const record=()=>({version:1,method:'sam-3.1',sourceHash:'a'.repeat(64),width:2,height:2,estimated:{grass:.25,tree:.25,water:.25},reviewed:{grass:.3,tree:.2,water:.2},start:{grass:.3,browse:.55},atWeek:0});
const wire="<0f>0<|box;x1=211;y1=228;x2=270;y2=254;w=320;h=334|><|mask;x=0;y=0;data=27,60,~!!!!M!0c[0o91w?q1!pIH4pPRVp2B3'7`e.ioeAf6-k/#Xd8%dX9x(|>";
const sam=text=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text}]}]});

test('instance union counts overlapping objects once and keeps cropped mask coordinates',()=>{
  const m=mask([1,0,0,1]);assert.deepEqual([...unionMasks([m,m],2,2)],[1,0,0,1]);assert.deepEqual([...unionMasks([],2,2)],[0,0,0,0]);
  assert.throws(()=>unionMasks([{...m,bounds:{left:0,top:0,right:3,bottom:2}}],2,2));
});
test('cross-label overlap uses explicit water/tree/grass priority with unclassified pixels retained',()=>{
  const result=decodePlaceLayers(2,2,layers());assert.deepEqual(result.coverage,{grass:.25,tree:.25,water:.25});assert.equal(result.overlapFraction,.5);assert.equal(result.unclassified,.25);assert.equal(result.rawCoverage.grass,.5);
  const empty=PLACE_LABELS.map(key=>({key,objects:0,data:data([0,0,0,0])}));assert.equal(decodePlaceLayers(2,2,empty).unclassified,1);
  assert.throws(()=>decodePlaceLayers(2,2,[...layers().slice(0,2),layers()[0]]));assert.throws(()=>decodePlaceLayers(2,2,layers().map(l=>({...l,objects:0}))));
});
test('SAM parser accepts multiple place masks/valid zero matches while animal import stays single-subject',async()=>{
  const multiple=sam(wire+','+wire.slice(4).replace(/^0/,'1'));
  assert.equal((await parseSamMasks(multiple,320,334)).length,2);await assert.rejects(parseSamResponse(multiple,320,334),/More than one/);
  assert.deepEqual(await parseSamMasks(sam(''),2,2),[]);await assert.rejects(parseSamResponse(sam(''),2,2),/No animal/);
  await assert.rejects(parseSamMasks(sam('not a structured mask'),2,2));
});
test('place provider fixes labels/routes and accepts empty class results without making them ecological absence',async()=>{
  let sent;const provider=createMetaProvider({apiKey:'fixture',fetchImpl:async(url,options)=>{sent={url,options,body:JSON.parse(options.body)};return new Response(JSON.stringify(sam('')));}});
  assert.deepEqual(await provider.segmentPlace(png(),'grass'),[]);assert.equal(sent.body.model,'sam-3.1');assert.equal(sent.body.input[0].content[0].text,'grass');assert.equal(sent.body.store,false);assert.equal(sent.options.redirect,'error');assert.equal(sent.url,'https://api.meta.ai/v1/responses');await assert.rejects(provider.segmentPlace(png(),'execute arbitrary text'));
});
test('place service has funding/consent gates, exactly three labels and successful repeat reuse',async()=>{
  const calls=[];let reserves=0;const provider={async segmentPlace(image,key){calls.push(key);return key==='water'?[]:[mask([1,0,0,0])];}},budget={async reserve(){reserves++;}};
  const off=createPlaceService({provider,budget});await assert.rejects(off.run({image:png(),consent:true}),/paused/);
  const service=createPlaceService({enabled:true,creditsConfirmed:true,provider,budget});await assert.rejects(service.run({image:png(),consent:false}));assert.equal(reserves,0);
  const result=await service.run({image:png(),consent:true});assert.deepEqual(calls,PLACE_LABELS);assert.equal(reserves,1);assert.equal(result.layers[2].objects,0);assert.equal((await service.run({image:png(),consent:true})).cached,true);assert.equal(calls.length,3);
});
test('partial SAM failure retains reservation and does not retry or apply anything',async()=>{
  let calls=0,reserves=0;const service=createPlaceService({enabled:true,creditsConfirmed:true,provider:{async segmentPlace(){calls++;throw Error('fixture failure');}},budget:{async reserve(){reserves++;}}});
  await assert.rejects(service.run({image:png(),consent:true}));assert.equal(calls,1);assert.equal(reserves,1);
});
test('reviewed place start changes only food arrays and records the explicit mapping',()=>{
  const c=createForestController();c.add({species:'dog',name:'Retain me'});const before=c.toSnapshot();c.applyPlaceStart(record());const after=c.toSnapshot();
  assert.deepEqual(after.world.animals,before.world.animals);assert.deepEqual(after.appearances,before.appearances);assert.equal(after.world.randomState,before.world.randomState);assert.deepEqual(after.world.params,before.world.params);assert.deepEqual(after.world.open,before.world.open);assert.deepEqual(after.world.events,before.world.events);
  assert(Math.abs(c.getState().grass-.3)<1e-7);assert(Math.abs(c.getState().browse-.55)<1e-7);assert.deepEqual(after.place.reviewed,record().reviewed);assert(!JSON.stringify(after.place).includes('image/png'));
});
test('invalid or stale place choices are rejected atomically and cannot change curated rules',()=>{
  const c=createForestController(),before=c.toSnapshot();
  for(const bad of [{...record(),reviewed:{grass:.8,tree:.4,water:0}},{...record(),start:{grass:2,browse:.5}},{...record(),sourceHash:'bad'},{...record(),code:'execute'},{...record(),atWeek:1},{...record(),estimated:null}]){
    assert.throws(()=>c.applyPlaceStart(bad));assert.deepEqual(c.toSnapshot(),before);
  }
  c.step();assert.throws(()=>c.applyPlaceStart(record()),/current forest week/);
  assert.throws(()=>validatePlaceRecord({...record(),start:{grass:.5,browse:.5,temperature:90}},0));
});
test('place metadata and inputs survive paired replay, stripped reruns and exact continuation',()=>{
  const c=createForestController();c.applyPlaceStart(record());const e=createExperiment(c.toSnapshot(),'drought');e.seek(26);const file=e.toReplay(),copy=experimentFromReplay(JSON.parse(JSON.stringify(file)));assert.deepEqual(copy.toReplay().initial.place,record());
  e.seek(80);copy.seek(80);assert.deepEqual(copy.getState().changed.world.toSnapshot(),e.getState().changed.world.toSnapshot());const clean=experimentFromReplay(modelOnlyReplay(file));assert.deepEqual(clean.toReplay().initial.place,record());
  const forged=structuredClone(file);forged.initial.world.params.species.rabbit.speed=200;assert.throws(()=>experimentFromReplay(forged),/rules/);c.reset();assert.equal(c.getState().place,null);
  assert(worksheetHtml(file,buildEvidence(experimentFromReplay(file))).includes('Place-inspired start'));
});
test('the public-domain recorded sample matches its source hash, manifest and recomputed mask arithmetic',async()=>{
  const root=new URL('../public/places/',import.meta.url),bytes=await readFile(new URL('garden-pond.png',root)),result=JSON.parse(await readFile(new URL('garden-pond-analysis.json',root))),manifest=JSON.parse(await readFile(new URL('manifest.json',root)));
  assert.equal(result.recorded,true);assert.equal(result.sourceHash,createHash('sha256').update('data:image/png;base64,'+bytes.toString('base64')).digest('hex'));assert.deepEqual(decodePlaceLayers(result.width,result.height,result.layers).coverage,result.coverage);
  for(const file of manifest.files)assert.equal(createHash('sha256').update(await readFile(new URL(file.file,root))).digest('hex'),file.sha256);
});
test('place route uses the same local session/origin boundary and hides private data',async()=>{
  const service={status:()=>({enabled:true}),run:async()=>({fixture:true})},server=createPreviewServer({placeApi:createCreatureApi(service,{prefix:'/api/place',action:'run'})});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
  try{const s=await fetch(base+'/api/place/status').then(r=>r.json());assert.equal((await fetch(base+'/api/place/run',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,403);assert.equal((await fetch(base+'/api/place/run',{method:'POST',headers:{'Content-Type':'application/json',Origin:base,'X-Microverse-Session':s.session},body:'{}'})).status,200);assert.equal((await fetch(base+'/runtime/place-budget.json')).status,404);}finally{await new Promise(r=>server.close(r));}
});
