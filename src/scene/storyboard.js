import {mountCachedWalk} from '../motion/cached-walk.js';
import {entranceFrame,foxDrift} from './entrance-motion.js';
import {mountPaintedRain} from './painted-rain.js';
import {mountFoxGuide} from './fox-guide.js';
const el=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,fox=null,fawn=null,disposed=false,raf=0;
const guide=mountFoxGuide(el('entry-guide'),{paused}),rain=mountPaintedRain(el('rain-canvas'),{paused});
function motion(){document.body.dataset.motion=paused?'paused':'playing';el('motion-toggle').textContent=paused?'Play motion':'Pause motion';el('motion-toggle').setAttribute('aria-pressed',String(paused));fox?.setPaused(paused);fawn?.setPaused(paused);guide.setPaused(paused);rain.setPaused(paused);update();}
el('motion-toggle').onclick=()=>{paused=!paused;motion();};reduced.addEventListener('change',()=>{paused=reduced.matches;motion();});
// The fox is clamped to 300px wide, so a share of the viewport is not enough
// travel on a phone. Measure the distance that actually clears the stage.
function setFoxOffset(region,progress){
  const fox=el('fox-canvas').hidden?el('fox-still'):el('fox-canvas');
  const clear=region.clientWidth-fox.offsetLeft+fox.offsetWidth/2+8;
  region.style.setProperty('--fox-offset',`${foxDrift(progress)/foxDrift(1)*clear}px`);
}
function update(){raf=0;const region=el('journey'),box=region.getBoundingClientRect(),frame=entranceFrame(-box.top/Math.max(1,region.offsetHeight-innerHeight));document.querySelector('.site-header').dataset.solid=String(box.bottom<100);if(paused)return;region.style.setProperty('--camera',String(frame.camera));region.style.setProperty('--edge-camera',String(frame.foreground));region.style.setProperty('--edge-shift',`${frame.edgeShift}%`);setFoxOffset(region,frame.progress);region.style.setProperty('--title-opacity',String(frame.titleOpacity));}
function schedule(){if(!raf)raf=requestAnimationFrame(update);}addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);motion();
mountCachedWalk(el('fox-canvas'),{source:'/entrance/fox-walk.webp',paused,continuous:true,onReady:()=>{el('fox-still').hidden=true;}}).then(player=>{if(disposed)player.destroy();else{fox=player;fox.setPaused(paused);}}).catch(()=>{el('fox-walk').disabled=true;el('art-status').textContent='The still fox is shown while movement is unavailable.';});
mountCachedWalk(el('fawn-canvas'),{source:'/entrance/fawn-walk.webp',paused,continuous:true,onReady:()=>{el('fawn-still').hidden=true;}}).then(player=>{if(disposed)player.destroy();else{fawn=player;fawn.setPaused(paused);}}).catch(()=>{});
el('fox-walk').onclick=()=>fox?.replay();
const stories={spring:{title:'What if the rain slows down?',copy:'Start with the plants. Who depends on them?',note:'A little illustrated preview. The lesson runs the experiment.'},rain:{title:'What could more rain change?',copy:'A drink for the plants. A question about the animals.',note:'This changes the illustration. Explore the model to see its results.'},dry:{title:'What if the rain slows down?',copy:'Less water for the plants. What might happen next?',note:'Follow the first story to explore a dry spell.'}};
for(const button of document.querySelectorAll('[data-weather-choice]'))button.onclick=()=>{const key=button.dataset.weatherChoice,story=stories[key];el('weather-picture').dataset.weather=key;el('rain-title').textContent=story.title;el('weather-copy').textContent=story.copy;el('weather-status').textContent=story.note;rain.setMode(key);fawn?.replay();for(const other of document.querySelectorAll('[data-weather-choice]'))other.setAttribute('aria-pressed',String(other===button));};
const entry=el('entry-dialog');for(const button of document.querySelectorAll('[data-enter]'))button.onclick=()=>{entry.showModal();guide.say('Every forest starts with a question. Let’s follow yours.');};el('entry-close').onclick=()=>entry.close();
addEventListener('pagehide',event=>{if(!event.persisted){disposed=true;cancelAnimationFrame(raf);fox?.destroy();fawn?.destroy();guide.destroy();rain.destroy();}});
