import {mountFoxScene} from '../motion/fox-scene.js';

const el=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,fox=null,disposed=false;
function motionState(){document.body.dataset.motion=paused?'paused':'playing';el('motion-toggle').textContent=paused?'Play motion':'Pause motion';el('motion-toggle').setAttribute('aria-pressed',String(paused));fox?.setPaused(paused);if(paused){el('fox-scene').style.removeProperty('--drift-x');el('fox-scene').style.removeProperty('--drift-y');}}
el('motion-toggle').onclick=()=>{paused=!paused;motionState();};
reduced.addEventListener('change',()=>{paused=reduced.matches;motionState();});motionState();
mountFoxScene(el('fox-canvas'),{paused,onReady:({articulated})=>{el('fox-still').hidden=true;if(!articulated)el('art-status').textContent='The fox illustration is ready; articulated movement is unavailable in this browser.';}}).then(value=>{if(disposed)value.destroy();else{fox=value;fox.setPaused(paused);}}).catch(()=>{el('art-status').textContent='The still fox is shown while motion is unavailable.';el('fox-walk').disabled=true;});
el('fox-walk').onclick=()=>{if(!fox)return;if(paused&&!reduced.matches){paused=false;motionState();}fox.replay();};
const fine=matchMedia('(hover: hover) and (pointer: fine)');
el('fox-scene').addEventListener('pointermove',event=>{if(paused||reduced.matches||!fine.matches)return;const box=el('fox-scene').getBoundingClientRect();el('fox-scene').style.setProperty('--drift-x',`${((event.clientX-box.left)/box.width-.5)*12}px`);el('fox-scene').style.setProperty('--drift-y',`${((event.clientY-box.top)/box.height-.5)*8}px`);});
el('fox-scene').addEventListener('pointerleave',()=>{el('fox-scene').style.removeProperty('--drift-x');el('fox-scene').style.removeProperty('--drift-y');});
const stories={spring:{title:'Every story starts somewhere.',copy:'Meet the plants, grazers, and hunters that share this little world.',status:'Choose a question, then explore it in the game.'},rain:{title:'What could more rain change?',copy:'Start with the plants. Then follow the animals that depend on them.',status:'Illustration only. Run an experiment in the game to see model results.'},dry:{title:'What happens when the rain slows?',copy:'Less water. A question about food. Where would you look first?',status:'Illustration only. The first adventure explores a dry spell.'}};
for(const button of document.querySelectorAll('[data-weather-choice]'))button.onclick=()=>{const key=button.dataset.weatherChoice,story=stories[key];el('weather-picture').dataset.weather=key;el('fox-scene').dataset.weather=key;el('weather-title').textContent=story.title;el('weather-copy').textContent=story.copy;el('weather-status').textContent=story.status;for(const other of document.querySelectorAll('[data-weather-choice]'))other.setAttribute('aria-pressed',String(button===other));};
const entry=el('entry-dialog');for(const button of document.querySelectorAll('[data-enter]'))button.onclick=()=>entry.showModal();el('entry-close').onclick=()=>entry.close();
window.addEventListener('pagehide',event=>{if(!event.persisted){disposed=true;fox?.destroy();}});
