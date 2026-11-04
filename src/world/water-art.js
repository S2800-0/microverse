// Water drawn on the device: which pixels of a painting are water, and how they move and shine.
// A picture effect only. It is not a fluid simulation and changes nothing in the world's rules.
function seeded(n){let a=n;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}}
export function isWaterPixel(r,g,b){return b>r+14&&b>=g-6&&r<170}
// Soft mask of the painted water, keeping only real bodies of water and not a blue flower.
export function waterMask(image,{size=480}={}){
 const w=size,h=Math.max(1,Math.round(size*image.height/image.width)),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,w,h);const data=ctx.getImageData(0,0,w,h),p=data.data,wet=new Uint8Array(w*h);
 for(let i=0;i<w*h;i++)wet[i]=isWaterPixel(p[i*4],p[i*4+1],p[i*4+2])?1:0;
 const seen=new Uint8Array(w*h),keep=new Uint8Array(w*h),minimum=w*h*.012,points=[];
 for(let start=0;start<w*h;start++){if(!wet[start]||seen[start])continue;const stack=[start],cells=[];seen[start]=1;while(stack.length){const i=stack.pop(),x=i%w,y=Math.floor(i/w);cells.push(i);for(const j of [x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1])if(j>=0&&wet[j]&&!seen[j]){seen[j]=1;stack.push(j)}}if(cells.length>=minimum)for(const i of cells)keep[i]=1}
 let count=0;for(let i=0;i<w*h;i++){p[i*4]=p[i*4+1]=p[i*4+2]=255;p[i*4+3]=keep[i]?255:0;if(keep[i])count++}
 if(!count)return null;
 ctx.putImageData(data,0,0);const soft=document.createElement('canvas');soft.width=w;soft.height=h;const s=soft.getContext('2d');s.filter='blur(2px)';s.drawImage(c,0,0);
 const rnd=seeded(11);for(let n=0;n<4000&&points.length<40;n++){const x=Math.floor(rnd()*w),y=Math.floor(rnd()*h);if(keep[y*w+x]&&keep[y*w+Math.min(w-1,x+6)]&&keep[y*w+Math.max(0,x-6)])points.push({x:x/w,y:y/h})}
 return {canvas:soft,points};
}
// Seamless curved lines of light. Two layers drifting apart read as moving water.
export function lightTile(size=512,seed=3){
 const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d'),rnd=seeded(seed);ctx.lineCap='round';
 for(let n=0;n<46;n++){const x=rnd()*size,y=rnd()*size,len=40+rnd()*110,bend=(rnd()-.5)*110,width=1+rnd()*2.6;ctx.strokeStyle=`rgba(255,255,255,${.2+rnd()*.5})`;ctx.lineWidth=width;for(const [ox,oy] of [[0,0],[-size,0],[0,-size],[-size,-size]]){ctx.beginPath();ctx.moveTo(x+ox,y+oy);ctx.quadraticCurveTo(x+ox+len/2,y+oy+bend,x+ox+len,y+oy+bend*.2);ctx.stroke()}}
 return c;
}
// A pond bed seen through clear water, painted once in the watercolour palette.
export function paintPondFloor(width=1200,height=888){
 const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d'),rnd=seeded(29);
 const base=ctx.createLinearGradient(0,0,0,height);base.addColorStop(0,'#5fb0b4');base.addColorStop(.55,'#3f8f9c');base.addColorStop(1,'#2f7686');ctx.fillStyle=base;ctx.fillRect(0,0,width,height);
 const blot=(x,y,r,color,alpha)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+alpha);g.addColorStop(.7,color+alpha);g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()};
 for(let i=0;i<70;i++)blot(rnd()*width,rnd()*height,60+rnd()*190,i%3?'#2c7f8a':'#7cc6bd','22');
 for(let i=0;i<40;i++)blot(rnd()*width,height*(.55+rnd()*.5),50+rnd()*130,'#c9b98a','1c');
 // Pebbles rest on the bed, darker and softer than anything swimming above them.
 for(let i=0;i<70;i++){const x=rnd()*width,y=height*(.35+rnd()*.68),rx=7+rnd()*24,ry=rx*(.45+rnd()*.25),tone=rnd();ctx.fillStyle=`rgba(${60+tone*50},${105+tone*45},${115+tone*35},.5)`;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rnd()*.6,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(235,250,240,.1)';ctx.beginPath();ctx.ellipse(x-rx*.2,y-ry*.3,rx*.5,ry*.35,0,0,Math.PI*2);ctx.fill()}
 // Rippled sand and a few dim weed shadows, so depth has a floor.
 ctx.strokeStyle='rgba(225,240,220,.09)';ctx.lineWidth=2;for(let i=0;i<34;i++){const y=height*(.4+i/34*.6);ctx.beginPath();for(let x=0;x<=width;x+=40){const v=y+Math.sin(x*.012+i)*9+Math.sin(x*.031+i*2)*4;x?ctx.lineTo(x,v):ctx.moveTo(x,v)}ctx.stroke()}
 // Soft weed tufts: several thin curving blades from one root, never a single straight stalk.
 ctx.lineCap='round';for(let i=0;i<20;i++){const x=rnd()*width,y=height*(.45+rnd()*.55),blades=4+Math.floor(rnd()*4);for(let b=0;b<blades;b++){const lean=(b-blades/2)*14+(rnd()-.5)*18,len=34+rnd()*62;ctx.strokeStyle=`rgba(30,92,86,${.12+rnd()*.14})`;ctx.lineWidth=1.5+rnd()*2.2;ctx.beginPath();ctx.moveTo(x+b*3,y);ctx.bezierCurveTo(x+b*3+lean*.2,y-len*.5,x+b*3+lean*1.2,y-len*.7,x+b*3+lean*.9,y-len);ctx.stroke()}}
 const edge=ctx.createRadialGradient(width/2,height*.42,height*.3,width/2,height*.5,width*.72);edge.addColorStop(0,'rgba(20,70,85,0)');edge.addColorStop(1,'rgba(16,56,72,.5)');ctx.fillStyle=edge;ctx.fillRect(0,0,width,height);
 return c;
}
// Sum of slow waves, in painted pixels. Time 0 is the painting as it was made.
export function waterWave(x,y,time){return {x:Math.sin(y*.05+time*1.15)*2.4+Math.sin((x+y)*.021-time*.7)*1.6,y:Math.cos(x*.04+time*.95)*1.5}}
