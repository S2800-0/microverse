import {removeSpriteBackground} from './sprite-mask.js';
// The user requested programmatic cutting. Remove only white connected to cell edges,
// preserving white markings inside the animal. No inference call per cutout or frame.
async function cutAtlasUncached(source,count,{cols=2,rows=2,allowEmpty=false}={}){
 const image=new Image();image.src=source;await image.decode();const sprites=[];
 for(let i=0;i<count;i++){
  const cellW=Math.floor(image.width/cols),cellH=Math.floor(image.height/rows),col=i%cols,row=Math.floor(i/cols);
  const insetX=0,insetY=0,c=document.createElement('canvas');c.width=cellW;c.height=cellH;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,col*cellW,row*cellH,cellW,cellH,0,0,cellW,cellH);
  const data=ctx.getImageData(0,0,cellW,cellH);data.data.set(removeSpriteBackground(data.data,cellW,cellH));const p=data.data,w=cellW,h=cellH;
  let x0=w,y0=h,x1=0,y1=0,ink=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4;if(p[k+3]>30&&Math.min(p[k],p[k+1],p[k+2])<228){ink++;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}}
  if(ink<100||x1<=x0||y1<=y0){if(allowEmpty){sprites.push(null);continue}throw Error('One neighbour did not paint clearly. Choose another saved world.')}ctx.putImageData(data,0,0);const out=document.createElement('canvas');out.width=x1-x0+9;out.height=y1-y0+9;out.getContext('2d').drawImage(c,x0-4,y0-4,out.width,out.height,0,0,out.width,out.height);out.atlasCrop={x:(col*cellW+insetX+x0-4)/image.width,y:(row*cellH+insetY+y0-4)/image.height,w:out.width/image.width,h:out.height/image.height};sprites.push(out);
 }return sprites;
}

const cache=new Map();
export function cutAtlas(source,count){const key=source+'|'+count;if(cache.has(key))return cache.get(key);if(cache.size>=6)cache.delete(cache.keys().next().value);const promise=cutAtlasUncached(source,count).catch(e=>{cache.delete(key);throw e});cache.set(key,promise);return promise}
// A drawn pose sheet. Big models don't keep tails inside neat cells, so each pose is found by its own
// connected shape, then placed by row and column. Falls back to plain cells if the shapes don't add up.
async function cutPoseComponents(source,cols,rows){
 const image=new Image();image.src=source;await image.decode();const w=image.width,h=image.height,want=cols*rows;
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const data=ctx.getImageData(0,0,w,h);data.data.set(removeSpriteBackground(data.data,w,h));const p=data.data,labels=new Int32Array(w*h),parts=[],stack=[];
 // A curled tail can trap paper inside the shape. Clear pure-white pockets too big to be a highlight.
 const seenWhite=new Uint8Array(w*h),isPaper=k=>p[k*4+3]>30&&p[k*4]>=250&&p[k*4+1]>=250&&p[k*4+2]>=248,pocket=[];
 for(let start=0;start<w*h;start++){if(seenWhite[start]||!isPaper(start))continue;pocket.length=0;seenWhite[start]=1;pocket.push(start);for(let i=0;i<pocket.length;i++){const k=pocket[i],x=k%w;for(const n of [x>0?k-1:-1,x<w-1?k+1:-1,k-w,k+w])if(n>=0&&n<w*h&&!seenWhite[n]&&isPaper(n)){seenWhite[n]=1;pocket.push(n)}}if(pocket.length>=w*h*.00035)for(const k of pocket)p[k*4+3]=0}
 for(let start=0;start<w*h;start++){if(labels[start]||p[start*4+3]<=30)continue;const id=parts.length+1,part={id,area:0,x0:w,y0:h,x1:0,y1:0};labels[start]=id;stack.push(start);
  while(stack.length){const k=stack.pop(),x=k%w,y=(k-x)/w;part.area++;part.x0=Math.min(part.x0,x);part.x1=Math.max(part.x1,x);part.y0=Math.min(part.y0,y);part.y1=Math.max(part.y1,y);
   for(const n of [x>0?k-1:-1,x<w-1?k+1:-1,y>0?k-w:-1,y<h-1?k+w:-1])if(n>=0&&!labels[n]&&p[n*4+3]>30){labels[n]=id;stack.push(n)}}
  parts.push(part)}
 const sorted=[...parts].sort((a,b)=>b.area-a.area),main=sorted.slice(0,want);
 if(main.length<want||main[want-1].area<main[0].area*.12)return null;
 // Whiskers, crumbs and loose feather tips belong to the closest pose when they sit right beside it.
 const members=new Map(main.map(m=>[m.id,m]));const reach=Math.max(w,h)*.022;
 for(const s of sorted.slice(want)){let best=null,gap=reach;for(const m of main){const dx=Math.max(m.x0-s.x1,s.x0-m.x1,0),dy=Math.max(m.y0-s.y1,s.y0-m.y1,0),d=Math.hypot(dx,dy);if(d<gap){gap=d;best=m}}if(best){members.set(s.id,best);best.x0=Math.min(best.x0,s.x0);best.x1=Math.max(best.x1,s.x1);best.y0=Math.min(best.y0,s.y0);best.y1=Math.max(best.y1,s.y1)}}
 const byRow=[...main].sort((a,b)=>(a.y0+a.y1)-(b.y0+b.y1)),ordered=[];
 for(let r=0;r<rows;r++)ordered.push(...byRow.slice(r*cols,(r+1)*cols).sort((a,b)=>(a.x0+a.x1)-(b.x0+b.x1)));
 return ordered.map(m=>{const pad=4,cw=m.x1-m.x0+1+pad*2,ch=m.y1-m.y0+1+pad*2,out=document.createElement('canvas');out.width=cw;out.height=ch;const octx=out.getContext('2d'),cell=octx.createImageData(cw,ch);
  for(let y=m.y0;y<=m.y1;y++)for(let x=m.x0;x<=m.x1;x++){const k=y*w+x;if(members.get(labels[k])!==m)continue;const from=k*4,to=((y-m.y0+pad)*cw+(x-m.x0+pad))*4;cell.data[to]=p[from];cell.data[to+1]=p[from+1];cell.data[to+2]=p[from+2];cell.data[to+3]=p[from+3]}
  octx.putImageData(cell,0,0);return out});
}
export function cutPoseGrid(source,cols,rows){const key=source+'|grid'+cols+'x'+rows;if(cache.has(key))return cache.get(key);if(cache.size>=6)cache.delete(cache.keys().next().value);const promise=cutPoseComponents(source,cols,rows).then(cells=>cells||cutAtlasUncached(source,cols*rows,{cols,rows,allowEmpty:true})).catch(e=>{cache.delete(key);throw e});cache.set(key,promise);return promise}
