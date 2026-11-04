// Offline asset preparation only. User authorized <= $1 Meta promotional-credit tests.
// Shared fixed reservations bound attempts; estimates are not a billing receipt.
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createBudget} from '../server/credit-budget.mjs';
const job=JSON.parse(await readFile(process.argv[2],'utf8'));
if(!/^[a-z0-9-]+$/.test(job.id)||typeof job.prompt!=='string'||!Array.isArray(job.sources)||job.sources.length>3)throw Error('Invalid job');
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'runtime/expansion-art');await mkdir(out,{recursive:true});
const receiptPath=resolve(out,job.id+'.json');try{await access(receiptPath);throw Error('Already attempted; no automatic retry')}catch(e){if(e.code!=='ENOENT')throw e}
const env=parseEnv(await readFile(resolve(root,'../microverse-hackathon/.env'),'utf8'));if(!env.MODEL_API_KEY)throw Error('Meta key missing');
const images=[];for(const path of job.sources){const b=await readFile(path);const ext=path.split('.').at(-1).toLowerCase();images.push({image_url:`data:image/${ext==='jpg'||ext==='jpeg'?'jpeg':ext==='webp'?'webp':'png'};base64,`+b.toString('base64')})}
const fingerprint=createHash('sha256').update(JSON.stringify(job)).digest('hex');
const budget=createBudget({path:resolve(out,'budget.json'),capMicroUsd:1000000,reservationMicroUsd:50000});await budget.reserve(fingerprint);
const receipt={id:job.id,model:'muse-image-1.0',prompt:job.prompt,sources:job.sources,at:new Date().toISOString(),reservationMicroUsd:50000,status:'attempted'};await writeFile(receiptPath,JSON.stringify(receipt,null,2));
try{
 const r=await fetch('https://api.meta.ai/v1/images/edits',{method:'POST',redirect:'error',signal:AbortSignal.timeout(240000),headers:{Authorization:'Bearer '+env.MODEL_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'muse-image-1.0',images,prompt:job.prompt,n:1,size:job.size||'1536x1024',output_format:'png',response_format:'b64_json',reasoning_strength:'high',tool_enablement:{enable_web_search:false,enable_image_search:false,enable_shell:false}})});
 if(!r.ok){await r.body?.cancel();throw Error('Meta HTTP '+r.status+'; no retry')}
 const d=await r.json();if(d.data?.length!==1||!d.data[0].b64_json)throw Error('No single result');const b=Buffer.from(d.data[0].b64_json,'base64');if(b.length>20000000||!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Invalid PNG');await writeFile(resolve(out,job.id+'.png'),b,{flag:'wx'});Object.assign(receipt,{status:'candidate',usage:d.usage,width:b.readUInt32BE(16),height:b.readUInt32BE(20),sha256:createHash('sha256').update(b).digest('hex')});
}catch(e){receipt.status='failed';receipt.error=e.message}
await writeFile(receiptPath,JSON.stringify(receipt,null,2));console.log(JSON.stringify({id:receipt.id,status:receipt.status,path:resolve(out,job.id+'.png'),error:receipt.error,width:receipt.width,height:receipt.height}));
