import {ART} from '../../src/scene/art.js';
import {buildRig,GAITS} from '../../src/motion/rig.js';
import {prepareJointPieces,drawPuppet} from '../../src/motion/puppet-motion.js';
import {getMotion} from '../../src/motion/motion-library.js';
const el=id=>document.getElementById(id);
el('render').onclick=async()=>{el('render').disabled=true;el('status').textContent='Rendering saved-art frames locally…';try{const art=ART[el('character').value],rig=prepareJointPieces(await buildRig(art.image,art.cut)),canvas=el('atlas'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,2304,1280);for(let i=0;i<24;i++){ctx.save();ctx.beginPath();ctx.rect(i%6*384,Math.floor(i/6)*320,384,320);ctx.clip();ctx.translate(i%6*384+192,Math.floor(i/6)*320+285);drawPuppet(ctx,rig,{size:330,phase:i/24,moving:true,preset:getMotion('dog'),phases:GAITS.walk.phase,clock:0});ctx.restore();}el('export').src=canvas.toDataURL('image/png');el('export').dataset.character=el('character').value;el('status').textContent='24 cached poses ready. No inference used.';}catch(e){el('status').textContent=e.message;}finally{el('render').disabled=false;}};
