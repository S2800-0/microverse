import {drawStoryActor} from '../motion/story-actors.js';

export function createStoryWorld(canvas,images,session){
  const ctx=canvas.getContext('2d'),first=session.frameAt(0).changed;
  const subject=first.animals.find(a=>a.id===session.subjectId);
  const tracks=new Map();let width=1,height=1,projection=null;
  function resize(){const box=canvas.getBoundingClientRect();width=box.width;height=box.height;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  function draw(from,to,amount,{branch='changed',clock=0,reduced=false,showFood=false,emphasize=false,greeting=0}={}){
    const a=from[branch],b=to[branch],scale=Math.max(width/a.width,height/a.height)*(width<700?1.4:2.15);
    const camera={x:subject.x-(width<700?0:6),y:subject.y+(width<700?4:-6)};
    camera.x=Math.max(width/scale/2,Math.min(a.width-width/scale/2,camera.x));
    camera.y=Math.max(height/scale/2,Math.min(a.height-height/scale/2,camera.y));
    const project=(x,y)=>({x:width/2+(x-camera.x)*scale,y:height/2+(y-camera.y)*scale});
    projection={project,scale};ctx.clearRect(0,0,width,height);ctx.fillStyle='#d5d8bd';ctx.fillRect(0,0,width,height);
    const origin=project(0,0);ctx.drawImage(images.map,origin.x,origin.y,a.width*scale,a.height*scale);
    if(showFood){
      const patch=session.patch,p=project(patch.x,patch.y);
      const wash=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,scale*4);wash.addColorStop(0,'#f7edc9bc');wash.addColorStop(1,'#f7edc900');ctx.fillStyle=wash;ctx.fillRect(p.x-scale*4,p.y-scale*4,scale*8,scale*8);
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
        const x=Math.floor(patch.x)+dx,y=Math.floor(patch.y)+dy,i=y*a.width+x;if(!a.open[i])continue;
        const food=a.food[i]*(1-amount)+b.food[i]*amount;
        for(let k=0;k<3;k++){
          const s=project(x+.18+k*.26,y+.2+(k%2)*.4),tall=(.12+food*.5)*scale;
          ctx.strokeStyle=food>.65?'#537047':'#8b874f';ctx.lineWidth=Math.max(1,scale*.045);ctx.lineCap='round';
          ctx.beginPath();ctx.moveTo(s.x-scale*.09,s.y);ctx.quadraticCurveTo(s.x-scale*.08,s.y-tall*.6,s.x-scale*.16,s.y-tall*.86);ctx.moveTo(s.x,s.y);ctx.quadraticCurveTo(s.x+scale*.04,s.y-tall*.5,s.x+scale*.09,s.y-tall);ctx.stroke();
        }
      }
      if(emphasize){ctx.strokeStyle='#fdf1c6';ctx.lineWidth=2;ctx.setLineDash([5,7]);ctx.beginPath();ctx.ellipse(p.x,p.y,scale*3.8,scale*2.7,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
    }
    const next=new Map(b.animals.map(animal=>[animal.id,animal]));
    const animals=(amount>=1?b.animals:a.animals).map(animal=>{const target=next.get(animal.id)||animal;return {...animal,x:animal.x+(target.x-animal.x)*amount,y:animal.y+(target.y-animal.y)*amount};}).sort((x,y)=>x.y-y.y);
    for(const animal of animals){
      // This is an explicitly selective close-up, not an overview/count display.
      // Every animal still participates in both model branches and saved replay.
      if(animal.id!==session.subjectId)continue;
      const p=project(animal.x,animal.y),size=(animal.species==='rabbit'?4.4:animal.species==='deer'?7.5:6)*scale;
      if(p.x<-size||p.x>width+size||p.y<0||p.y>height+size)continue;
      const key=`${branch}.${animal.id}`,old=tracks.get(key)||{x:animal.x,y:animal.y,distance:0,direction:1};
      const moved=Math.hypot(animal.x-old.x,animal.y-old.y)*scale;
      const track={x:animal.x,y:animal.y,distance:old.distance+(moved<scale*3?moved:0),direction:Math.abs(animal.x-old.x)>.001?Math.sign(animal.x-old.x):old.direction};tracks.set(key,track);
      const focused=animal.id===session.subjectId;ctx.globalAlpha=1;
      const species=animal.species==='deer'?(animal.age<52?'fawn':animal.sex==='f'?'doe':'deer'):animal.species;
      drawStoryActor(ctx,images,{species,...p,y:p.y-(focused&&!reduced?greeting*10:0),size,distance:track.distance,moving:moved>.02&&moved<scale*3,direction:track.direction,clock,reduced});
      ctx.globalAlpha=1;
    }
    return {subject:project(subject.x,subject.y),patch:project(session.patch.x,session.patch.y)};
  }
  return {draw,project(x,y){return projection?.project(x,y);},destroy(){observer.disconnect();}};
}
