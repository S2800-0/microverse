// One Muse Image call: one creature's eat, sleep and run drawings. Reserved first, no retry, cached per image.
import {createHash} from 'node:crypto';
import {creaturePosePrompt} from '../src/core/creature/pose-sheet.js';
import {validateAnimalIdentity} from '../src/core/creature/identity.js';
import {pngDimensions} from '../src/core/creature/contract.js';
export function createPoseSheet({apiKey,budget,fetchImpl=fetch}){
 const cache=new Map();let active=false;
 return {async run(input,{signal=null}={}){
  if(input?.consent!==true||Object.keys(input).some(k=>!['consent','image','identity'].includes(k)))throw Error('Choose to send this creature first.');
  pngDimensions(input.image,640);const identity=validateAnimalIdentity(input.identity);
  const key=createHash('sha256').update('pose-sheet-v19'+input.image+JSON.stringify(identity)).digest('hex');
  if(cache.has(key))return {atlas:cache.get(key),cached:true};if(active)throw Error('One creature is already being drawn.');active=true;
  try{await budget.reserve(key);signal?.throwIfAborted();
   const r=await fetchImpl('https://api.meta.ai/v1/images/edits',{method:'POST',redirect:'error',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(240000)]):AbortSignal.timeout(240000),headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:'muse-image-1.0',images:[{image_url:input.image}],prompt:creaturePosePrompt(identity),n:1,size:'1536x1024',output_format:'png',response_format:'b64_json',reasoning_strength:'low',tool_enablement:{enable_web_search:false,enable_image_search:false,enable_shell:false}})});
   if(!r.ok){await r.body?.cancel();throw Error('Drawn poses did not finish. No automatic retry was made.')}
   const d=await r.json();if(d.data?.length!==1||typeof d.data[0].b64_json!=='string'||d.data[0].b64_json.length>12000000)throw Error('The drawn poses could not be opened.');
   const atlas='data:image/png;base64,'+d.data[0].b64_json;pngDimensions(atlas,2048);if(cache.size>=3)cache.delete(cache.keys().next().value);cache.set(key,atlas);return {atlas,cached:false};
  }finally{active=false}
 }};
}
