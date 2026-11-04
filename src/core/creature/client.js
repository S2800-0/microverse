import {validateAnimalIdentity} from './identity.js';
import {PROMPT_VERSION,pngDimensions,applyCutoutMask} from './contract.js';
import {readAiResult} from './public-job.js';

export async function composeCreatureCutout(result){
  const {width,height}=pngDimensions(result.image);
  const image=new Image();image.src=result.image;await image.decode();
  if(image.naturalWidth!==width||image.naturalHeight!==height)throw new Error('The illustration dimensions do not match.');
  const full=document.createElement('canvas');full.width=width;full.height=height;
  const ctx=full.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,width,height);applyCutoutMask(pixels.data,width,height,result.mask);ctx.putImageData(pixels,0,0);
  const c=document.createElement('canvas');c.width=c.height=640;
  const scale=Math.min(640/width,640/height);
  c.getContext('2d').drawImage(full,(640-width*scale)/2,(640-height*scale)/2,width*scale,height*scale);
  return c.toDataURL('image/png');
}
export async function readCreatureService(){
  try{
    const response=await fetch('/api/creature/status',{cache:'no-store'});
    if(!response.ok)throw new Error();
    const value=await response.json();if(typeof value.session!=='string'||typeof value.enabled!=='boolean')throw new Error();return value;
  }catch{return {enabled:false,reason:'Local mode. Meta generation needs the configured local bridge; local import and review still work.'};}
}
export async function generateCreature(input,service,signal){
  if(!service?.enabled)throw new Error('Meta generation is paused.');
  const response=await fetch('/api/creature/generate',{method:'POST',headers:{'Content-Type':'application/json','X-Microverse-Session':service.session},body:JSON.stringify(input),signal});
  const result=await readAiResult(response,{signal,session:service.session});
  if(result.provider!=='Meta · Muse Image + SAM 3.1'||result.promptVersion!==PROMPT_VERSION)throw new Error('The creature response version does not match this app.');
  const image=await composeCreatureCutout(result);
  return {image,identity:validateAnimalIdentity(result.identity),cached:result.cached===true,source:{provider:'Meta',imageModel:'muse-image-1.0',maskModel:'sam-3.1',promptVersion:result.promptVersion}};
}
// Flatten the cutout on white, ask for the four drawn poses, then keep a small copy that fits a saved creature.
export async function generateCreaturePoses({image,identity},signal){
  const status=await fetch('/api/world-tools/status',{cache:'no-store'}).then(r=>r.json());
  if(!status?.session||!status.enabled)throw new Error('Drawn poses are paused.');
  const art=new Image();art.src=image;await art.decode();
  const flat=document.createElement('canvas');flat.width=flat.height=640;const fctx=flat.getContext('2d');fctx.fillStyle='#fff';fctx.fillRect(0,0,640,640);fctx.drawImage(art,0,0,640,640);
  const response=await fetch('/api/world-tools/creature-poses',{method:'POST',signal,headers:{'Content-Type':'application/json','X-Microverse-Session':status.session},body:JSON.stringify({consent:true,image:flat.toDataURL('image/png'),identity})});
  const value=await response.json();if(!response.ok)throw new Error(value.error||'Drawn poses did not finish.');
  return shrinkPoseSheet(value.atlas);
}
export async function shrinkPoseSheet(src){
  const sheet=new Image();sheet.src=src;await sheet.decode();const scale=Math.min(1,1200/sheet.naturalWidth),c=document.createElement('canvas');c.width=Math.round(sheet.naturalWidth*scale);c.height=Math.round(sheet.naturalHeight*scale);
  const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(sheet,0,0,c.width,c.height);return c.toDataURL('image/webp',.86);
}
