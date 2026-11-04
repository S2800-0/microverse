import {motionPoint,validateMotionHints} from './motion-points.js';
const cache=new WeakMap();
function triangle(ctx,image,s,d){const [p,q,r]=s,[a,b,c]=d,den=p.x*(q.y-r.y)+q.x*(r.y-p.y)+r.x*(p.y-q.y);if(!den)return;const A=(a.x*(q.y-r.y)+b.x*(r.y-p.y)+c.x*(p.y-q.y))/den,B=(a.y*(q.y-r.y)+b.y*(r.y-p.y)+c.y*(p.y-q.y))/den,C=(a.x*(r.x-q.x)+b.x*(p.x-r.x)+c.x*(q.x-p.x))/den,D=(a.y*(r.x-q.x)+b.y*(p.x-r.x)+c.y*(q.x-p.x))/den,E=(a.x*(q.x*r.y-r.x*q.y)+b.x*(r.x*p.y-p.x*r.y)+c.x*(p.x*q.y-q.x*p.y))/den,F=(a.y*(q.x*r.y-r.x*q.y)+b.y*(r.x*p.y-p.x*r.y)+c.y*(p.x*q.y-q.x*p.y))/den;ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.clip();ctx.setTransform(A,B,C,D,E,F);ctx.drawImage(image,0,0);ctx.restore()}
export async function prepareSpriteMotion(image,{rig=null,rooted=false}={}){
 if(cache.has(image))return cache.get(image);const promise=(async()=>{
 const accepted=rig?validateMotionHints(rig):null;if(!accepted&&!rooted)return null;const w=256,h=Math.max(96,Math.round(w*image.height/image.width)),atlas=document.createElement('canvas');atlas.width=w*6;atlas.height=h*5;const ctx=atlas.getContext('2d'),frames=24;
 for(let pose=0;pose<26;pose++){
  const tile=document.createElement('canvas');tile.width=w;tile.height=h;const c=tile.getContext('2d'),cols=14,rows=10,phase=(pose<24?pose/24:0)*Math.PI*2;
  const point=(x,y)=>{const p=motionPoint(x/image.width,y/image.height,phase,{rig:accepted,rooted,blink:pose>=24});return{x:p.x*w,y:p.y*h}};
  for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){const a={x:gx/cols*image.width,y:gy/rows*image.height},b={x:(gx+1)/cols*image.width,y:a.y},d={x:a.x,y:(gy+1)/rows*image.height},e={x:b.x,y:d.y};triangle(c,image,[a,b,e],[point(a.x,a.y),point(b.x,b.y),point(e.x,e.y)]);triangle(c,image,[a,e,d],[point(a.x,a.y),point(e.x,e.y),point(d.x,d.y)])}
  ctx.drawImage(tile,pose%6*w,Math.floor(pose/6)*h);if(pose%3===2)await new Promise(requestAnimationFrame);
 }
 const blendCanvas=document.createElement('canvas');blendCanvas.width=w;blendCanvas.height=h;return {atlas,w,h,frames,rig:accepted,rooted,blendCanvas};})();cache.set(image,promise);return promise;
}
export function drawSprite(ctx,image,motion,{x,y,width,height,clock=0,phase=0,paused=false}){
 if(!motion){ctx.drawImage(image,x,y,width,height);return}
 const blink=motion.rig&&!paused&&((clock+phase*2)%8)>.0&&((clock+phase*2)%8)<.16;
 const position=((clock*(motion.rooted?.24:1.15)+phase) %1)*motion.frames,lower=blink?24:Math.floor(position),upper=blink?24:(lower+1)%motion.frames,mix=blink?0:position-Math.floor(position);
 const tile=motion.blendCanvas,b=tile.getContext('2d');b.clearRect(0,0,motion.w,motion.h);b.globalCompositeOperation='source-over';b.globalAlpha=1-mix;b.drawImage(motion.atlas,lower%6*motion.w,Math.floor(lower/6)*motion.h,motion.w,motion.h,0,0,motion.w,motion.h);if(mix>.002){b.globalCompositeOperation='lighter';b.globalAlpha=mix;b.drawImage(motion.atlas,upper%6*motion.w,Math.floor(upper/6)*motion.h,motion.w,motion.h,0,0,motion.w,motion.h)}b.globalAlpha=1;b.globalCompositeOperation='source-over';ctx.drawImage(tile,x,y,width,height);
}
