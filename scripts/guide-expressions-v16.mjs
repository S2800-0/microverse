import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {parseEnv} from 'node:util';
import {createAvatarPainter} from '../server/avatar.mjs';
import {createBudget} from '../server/credit-budget.mjs';
const env=parseEnv(await readFile('../microverse-hackathon/.env','utf8'));
const budget=createBudget({path:fileURLToPath(new URL('../runtime/expansion-art/budget.json',import.meta.url)),capMicroUsd:2100000,reservationMicroUsd:50000});
const painter=createAvatarPainter({apiKey:env.MODEL_API_KEY,budget});
await mkdir('runtime/guide-v16',{recursive:true});
for(const [id,file,details] of [['fox','fox-portrait.png','Red fox: orange fur, cream muzzle and cheeks, dark ear tips. Head only; turn to face the viewer. No accessories.'],['clover','spark-clover.png','Orange-and-white tabby cat, green eyes, pink nose. Head only; turn to face the viewer. No accessories.']]){
 const receipt=`runtime/guide-v16/${id}-receipt.json`;try{await access(receipt);console.log(id+': already attempted; not retried');continue}catch(e){if(e.code!=='ENOENT')throw e}
 await writeFile(receipt,JSON.stringify({status:'attempted',source:file,approvedCapMicroUsd:2100000}));
 try{const input='data:image/png;base64,'+(await readFile('public/assets/'+file)).toString('base64');const d=await painter.run({image:input,details,consent:true});await writeFile(`runtime/guide-v16/${id}-sheet.png`,Buffer.from(d.atlas.split(',')[1],'base64'));await writeFile(receipt,JSON.stringify({status:'ready-for-review',source:file,provider:d.provider}));console.log(id+': ready for visual review')}catch(e){await writeFile(receipt,JSON.stringify({status:'failed',message:e.message}));console.log(id+': '+e.message)}
}
