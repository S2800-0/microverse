import {buildRig,GAITS} from './rig.js';
import {assessRig} from './rig-analysis.js';
import {prepareJointPieces,drawPuppet} from './puppet-motion.js';
import {getMotion} from './motion-library.js';

// Presentation-only motion. No simulation, provider request, or inferred animal behaviour.
export async function mountFoxScene(canvas,{paused=false,onReady=()=>{}}={}){
  const image=new Image();image.src='/intro/fox.png';await image.decode();
  // Native landscape proportions are retained. Use the actual alpha ground line
  // so a non-square illustration doesn't float above the walking surface.
  const source=document.createElement('canvas');source.width=image.naturalWidth;source.height=image.naturalHeight;
  const pixels=source.getContext('2d',{willReadFrequently:true});pixels.drawImage(image,0,0);
  const alpha=pixels.getImageData(0,0,source.width,source.height).data;
  let ground=source.height;
  outer:for(let y=source.height-1;y>=0;y--)for(let x=0;x<source.width;x++)if(alpha[(y*source.width+x)*4+3]>40){ground=y;break outer;}
  let rig=null;
  try{const candidate=await buildRig('/intro/fox.png',{knee:.72,hindMaxX:.6,minX:.25});if(!assessRig(candidate).warnings.length)rig=prepareJointPieces(candidate);}catch{/* The still illustration remains available. */}
  const ctx=canvas.getContext('2d'),preset=getMotion('dog');
  let elapsed=0,last=0,raf=0,visible=false,destroyed=false,journeyTravel=null,movingUntil=0;
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const travel=journeyTravel??Math.min(110,elapsed*35),moving=!!rig&&!paused&&(journeyTravel===null?travel<110:elapsed<movingUntil);
    const size=720,groundOffset=ground/image.naturalWidth*size;
    ctx.save();ctx.translate(450,500);
    if(rig){ctx.translate(0,size*.85-groundOffset);drawPuppet(ctx,rig,{size,phase:travel*preset.duty/preset.stride,moving,preset,phases:GAITS.walk.phase,clock:paused?0:elapsed});}
    else ctx.drawImage(image,-size/2,-groundOffset,size,size*image.naturalHeight/image.naturalWidth);
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
  return {setPaused(value){paused=!!value;sync();},setJourney(distance){if(!Number.isFinite(distance))return;if(journeyTravel===null||Math.abs(distance-journeyTravel)>.2)movingUntil=elapsed+.22;journeyTravel=distance;if(paused)draw();else if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(frame);},replay(){journeyTravel=null;elapsed=0;sync();},destroy(){destroyed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',sync);}};
}
