// Saved 24-pose atlases: one texture blit, no runtime mesh or model work.
export function cachedPose(seconds,cyclesPerSecond=1.25){return Math.floor((((seconds*cyclesPerSecond)%1)+1)%1*24)%24;}
export async function mountCachedWalk(canvas,{source,paused=false,continuous=false,onReady=()=>{}}){
 const image=new Image();image.src=source;await image.decode();if(image.naturalWidth!==2304||image.naturalHeight!==1280)throw new Error('Unexpected cached walk atlas.');
 const ctx=canvas.getContext('2d',{alpha:true});let raf=0,last=0,time=0,visible=false,dead=false,remaining=continuous?Infinity:3.2,previous=-1;
 function paint(){const pose=remaining<=0?0:cachedPose(time);if(pose===previous)return;previous=pose;ctx.clearRect(0,0,384,320);ctx.drawImage(image,pose%6*384,Math.floor(pose/6)*320,384,320,0,0,384,320);}
 function run(now){raf=0;if(dead||paused||!visible||document.hidden)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;time+=dt;remaining-=dt;paint();if(remaining>0)raf=requestAnimationFrame(run);}
 function sync(){cancelAnimationFrame(raf);raf=0;last=0;paint();if(!dead&&!paused&&visible&&!document.hidden&&remaining>0)raf=requestAnimationFrame(run);}
 const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting===true;sync();},{threshold:.01});observer.observe(canvas);document.addEventListener('visibilitychange',sync);paint();canvas.hidden=false;onReady();
 return {setPaused(value){paused=!!value;sync();},replay(){time=0;remaining=continuous?Infinity:3.2;previous=-1;sync();},destroy(){dead=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',sync);}};
}
