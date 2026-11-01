import {randomBytes} from 'node:crypto';
import {createPublicSecurity,publicError} from './public-security.mjs';
import {createPublicLedger} from './public-ledger.mjs';
import {PUBLIC_COSTS,publicServiceStatus,validatePublicInput,preparedPublicResult,createPublicService} from './public-services.mjs';
import {verifiedRelayIp} from './public-relay.mjs';

const headers={'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
function json(value,status=200,extra={}){
  const text=JSON.stringify(value);
  // Generated PNG + raster mask can exceed Netlify's buffered response limit.
  // Large results use its streaming response path (no repeated AI request).
  const body=text.length>4000000?new ReadableStream({start(controller){const encoder=new TextEncoder();for(let i=0;i<text.length;i+=65536)controller.enqueue(encoder.encode(text.slice(i,i+65536)));controller.close();}}):text;
  return new Response(body,{status,headers:{...headers,...extra}});
}
async function boundedJson(request,maxBytes=2900000){
  if(request.headers.get('content-type')?.split(';')[0]!=='application/json')throw publicError('Use a JSON request.',415);
  if(Number(request.headers.get('content-length'))>maxBytes)throw publicError('Please use a smaller image or recording.',413);
  const reader=request.body?.getReader();if(!reader)throw publicError('Missing request.');
  const chunks=[];let length=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>maxBytes){await reader.cancel();throw publicError('Please use a smaller image or recording.',413);}chunks.push(value);}}
  finally{reader.releaseLock();}
  try{return JSON.parse(Buffer.concat(chunks).toString());}catch{throw publicError('Invalid request JSON.');}
}

export function createPublicApi({env,store,now=Date.now,fetchImpl=fetch}){
  const security=createPublicSecurity(env.MICROVERSE_PUBLIC_SESSION_SECRET,{now});
  const origin=new URL(env.URL).origin;
  const ledger=createPublicLedger(store,{capMicroUsd:Number(env.MICROVERSE_PUBLIC_CAP_MICRO_USD||0),now});
  return async(request,{ip}={})=>{
    try{
      if(new URL(request.url).origin!==origin)throw publicError('AI requests are available on the published site.',403);
      const path=new URL(request.url).pathname;
      const route=path.match(/^\/api\/(creature|spark|place|speech|narration)\/(status|generate|run)$/);
      if(route&&route[2]==='status'&&request.method==='GET'){
        const session=security.session(request);
        return json({...publicServiceStatus(route[1],env),session:session.token},200,session.cookie?{'Set-Cookie':session.cookie}:{});
      }
      // GET polling carries an explicit same-origin header because GET has no
      // Origin header in ordinary browsers. The signed cookie binds its owner.
      if(path.startsWith('/api/jobs/')&&request.method==='GET'){
        const session=security.authorize(new Request(request,{headers:new Headers([...request.headers,['Origin',origin]])}),origin);
        const id=path.slice('/api/jobs/'.length);if(!/^[a-f0-9]{48}$/.test(id))throw publicError('Unknown creation.',404);
        const job=await store.get(`jobs/${id}`,{type:'json',consistency:'strong'});
        if(!job||job.owner!==security.hash(`owner:${session.id}`))throw publicError('This creation belongs to another session.',404);
        if(job.expires<=now())throw publicError('This preview expired. Its request was not retried.',410);
        if(job.phase==='failed')return json({error:'The AI request did not finish. No automatic retry was made. Prepared examples still work.'},400);
        if(job.phase==='complete')return json({result:security.decrypt(job.payload)});
        if(now()-job.created>300000)throw publicError('This request timed out. It was not retried or refunded automatically.',408);
        return json({pending:true},202);
      }
      if(!route||route[2]==='status'||request.method!=='POST'||(route[1]==='creature')!==(route[2]==='generate'))throw publicError('Unknown action.',404);
      const name=route[1],session=security.authorize(request,origin);
      if(!publicServiceStatus(name,env).enabled)throw publicError(publicServiceStatus(name,env).reason,503);
      ip=verifiedRelayIp(request,env.MICROVERSE_PROXY_SECRET,{now})||ip;
      if(typeof ip!=='string'||!ip)throw publicError('The hosting network could not verify this request. No AI call was sent.',503);
      const input=validatePublicInput(name,await boundedJson(request,name==='speech'?1000000:2900000));
      const prepared=preparedPublicResult(name,input);if(prepared)return json(prepared);
      const id=randomBytes(24).toString('hex'),created=now(),owner=security.hash(`owner:${session.id}`);
      const reservation=await ledger.reserve({id,cost:PUBLIC_COSTS[name],visitor:security.hash(`visitor:${session.id}`),network:security.hash(`network:${Math.floor(created/86400000)}:${ip}`)});
      const job={version:1,name,owner,created,expires:created+900000,phase:'queued',reservation,payload:security.encrypt(input)};
      const stored=await store.setJSON(`jobs/${id}`,job,{onlyIfNew:true});if(!stored.modified)throw publicError('The creation could not be queued. No automatic retry was made.',503);
      // Only signed job IDs enter the background invocation, never photos.
      const response=await fetchImpl(`${origin}/.netlify/functions/ai-worker-background`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json'},body:JSON.stringify({id,signature:security.workerSignature(id)})});
      if(response.status!==202){await response.body?.cancel();throw publicError('The background queue is unavailable. No automatic retry was made.',503);}
      await response.body?.cancel();return json({job:id},202);
    }catch(error){return json({error:error.publicMessage||'This request could not be processed. No automatic retry was made.'},error.status||400);}
  };
}

export async function runPublicJob({request,env,store,now=Date.now,makeService=createPublicService}){
  const security=createPublicSecurity(env.MICROVERSE_PUBLIC_SESSION_SECRET,{now});
  let body;try{body=await boundedJson(request,1000);}catch{return;}
  if(!body||Object.keys(body).some(k=>!['id','signature'].includes(k))||typeof body.id!=='string'||!security.verifyWorker(body.id,body.signature))return;
  const key=`jobs/${body.id}`,entry=await store.getWithMetadata(key,{type:'json',consistency:'strong'});
  if(!entry||typeof entry.etag!=='string'||entry.data.phase!=='queued'||entry.data.expires<=now()||now()-entry.data.created>60000)return;
  const job=entry.data;
  // Platform retries/concurrent deliveries cannot repeat the provider attempt.
  const claim=await store.setJSON(key,{...job,phase:'running'},{onlyIfMatch:entry.etag});if(!claim.modified)return;
  let output;
  try{
    if(!publicServiceStatus(job.name,env).enabled)throw new Error('Public AI disabled.');
    const service=makeService(job.name,env,job.reservation),result=await service.run(security.decrypt(job.payload));
    output={...job,phase:'complete',payload:security.encrypt(result)};
  }catch{output={...job,phase:'failed',payload:null};}
  // Overwrite input on both success and failure. Photos/clips aren't logs.
  try{await store.setJSON(key,output);}finally{await createPublicLedger(store,{capMicroUsd:Number(env.MICROVERSE_PUBLIC_CAP_MICRO_USD||0),now}).finish(body.id);}
}

export async function cleanPublicJobs(store,{now=Date.now}={}){
  const {blobs}=await store.list({prefix:'jobs/'});
  let removed=0;
  for(const {key}of blobs){const job=await store.get(key,{type:'json',consistency:'strong'});if(job&&job.expires<=now()){await store.delete(key);removed++;}}
  return removed;
}
