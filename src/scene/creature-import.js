import { createRigReview } from '../motion/rig-review.js';
import { fitQuadruped } from '../motion/rig-fitting.js';
import { suggestRig } from '../motion/rig-analysis.js';
import { drawPuppet } from '../motion/puppet-motion.js';
import { getMotion } from '../motion/motion-library.js';
import { GAITS } from '../motion/rig.js';
import {readCreatureService,generateCreature} from '../creature/client.js';

export function validatePhotoFile(file) {
  if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Choose a JPEG, PNG or WebP image.');
  if(file.size>10*1024*1024)throw new Error('Choose an image under 10 MB.');
}

export function installCreatureImport({ onAdd, onPause }) {
  const el=id=>document.getElementById(id), dialog=el('import-dialog');
  const source=el('import-source'), motion=el('import-motion');
  let image=null,original=null,processedPreview=null,assetSource=null,token=0,raf=0,phase=0,last=0;
  let complete=onAdd;
  function stage(title,joke,{paint=false,cut=false,movement=false,local=false}={}){el('creation-progress').hidden=false;el('creation-stage').textContent=title;el('creation-joke').textContent=joke;el('creation-paint').hidden=local;el('creation-cut').hidden=local;el('creation-note').textContent=local?'Prepared on this device. Painting with Meta is optional.':'Painting and cutout happen in one request. Completion appears when both return; no guessed countdown.';for(const [key,done]of [['paint',paint],['cut',cut],['move',movement]])el(`creation-${key}`).classList.toggle('done',done);}
  let service={enabled:false,reason:'Checking the local image bridge…'},generating=false,requestController=null,providerNote='';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const review=createRigReview({fit:fitQuadruped,onChange(state){
    el('import-status').textContent=state.status==='accepted'?'Movement approved. You can welcome this creature in.':state.approved?'Simpler movement is ready.':state.status==='review'?'Check the moving legs and markings, then choose the movement you prefer.':state.reason||'Choose a photo or try a prepared creature.';
    updateControls(state);
  }});
  function updateControls(state=review.getState()){
    el('import-accept').disabled=generating||state.status!=='review';
    el('import-fallback').disabled=generating||['empty','preparing'].includes(state.status);
    el('import-add').disabled=generating||!state.approved;
    el('import-paint').disabled=generating||state.status==='preparing'||!original||!service.enabled||!el('import-consent').checked;
    el('import-save').disabled=generating||!image;
    el('import-appearance').disabled=generating;el('import-consent').disabled=generating;
    el('import-provider-status').textContent=generating?'Preparing one illustration and one cutout. Closing the dialog does not cancel a request already sent.':providerNote||service.reason;
  }
  function invalidate(){token++;requestController?.abort();requestController=null;generating=false;image=null;original=null;processedPreview=null;assetSource=null;providerNote='';el('import-consent').checked=false;el('creation-progress').hidden=true;review.reset();source.getContext('2d').clearRect(0,0,320,320);}
  async function load(src) {
    invalidate();const current=token;
    el('import-status').textContent='Preparing your image locally…';stage('Preparing your photo…','Please keep all paws inside the picture.',{local:true});
    try {
      const img=new Image();img.src=src;await img.decode();
      if(current!==token||!dialog.open)return;
      if(img.naturalWidth*img.naturalHeight>36e6)throw new Error('Choose an image under 36 megapixels.');
      const c=document.createElement('canvas');c.width=c.height=640;
      const ctx=c.getContext('2d'), scale=Math.min(640/img.naturalWidth,640/img.naturalHeight);
      ctx.drawImage(img,(640-img.naturalWidth*scale)/2,(640-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);
      // Re-encoding keeps processing bytes free of source EXIF/GPS metadata.
      image=c.toDataURL('image/png');original=image;processedPreview=c;source.getContext('2d').drawImage(c,0,0,320,320);
      let config={knee:.7,hindMaxX:.55};
      try {config=suggestRig(ctx.getImageData(0,0,640,640)).config;} catch { /* Opaque poses still have an explicit fallback. */ }
      await review.prepare({source:image,profile:el('import-species').value,config});if(current===token)stage('Your little neighbour is ready to review.','One paw in front of the other. Mostly.',{movement:true,local:true});
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
    else if(processedPreview)ctx.drawImage(processedPreview,0,0,320,320);
    raf=requestAnimationFrame(frame);
  }
  function close(){invalidate();cancelAnimationFrame(raf);raf=0;last=0;el('import-file').value='';el('import-camera').value='';motion.getContext('2d').clearRect(0,0,320,320);}
  for(const id of ['import-file','import-camera'])el(id).onchange=()=>{const f=el(id).files[0];if(f)readFile(f);};
  el('sample-dog').onclick=()=>{el('import-species').value='dog';load('/animals/dog-standing.png');};
  el('sample-cat').onclick=()=>{el('import-species').value='cat';load('/animals/tabby-character-preview.png');};
  el('import-species').onchange=()=>{if(original){const src=original;load(src);}else review.reset();};
  el('import-consent').onchange=()=>updateControls();
  el('import-paint').onclick=async()=>{
    if(generating||!original||!service.enabled||!el('import-consent').checked)return;
    const current=++token,profile=el('import-species').value,sourceImage=original;
    generating=true;assetSource=null;providerNote='';review.reset();requestController=new AbortController();updateControls();
    el('import-status').textContent='Making one watercolor creature. No automatic retries.';
    stage('Painting and making the cutout…',/sunglasses/i.test(el('import-appearance').value)?'The sunglasses are a lifestyle choice.':'Politely asking the sofa to leave.');
    try{
      const result=await generateCreature({image:sourceImage,profile,appearance:el('import-appearance').value,consent:true},service,requestController.signal);
      if(current!==token||!dialog.open)return;
      image=result.image;assetSource=result.source;stage('Preparing movement…','Consulting the Department of Tiny Footsteps.',{paint:true,cut:true});generating=false;
      const c=document.createElement('canvas');c.width=c.height=640;
      const img=new Image();img.src=image;await img.decode();if(current!==token||!dialog.open)return;
      const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);processedPreview=c;
      let config={knee:.7,hindMaxX:.55};try{config=suggestRig(ctx.getImageData(0,0,640,640)).config;}catch{/* Keep the explicit local fallback. */}
      await review.prepare({source:image,profile,config});
      if(current===token)stage('Your tiny troublemaker awaits.','Check markings and movement before welcoming them in.',{paint:true,cut:true,movement:true});
      if(current===token)providerNote=result.cached?'Reused the cached illustration and mask. No new provider calls.':'Meta illustration and cutout ready. Compare markings/accessories with the source, then review movement.';
    }catch(error){
      if(current!==token||!dialog.open)return;
      generating=false;image=sourceImage;processedPreview=source;assetSource=null;
      await review.prepare({source:image,profile,config:{knee:.7,hindMaxX:.55}});
      if(current===token){el('creation-progress').hidden=true;el('import-status').textContent=`${error.message} You can still review or use the original image locally.`;}
    }finally{if(current===token){requestController=null;generating=false;updateControls();}}
  };
  el('import-save').onclick=()=>{
    if(!image)return;const a=document.createElement('a');a.href=image;a.download=`microverse-${el('import-species').value}-cutout.png`;a.click();
  };
  el('import-accept').onclick=()=>review.accept();el('import-fallback').onclick=()=>review.useFallback();
  el('import-add').onclick=()=>{
    const state=review.getState();if(!state.approved||!image)return;
    try{complete({species:el('import-species').value,name:el('import-name').value,image,rig:state.candidate?.rig,rigConfig:state.candidate?.config,source:assetSource||undefined});dialog.close();}
    catch(error){el('import-status').textContent=error.message;}
  };
  el('import-close').onclick=()=>dialog.close();dialog.addEventListener('close',close);
  return {open({destination='ecosystem',onComplete=onAdd}={}){complete=onComplete;onPause();el('import-add').textContent=destination==='library'?'Save to My creatures':'Welcome into the forest';el('import-heading').textContent=destination==='library'?'Meet your next little neighbour.':'Bring a companion to visit.';dialog.showModal();review.reset();if(!raf)raf=requestAnimationFrame(frame);
    readCreatureService().then(value=>{if(dialog.open){service=value;updateControls();}});
  }};
}
