import { createRigReview } from '../motion/rig-review.js';
import { fitQuadruped } from '../motion/rig-fitting.js';
import { suggestRig } from '../motion/rig-analysis.js';
import { drawPuppet } from '../motion/puppet-motion.js';
import { getMotion } from '../motion/motion-library.js';
import { GAITS } from '../motion/rig.js';

export function validatePhotoFile(file) {
  if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Choose a JPEG, PNG or WebP image.');
  if(file.size>10*1024*1024)throw new Error('Choose an image under 10 MB.');
}

export function installCreatureImport({ onAdd, onPause }) {
  const el=id=>document.getElementById(id), dialog=el('import-dialog');
  const source=el('import-source'), motion=el('import-motion');
  let image=null, token=0, raf=0, phase=0, last=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const review=createRigReview({fit:fitQuadruped,onChange(state){
    el('import-status').textContent=state.reason||'Choose an image to prepare.';
    el('import-accept').disabled=state.status!=='review';
    el('import-fallback').disabled=['empty','preparing'].includes(state.status);
    el('import-add').disabled=!state.approved;
  }});
  function invalidate(){token++;image=null;review.reset();source.getContext('2d').clearRect(0,0,320,320);}
  async function load(src) {
    invalidate();const current=token;
    el('import-status').textContent='Preparing your image locally…';
    try {
      const img=new Image();img.src=src;await img.decode();
      if(current!==token||!dialog.open)return;
      if(img.naturalWidth*img.naturalHeight>36e6)throw new Error('Choose an image under 36 megapixels.');
      const c=document.createElement('canvas');c.width=c.height=640;
      const ctx=c.getContext('2d'), scale=Math.min(640/img.naturalWidth,640/img.naturalHeight);
      ctx.drawImage(img,(640-img.naturalWidth*scale)/2,(640-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);
      // Re-encoding keeps processing bytes free of source EXIF/GPS metadata.
      image=c.toDataURL('image/png');source.getContext('2d').drawImage(c,0,0,320,320);
      let config={knee:.7,hindMaxX:.55};
      try {config=suggestRig(ctx.getImageData(0,0,640,640)).config;} catch { /* Opaque poses still have an explicit fallback. */ }
      await review.prepare({source:image,profile:el('import-species').value,config});
    } catch(error) {if(current===token)el('import-status').textContent=error.message;}
  }
  async function readFile(file) {
    invalidate();
    try {validatePhotoFile(file);const url=URL.createObjectURL(file);try{await load(url);}finally{URL.revokeObjectURL(url);}}
    catch(error){el('import-status').textContent=error.message;}
  }
  function frame(now){
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    if(!reduced.matches)phase+=dt*.8;
    const ctx=motion.getContext('2d');ctx.clearRect(0,0,320,320);
    const state=review.getState();
    if(state.candidate){ctx.save();ctx.translate(160,285);drawPuppet(ctx,state.candidate.rig,{size:290,phase,moving:!reduced.matches,preset:getMotion(el('import-species').value),phases:GAITS.walk.phase,clock:reduced.matches?0:phase});ctx.restore();}
    else if(image)ctx.drawImage(source,0,0);
    raf=requestAnimationFrame(frame);
  }
  function close(){token++;cancelAnimationFrame(raf);raf=0;last=0;image=null;review.reset();el('import-file').value='';source.getContext('2d').clearRect(0,0,320,320);motion.getContext('2d').clearRect(0,0,320,320);}
  el('import-file').onchange=()=>{const f=el('import-file').files[0];if(f)readFile(f);};
  el('sample-dog').onclick=()=>{el('import-species').value='dog';load('/animals/dog-standing.png');};
  el('sample-cat').onclick=()=>{el('import-species').value='cat';load('/animals/tabby-character-preview.png');};
  el('import-species').onchange=()=>{if(image){const src=image;load(src);}else review.reset();};
  el('import-accept').onclick=()=>review.accept();el('import-fallback').onclick=()=>review.useFallback();
  el('import-add').onclick=()=>{
    const state=review.getState();if(!state.approved||!image)return;
    try{onAdd({species:el('import-species').value,name:el('import-name').value,image,rig:state.candidate?.rig,rigConfig:state.candidate?.config});dialog.close();}
    catch(error){el('import-status').textContent=error.message;}
  };
  el('import-close').onclick=()=>dialog.close();dialog.addEventListener('close',close);
  return {open(){onPause();dialog.showModal();review.reset();if(!raf)raf=requestAnimationFrame(frame);}};
}
