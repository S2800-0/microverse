import {readAiResult} from '../creature/public-job.js';
export async function readSparkService(){
  try{const r=await fetch('/api/spark/status',{cache:'no-store'});if(!r.ok)throw new Error();const s=await r.json();if(typeof s.session!=='string'||typeof s.enabled!=='boolean')throw new Error();return s;}
  catch{return {enabled:false,provider:'Local mode',reason:'Spark is unavailable here. Prepared questions, supported controls and local evidence work without it.'};}
}
export async function askSpark(service,input,signal){
  if(!service.enabled)throw new Error('Spark calls are paused.');
  const r=await fetch('/api/spark/run',{method:'POST',signal,headers:{'Content-Type':'application/json','X-Microverse-Session':service.session},body:JSON.stringify({...input,consent:true})});
  return readAiResult(r,{signal,session:service.session});
}
