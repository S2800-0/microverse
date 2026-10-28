import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createBudget} from '../server/creature-budget.mjs';
import {parseSamMasks} from '../server/meta-provider.mjs';
import {META_ART_PLAN,META_ART_CAP} from './meta-art-plan.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const output=resolve(root,'runtime/meta-art-batch-2026-10-28');
const hash=b=>createHash('sha256').update(b).digest('hex');
async function jsonPost(route,body){
 const response=await fetch('https://api.meta.ai/v1'+route,{method:'POST',redirect:'error',signal:AbortSignal.timeout(240000),headers:{Authorization:`Bearer ${process.env.MODEL_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!response.ok){await response.body?.cancel();throw new Error(`Meta HTTP ${response.status}; no retry.`);}
 let length=0;const chunks=[];for await(const c of response.body){length+=c.length;if(length>20000000)throw new Error('Response size limit.');chunks.push(c);}
 return JSON.parse(Buffer.concat(chunks).toString());
}
async function save(receipt){await writeFile(resolve(output,receipt.id+'.json'),JSON.stringify(receipt,null,2),{mode:0o600});}
if(!process.argv.includes('--run')){console.log(JSON.stringify({capMicroUsd:META_ART_CAP,jobs:META_ART_PLAN.map(({id,kind})=>({id,kind})),note:'No calls made. Use --run with an explicitly funded key.'}));process.exit(0);}
if(!process.env.MODEL_API_KEY)throw new Error('Meta key missing.');
await mkdir(output,{recursive:true,mode:0o700});
const budget=createBudget({path:resolve(root,'runtime/meta-budget.json'),capMicroUsd:META_ART_CAP,reservationMicroUsd:12500});
for(const job of META_ART_PLAN){
 try{await access(resolve(output,job.id+'.json'));console.log(JSON.stringify({id:job.id,status:'already attempted; skipped'}));continue;}catch(e){if(e.code!=='ENOENT')throw e;}
 const receipt={id:job.id,label:job.label,kind:job.kind,at:new Date().toISOString(),imageModel:job.kind==='layer'?null:'muse-image-1.0',segmentationModel:job.segment?'sam-3.1':null,prompt:job.prompt||null,segment:job.segment||null,reservationMicroUsd:12500,imageCalls:0,samCalls:0,sourceReferences:[]};
 try{
  const images=[];
  for(const s of job.sources){const path=s.startsWith('@')?resolve(output,s.slice(1)+'.png'):resolve(root,s);const bytes=await readFile(path);receipt.sourceReferences.push({source:s,sha256:hash(bytes)});images.push({image_url:'data:image/png;base64,'+bytes.toString('base64')});}
  receipt.fingerprint=hash(JSON.stringify([job,receipt.sourceReferences]));
  await budget.reserve(receipt.fingerprint);await save(receipt);
  console.log(JSON.stringify({id:job.id,status:'reserved; starting'}));
  let image;
  if(job.kind!=='layer'){
   receipt.imageCalls=1;await save(receipt);
   const r=await jsonPost('/images/edits',{model:'muse-image-1.0',images,prompt:job.prompt,n:1,output_format:'png',response_format:'b64_json',size:job.size,reasoning_strength:'high',tool_enablement:{enable_web_search:false,enable_image_search:false,enable_shell:false}});
   if(r.data?.length!==1||typeof r.data[0].b64_json!=='string')throw new Error('No single image.');
   image=Buffer.from(r.data[0].b64_json,'base64');receipt.imageUsage=r.usage;
  }else image=Buffer.from(images[0].image_url.split(',')[1],'base64');
  if(!image.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error('Expected PNG.');
  receipt.width=image.readUInt32BE(16);receipt.height=image.readUInt32BE(20);
  if(receipt.width>4096||receipt.height>4096||receipt.width*receipt.height>4194304)throw new Error('Image dimensions exceed bound.');
  await writeFile(resolve(output,job.id+'.png'),image,{flag:'wx',mode:0o600});receipt.imageSha256=hash(image);await save(receipt);
  if(job.segment){
   receipt.samCalls=1;await save(receipt);
   const r=await jsonPost('/responses',{model:'sam-3.1',store:false,stream:false,input:[{type:'message',role:'user',content:[{type:'input_text',text:job.segment},{type:'input_image',image_url:'data:image/png;base64,'+image.toString('base64')}]}],metadata:{mask_encoding:'one_bit'}});
   const masks=await parseSamMasks(r,receipt.width,receipt.height,{maxMatches:job.kind==='walk'?8:job.kind==='layer'?12:1});
   if(!masks.length||(job.expectedMasks!==null&&masks.length!==job.expectedMasks))throw new Error(`Expected ${job.expectedMasks??'one or more'} masks, got ${masks.length}.`);
   await writeFile(resolve(output,job.id+'-masks.json'),JSON.stringify({width:receipt.width,height:receipt.height,masks}),{mode:0o600});receipt.maskCount=masks.length;receipt.maskBounds=masks.map(m=>m.bounds);receipt.samUsage=r.usage;
  }
  receipt.status='candidate';await save(receipt);console.log(JSON.stringify({id:job.id,status:receipt.status,width:receipt.width,height:receipt.height,masks:receipt.maskCount}));
 }catch(error){receipt.status='failed';receipt.error=error.message;await save(receipt);console.log(JSON.stringify({id:job.id,status:'failed',error:receipt.error}));}
}
console.log('Batch finished. Candidates require visual/geometry review before application use.');
