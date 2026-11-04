// Compact displacements of the original watercolor pixels. No new image or inferred biology per frame.
export function validateMotionHints(raw){
 if(!raw||Object.keys(raw).some(k=>!['tail','fin','mouth','eye'].includes(k)))throw Error('Unknown movement region.');const out={};
 for(const key of ['tail','fin','mouth','eye']){const p=raw[key];if(!p||typeof p.visible!=='boolean'||!['x','y','rx','ry'].every(k=>Number.isFinite(p[k])&&p[k]>=0&&p[k]<=1)||p.rx>.3||p.ry>.4)throw Error('Movement hints must stay bounded.');out[key]={visible:p.visible,x:p.x,y:p.y,rx:p.rx,ry:p.ry};}return out;
}
const wave=(p,x,y)=>p?.visible?Math.exp(-2*((x-p.x)/Math.max(.02,p.rx))**2-2*((y-p.y)/Math.max(.02,p.ry))**2):0;
export function motionPoint(x,y,phase,{rig=null,rooted=false,blink=false}={}){
 let nx=x,ny=y;
 if(rooted)nx+=Math.sin(phase)*(1-y)**2*.045;
 if(rig){
  ny+=Math.sin(phase)*.024*wave(rig.tail,x,y);
  const fin=wave(rig.fin,x,y);nx+=Math.sin(phase)*.025*fin;ny+=Math.cos(phase)*.025*fin;
  ny+=Math.max(0,Math.sin(phase*.5))*.02*wave(rig.mouth,x,y)*(y>=rig.mouth.y?1:-.2);
  if(blink)ny+=(rig.eye.y-y)*.85*wave(rig.eye,x,y);
 }
 return {x:nx,y:ny};
}

export function motionForSprite(world,index,image){
 const raw=world.motionHints?.[index];if(!raw)return null;
 if(world.motionSpace!=='atlas')return validateMotionHints(raw);
 const box=image.atlasCrop;if(!box)return null;const mapped={};
 for(const key of ['tail','fin','mouth','eye']){const p=raw[key];if(!p)return null;const x=(p.x-box.x)/box.w,y=(p.y-box.y)/box.h,rx=p.rx/box.w,ry=p.ry/box.h;mapped[key]={visible:p.visible&&x>=0&&x<=1&&y>=0&&y<=1,x:Math.max(0,Math.min(1,x)),y:Math.max(0,Math.min(1,y)),rx:Math.min(.3,rx),ry:Math.min(.4,ry)}}
 return validateMotionHints(mapped);
}
