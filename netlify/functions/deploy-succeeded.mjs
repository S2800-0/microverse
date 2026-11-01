import {getStore} from '@netlify/blobs';

// Optional one-time release check runs inside Netlify when the author's
// network cannot reach its CDN. It contains no uploads or learner data.
// Claim before any paid request; redeploys and event retries never repeat it.
export default async function(){
  if(process.env.MICROVERSE_PUBLIC_VERIFY_ONCE!=='1')return;
  const store=getStore({name:'microverse-public-ai',consistency:'strong'}),key='verification/public-launch-v1';
  const previous=await store.getWithMetadata(key,{type:'json',consistency:'strong'});
  // A single access-only retry is safe after fixing the initial login gate:
  // the failed report proves no AI submission occurred. Never retry AI work.
  const accessRetry=previous?.data.phase==='failed'&&previous.data.ai===null&&previous.data.pages?.some(page=>page.status===401)&&!previous.data.accessRetry&&typeof previous.etag==='string';
  if(previous&&!accessRetry)return;
  const report={phase:'running',at:new Date().toISOString(),pages:[],ai:null,accessRetry};
  const claim=await store.setJSON(key,report,accessRetry?{onlyIfMatch:previous.etag}:{onlyIfNew:true});if(!claim.modified)return;
  try{
    const origin=new URL(process.env.URL).origin;
    report.origin=origin;
    for(const path of ['/storyboard.html','/forest-story.html','/src/scene/story-session.js','/privacy.html','/.env','/server/meta-provider.mjs']){
      const response=await fetch(origin+path,{redirect:'error',signal:AbortSignal.timeout(6000)});report.pages.push({path,status:response.status});await response.body?.cancel();
    }
    if(report.pages.some(({path,status})=>status!==(path==='/.env'||path.startsWith('/server/')?404:200)))throw new Error('Static route or private-file check failed.');
    const status=await fetch(origin+'/api/spark/status',{signal:AbortSignal.timeout(6000),cache:'no-store'}),service=await status.json();
    const cookie=status.headers.get('set-cookie')?.split(';')[0];
    report.status={http:status.status,enabled:service.enabled,provider:service.provider};
    if(!status.ok||!service.enabled||!cookie||typeof service.session!=='string')throw new Error('Reasoning backend unavailable.');
    const response=await fetch(origin+'/api/spark/run',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie,'X-Microverse-Session':service.session},body:JSON.stringify({operation:'propose',question:'Could you model rainfall at sixty-five percent of usual for seventeen weeks?',consent:true})});
    let result=await response.json();report.ai={http:response.status,phase:'submitted'};
    if(!response.ok)throw new Error(result.error||'Reasoning submission failed.');
    if(response.status===202){
      if(!/^[a-f0-9]{48}$/.test(result.job))throw new Error('Invalid job reference.');
      const id=result.job;report.ai.job=id;
      for(let i=0;i<17;i++){
        await new Promise(resolve=>setTimeout(resolve,1500));
        const poll=await fetch(origin+'/api/jobs/'+id,{signal:AbortSignal.timeout(6000),headers:{Cookie:cookie,'X-Microverse-Session':service.session}});result=await poll.json();
        if(!poll.ok)throw new Error(result.error||'Reasoning job failed.');
        if(poll.status===200){result=result.result;report.ai.phase='complete';break;}
      }
      if(report.ai.phase!=='complete'){report.ai.phase='still-pending';report.phase='pending';await store.setJSON(key,report);return;}
    }else report.ai.phase='complete';
    report.ai.provider=result.provider;report.ai.proposal=result.value;report.phase='passed';
  }catch(error){report.phase='failed';report.error=String(error.message).slice(0,250);}
  await store.setJSON(key,report);
}
