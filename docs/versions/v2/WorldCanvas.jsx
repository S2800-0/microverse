import {useEffect,useRef,useState} from 'react';

const SOURCES={map:'/assets/forest.webp',dry:'/assets/forest-dry.webp',fox:'/assets/fox-walk.webp',rabbit:'/assets/rabbit.png',deer:'/assets/deer.png',wolf:'/assets/wolf.png'};
let imagesPromise;
function loadImages(){return imagesPromise??=Promise.all(Object.entries(SOURCES).map(async([key,src])=>{const image=new Image();image.src=src;await image.decode();return [key,image]})).then(Object.fromEntries)}
export function frameFor(state){return {week:state.week,grass:state.grass,browse:state.browse,animals:state.animals.map(a=>({...a})),width:state.world.params.width,height:state.world.params.height,terrain:state.terrain}}

export function WorldCanvas({frame,focusId=null,paused=false,reduced=false,label='The model forest'}){
  const canvas=useRef(null),latest=useRef(null),renderer=useRef(null),[error,setError]=useState('');
  latest.current={frame,focusId,paused,reduced};
  useEffect(()=>{
    let dead=false,raf=0,images=null,width=1,height=1,old=null,shown=null,transition=1,lastTime=0,clock=0,camera=null,lastFrame=null,lastFocus=null;
    const distances=new Map();
    const c=canvas.current,ctx=c.getContext('2d');
    function resize(){const box=c.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);const dpr=Math.min(devicePixelRatio||1,2);c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);paint(0)}
    function paint(dt){
      if(!images||!latest.current.frame)return;
      const props=latest.current,f=props.frame;
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
      const zoom=focused?1.8:1;
      const scale=Math.max(width/f.width,height/f.height)*zoom;
      const desired={x:focused?focused.x+(width>700?width/scale*.2:0):f.width/2,y:focused?focused.y+(width<=700?height/scale*.18:0):f.height/2};
      if(!focused){desired.x=Math.max(width/scale/2,Math.min(f.width-width/scale/2,desired.x));desired.y=Math.max(height/scale/2,Math.min(f.height-height/scale/2,desired.y));}
      if(focused||!camera||props.reduced||props.focusId!==lastFocus){camera={...desired};lastFocus=props.focusId}else if(!props.paused){const blend=1-Math.exp(-dt*5);camera.x+=(desired.x-camera.x)*blend;camera.y+=(desired.y-camera.y)*blend}
      const project=(x,y)=>({x:width/2+(x-camera.x)*scale,y:height/2+(y-camera.y)*scale});
      const origin=project(0,0);ctx.clearRect(0,0,width,height);ctx.fillStyle='#f7f2e6';ctx.fillRect(0,0,width,height);ctx.drawImage(images.map,origin.x,origin.y,f.width*scale,f.height*scale);
      // One painterly food indicator, driven by actual model grass level.
      ctx.globalAlpha=Math.max(0,Math.min(.95,(1-f.grass)*1.2));ctx.drawImage(images.dry,origin.x,origin.y,f.width*scale,f.height*scale);ctx.globalAlpha=1;
      for(const animal of animals){
        if(focused&&animal.id!==focused.id)continue;
        const p=project(animal.x,animal.y),size=scale*(animal.species==='rabbit'?2.7:animal.species==='deer'?5:4);
        if(p.x<-size||p.x>width+size||p.y<-size||p.y>height+size)continue;
        const previous=distances.get(animal.id)||{x:animal.x,y:animal.y,distance:0,direction:1};
        const moved=Math.hypot(animal.x-previous.x,animal.y-previous.y)*scale;
        const next={x:animal.x,y:animal.y,distance:previous.distance+(moved<size*2?moved:0),direction:Math.abs(animal.x-previous.x)>.001?Math.sign(animal.x-previous.x):previous.direction};distances.set(animal.id,next);
        ctx.save();ctx.globalAlpha=animal.alpha*(focused&&animal.id!==focused.id ? .82 : 1);ctx.translate(p.x,p.y);ctx.scale(next.direction,1);
        if(animal.species==='fox'){
          const cycle=next.distance/Math.max(1,32/.65*size/384),pose=animal.moving&&!props.paused&&!props.reduced?Math.floor(((cycle%1)+1)%1*24):0;
          ctx.drawImage(images.fox,pose%6*384,Math.floor(pose/6)*320,384,320,-size/2,-size*298/384,size,size*320/384);
        }else{
          const image=images[animal.species];if(image){const sourceHeight=Math.min(570,image.naturalHeight),h=size*sourceHeight/image.naturalWidth;
            const hop=animal.species==='rabbit'&&animal.moving&&!props.reduced?Math.abs(Math.sin(next.distance/Math.max(12,size*.3)*Math.PI))*size*.07:0;
            ctx.drawImage(image,0,0,image.naturalWidth,sourceHeight,-size/2,-h-hop,size,h);
          }
        }
        ctx.restore();
      }
    }
    function run(now){raf=0;if(dead||document.hidden)return;const dt=lastTime?Math.min(.05,(now-lastTime)/1000):0;lastTime=now;clock+=dt;paint(dt);if(!latest.current.paused&&!latest.current.reduced&&transition<1)raf=requestAnimationFrame(run)}
    function wake(){cancelAnimationFrame(raf);lastTime=0;if(!dead){paint(0);if(!document.hidden&&!latest.current.paused&&!latest.current.reduced)raf=requestAnimationFrame(run)}}
    renderer.current={wake};const observer=new ResizeObserver(resize);observer.observe(c);document.addEventListener('visibilitychange',wake);
    loadImages().then(result=>{if(!dead){images=result;resize();wake()}}).catch(()=>{if(!dead)setError('The forest artwork could not load. Your experiment records are still available.')});
    return()=>{dead=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',wake);renderer.current=null};
  },[]);
  useEffect(()=>renderer.current?.wake(),[frame,focusId,paused,reduced]);
  return <><canvas className="world-canvas" ref={canvas} role="img" aria-label={label}/>{error&&<p className="art-error" role="status">{error}</p>}</>;
}
