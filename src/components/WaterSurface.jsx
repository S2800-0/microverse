import {useEffect,useRef} from 'react';
// Refraction of the actual painted pixels. No video, repeated AI calls or invented terrain.
export function WaterSurface({source,paused=false,hero=false}){
 const ref=useRef(null),latest=useRef(paused);latest.current=paused;
 useEffect(()=>{let dead=false,raf=0,last=0;const c=ref.current,ctx=c.getContext('2d'),img=new Image();img.src=source;
 function draw(now){if(dead)return;raf=requestAnimationFrame(draw);if(latest.current||document.hidden){ctx.clearRect(0,0,c.width,c.height);return}if(now-last<1000/45)return;last=now;const w=c.clientWidth,h=c.clientHeight,d=Math.min(devicePixelRatio||1,1.5);if(c.width!==Math.round(w*d)||c.height!==Math.round(h*d)){c.width=Math.round(w*d);c.height=Math.round(h*d)}ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);const scale=Math.max(w/img.width,h/img.height),sw=img.width*scale,sh=img.height*scale,ox=(w-sw)*(hero&&w<=700?.22:.5),oy=(h-sh)/2;ctx.save();ctx.beginPath();const points=hero?[[.69,.80],[.79,.77],[.91,.80],[1,.76],[1,1],[.64,1],[.68,.91]]:[[0,.39],[1,.39],[1,1],[0,1]];points.forEach(([x,y],i)=>i?ctx.lineTo(ox+x*sw,oy+y*sh):ctx.moveTo(ox+x*sw,oy+y*sh));ctx.closePath();ctx.clip();
 const t=now/1000;for(let y=Math.max(0,oy+sh*(hero?.76:.39));y<h;y+=4){const shift=Math.sin(y*.043+t*1.7)*1.6+Math.sin(y*.021-t*.65)*1.1;const sy=(y-oy)/scale;ctx.drawImage(img,0,sy,img.width,4/scale,ox+shift,y,sw,4.3)}ctx.restore();}
 img.decode().then(()=>{if(!dead)raf=requestAnimationFrame(draw)}).catch(()=>{});return()=>{dead=true;cancelAnimationFrame(raf)};
 },[source,hero]);return <canvas className="water-surface" ref={ref} aria-hidden="true"/>;
}
