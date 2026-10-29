// Irregular small drops rather than a repeated stripe texture. Decorative only.
export function mountPaintedRain(canvas,{paused=false}={}){
 const ctx=canvas.getContext('2d'),drops=Array.from({length:54},(_,i)=>({x:((i*127.1+83)%997)/997,y:((i*71.7+31)%991)/991,speed:.24+(i%7)*.035,length:5+(i%5)*2,alpha:.12+(i%4)*.035}));
 let mode='spring',visible=false,raf=0,last=0,dead=false;const observer=new IntersectionObserver(e=>{visible=e[0]?.isIntersecting===true;sync();});observer.observe(canvas);
 function size(){const box=canvas.getBoundingClientRect();canvas.width=Math.max(1,Math.round(box.width));canvas.height=Math.max(1,Math.round(box.height));}
 const resize=new ResizeObserver(size);resize.observe(canvas);size();
 function frame(now){raf=0;if(dead||paused||!visible||document.hidden||mode!=='rain')return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.lineCap='round';for(const d of drops){d.y=(d.y+dt*d.speed)%1;const x=d.x*canvas.width,y=d.y*canvas.height;ctx.strokeStyle=`rgba(210,225,230,${d.alpha})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-1.5,y+d.length);ctx.stroke();}raf=requestAnimationFrame(frame);}
 function sync(){cancelAnimationFrame(raf);raf=0;last=0;if(mode!=='rain'||paused)ctx.clearRect(0,0,canvas.width,canvas.height);if(!dead&&!paused&&visible&&!document.hidden&&mode==='rain')raf=requestAnimationFrame(frame);}
 document.addEventListener('visibilitychange',sync);
 return {setMode(value){mode=value;sync();},setPaused(value){paused=!!value;sync();},destroy(){dead=true;cancelAnimationFrame(raf);observer.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',sync);}};
}
