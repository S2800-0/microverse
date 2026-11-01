import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPublicSecurity} from '../server/public-security.mjs';
import {createPublicLedger} from '../server/public-ledger.mjs';
import {createPublicApi,runPublicJob,cleanPublicJobs} from '../server/public-api.mjs';
import {validatePublicInput,publicServiceStatus} from '../server/public-services.mjs';
import {readAiResult} from '../src/creature/public-job.js';
import {createStorySession} from '../src/scene/story-session.ts';
import {signRelay,verifiedRelayIp,createVercelRelay} from '../server/public-relay.mjs';

// In-memory adapter implements the documented Netlify ETag/conditional-write
// contract. Each get returns a defensive copy so races are real in the tests.
function memoryStore(){
  const data=new Map();let version=0;
  return {data,async getWithMetadata(key){const entry=data.get(key);return entry?structuredClone(entry):null;},
    async get(key){return structuredClone(data.get(key)?.data??null);},
    async setJSON(key,value,options={}){const old=data.get(key);if(options.onlyIfNew&&old||options.onlyIfMatch&&old?.etag!==options.onlyIfMatch)return {modified:false};const etag=String(++version);data.set(key,{data:structuredClone(value),etag});return {modified:true,etag};},
    async list({prefix}){return {blobs:[...data.keys()].filter(key=>key.startsWith(prefix)).map(key=>({key}))};},async delete(key){data.delete(key);}};
}
const env={URL:'https://microverse-example.netlify.app',MODEL_API_KEY:'fixture-not-a-real-key',BASETEN_API_KEY:'fixture-not-a-real-key',MICROVERSE_SPARK_PROVIDER:'baseten',MICROVERSE_PUBLIC_AI_ENABLED:'1',MICROVERSE_PUBLIC_CREDITS_CONFIRMED:'1',MICROVERSE_PUBLIC_CAP_MICRO_USD:'1000000',MICROVERSE_PUBLIC_SESSION_SECRET:'fixture-secret-'.repeat(8)};
const request=(path,options={})=>new Request(env.URL+path,options);
function png(){const h=Buffer.alloc(33);Buffer.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82]).copy(h);h.writeUInt32BE(2,16);h.writeUInt32BE(2,20);return 'data:image/png;base64,'+h.toString('base64');}
const input=()=>({image:png(),profile:'dog',appearance:'black sunglasses',consent:true});
async function session(api){const response=await api(request('/api/creature/status'));const status=await response.json();return {cookie:response.headers.get('set-cookie').split(';')[0],session:status.session};}
const post=(path,body,s)=>request(path,{method:'POST',headers:{Cookie:s.cookie,Origin:env.URL,'X-Microverse-Session':s.session,'Content-Type':'application/json'},body:JSON.stringify(body)});
const poll=(id,s)=>request('/api/jobs/'+id,{headers:{Cookie:s.cookie,'X-Microverse-Session':s.session}});

test('public cookie survives instances, rejects forgery/expiry/origin errors and encrypts authenticated job payloads',()=>{
  let time=1800000000000;const a=createPublicSecurity(env.MICROVERSE_PUBLIC_SESSION_SECRET,{now:()=>time}),b=createPublicSecurity(env.MICROVERSE_PUBLIC_SESSION_SECRET,{now:()=>time});
  const issued=a.session(request('/api/creature/status')),s={cookie:issued.cookie.split(';')[0],session:issued.token};
  assert.equal(b.authorize(post('/api/creature/generate',input(),s),env.URL).id,issued.id);
  assert.throws(()=>b.authorize(post('/api/creature/generate',input(),{...s,session:'bad'}),env.URL),/Microverse/);
  assert.throws(()=>b.authorize(new Request('https://evil.example',{headers:{Cookie:s.cookie,Origin:'https://evil.example','X-Microverse-Session':s.session}}),env.URL),/Microverse/);
  const encrypted=a.encrypt(input());assert(!encrypted.includes('sunglasses'));assert.deepEqual(b.decrypt(encrypted),input());
  assert.throws(()=>b.decrypt('x'+encrypted.slice(1)));time+=86400001;assert.throws(()=>b.authorize(post('/api/creature/generate',input(),s),env.URL),/Microverse/);
});

