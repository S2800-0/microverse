import {useEffect,useRef} from 'react';
// Bend the original raster mesh gently around the neck. No live AI/video request.
function triangle(ctx,img,s,d){
 const [p,q,r]=s,[a,b,c]=d,den=p.x*(q.y-r.y)+q.x*(r.y-p.y)+r.x*(p.y-q.y);if(!den)return;
 const A=(a.x*(q.y-r.y)+b.x*(r.y-p.y)+c.x*(p.y-q.y))/den;
 const B=(a.y*(q.y-r.y)+b.y*(r.y-p.y)+c.y*(p.y-q.y))/den;
 const C=(a.x*(r.x-q.x)+b.x*(p.x-r.x)+c.x*(q.x-p.x))/den;
 const D=(a.y*(r.x-q.x)+b.y*(p.x-r.x)+c.y*(q.x-p.x))/den;
 const E=(a.x*(q.x*r.y-r.x*q.y)+b.x*(r.x*p.y-p.x*r.y)+c.x*(p.x*q.y-q.x*p.y))/den;
 const F=(a.y*(q.x*r.y-r.x*q.y)+b.y*(r.x*p.y-p.x*r.y)+c.y*(p.x*q.y-q.x*p.y))/den;
 ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.clip();ctx.setTransform(A,B,C,D,E,F);ctx.drawImage(img,0,0);ctx.restore();
}
export function HeroFox({paused}){const ref=useRef(null),latest=useRef(paused);latest.current=paused;
 useEffect(()=>{let dead=false,raf=0,frames=[],last=-1,lastTime=0,idle=performance.now();const canvas=ref.current,ctx=canvas.getContext('2d');const img=new Image();img.src='/assets/hero-fox-v3.webp';
  const touch=()=>{idle=performance.now()};window.addEventListener('pointermove',touch,{passive:true});window.addEventListener('keydown',touch);
  async function prepare(){await img.decode();canvas.width=960;canvas.height=640;
   for(let n=0;n<9;n++){if(dead)return;const angle=(n-4)*.007,c=document.createElement('canvas');c.width=960;c.height=640;const p=c.getContext('2d'),cols=18,rows=12;
    const point=(x,y)=>{const w=Math.max(0,Math.min(1,(x/img.width-.53)/.18))*Math.max(0,Math.min(1,(.69-y/img.height)/.21));const ax=img.width*.76,ay=img.height*.58,theta=angle*w,dx=x-ax,dy=y-ay;return {x:(ax+dx*Math.cos(theta)-dy*Math.sin(theta))*960/img.width,y:(ay+dx*Math.sin(theta)+dy*Math.cos(theta))*640/img.height}};
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a={x:x/cols*img.width,y:y/rows*img.height},b={x:(x+1)/cols*img.width,y:a.y},d={x:a.x,y:(y+1)/rows*img.height},e={x:b.x,y:d.y};triangle(p,img,[a,b,e],[point(a.x,a.y),point(b.x,b.y),point(e.x,e.y)]);triangle(p,img,[a,e,d],[point(a.x,a.y),point(e.x,e.y),point(d.x,d.y)])}
    frames.push(c);await new Promise(requestAnimationFrame);
   }
   run(performance.now());
  }
  function run(now){if(dead)return;const quiet=(now-idle)/1000,cycle=quiet%16;const t=quiet>5&&cycle>5&&cycle<10?Math.sin((cycle-5)/5*Math.PI*2):0;const pose=latest.current||document.hidden?4:4+t*4;if(frames.length===9&&Math.abs(pose-last)>.002){const lower=Math.floor(pose),upper=Math.min(8,lower+1),mix=pose-lower;ctx.clearRect(0,0,960,640);ctx.globalAlpha=1;ctx.drawImage(frames[lower],0,0);if(mix>.001){ctx.globalAlpha=mix;ctx.drawImage(frames[upper],0,0);ctx.globalAlpha=1}last=pose;lastTime=now}raf=requestAnimationFrame(run)}
  prepare().catch(()=>{if(!dead){ctx.drawImage(img,0,0,canvas.width,canvas.height)}});return()=>{dead=true;cancelAnimationFrame(raf);window.removeEventListener('pointermove',touch);window.removeEventListener('keydown',touch)};
 },[]);
 return <canvas ref={ref} className="hero-fox" width="960" height="640" aria-hidden="true"/>;
}
export function FallingLeaves(){return <div className="falling-leaves" aria-hidden="true">{Array.from({length:5},(_,i)=><img key={i} src={'/assets/leaf-v7-'+i%4+'.webp'} alt="" style={{'--leaf-x':[12,29,7,48,35][i]+'%','--leaf-delay':i*-3.7+'s','--leaf-time':18+i*2+'s','--leaf-size':20+i%3*6+'px'}}/>)}</div>}
