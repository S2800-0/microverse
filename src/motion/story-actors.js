import {distancePhase} from './actor-track.js';
const FEET=[298,298,298,298,298,299,298,298,298,298,297,294,296,296,296,296,296,296,296,296,296,295,296,298];
export async function loadStoryActors(){
  const sources={fox:'/entrance/fox-walk.webp',rabbit:'/meta-art/game-rabbit.png',map:'/meta-art/game-map-live.png'};
  const images={};await Promise.all(Object.entries(sources).map(async([key,src])=>{const image=new Image();image.src=src;await image.decode();images[key]=image;}));return images;
}

export function drawStoryActor(ctx,images,{species='fox',x,y,size=180,distance=0,moving=false,direction=1,scaleX=direction,clock=0,reduced=false}){
  if(!['fox','rabbit'].includes(species))throw new Error('This movement study supports fox and rabbit artwork.');
  ctx.save();ctx.translate(x,y);
  const hop=species==='rabbit'&&moving&&!reduced?Math.abs(Math.sin(distance/Math.max(12,size*.3)*Math.PI))*size*.075:0;
  ctx.fillStyle='#2f402328';ctx.beginPath();ctx.ellipse(0,1,size*.2*(1-hop/Math.max(1,size)),size*.025,0,0,Math.PI*2);ctx.fill();
  ctx.scale(scaleX,1);const breathe=!moving&&!reduced?1+Math.sin(clock*1.7)*.003:1;ctx.scale(1,breathe);
  if(species==='fox'){
    const phase=distancePhase(distance,size),pose=moving&&!reduced?Math.floor((((phase%1)+1)%1)*24):0,s=size/384;
    ctx.drawImage(images.fox,pose%6*384,Math.floor(pose/6)*320,384,320,-size/2,-FEET[pose]*s,384*s,320*s);
  }else{
    const image=images[species]||images.rabbit;
    // Public normalized cutouts share a reviewed foot line at source y=570.
    const sourceHeight=Math.min(570,image.naturalHeight),height=size*sourceHeight/image.naturalWidth;
    ctx.drawImage(image,0,0,image.naturalWidth,sourceHeight,-size/2,-height-hop,size,height);
  }
  ctx.restore();
}