test('public ledger atomically limits concurrent instances and cannot reset allowance after redeploy',async()=>{
  const store=memoryStore(),now=()=>1800000000000;
  const jobs=Array.from({length:12},(_,i)=>({id:(i+1).toString(16).padStart(48,'0'),cost:12500,visitor:(i+1).toString(16).padStart(64,'0'),network:(i+20).toString(16).padStart(64,'0')}));
  const results=await Promise.allSettled(jobs.map(job=>createPublicLedger(store,{capMicroUsd:12500,now}).reserve(job)));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal((await store.get('budget/public-pilot-v1')).reservedMicroUsd,12500);
  await assert.rejects(createPublicLedger(store,{capMicroUsd:12500,now}).reserve(jobs[10]),/allowance/);
  const row=await store.get('budget/public-pilot-v1');row.reservedMicroUsd=0;await store.setJSON('budget/public-pilot-v1',row);
  await assert.rejects(createPublicLedger(store,{capMicroUsd:12500,now}).reserve(jobs[10]),/operator/);
});

test('rate and active-job limits hold across new sessions on the same network',async()=>{
  const store=memoryStore();let time=1800000000000;const ledger=createPublicLedger(store,{capMicroUsd:1000000,now:()=>time});
  for(let i=0;i<6;i++){const id=(i+1).toString(16).padStart(48,'0');await ledger.reserve({id,cost:1000,visitor:(i+1).toString(16).padStart(64,'0'),network:'f'.repeat(64)});await ledger.finish(id);time+=10001;}
  await assert.rejects(ledger.reserve({id:'c'.repeat(48),cost:1000,visitor:'e'.repeat(64),network:'f'.repeat(64)}),/six/);
  time+=86400000;await ledger.reserve({id:'d'.repeat(48),cost:1000,visitor:'e'.repeat(64),network:'f'.repeat(64)});
});

test('missing storage ETags cannot turn an atomic reservation into an unconditional write',async()=>{
  let writes=0;const store={getWithMetadata:async()=>({data:{}}),setJSON:async()=>{writes++;}};
  await assert.rejects(createPublicLedger(store,{capMicroUsd:1000000}).reserve({id:'a'.repeat(48),cost:1000,visitor:'b'.repeat(64),network:'c'.repeat(64)}),/safe reservation/);assert.equal(writes,0);
});

test('public API validates before reserving, dispatches only signed IDs and scopes encrypted jobs to their owner',async()=>{
  const store=memoryStore();let dispatch;
  const api=createPublicApi({env,store,fetchImpl:async(url,options)=>{dispatch={url,...JSON.parse(options.body)};return new Response(null,{status:202});}}),s=await session(api);
  assert.equal((await api(post('/api/creature/generate',{...input(),consent:false},s),{ip:'127.0.0.2'})).status,400);assert.equal(store.data.size,0);
  assert.equal((await api(post('/api/creature/generate',input(),{...s,session:'bad'}),{ip:'127.0.0.2'})).status,403);
  const response=await api(post('/api/creature/generate',input(),s),{ip:'127.0.0.2'});assert.equal(response.status,202);const {job}=await response.json();
  assert.equal(dispatch.id,job);assert.equal(Object.keys(dispatch).length,3);assert(!JSON.stringify([...store.data]).includes('sunglasses'));
  assert.equal((await api(poll(job,s))).status,202);assert.equal((await api(poll(job,await session(api)))).status,404);
  let calls=0;const workerRequest=()=>new Request(dispatch.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:job,signature:dispatch.signature})});
  await Promise.all([1,2,3].map(()=>runPublicJob({request:workerRequest(),env,store,makeService:()=>({run:async value=>{calls++;return {provider:'fixture',appearance:value.appearance};}})})));
  assert.equal(calls,1);const result=await (await api(poll(job,s))).json();assert.equal(result.result.appearance,'black sunglasses');
  const saved=await store.get('jobs/'+job);assert.equal(saved.phase,'complete');assert(!JSON.stringify(saved).includes('sunglasses'));
  await runPublicJob({request:workerRequest(),env,store,makeService:()=>{throw new Error('must never retry');}});assert.equal(calls,1);
});

test('unsigned background requests cannot call providers; failures keep reservations, remove input and expire',async()=>{
  const store=memoryStore();let dispatch,time=1800000000000;
  const api=createPublicApi({env,store,now:()=>time,fetchImpl:async(url,opts)=>{dispatch={url,...JSON.parse(opts.body)};return new Response(null,{status:202});}}),s=await session(api);
  const {job}=await (await api(post('/api/creature/generate',input(),s),{ip:'fixture-ip'})).json();let calls=0;
  const worker=signature=>runPublicJob({env,store,now:()=>time,request:new Request(dispatch.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:job,signature})}),makeService:()=>({run:async()=>{calls++;throw new Error('provider failed');}})});
  await worker('bad');assert.equal(calls,0);await worker(dispatch.signature);await worker(dispatch.signature);assert.equal(calls,1);
  const failed=await store.get('jobs/'+job);assert.equal(failed.payload,null);assert.equal(failed.phase,'failed');assert.equal((await store.get('budget/public-pilot-v1')).reservedMicroUsd,12500);
  assert.equal((await api(poll(job,s))).status,400);time+=900001;assert.equal((await api(poll(job,s))).status,410);assert.equal(await cleanPublicJobs(store,{now:()=>time}),1);assert.equal(await store.get('jobs/'+job),null);
});

