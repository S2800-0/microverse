import {readJsonResponse} from './json-response.js';
const abort=()=>new DOMException('The request was cancelled.','AbortError');
function delay(ms,signal){return new Promise((resolve,reject)=>{
  if(signal?.aborted){reject(abort());return;}
  const stop=()=>{clearTimeout(timer);reject(abort());};
  const timer=setTimeout(()=>{signal?.removeEventListener('abort',stop);resolve();},ms);
  signal?.addEventListener('abort',stop,{once:true});
});}
// Local bridge responses stay synchronous. Public hosting queues once, then
// polls only the existing job; it never resubmits a paid POST automatically.
export async function readAiResult(response,{signal,session,fetchImpl=fetch,wait=delay}={}){
  let value=await readJsonResponse(response);if(!response.ok)throw new Error(value.error||'The AI request did not finish. No automatic retry.');
  if(response.status!==202)return value;
  if(!/^[a-f0-9]{48}$/.test(value.job))throw new Error('The creation queue returned an invalid reference.');
  const path=`/api/jobs/${value.job}`;
  for(let attempt=0;attempt<150;attempt++){
    await wait(2000,signal);if(signal?.aborted)throw abort();
    response=await fetchImpl(path,{signal,cache:'no-store',headers:{'X-Microverse-Session':session}});value=await readJsonResponse(response);
    if(!response.ok)throw new Error(value.error||'The creation could not finish. No automatic retry.');
    if(response.status===200&&value.result)return value.result;
    if(response.status!==202||value.pending!==true)throw new Error('The creation queue returned an invalid state.');
  }
  throw new Error('The creation is taking too long. No automatic retry was made.');
}
