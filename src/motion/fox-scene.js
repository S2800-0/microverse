import {FOX_SHEET,foxSpriteRegion,foxWalkFrame} from './sprite-sheet.js';

// Presentation-only playback of locally registered artwork. No model or simulation.
export async function mountFoxScene(canvas,{paused=false,onReady=()=>{}}={}){
  let sheet=null;
  try{
    sheet=new Image();sheet.src='/intro/fox-walk.png';await sheet.decode();
    if(sheet.naturalWidth!==2048||sheet.naturalHeight!==1024)throw new Error('Unexpected sheet dimensions.');
  }catch{sheet=null;}
  let poster=null;
  if(!sheet){poster=new Image();poster.src='/intro/fox-poster.png';await poster.decode();}
  const ctx=canvas.getContext('2d');
  let elapsed=0,last=0,raf=0,visible=false,destroyed=false,journeyTravel=null,movingUntil=0;
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!sheet){ctx.drawImage(poster,0,0,canvas.width,canvas.height);return;}
    const index=journeyTravel===null?Math.floor(Math.min(elapsed,3.125)*8)%8:foxWalkFrame(journeyTravel);
    const region=foxSpriteRegion(index),size=720,scale=size/FOX_SHEET.cell;
    ctx.drawImage(sheet,region.x,region.y,region.width,region.height,90,500-425*scale,size,size);
  }
  function canPlay(){return sheet&&!destroyed&&!paused&&visible&&!document.hidden&&(journeyTravel===null?elapsed<3.125:elapsed<movingUntil);}
  function frame(now){
    raf=0;if(destroyed||paused||!visible||document.hidden)return;
    if(last){const dt=(now-last)/1000;if(dt<1/30){raf=requestAnimationFrame(frame);return;}elapsed+=Math.min(dt,.075);}
    last=now;draw();if(canPlay())raf=requestAnimationFrame(frame);
  }
  function sync(){cancelAnimationFrame(raf);raf=0;last=0;draw();if(canPlay())raf=requestAnimationFrame(frame);}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05});observer.observe(canvas);
  document.addEventListener('visibilitychange',sync);
  canvas.hidden=false;draw();onReady({mode:sheet?'sprite':'still'});
  return {
    setPaused(value){paused=!!value;sync();},
    setJourney(distance){if(!Number.isFinite(distance)||destroyed)return;if(journeyTravel===null||Math.abs(distance-journeyTravel)>.2)movingUntil=elapsed+.22;journeyTravel=distance;if(paused)draw();else if(!raf&&visible&&!document.hidden){last=0;raf=requestAnimationFrame(frame);}},
    replay(){journeyTravel=null;elapsed=0;sync();},
    destroy(){destroyed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',sync);}
  };
}
