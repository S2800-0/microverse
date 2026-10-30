import {createActorTrack} from '../../src/motion/actor-track.js';
import {loadStoryActors,drawStoryActor} from '../../src/motion/story-actors.js';
const el=id=>document.getElementById(id),canvas=el('acting-world'),ctx=canvas.getContext('2d');
const actor=createActorTrack({x:370,y:425,speed:68});
let images,paused=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,clock=0,dead=false,raf=0;
const times=[];el('acting-reduced').checked=reduced;
el('walk-right').onclick=()=>actor.goTo(760,425);el('walk-left').onclick=()=>actor.goTo(200,425);el('turn-around').onclick=()=>actor.turn();el('stop-fox').onclick=()=>actor.stop();
el('pause-acting').onclick=()=>{paused=!paused;el('pause-acting').textContent=paused?'Resume':'Pause';el('pause-acting').setAttribute('aria-pressed',String(paused));};
el('acting-reduced').onchange=()=>{reduced=el('acting-reduced').checked;};
function render(now){
  if(dead)return;const dt=last?Math.min(.05,(now-last)/1000):0;last=now;
  if(!document.hidden){const start=performance.now();if(!paused)clock+=dt;const pose=actor.tick(paused?0:dt);
    ctx.clearRect(0,0,960,540);ctx.drawImage(images.map,250,350,1000,562,0,0,960,540);
    const light=ctx.createLinearGradient(0,0,0,540);light.addColorStop(0,'#f5eed536');light.addColorStop(1,'#eff0d51a');ctx.fillStyle=light;ctx.fillRect(0,0,960,540);
    ctx.strokeStyle='#f5e9c390';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(480,431,370,11,0,0,Math.PI*2);ctx.stroke();
    drawStoryActor(ctx,images,{species:'fox',...pose,size:360,clock,reduced:reduced||paused});
    const state=paused?'Paused':pose.turning?'Turning':pose.moving?'Walking':'Resting';
    if(el('acting-status').textContent!==state)el('acting-status').textContent=state;
    times.push(performance.now()-start);if(times.length>120)times.shift();if(times.length===120){const sorted=[...times].sort((a,b)=>a-b);el('render-proof').textContent=`Local draw sample · median ${sorted[60].toFixed(1)} ms · 95th percentile ${sorted[114].toFixed(1)} ms · 120 frames`;}
  }raf=requestAnimationFrame(render);
}
document.addEventListener('visibilitychange',()=>{last=0;});addEventListener('pageshow',()=>{last=0;});addEventListener('pagehide',event=>{if(!event.persisted){dead=true;cancelAnimationFrame(raf);}});
try{images=await loadStoryActors();raf=requestAnimationFrame(render);}catch{el('acting-status').textContent='The saved artwork could not load. Refresh to try again.';}
