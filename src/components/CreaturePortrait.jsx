import {motionForSprite} from '../world/motion-points.js';
import {useEffect,useRef} from 'react';
import {cutAtlas} from '../world/sprites.js';
import {drawFlight} from '../world/habitat-layers.js';
import {prepareSpriteMotion,drawSprite} from '../world/sprite-motion.js';
export function CreaturePortrait({world,type,paused=false}){
 const ref=useRef(null),latest=useRef(paused);latest.current=paused;
 useEffect(()=>{let dead=false,raf=0,image,motion,flight=[],clock=0,last=0,painted=false;const c=ref.current,ctx=c.getContext('2d');
 async function load(){const sprites=await cutAtlas(world.atlas,world.atlasSourceCount||world.plan.inhabitants.length);image=sprites[world.atlasIndices?.[type.id]??type.id];motion=await prepareSpriteMotion(image,{rig:motionForSprite(world,type.id,sprites[type.id]),rooted:type.role==='producer'});if(world.flightType===type.id)flight=await Promise.all([0,1,2,3].map(async i=>{const im=new Image();im.src='/assets/owl-flight-'+i+'-v11.png';await im.decode();return im}));if(!dead)raf=requestAnimationFrame(draw)}
 function draw(now){if(dead)return;raf=requestAnimationFrame(draw);if(document.hidden){last=0;return}const dt=last?Math.min(.05,(now-last)/1000):0;last=now;if(!latest.current)clock+=dt;else if(painted)return;painted=true;const w=320,h=220;if(c.width!==w){c.width=w;c.height=h}ctx.clearRect(0,0,w,h);const s=Math.min(260/image.width,170/image.height),iw=image.width*s,ih=image.height*s;ctx.save();if(!latest.current)ctx.translate(Math.sin(clock*1.1)*5,0);if(flight.length)drawFlight(ctx,flight,{x:w/2,y:h*.72,size:115,clock,paused:latest.current});else drawSprite(ctx,image,motion,{x:(w-iw)/2,y:(h-ih)/2,width:iw,height:ih,clock,paused:latest.current});ctx.restore()}
 load().catch(()=>{});return()=>{dead=true;cancelAnimationFrame(raf)};
 },[world,type]);return <canvas className="creature-portrait" ref={ref} width="320" height="220" role="img" aria-label={'Close-up movement of '+type.name}/>;
}