test('public reasoning strips learner notes before queueing and unfunded services fail closed',()=>{
  const replay=createStorySession().replay('private prediction','private reflection','private school');
  const value=validatePublicInput('spark',{operation:'guide',question:'What changed?',replay,consent:true});
  assert(!JSON.stringify(value).includes('private'));
  assert.equal(publicServiceStatus('creature',{}).enabled,false);assert.equal(publicServiceStatus('narration',env).enabled,false);assert.equal(publicServiceStatus('spark',env).enabled,true);
});

test('browser polls an existing job only, supports local responses and aborts without another paid POST',async()=>{
  const job='a'.repeat(48),paths=[];
  assert.deepEqual(await readAiResult(Response.json({local:true})),{local:true});
  const result=await readAiResult(Response.json({job},{status:202}),{session:'fixture',wait:async()=>{},fetchImpl:async(path,options)=>{paths.push({path,options});return paths.length===1?Response.json({pending:true},{status:202}):Response.json({result:{done:true}});}});
  assert.deepEqual(result,{done:true});assert(paths.every(x=>x.path==='/api/jobs/'+job&&!x.options.method));
  const controller=new AbortController();controller.abort();let polls=0;
  await assert.rejects(readAiResult(Response.json({job},{status:202}),{signal:controller.signal,wait:async()=>{},fetchImpl:async()=>{polls++;}}),{name:'AbortError'});assert.equal(polls,0);
});

test('only a fresh server-signed relay can supply the visitor network for shared limits',()=>{
  const secret='relay-fixture-'.repeat(8),at=1800000000000;
  const headers=signRelay(secret,{method:'POST',path:'/api/spark/run',ip:'192.0.2.15',at});
  const req=new Request(env.URL+'/api/spark/run',{method:'POST',headers});
  assert.equal(verifiedRelayIp(req,secret,{now:()=>at}),'192.0.2.15');
  assert.equal(verifiedRelayIp(req,'wrong-secret',{now:()=>at}),null);
  assert.equal(verifiedRelayIp(req,secret,{now:()=>at+60001}),null);
  assert.equal(verifiedRelayIp(new Request(env.URL+'/api/place/run',{method:'POST',headers}),secret,{now:()=>at}),null);
  assert.equal(verifiedRelayIp(new Request(env.URL+'/api/spark/run',{method:'POST',headers:{...headers,'x-microverse-relay-ip':'192.0.2.16'}}),secret,{now:()=>at}),null);
});

test('Vercel relay is bounded to the existing API and preserves session cookies and streamed results',async()=>{
  const secret='relay-fixture-'.repeat(8),at=1800000000000;let sent,calls=0;
  const relay=createVercelRelay({secret,now:()=>at,fetchImpl:async(url,options)=>{calls++;sent={url,...options};return new Response('fixture-stream',{status:202,headers:{'Set-Cookie':'__Host-microverse=fixture; Secure; HttpOnly; Path=/; SameSite=Strict','Content-Type':'application/json'}});}});
  const origin='https://microverse-example.vercel.app';
  const response=await relay(new Request(origin+'/api?route=creature/generate',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','x-vercel-forwarded-for':'192.0.2.15',Cookie:'__vercel_sso=private; __Host-microverse=fixture-cookie','X-Microverse-Session':'fixture-token'},body:JSON.stringify(input())}));
  assert.equal(response.status,202);assert.equal(await response.text(),'fixture-stream');assert(response.headers.get('Set-Cookie').includes('HttpOnly'));
  assert.equal(sent.url,'https://microverse-shahesta.netlify.app/api/creature/generate');assert.equal(sent.headers.get('origin'),'https://microverse-shahesta.netlify.app');assert.equal(sent.headers.get('cookie'),'__Host-microverse=fixture-cookie');
  assert.equal(verifiedRelayIp(new Request(sent.url,{method:'POST',headers:sent.headers}),secret,{now:()=>at}),'192.0.2.15');
  assert.equal((await relay(new Request(origin+'/api?route=../../.env'))).status,404);
  assert.equal((await relay(new Request(origin+'/api/spark/run',{method:'POST',headers:{Origin:'https://evil.example'}}))).status,403);
  assert.equal((await relay(new Request(origin+'/api/spark/status'))).status,503);assert.equal(calls,1);
});
