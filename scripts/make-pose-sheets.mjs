// One-off saved art: draws eat/sleep/run poses for saved characters from their existing art.
// Each job reserves one $0.05 slot in the shared ledger. A job that already has a receipt never runs again.
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {createBudget} from '../server/credit-budget.mjs';
import {expansionAccess,EXPANSION_LEDGER} from '../server/expansion-access.mjs';
import {worldPosePrompt,creaturePosePrompt} from '../src/core/creature/pose-sheet.js';
const run=promisify(execFile),root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),assets=resolve(root,'public/assets'),out=resolve(root,'runtime/expansion-art');
const JOBS={
 woodland:{source:'woodland-neighbours-v12.png',target:'woodland-poses-v19.png',prompt:worldPosePrompt([{name:'wood mouse',look:'small brown wood mouse from the reference',family:'default'},{name:'owl',look:'brown owl from the reference',family:'bird'},{name:'fox',look:'red fox from the reference',family:'default'}])},
 pond:{source:'garden-neighbours-v12.png',target:'pond-poses-v19.png',prompt:worldPosePrompt([{name:'pond snail',look:'snail from the reference; it glides on its foot, with eye stalks',family:'default'},{name:'dragonfly',look:'dragonfly from the reference',family:'bird'},{name:'goldfish',look:'goldfish from the reference',family:'fish'}])},
 reef:{source:'reef-neighbours-v12.png',target:'reef-poses-v19.png',prompt:worldPosePrompt([{name:'yellow reef fish',look:'yellow reef fish from the reference',family:'fish'},{name:'shrimp',look:'shrimp from the reference',family:'fish'},{name:'parrotfish',look:'parrotfish from the reference',family:'fish'}])},
 sunny:{source:'companion-dog-painted.webp',target:'companion-dog-poses-v19.png',flatten:true,prompt:creaturePosePrompt({animal:'golden retriever dog',family:'quadruped',features:['golden coat','floppy ears']})},
 clover:{source:'companion-cat.png',target:'companion-cat-poses-v19.png',flatten:true,prompt:creaturePosePrompt({animal:'cat',family:'quadruped',features:['as shown in the reference']})},
};
const id=process.argv[2],job=JOBS[id];if(!job)throw Error('Choose: '+Object.keys(JOBS).join(', '));
const access_=expansionAccess();if(!access_.enabled)throw Error('The local AI test window is closed.');
await mkdir(out,{recursive:true});const receiptPath=resolve(out,'poses-'+id+'.json');
try{await access(receiptPath);throw Error('Already attempted; no automatic retry')}catch(e){if(e.code!=='ENOENT')throw e}
let source=resolve(assets,job.source);if(job.flatten){const flat=resolve(out,'poses-'+id+'-reference.png');await run('magick',[source,'-background','white','-alpha','remove','-alpha','off','-resize','1024x1024',flat]);source=flat}
const bytes=await readFile(source),mime=source.endsWith('.png')?'png':'webp',images=[{image_url:`data:image/${mime};base64,`+bytes.toString('base64')}];
const budget=createBudget({path:EXPANSION_LEDGER,capMicroUsd:access_.cap,reservationMicroUsd:50000});
await budget.reserve(createHash('sha256').update('pose-sheet-v19:'+id).digest('hex'));
const receipt={id,model:'muse-image-1.0',prompt:job.prompt,source:job.source,target:job.target,at:new Date().toISOString(),reservationMicroUsd:50000,status:'attempted'};await writeFile(receiptPath,JSON.stringify(receipt,null,1));
try{
 const r=await fetch('https://api.meta.ai/v1/images/edits',{method:'POST',redirect:'error',signal:AbortSignal.timeout(240000),headers:{Authorization:'Bearer '+access_.env.MODEL_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'muse-image-1.0',images,prompt:job.prompt,n:1,size:'1536x1024',output_format:'png',response_format:'b64_json',reasoning_strength:'high',tool_enablement:{enable_web_search:false,enable_image_search:false,enable_shell:false}})});
 if(!r.ok){await r.body?.cancel();throw Error('Meta HTTP '+r.status+'; no retry')}
 const d=await r.json();if(d.data?.length!==1||!d.data[0].b64_json)throw Error('No single result');
 await writeFile(resolve(assets,job.target),Buffer.from(d.data[0].b64_json,'base64'));receipt.status='saved';receipt.usage=d.usage;
}catch(e){receipt.status='failed';receipt.error=e.message}
await writeFile(receiptPath,JSON.stringify(receipt,null,1));console.log(JSON.stringify({id,status:receipt.status,error:receipt.error,target:job.target}));
