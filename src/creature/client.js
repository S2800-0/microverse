import {PROMPT_VERSION,pngDimensions,applyCutoutMask} from './contract.js';

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
  const result=await response.json();if(!response.ok)throw new Error(result.error||'Creature generation failed.');
  if(result.provider!=='Meta · Muse Image + SAM 3.1'||result.promptVersion!==PROMPT_VERSION)throw new Error('The creature response version does not match this app.');
  const image=await composeCreatureCutout(result);
  return {image,cached:result.cached===true,source:{provider:'Meta',imageModel:'muse-image-1.0',maskModel:'sam-3.1',promptVersion:result.promptVersion}};
}
