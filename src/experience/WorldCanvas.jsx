import {useEffect,useRef,useState} from 'react';
import {fitQuadruped} from '../core/motion/rig-fitting.js';
import {drawPuppet} from '../core/motion/puppet-motion.js';
import {HABITATS} from './world-appearance.js';
import {GAITS} from '../core/motion/rig.js';
import {getMotion} from '../core/motion/motion-library.js';
import {META_RIG_CONFIGS} from '../core/scene/meta-art-approved.js';

const SOURCES={plant:'/assets/food-grass-v7.webp',herb:'/assets/food-herb-v7.webp',fern:'/assets/food-fern-v7.webp',shrub:'/assets/food-shrub-v7.webp',map:'/assets/forest-original-2048.webp',dry:'/assets/forest-dry.webp',fox:'/assets/fox-walk.webp',rabbit:'/assets/rabbit.png',deer:'/assets/deer.png',wolf:'/assets/wolf.png',doe:'/assets/doe.png',fawn:'/assets/fawn-walk.webp'};
let imagesPromise,rigsPromise;
function prepareWorldRigs(images){return rigsPromise??=Promise.all(['deer','doe','wolf'].map(async key=>{
  try{const fitted=await fitQuadruped({source:images[key].src,config:META_RIG_CONFIGS[key]});if(!fitted?.valid)return [key,null];
    // Prepare each gait once. Ordinary frames use one texture blit per creature,
    // rather than rerunning every leg mesh across the whole population.
    const atlas=document.createElement('canvas');atlas.width=2304;atlas.height=1280;const ctx=atlas.getContext('2d');
    for(let pose=0;pose<24;pose++){ctx.save();ctx.translate(pose%6*384+192,Math.floor(pose/6)*320+285);drawPuppet(ctx,fitted.rig,{size:336,phase:pose/24,moving:true,preset:getMotion('dog'),phases:GAITS.walk.phase,clock:pose/24});ctx.restore();if(pose%4===3)await new Promise(resolve=>requestAnimationFrame(resolve))}
    return [key,atlas];
  }catch{return [key,null]}
})).then(Object.fromEntries)}
function loadImages(){return imagesPromise??=Promise.all(Object.entries(SOURCES).map(async([key,src])=>{const image=new Image();image.src=src;await image.decode();return [key,image]})).then(Object.fromEntries)}
export function frameFor(state){return {week:state.week,grass:state.grass,browse:state.browse,animals:state.animals.map(a=>({...a})),width:state.world.params.width,height:state.world.params.height,terrain:state.terrain,foodGrid:{grass:Array.from(state.world.grass),browse:Array.from(state.world.browse)},feeding:(state.world.lastFeeding||[]).map(b=>({...b}))}}

