import {useEffect,useRef} from 'react';
import {drawPuppet} from '../core/motion/puppet-motion.js';
import {getMotion} from '../core/motion/motion-library.js';
import {locomotionFrame} from '../world/locomotion.js';
import {GAITS} from '../core/motion/rig.js';
import {chooseBehaviour,deformPoint,poseFor,warpFor} from '../world/creature-motion.js';

// The painting's own edges: a 3:2 painting sits letterboxed inside its square, and feet must meet the ground.
function artBox(img){const n=160,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,n,n);const d=x.getImageData(0,0,n,n).data;let a=n,b=n,e=0,f=0;for(let j=0;j<n;j++)for(let i=0;i<n;i++)if(d[(j*n+i)*4+3]>40){a=Math.min(a,i);b=Math.min(b,j);e=Math.max(e,i+1);f=Math.max(f,j+1)}return e>a&&f>b?{x:a/n,y:b/n,w:(e-a)/n,h:(f-b)/n}:{x:0,y:0,w:1,h:1}}
// Same bend as the living world, drawn as small triangles. A soft overlap hides the seams.
function drawWarped(ctx,img,box,size,behaviour,time){const cols=14,rows=11,sx=img.naturalWidth*box.x,sy=img.naturalHeight*box.y,sw=img.naturalWidth*box.w,sh=img.naturalHeight*box.h,dw=size*box.w,dh=size*box.h,pt=(i,j)=>{const u=i/cols,v=j/rows,p=deformPoint(u,v,behaviour,time);return {x:(p.x-.5)*dw,y:(p.y-1)*dh,u:sx+u*sw,v:sy+v*sh}};
 const tri=(a,b,c)=>{const cx=(a.x+b.x+c.x)/3,cy=(a.y+b.y+c.y)/3,grow=p=>{const k=.8/Math.max(1,Math.hypot(p.x-cx,p.y-cy));return {x:p.x+(p.x-cx)*k,y:p.y+(p.y-cy)*k}},A=grow(a),B=grow(b),C=grow(c),den=(a.u-c.u)*(b.v-c.v)-(b.u-c.u)*(a.v-c.v);if(!den)return;const m11=((a.x-c.x)*(b.v-c.v)-(b.x-c.x)*(a.v-c.v))/den,m12=((a.y-c.y)*(b.v-c.v)-(b.y-c.y)*(a.v-c.v))/den,m21=((b.x-c.x)*(a.u-c.u)-(a.x-c.x)*(b.u-c.u))/den,m22=((b.y-c.y)*(a.u-c.u)-(a.y-c.y)*(b.u-c.u))/den;ctx.save();ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.clip();ctx.transform(m11,m12,m21,m22,c.x-m11*c.u-m21*c.v,c.y-m12*c.u-m22*c.v);ctx.drawImage(img,0,0);ctx.restore()};
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const p00=pt(i,j),p10=pt(i+1,j),p01=pt(i,j+1),p11=pt(i+1,j+1);tri(p00,p10,p11);tri(p00,p11,p01)}}
export function CompanionCanvas({image,rig=null,species='dog',gait='walk',moving=true,activity='move',paused=false,reduced=false,poses=null,motion:movement='walk',label='Your creature’s movement preview'}){
 const canvas=useRef(null),latest=useRef(null),wakeRef=useRef(null);latest.current={image,rig,species,gait,moving,activity,paused,reduced,poses,movement};
 useEffect(()=>{
  let raf=0,dead=false,art=null,box={x:0,y:0,w:1,h:1},last=0,clock=0,phase=0,w=1,h=1,loaded='';const c=canvas.current,ctx=c.getContext('2d');
  function load(){const src=latest.current.image;if(src===loaded)return;loaded=src;art=null;if(src){const img=new Image();img.src=src;img.decode().then(()=>{if(!dead&&loaded===src){art=img;box=artBox(img);wake()}}).catch(()=>{})}}
  function draw(){const p=latest.current;ctx.clearRect(0,0,w,h);const size=Math.min(w*.76/box.w,h*.74/box.h,900),active=!p.paused&&!p.reduced,time=active?clock:0,hop=p.movement==='hop',behaviour=chooseBehaviour({motion:p.movement,moving:p.moving,fast:p.gait==='trot',activityMode:p.activity==='move'?'auto':p.activity}),drawn=poseFor(behaviour,time,0,p.poses),legs=!!p.rig&&!drawn&&['walk','run'].includes(behaviour);ctx.save();ctx.translate(w/2,h*.91);const frame=locomotionFrame(hop?'hop':'walk',time,0,{moving:p.moving&&active&&!drawn,fast:p.gait==='trot',activity:p.activity});ctx.translate(0,-frame.lift);ctx.scale(1,frame.squash);let top=size*box.h;
   if(drawn){const t=drawn.texture,fit=Math.min(1,h*.76/(size*box.w*drawn.scale*t.height/t.width),w*.9/(size*box.w*drawn.scale)),dw=size*box.w*drawn.scale*fit,dh=dw*t.height/t.width;ctx.translate(0,-drawn.bob);ctx.rotate(drawn.tilt);ctx.scale(1,1+drawn.breath);ctx.drawImage(t,-dw/2,-dh,dw,dh);top=dh}
   else if(legs)drawPuppet(ctx,p.rig,{size,phase:active?phase:0,moving:p.moving&&active,preset:getMotion(p.species,p.gait),phases:GAITS[p.gait].phase,clock:time});
   else if(art)drawWarped(ctx,art,box,size,warpFor(behaviour,p.movement),time);
   ctx.restore();if(behaviour==='sleep'){const t=(time*.45)%1;ctx.save();ctx.globalAlpha=active?1-t:1;ctx.fillStyle='#315e65';ctx.font='700 '+Math.round(20+t*12)+'px "Baloo 2"';ctx.fillText('z',w/2+size*box.w*.28+t*18,h*.91-top-8-t*28);ctx.restore()}
  }
  function loop(now){raf=0;if(dead||document.hidden)return;const p=latest.current;if(last&&now-last<1000/30){raf=requestAnimationFrame(loop);return}const dt=last?Math.min(.08,(now-last)/1000):0;last=now;if(!p.paused&&!p.reduced){clock+=dt;phase+=dt*(p.gait==='trot'?1.25:.72)}draw();if(!p.paused&&!p.reduced)raf=requestAnimationFrame(loop)}
  function wake(){cancelAnimationFrame(raf);last=0;load();draw();if(!dead&&!document.hidden&&!latest.current.paused&&!latest.current.reduced)raf=requestAnimationFrame(loop)}
  const resize=()=>{const b=c.getBoundingClientRect();w=Math.max(1,b.width);h=Math.max(1,b.height);const d=Math.min(devicePixelRatio||1,2);c.width=Math.round(w*d);c.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);wake()};
  const ro=new ResizeObserver(resize);ro.observe(c);wakeRef.current=wake;document.addEventListener('visibilitychange',wake);resize();
  return()=>{dead=true;cancelAnimationFrame(raf);ro.disconnect();document.removeEventListener('visibilitychange',wake);wakeRef.current=null};
 },[]);
 useEffect(()=>wakeRef.current?.(),[image,rig,species,gait,moving,activity,paused,reduced,poses,movement]);
 return <canvas ref={canvas} className="companion-canvas" role="img" aria-label={label}/>;
}
