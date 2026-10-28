import {buildRig,GAITS} from './rig.js';
import {assessRig} from './rig-analysis.js';
import {prepareJointPieces,drawPuppet} from './puppet-motion.js';
import {getMotion} from './motion-library.js';
import {ART} from '../scene/art.js';

// Presentation-only motion. No simulation, provider request, or inferred animal behaviour.
export async function mountFoxScene(canvas,{paused=false,onReady=()=>{}}={}){
  const image=new Image();image.src=ART.fox.image;await image.decode();
  let rig=null;
  try{const candidate=await buildRig(ART.fox.image,ART.fox.cut);if(!assessRig(candidate).warnings.length)rig=prepareJointPieces(candidate);}catch{/* The still illustration remains available. */}
  const ctx=canvas.getContext('2d'),preset=getMotion('dog');
  let elapsed=0,last=0,raf=0,visible=false,destroyed=false;
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const travel=Math.min(110,elapsed*35),moving=!!rig&&!paused&&travel<110;
    ctx.save();ctx.translate(385+travel,500);
    if(rig)drawPuppet(ctx,rig,{size:620,phase:travel*preset.duty/preset.stride,moving,preset,phases:GAITS.walk.phase,clock:paused?0:elapsed});
    else ctx.drawImage(image,-310,-527,620,620);
    ctx.restore();
  }
  function frame(now){
    raf=0;if(destroyed||paused||!visible||document.hidden)return;
    if(last){const dt=(now-last)/1000;if(dt<1/30){raf=requestAnimationFrame(frame);return;}elapsed+=Math.min(dt,.075);}
    last=now;draw();raf=requestAnimationFrame(frame);
  }
  function sync(){cancelAnimationFrame(raf);raf=0;last=0;draw();if(!destroyed&&!paused&&visible&&!document.hidden)raf=requestAnimationFrame(frame);}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05});observer.observe(canvas);
  document.addEventListener('visibilitychange',sync);
  canvas.hidden=false;draw();onReady({articulated:!!rig});
  return {setPaused(value){paused=!!value;sync();},replay(){elapsed=0;sync();},destroy(){destroyed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',sync);}};
}