export function WorldCanvas({frame,focusId=null,paused=false,reduced=false,onSelectAnimal=null,landscape=null,habitat='meadow',label='The model forest'}){
  const landscapeImage=useRef(null);
  const canvas=useRef(null),latest=useRef(null),renderer=useRef(null),hitRegions=useRef([]),[error,setError]=useState(''),[ready,setReady]=useState(false);
  latest.current={frame,focusId,paused,reduced,onSelectAnimal,landscape,habitat};
  useEffect(()=>{let dead=false;landscapeImage.current=null;if(!landscape){renderer.current?.wake();return}const img=new Image();img.src=landscape;img.decode().then(()=>{if(!dead){landscapeImage.current=img;renderer.current?.wake()}}).catch(()=>{});return()=>{dead=true}},[landscape]);
  useEffect(()=>{
    let wasReady=false,dead=false,raf=0,images=null,width=1,height=1,old=null,shown=null,transition=1,lastTime=0,clock=0,camera=null,lastFrame=null,lastFocus=null;
    const distances=new Map();
    const scenery=document.createElement('canvas'),sceneryContext=scenery.getContext('2d');let sceneryKey='';
    const c=canvas.current,ctx=c.getContext('2d');
    function resize(){const box=c.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);const dpr=Math.min(devicePixelRatio||1,2);c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);paint(0)}
    function paint(dt){
      if(!images||!latest.current.frame)return;
      const props=latest.current,f=props.frame;if(props.landscape&&!landscapeImage.current)return;
      if(!wasReady){wasReady=true;setReady(true)}
      if(f!==lastFrame){old=shown||f;lastFrame=f;transition=props.reduced||old.week===f.week?1:0;}
      if(!props.paused)transition=Math.min(1,transition+dt/.7);
      if(props.paused)transition=1;
      const u=props.reduced?1:transition,ease=u*u*(3-2*u);
      const source=new Map((old?.animals||f.animals).map(a=>[a.id,a]));
      const animals=f.animals.map(a=>{
        const before=source.get(a.id)||a;
        const traversable=f.terrain.clear(before.x,before.y/f.height*100,a.x,a.y/f.height*100);
        const jump=!traversable&&u<1;
        return {...a,x:jump?(u<.5?before.x:a.x):before.x+(a.x-before.x)*ease,y:jump?(u<.5?before.y:a.y):before.y+(a.y-before.y)*ease,alpha:jump?Math.abs(u-.5)*2:1,moving:!jump&&u<1&&Math.hypot(a.x-before.x,a.y-before.y)>.02};
      }).sort((a,b)=>a.y-b.y);
      shown={...f,animals};
      const focused=animals.find(a=>a.id===props.focusId);
      const zoom=focused?1.08:1;
      const scale=Math.max(width/f.width,height/f.height)*zoom;
      const desired={x:focused?focused.x+(width>700?width/scale*.2:0):f.width/2,y:focused?focused.y+(width<=700?height/scale*.18:0):f.height/2};
      desired.x=Math.max(width/scale/2,Math.min(f.width-width/scale/2,desired.x));desired.y=Math.max(height/scale/2,Math.min(f.height-height/scale/2,desired.y));
      if(!camera||props.reduced){camera={...desired};lastFocus=props.focusId}else if(!props.paused){const blend=1-Math.exp(-dt*5);camera.x+=(desired.x-camera.x)*blend;camera.y+=(desired.y-camera.y)*blend}
      const project=(x,y)=>({x:width/2+(x-camera.x)*scale,y:height/2+(y-camera.y)*scale});
      const origin=project(0,0);
      // Cache the scenery between checkpoints; idle poses need no map repaint.
      const key=[width,height,c.width,c.height,origin.x,origin.y,scale,f.grass,landscapeImage.current?.src||'original'].join(':');
      if(key!==sceneryKey){sceneryKey=key;scenery.width=c.width;scenery.height=c.height;const density=c.width/width;sceneryContext.setTransform(density,0,0,density,0,0);sceneryContext.fillStyle='#f7f2e6';sceneryContext.fillRect(0,0,width,height);sceneryContext.drawImage(landscapeImage.current||images.map,origin.x,origin.y,f.width*scale,f.height*scale);
        // Food tint reflects model grass, never measured cover in the photograph.
        if(!landscapeImage.current){sceneryContext.globalAlpha=Math.max(0,Math.min(.95,(1-f.grass)*1.2));sceneryContext.drawImage(images.dry,origin.x,origin.y,f.width*scale,f.height*scale);sceneryContext.globalAlpha=1}else if(f.grass<.8){sceneryContext.save();sceneryContext.globalAlpha=Math.max(0,Math.min(.85,(.8-f.grass)*1.35));sceneryContext.filter='saturate(.2) sepia(.45)';sceneryContext.drawImage(landscapeImage.current,origin.x,origin.y,f.width*scale,f.height*scale);sceneryContext.restore()}}
      ctx.clearRect(0,0,width,height);ctx.drawImage(scenery,0,0,width,height);
      // Actual per-cell food, copied out of the model. The painted base is scenery.
      const foodArt=props.habitat==='woodland'?images.fern:props.habitat==='garden'?images.herb:images.plant;
      const patchPositions=[];
      for(let gy=5;gy<f.height;gy+=5)for(let gx=5;gx<98;gx+=6){const x=gx+Math.sin(gy*gx)*1.1,y=gy+Math.cos(gx)*.6;if(!f.terrain.walkable(x,y/f.height*100))continue;
       const cell=Math.floor(y)*f.width+Math.floor(x),before=old?.foodGrid?.grass?.[cell]??f.grass,after=f.foodGrid?.grass?.[cell]??f.grass,amount=before+(after-before)*ease,pp=project(x,y);if(amount<.04||pp.x<-60||pp.x>width+60||pp.y<-20||pp.y>height+80)continue;
       const s=scale*(2.2+amount*3.6);ctx.save();ctx.globalAlpha=Math.min(1,amount*1.4);ctx.drawImage(foodArt,pp.x-s/2,pp.y-s*.7,s,s*.8);ctx.restore();patchPositions.push({x,y,amount});
      }
      const feeding=(f.feeding||[]).filter(b=>animals.some(a=>a.id===b.id));
      hitRegions.current=[];
      for(const animal of animals){
        if(focused&&animal.id!==focused.id)continue;
        const p=project(animal.x,animal.y),baseSize=scale*(animal.species==='rabbit'?2.7:animal.species==='deer'?5:4),size=focused?Math.max(width>700?130:100,baseSize):baseSize;
        if(p.x<-size||p.x>width+size||p.y<-size||p.y>height+size)continue;
        hitRegions.current.push({id:animal.id,left:p.x-size*.43,right:p.x+size*.43,top:p.y-size*.85,bottom:p.y+5});
        const previous=distances.get(animal.id)||{x:animal.x,y:animal.y,distance:0,direction:1};
        const moved=Math.hypot(animal.x-previous.x,animal.y-previous.y)*scale;
        const next={x:animal.x,y:animal.y,distance:previous.distance+(moved<size*2?moved:0),direction:Math.abs(animal.x-previous.x)>.001?Math.sign(animal.x-previous.x):previous.direction};distances.set(animal.id,next);
        ctx.save();ctx.globalAlpha=animal.alpha;ctx.translate(p.x,p.y);ctx.scale(next.direction,1);
        // Cosmetic breathing/sniffing never changes model positions or event records.
        const alive=!props.paused&&!props.reduced;
        const meal=feeding.find(b=>b.id===animal.id),phase=clock*1.6+animal.id*.7;
        if(meal&&alive){ctx.rotate(Math.sin(clock*8)*.045);ctx.translate(0,Math.sin(clock*8)*size*.012)}
        if(alive){const breath=Math.sin(phase);ctx.scale(1+breath*.006,1+breath*.015);if(!animal.moving&&animal.species==='rabbit'){const sniff=Math.max(0,Math.sin(clock*.8+animal.id));ctx.rotate(Math.sin(clock*2.4)*sniff*.012);ctx.translate(0,-sniff*size*.025)}}
        const artKey=animal.species==='deer'&&animal.sex==='f'?'doe':animal.species;
        if(animal.species==='fox'||(animal.species==='deer'&&animal.age<52)){
          const cycle=next.distance/Math.max(1,32/.65*size/384),pose=animal.moving&&!props.paused&&!props.reduced?Math.floor(((cycle%1)+1)%1*24):0;
          ctx.drawImage(animal.species==='fox'?images.fox:images.fawn,pose%6*384,Math.floor(pose/6)*320,384,320,-size/2,-size*298/384,size,size*320/384);
        }else if(images.rigs?.[artKey]){
          const cycle=next.distance/Math.max(1,32/.65*size/384),pose=animal.moving&&alive?Math.floor(((cycle%1)+1)%1*24):0;
          ctx.drawImage(images.rigs[artKey],pose%6*384,Math.floor(pose/6)*320,384,320,-size/2,-size*298/384,size,size*320/384);
        }else{
          const image=images[artKey];if(image){const sourceHeight=Math.min(570,image.naturalHeight),h=size*sourceHeight/image.naturalWidth;
            const hop=animal.species==='rabbit'&&animal.moving&&!props.reduced?Math.abs(Math.sin(next.distance/Math.max(12,size*.3)*Math.PI))*size*.07:0;
            ctx.drawImage(image,0,0,image.naturalWidth,sourceHeight,-size/2,-h-hop,size,h);
          }
        }
        ctx.restore();
      }
      const meal=feeding.find(b=>b.id===props.focusId)||(!focused?feeding[0]:null);
      if(meal){const p=project(meal.x,meal.y),s=scale*5;ctx.save();ctx.globalAlpha=Math.max(.3,1-ease*.65);ctx.drawImage(foodArt,p.x-s*.9,p.y-s*.2,s,s*.8);ctx.restore();
       const text=(meal.species==='rabbit'?'Rabbit':meal.species==='deer'?'Deer':meal.species)+' ate '+(meal.food==='browse'?'leaves':'grass')+' here';ctx.font='700 17px "Atkinson Hyperlegible"';const bw=ctx.measureText(text).width+28,bx=Math.max(15,Math.min(width-bw-15,p.x-bw/2)),by=Math.max(200,Math.min(height-170,p.y-115));ctx.fillStyle='#fff8e9f2';ctx.beginPath();ctx.roundRect(bx,by,bw,35,17);ctx.fill();ctx.fillStyle='#1f4b49';ctx.fillText(text,bx+14,by+24);
      }
    }
    function run(now){raf=0;if(dead||document.hidden)return;if(lastTime&&now-lastTime<1000/30){raf=requestAnimationFrame(run);return}const dt=lastTime?Math.min(.08,(now-lastTime)/1000):0;lastTime=now;clock+=dt;paint(dt);if(!latest.current.paused&&!latest.current.reduced)raf=requestAnimationFrame(run)}
    function wake(){cancelAnimationFrame(raf);lastTime=0;if(!dead){paint(0);if(!document.hidden&&!latest.current.paused&&!latest.current.reduced)raf=requestAnimationFrame(run)}}
    renderer.current={wake};const observer=new ResizeObserver(resize);observer.observe(c);document.addEventListener('visibilitychange',wake);
    loadImages().then(result=>{if(!dead){images=result;resize();wake();prepareWorldRigs(images).then(rigs=>{if(!dead){images.rigs=rigs;wake()}})}}).catch(()=>{if(!dead)setError('The forest artwork could not load. Your experiment records are still available.')});
    return()=>{dead=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',wake);renderer.current=null};
  },[]);
  useEffect(()=>renderer.current?.wake(),[frame,focusId,paused,reduced]);
  function select(event){if(!onSelectAnimal)return;const box=canvas.current.getBoundingClientRect(),x=event.clientX-box.left,y=event.clientY-box.top;const target=[...hitRegions.current].reverse().find(r=>x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom);onSelectAnimal(target?.id??null,event)}
  return <><canvas className={'world-canvas'+(onSelectAnimal?' interactive-world':'')} ref={canvas} style={{backgroundImage:`url("${landscape||SOURCES.map}")`,backgroundSize:'cover',backgroundPosition:'center'}} role="img" tabIndex={onSelectAnimal?0:undefined} onKeyDown={onSelectAnimal?e=>{if(e.key==='Escape')onSelectAnimal(null,e)}:undefined} aria-busy={!ready} aria-label={label} onPointerDown={onSelectAnimal?select:undefined}/>{!ready&&!error&&<p className="world-loading" role="status">Welcoming the neighbours…</p>}{error&&<p className="art-error" role="status">{error}</p>}</>;
}
