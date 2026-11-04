// Low-opacity motion over the actual painted ground; these effects do not change ecological state.
export function environmentKind(habitat,condition){return habitat==='marine'?'water':habitat==='snow'&&condition!=='warm'?'snow':condition==='dry'?'dry':condition==='warm'?'sun':'rain'}
export function drawEnvironment(ctx,{x=0,y=0,width,height,clock=0,habitat='land',condition='usual',paused=false,foreground=false,leaves=[]}){
 const t=paused?0:clock,kind=environmentKind(habitat,condition);ctx.save();ctx.beginPath();ctx.rect(x,y,width,height);ctx.clip();
 if(!foreground){
  for(let i=0;i<3;i++){const cx=x+width*(.2+i*.3+Math.sin(t*.12+i)*.035),cy=y+height*.15;const light=ctx.createRadialGradient(cx,cy,0,cx,cy,width*.55);light.addColorStop(0,habitat==='marine'?'rgba(255,252,213,.13)':'rgba(255,241,194,.12)');light.addColorStop(1,'rgba(255,252,213,0)');ctx.fillStyle=light;ctx.fillRect(x,y,width,height)}
 }else if(kind==='water'){
  ctx.fillStyle='rgba(244,255,251,.35)';for(let i=0;i<14;i++){const px=x+((i*.173+t*.006)%1)*width,py=y+(1-((i*.119+t*.024)%1))*height;ctx.beginPath();ctx.arc(px,py,1.2+(i%3)*.6,0,Math.PI*2);ctx.fill()}
 }else if(kind==='snow'){
  ctx.fillStyle='rgba(255,253,245,.7)';for(let i=0;i<38;i++){const px=x+((i*.137+Math.sin(t*.4+i)*.025)%1+1)%1*width,py=y+((i*.191+t*(.024+i%3*.006))%1)*height;ctx.beginPath();ctx.arc(px,py,1.4+i%3*.7,0,Math.PI*2);ctx.fill()}
 }else{
  const count=kind==='rain'?24:kind==='dry'?3:0;ctx.strokeStyle='rgba(73,119,135,.22)';ctx.lineWidth=1.2;for(let i=0;i<count;i++){const px=x+((i*.167+t*.033)%1)*width,py=y+((i*.193+t*.52)%1)*height;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-3,py+10);ctx.stroke()}
  if(habitat!=='arid')for(let i=0;i<Math.min(4,leaves.length);i++){const px=x+((i*.247+t*.012)%1)*width,py=y+((i*.277+t*.03)%1)*height,s=width*.022;ctx.save();ctx.translate(px,py);ctx.rotate(Math.sin(t+i)+t*.17);ctx.globalAlpha=.55;ctx.drawImage(leaves[i],-s/2,-s/2,s,s);ctx.restore()}
 }
 ctx.restore();
}
