import {createStorySession,foodFinding} from './story-session.ts';
import {loadStoryActors} from '../motion/story-actors.js';
import {createStoryWorld} from './story-world.js';

const el=id=>document.getElementById(id),phases=['meet','predict','watch','reflect'];
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const session=createStorySession(),frames=Array.from({length:14},(_,week)=>session.frameAt(week));let world,phase='meet',prediction='',reflection='',greeted=false,explained=false;
let elapsed=0,paused=false,reduced=preference.matches,branch='changed',last=0,clock=0,greetingAt=-100,dead=false,raf=0,visible=true,painted=false;
const visibility=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting===true;last=0;});visibility.observe(document.querySelector('.story'));
const review=new URLSearchParams(location.search).get('frame');
if(phases.includes(review)){phase=review;if(phase==='watch'||phase==='reflect'){elapsed=13;paused=true;}}

function hide(id,value){el(id).hidden=value;}
function nextLabel(text){el('story-next').replaceChildren(document.createTextNode(text));const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';el('story-next').append(arrow);}
function sync({focus=false}={}){
  document.querySelector('.story').dataset.phase=phase;
  el('step-label').textContent=`${({meet:'Meet',predict:'Wonder',watch:'Notice',reflect:'Connect'})[phase]} · ${phases.indexOf(phase)+1} of 4`;
  const titles={meet:'A small neighbour.\nA big connection.',predict:'What might\nchange first?',watch:elapsed>=13?(branch==='baseline'?'With usual rain…':foodFinding(frames[13].baseline.food[session.patch.cell],frames[13].changed.food[session.patch.cell])):'A little less rain.\nLet’s watch.',reflect:explained?'Little changes.\nConnected lives.':'What did\nyou notice?'};
  el('story-title').replaceChildren(...titles[phase].split('\n').flatMap((text,i)=>i?[document.createElement('br'),document.createTextNode(text)]:[document.createTextNode(text)]));
  el('story-subtitle').textContent={meet:'Meet one rabbit in the meadow.',predict:'Imagine half the usual rain.',watch:elapsed>=13?(branch==='baseline'?'The same patch, at the same time.':'Look at the highlighted meadow patch.'):'A few weeks go by in our model forest.',reflect:explained?'What depends on the plants near you?':'Choose what caught your eye.'}[phase];
  el('guide-line').textContent={meet:greeted?'Hello, little neighbour. What does a meadow need?':'Tap the rabbit to say hello.',predict:'Will the plant food change first, or the animals?',watch:elapsed>=13?(branch==='baseline'?'This is the same patch with usual rain. Switch back to compare.':'The food grew differently. Want to see this patch with usual rain?'):'Watch the meadow. We’ll stop for a closer look.',reflect:explained?'In this model, rain changes plant growth. Rabbits depend on grass food.':reflection?'What helped you notice that? Add a few words, if you like.':'Choose what you noticed. Not sure is welcome, too.'}[phase];
  el('guide-face').src=`/meta-art/guide-${phase==='predict'||phase==='reflect'&&!explained?'curious':'attentive'}.png`;
  hide('prediction-choices',phase!=='predict');hide('reflection-choices',phase!=='reflect'||explained);hide('why-field',phase!=='reflect'||explained||!reflection);hide('connection',!explained||phase!=='reflect');
  hide('rabbit-hello',phase!=='meet'||greeted);hide('story-back',phase==='meet');hide('time-marker',phase!=='watch');hide('compare-weather',phase!=='watch'||elapsed<13);
  hide('story-next',(phase==='meet'&&!greeted)||(phase==='predict'&&!prediction)||(phase==='watch'&&elapsed<13)||(phase==='reflect'&&!reflection&&!explained));
  nextLabel({meet:'What if it rains less?',predict:'Let’s find out',watch:'What did you notice?',reflect:explained?'Play the story again':'See the connections'}[phase]);
  el('compare-weather').textContent=branch==='changed'?'See usual rain':'Back to less rain';
  el('pause-motion').textContent=paused?'Resume':'Pause';el('pause-motion').setAttribute('aria-pressed',String(paused));
  el('reduce-motion').checked=reduced;el('save-story').disabled=elapsed<13;
  el('time-label').textContent=`Week ${Math.floor(elapsed)}${paused?' · paused':''}`;el('condition-label').textContent=branch==='changed'?'Less rain':'Usual rain';
  el('story-status').textContent=phase==='reflect'&&explained?'That connection helps us ask questions. It does not prove why every animal outcome changed.':'';
  for(const button of document.querySelectorAll('[data-predict]'))button.setAttribute('aria-pressed',String(button.dataset.predict===prediction));
  for(const button of document.querySelectorAll('[data-reflect]'))button.setAttribute('aria-pressed',String(button.dataset.reflect===reflection));
  if(focus)el('story-title').focus();
}
function restart(){phase='meet';prediction='';reflection='';greeted=false;explained=false;elapsed=0;paused=false;branch='changed';el('reflection-note').value='';sync({focus:true});}
el('rabbit-hello').onclick=()=>{greeted=true;greetingAt=clock;sync();};
for(const button of document.querySelectorAll('[data-predict]'))button.onclick=()=>{prediction=button.dataset.predict;sync();};
for(const button of document.querySelectorAll('[data-reflect]'))button.onclick=()=>{reflection=button.dataset.reflect;sync();};
el('reflection-note').oninput=()=>{if(el('reflection-note').value.trim()&&!reflection){reflection='My own observation';sync();}};
el('story-next').onclick=()=>{
  if(phase==='meet')phase='predict';else if(phase==='predict'){phase='watch';elapsed=0;paused=false;branch='changed';}
  else if(phase==='watch'){phase='reflect';branch='changed';}
  else if(!explained)explained=true;else{restart();return;}sync({focus:true});
};
el('story-back').onclick=()=>{if(phase==='reflect'&&explained){explained=false;}else phase=phases[Math.max(0,phases.indexOf(phase)-1)];if(phase!=='watch')branch='changed';sync({focus:true});};
el('compare-weather').onclick=()=>{branch=branch==='changed'?'baseline':'changed';sync();};
el('pause-motion').onclick=()=>{paused=!paused;sync();};
el('reduce-motion').onchange=()=>{reduced=el('reduce-motion').checked;sync();};
preference.addEventListener('change',()=>{reduced=preference.matches;sync();});
el('story-menu').onclick=()=>{paused=true;sync();el('options').showModal();};
el('options-close').onclick=()=>el('options').close();
el('restart-story').onclick=()=>{el('options').close();restart();};
el('save-story').onclick=()=>{const file=session.replay(prediction,[reflection,el('reflection-note').value.trim()].filter(Boolean).join('. '));const url=URL.createObjectURL(new Blob([JSON.stringify(file)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='microverse-rain-story.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function render(now){
  if(dead)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;
  if(!document.hidden&&(visible||!painted)){
    if(!paused)clock+=dt;
    if(phase==='watch'&&!paused&&elapsed<13){const before=Math.floor(elapsed);elapsed=Math.min(13,elapsed+dt/1.05);if(elapsed===13)sync();else if(Math.floor(elapsed)!==before)el('time-label').textContent=`Week ${Math.floor(elapsed)}`;}
    const week=phase==='meet'||phase==='predict'?0:Math.floor(elapsed),next=Math.min(13,week+1),amount=reduced?0:elapsed-week;
    const positions=world.draw(frames[week],frames[next],amount,{branch,clock,reduced:reduced||paused,showFood:phase==='watch'||phase==='reflect',emphasize:elapsed>=13,greeting:Math.max(0,Math.sin(Math.min(1,(clock-greetingAt)/.5)*Math.PI))});
    painted=true;
    el('rabbit-hello').style.left=`${positions.subject.x}px`;el('rabbit-hello').style.top=`${positions.subject.y}px`;
  }
  raf=requestAnimationFrame(render);
}
document.addEventListener('visibilitychange',()=>{last=0;});
addEventListener('pageshow',()=>{last=0;});
addEventListener('pagehide',event=>{if(!event.persisted){dead=true;cancelAnimationFrame(raf);visibility.disconnect();world?.destroy();}});
sync();
try{const images=await loadStoryActors();world=createStoryWorld(el('story-world'),images,session);hide('loading',true);raf=requestAnimationFrame(render);}catch{el('loading').textContent='The meadow could not load. Refresh to try again.';el('rabbit-hello').disabled=true;}
