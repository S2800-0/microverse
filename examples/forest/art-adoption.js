import {mountFoxScene} from '../../src/motion/fox-scene.js';
import {META_SPRITE_CANDIDATES} from '../../src/scene/meta-art-candidates.js';
import {suggestRig} from '../../src/motion/rig-analysis.js';
import {fitQuadruped} from '../../src/motion/rig-fitting.js';
import {drawPuppet} from '../../src/motion/puppet-motion.js';
import {getMotion} from '../../src/motion/motion-library.js';
import {GAITS} from '../../src/motion/rig.js';
import {buildTerrain,MEADOW_V2_TERRAIN} from '../../src/scene/terrain.js';
const el=id=>document.getElementById(id),records=[],previews=[];let gait='walk';
function draw(){for(const p of previews){const ctx=p.canvas.getContext('2d');ctx.clearRect(0,0,960,220);for(let i=0;i<4;i++){ctx.save();ctx.translate(120+i*240,205);if(p.fit?.valid){const preset=getMotion(p.job.profile,gait);for(const [key,value]of Object.entries(p.job.motionScale||{}))preset[key]*=value;drawPuppet(ctx,p.fit.rig,{size:215,phase:i*.25,moving:i>0,preset,phases:GAITS[gait].phase,clock:0});}else ctx.drawImage(p.image,-107.5,-182.75,215,215);ctx.restore();ctx.fillStyle='#263d32';ctx.font='11px system-ui';ctx.fillText(i===0?'Still':`${gait} phase ${i}/4`,i*240+15,18);}}}
el('gait').onclick=()=>{gait=gait==='walk'?'trot':'walk';el('gait').textContent=gait==='walk'?'Show trot samples':'Show walk samples';draw();};
for(const job of META_SPRITE_CANDIDATES){
 const section=document.createElement('section'),title=document.createElement('h2'),status=document.createElement('p'),canvas=document.createElement('canvas');title.textContent=job.label;canvas.width=960;canvas.height=220;canvas.setAttribute('aria-label',`${job.label} still and ${gait} phase samples`);section.append(title,status,canvas);el('sprites').append(section);
 try{
  const image=new Image();image.src=job.image;await image.decode();const source=document.createElement('canvas');source.width=source.height=640;const ctx=source.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  let fit=null;if(job.profile!=='rabbit')fit=await fitQuadruped({source:job.image,config:suggestRig(ctx.getImageData(0,0,640,640)).config});
  const record={id:job.id,status:job.profile==='rabbit'?'whole-image':fit?.valid?'geometry-ready':'needs-correction',config:fit?.config||null,legs:fit?.rig?.legs?.map(({hind,x,length,pivot})=>({hind,x,length,pivot}))||[],warnings:fit?.warnings||[]};records.push(record);
  status.textContent=job.profile==='rabbit'?'Whole-image candidate. The quadruped fitter is not used for this hopper.':`${fit?.valid?'Geometry ready for visual inspection':'Needs correction'} · ${record.legs.length} pieces. ${record.warnings.join(' ')}`;
  previews.push({job,image,fit,canvas});draw();
 }catch(error){status.textContent=error.message;records.push({id:job.id,status:'failed',error:error.message});}
 el('progress').textContent=`${records.length} / ${META_SPRITE_CANDIDATES.length} saved sprites checked.`;el('qa-result').textContent=JSON.stringify(records,null,2);
}
const terrain=buildTerrain(MEADOW_V2_TERRAIN),overlay=terrain.debugCanvas();
for(const [id,src]of [['old-map','/maps/spring.png'],['new-map','/meta-art/game-map.png']]){const image=new Image();image.src=src;await image.decode();const ctx=el(id).getContext('2d');ctx.drawImage(image,0,0,836,471);ctx.drawImage(overlay,0,0,836,471);}
el('progress').textContent='8 sprites and both map overlays prepared. Inspect still, walk and trot samples before accepting changes.';

let fallback=null;el('fallback-check').onclick=async()=>{fallback?.destroy();try{fallback=await mountFoxScene(el('fallback-fox'),{paused:true,rigSource:'/meta-art/game-fox.png',rigConfig:{knee:0},posterSrc:'/meta-art/entrance-fox-poster.png',onReady:({mode})=>{el('fallback-status').textContent=mode==='still'?'Passed: rejected rig uses the saved static poster.':'Unexpected mode.';}});}catch{el('fallback-status').textContent='The fallback image could not load.';}};window.addEventListener('pagehide',()=>fallback?.destroy());
