import {mountFoxScene} from '../motion/fox-scene.js';
import {journeyFrame} from './journey.js';

const el=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,fox=null,disposed=false,scrollRaf=0,chapter=-1;
function motionState(){document.body.dataset.motion=paused?'paused':'playing';el('motion-toggle').textContent=paused?'Play motion':'Pause motion';el('motion-toggle').setAttribute('aria-pressed',String(paused));fox?.setPaused(paused);updateJourney(false);}
el('motion-toggle').onclick=()=>{paused=!paused;motionState();};
reduced.addEventListener('change',()=>{paused=reduced.matches;motionState();});motionState();
mountFoxScene(el('fox-canvas'),{paused,onReady:({articulated})=>{el('fox-still').hidden=true;if(!articulated)el('art-status').textContent='The fox illustration is ready; articulated movement is unavailable in this browser.';}}).then(value=>{if(disposed)value.destroy();else{fox=value;fox.setPaused(paused);}}).catch(()=>{el('art-status').textContent='The still fox is shown while motion is unavailable.';el('fox-walk').disabled=true;});
el('fox-walk').onclick=()=>{if(!fox)return;if(paused&&!reduced.matches){paused=false;motionState();}fox.replay();};
function updateJourney(moveFox=true){
  const region=el('journey'),box=region.getBoundingClientRect(),frame=journeyFrame(-box.top/Math.max(1,region.offsetHeight-innerHeight));
  const scene=el('fox-scene');region.style.setProperty('--journey',String(frame.progress));
  if(!paused){region.style.setProperty('--camera',String(frame.camera));region.style.setProperty('--fox-left',`${frame.foxLeft}%`);}
  document.body.dataset.beyondIntro=String(box.bottom<=100);
  if(chapter!==frame.chapter){chapter=frame.chapter;for(const [i,id]of ['opening-copy','question-copy','invitation-copy'].entries())el(id).hidden=i!==chapter;el('journey-chapter').textContent=['01 / A LITTLE WORLD','02 / ONE SMALL CHANGE','03 / YOUR OWN ADVENTURE'][chapter];scene.dataset.weather=frame.weather;}
  if(moveFox&&box.top<0&&box.bottom>0&&!paused){const canvas=el('fox-canvas');fox?.setJourney((frame.foxLeft-48)/100*region.clientWidth*canvas.width/Math.max(1,canvas.clientWidth));}
}
function scheduleJourney(){if(!scrollRaf)scrollRaf=requestAnimationFrame(()=>{scrollRaf=0;updateJourney();});}
window.addEventListener('scroll',scheduleJourney,{passive:true});window.addEventListener('resize',scheduleJourney);updateJourney(false);
const stories={spring:{title:'Every story starts somewhere.',copy:'Meet the plants, grazers, and hunters that share this little world.',status:'Choose a question, then explore it in the game.'},rain:{title:'What could more rain change?',copy:'Start with the plants. Then follow the animals that depend on them.',status:'Illustration only. Run an experiment in the game to see model results.'},dry:{title:'What happens when the rain slows?',copy:'Less water. A question about food. Where would you look first?',status:'Illustration only. The first adventure explores a dry spell.'}};
for(const button of document.querySelectorAll('[data-weather-choice]'))button.onclick=()=>{const key=button.dataset.weatherChoice,story=stories[key];el('weather-picture').dataset.weather=key;el('fox-scene').dataset.weather=key;el('weather-title').textContent=story.title;el('weather-copy').textContent=story.copy;el('weather-status').textContent=story.status;for(const other of document.querySelectorAll('[data-weather-choice]'))other.setAttribute('aria-pressed',String(button===other));};
const entry=el('entry-dialog');for(const button of document.querySelectorAll('[data-enter]'))button.onclick=()=>{document.body.classList.add('entering-world');entry.showModal();};el('entry-close').onclick=()=>entry.close();entry.addEventListener('close',()=>document.body.classList.remove('entering-world'));
window.addEventListener('pagehide',event=>{if(!event.persisted){disposed=true;fox?.destroy();}});
