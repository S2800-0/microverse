import {createStorySession,foodFinding} from './story-session.ts';
import {loadStoryActors} from '../motion/story-actors.js';
import {createStoryWorld} from './story-world.js';
import {createNaturalSpeaker} from '../voice/natural-speaker.js';
import {createStoryVoice} from './story-voice.js';
import {storyDownloadLinks} from './story-export.js';

const el=id=>document.getElementById(id),phases=['meet','predict','watch','reflect'];
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const embedded=new URLSearchParams(location.search).get('embedded')==='1'&&parent!==window;
let session,frames,moment,images,world;
let phase='meet',reflectionStep='notice',prediction='',reflection='',place='',greeted=false;
let elapsed=0,paused=false,reduced=preference.matches,branch='changed',view='story';
let last=0,clock=0,greetingAt=-100,dead=false,raf=0,visible=true,painted=false,hostHidden=false,hostWasPaused=false;
let savedKey='';
const overlayPause=new Map();
const voice=createStoryVoice({speaker:createNaturalSpeaker(),onChange:state=>{
  el('read-story').checked=state.enabled;
  el('repeat-story').disabled=!state.enabled||!state.canSpeak||state.speaking;
  el('story-voice-status').textContent=state.enabled?(state.canSpeak?'Natural voice reads the guide. Your notes stay private.':'Audio isn’t ready here. The guide’s words stay on screen.'):'The guide’s words stay on screen.';
}});

function prepareSession(scenario='dry'){
  session=createStorySession(7,scenario);frames=Array.from({length:14},(_,week)=>session.frameAt(week));moment=session.moment();
  document.title=`Microverse · ${session.settings.title}`;document.querySelector('.story').setAttribute('aria-label',session.settings.title);
  world?.destroy();if(images)world=createStoryWorld(el('story-world'),images,session);
}
prepareSession();
const review=new URLSearchParams(location.search).get('frame');
if(phases.includes(review)){phase=review;if(phase==='watch'||phase==='reflect'){elapsed=13;paused=true;}}
const visibility=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting===true;last=0;if(!visible)voice.stop();});visibility.observe(document.querySelector('.story'));
const hide=(id,value)=>{el(id).hidden=value;};
const reflectionText=()=>[reflection,el('reflection-note').value.trim()].filter(Boolean).join('. ');
const connectionText=()=>[place,el('outside-note').value.trim()].filter(Boolean).join('. ');
const complete=()=>phase==='reflect'&&reflectionStep==='done';

function nextLabel(text){
  el('story-next').replaceChildren(document.createTextNode(text));
  const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';el('story-next').append(arrow);
}
function setTitle(text){
  el('story-title').replaceChildren(...text.split('\n').flatMap((part,i)=>i?[document.createElement('br'),document.createTextNode(part)]:[document.createTextNode(part)]));
}
function refreshDownloads(){
  if(elapsed<13)return;
  const key=JSON.stringify([session.scenario,prediction,reflectionText(),connectionText()]);
  if(key===savedKey)return;savedKey=key;
  const links=storyDownloadLinks(session,prediction,reflectionText(),connectionText());el('save-story').href=links.replay;
  if(links.card)for(const id of ['save-discovery','save-before-next'])el(id).href=links.card;
}
function sync({focus=false}={}){
  const finished=elapsed>=13,reflecting=phase==='reflect',explained=reflecting&&reflectionStep!=='notice';
  const outside=reflecting&&reflectionStep==='outside',done=complete(),inspecting=view==='moment';
  const settings=session.settings;
  document.querySelector('.story').dataset.phase=inspecting?'moment':phase;
  el('step-label').textContent=inspecting?'Recorded moment':`${({meet:'Meet',predict:'Wonder',watch:'Notice',reflect:'Connect'})[phase]} · ${phases.indexOf(phase)+1} of 4`;
  el('story-kicker').textContent=settings.title.toUpperCase();
  let title,subtitle,caption;
  if(inspecting){
    title='A new\nneighbour.';subtitle=`A saved view from the end of week ${moment.frameWeek}.`;
    caption='This rabbit was born during our experiment. Births are one part of a population’s story.';
  }else if(phase==='meet'){
    title='A small neighbour.\nA big connection.';subtitle='Meet one rabbit in the meadow.';
    caption=greeted?'Hello, little neighbour. What does a meadow need?':'Tap the rabbit to say hello.';
  }else if(phase==='predict'){
    title='What might\nchange first?';subtitle=settings.imagine;caption='Will the plant food change first, or the animals?';
  }else if(phase==='watch'){
    title=finished?(branch==='baseline'?'With usual rain…':foodFinding(frames[13].baseline.food[session.patch.cell],frames[13].changed.food[session.patch.cell])):`${settings.title}.\nLet’s watch.`;
    subtitle=finished?(branch==='baseline'?'The same patch, at the same time.':'Look at the highlighted meadow patch.'):'A few weeks go by in our model forest.';
    caption=finished?(branch==='baseline'?'This is the same patch with usual rain. Switch back to compare.':'The food grew differently. Want to see this patch with usual rain?'):'Watch the meadow. We’ll stop for a closer look.';
  }else if(reflectionStep==='notice'){
    title='What did\nyou notice?';subtitle='Choose what caught your eye.';
    caption=reflection?'What helped you notice that? Add a few words, if you like.':'Choose what you noticed. Not sure is welcome, too.';
  }else if(reflectionStep==='connection'){
    title='Little changes.\nConnected lives.';subtitle='What depends on the plants near you?';
    caption='In this model, rain changes plant growth. Rabbits depend on grass food.';
  }else if(outside){
    title='Take a little\ncuriosity outside.';subtitle='Choose a place you know.';
    caption=place?'What grows there? What would you look for before deciding how to help?':'Where might you look for a plant-and-animal connection?';
  }else{
    title='Your discovery.\nYour next question.';subtitle='There is more to wonder about.';
    caption='Keep a discovery card, try another rain question, or return to your forest.';
  }
  setTitle(title);el('story-subtitle').textContent=subtitle;el('guide-line').textContent=caption;
  el('guide-face').src=`/meta-art/guide-${phase==='predict'||reflecting&&!done?'curious':'attentive'}.png`;
  hide('prediction-choices',phase!=='predict'||inspecting);hide('reflection-choices',!reflecting||reflectionStep!=='notice'||inspecting);
  hide('why-field',!reflecting||reflectionStep!=='notice'||!reflection||inspecting);
  hide('connection',!reflecting||reflectionStep!=='connection'||inspecting);
  hide('outside-choices',!outside||inspecting);hide('outside-field',!outside||!place||inspecting);
  el('connection-condition').textContent=settings.condition;el('connection-growth').textContent=settings.connection;
  hide('rabbit-hello',phase!=='meet'||greeted||inspecting);hide('story-back',phase==='meet'||inspecting);
  hide('time-marker',phase!=='watch'&&!inspecting);hide('compare-weather',phase!=='watch'||!finished||inspecting);
  const nextHidden=done||(phase==='meet'&&!greeted)||(phase==='predict'&&!prediction)||(phase==='watch'&&!finished)||(reflecting&&reflectionStep==='notice'&&!reflection);
  hide('story-next',!inspecting&&nextHidden);
  nextLabel(inspecting?'Back to my discovery':({meet:settings.invitation,predict:'Let’s find out',watch:'What did you notice?',reflect:outside?(place?'Keep my discovery':'Skip for now'):reflectionStep==='connection'?'Take the question outside':'See the connections'})[phase]);
  hide('discovery-actions',!done||inspecting);hide('inspection-actions',!explained||outside||inspecting);hide('look-moment',!moment);
  el('compare-weather').textContent=branch==='changed'?'See usual rain':`Back to ${settings.condition.toLowerCase()}`;
  el('pause-motion').textContent=paused?'Resume':'Pause';el('pause-motion').setAttribute('aria-pressed',String(paused));
  el('reduce-motion').checked=reduced;hide('save-story',!finished);hide('save-before-next',!reflection);
  const shownWeek=inspecting?moment.frameWeek:Math.floor(elapsed);
  el('time-label').textContent=inspecting?`Saved week ${shownWeek}`:`Week ${shownWeek}${paused?' · paused':''}`;
  el('condition-label').textContent=branch==='changed'?settings.condition:'Usual rain';
  el('story-status').textContent=inspecting?'This saved state follows the logged birth. It does not show the birth happening.':reflecting&&reflectionStep==='connection'?'A possible connection to investigate—not proof of why every animal outcome changed.':'';
  el('story-scope').textContent=`${settings.condition}: rainfall is ${settings.rain===.5?'half':'one and a half times'} the usual amount for one model year. This story watches its first 13 weeks. Both forests share the same complete starting state.`;
  for(const [attribute,value]of [['predict',prediction],['reflect',reflection],['place',place]])for(const button of document.querySelectorAll(`[data-${attribute}]`))button.setAttribute('aria-pressed',String(button.dataset[attribute]===value));
  if(finished&&(done||document.querySelector('#options[open],#next-story[open]')))refreshDownloads();
  if(!paused&&!hostHidden&&!document.querySelector('dialog[open]'))voice.caption(caption);
  if(focus)el('story-title').focus();
}

function restart(scenario=session.scenario){
  voice.stop();overlayPause.clear();prepareSession(scenario);phase='meet';reflectionStep='notice';prediction='';reflection='';place='';greeted=false;elapsed=0;paused=false;branch='changed';view='story';painted=false;
  el('reflection-note').value='';el('outside-note').value='';sync({focus:true});
}
function leave(){voice.stop();if(embedded)parent.postMessage({type:'microverse.story.close'},location.origin);else location.assign('/');}
function openOverlay(id){overlayPause.set(id,paused);paused=true;voice.stop();if(id==='options'||id==='next-story')refreshDownloads();sync();el(id).showModal();}
for(const id of ['options','records-dialog','next-story'])el(id).addEventListener('close',()=>{paused=hostHidden?true:(overlayPause.get(id)??paused);overlayPause.delete(id);sync();});

el('rabbit-hello').onclick=()=>{greeted=true;greetingAt=clock;sync();};
for(const button of document.querySelectorAll('[data-predict]'))button.onclick=()=>{prediction=button.dataset.predict;sync();};
for(const button of document.querySelectorAll('[data-reflect]'))button.onclick=()=>{reflection=button.dataset.reflect;sync();};
for(const button of document.querySelectorAll('[data-place]'))button.onclick=()=>{place=button.dataset.place;sync();};
el('reflection-note').oninput=()=>{savedKey='';};el('outside-note').oninput=()=>{savedKey='';};
el('story-next').onclick=()=>{
  if(view==='moment'){view='story';branch='changed';}
  else if(phase==='meet')phase='predict';
  else if(phase==='predict'){phase='watch';elapsed=0;paused=false;branch='changed';}
  else if(phase==='watch'){phase='reflect';reflectionStep='notice';branch='changed';}
  else if(reflectionStep==='notice')reflectionStep='connection';
  else if(reflectionStep==='connection')reflectionStep='outside';
  else if(reflectionStep==='outside')reflectionStep='done';
  sync({focus:true});
};
el('story-back').onclick=()=>{
  if(view==='moment')view='story';
  else if(phase==='reflect'&&reflectionStep!=='notice')reflectionStep=({connection:'notice',outside:'connection',done:'outside'})[reflectionStep];
  else phase=phases[Math.max(0,phases.indexOf(phase)-1)];
  if(phase!=='watch')branch='changed';sync({focus:true});
};
el('compare-weather').onclick=()=>{branch=branch==='changed'?'baseline':'changed';sync();};
el('pause-motion').onclick=()=>{paused=!paused;if(paused)voice.stop();sync();if(!paused&&voice.state().enabled)voice.repeat();};
el('reduce-motion').onchange=()=>{reduced=el('reduce-motion').checked;sync();};
preference.addEventListener('change',()=>{reduced=preference.matches;sync();});
el('story-menu').onclick=()=>openOverlay('options');el('options-close').onclick=()=>el('options').close();
el('restart-story').onclick=()=>{el('options').close();restart();};
for(const id of ['leave-story','options-leave','return-forest'])el(id).onclick=leave;
if(embedded)document.querySelector('.brand').onclick=event=>{event.preventDefault();leave();};
el('read-story').onchange=()=>{voice.caption(el('guide-line').textContent);voice.enable(el('read-story').checked);};
el('repeat-story').onclick=()=>voice.repeat();
el('look-moment').onclick=()=>{view='moment';branch='changed';paused=true;voice.stop();sync({focus:true});};
el('look-records').onclick=()=>{
  const packet=session.evidence(),lastFrame=frames[13],cell=session.patch.cell;
  el('patch-record').textContent=`At week 13: ${Math.round(lastFrame.baseline.food[cell]*100)} with usual rain; ${Math.round(lastFrame.changed.food[cell]*100)} with ${session.settings.condition.toLowerCase()}.`;
  el('counts-condition').textContent=session.settings.condition;
  const tbody=el('population-record');tbody.replaceChildren();
  for(const species of ['rabbit','deer','fox','wolf']){const tr=document.createElement('tr');for(const value of [species==='fox'?'Foxes':species==='wolf'?'Wolves':species==='rabbit'?'Rabbits':'Deer',lastFrame.baseline.counts[species],lastFrame.changed.counts[species]]){const td=document.createElement(tr.children.length?'td':'th');td.textContent=String(value);tr.append(td);}tbody.append(tr);}
  el('moment-record').textContent=moment?`${moment.eventId} · logged week ${moment.record.week}: ${moment.record.text} The close-up uses saved week ${moment.frameWeek}.`:'No supported rabbit-birth close-up is available in this short run.';
  el('records-dialog').dataset.elapsed=String(packet.elapsed);openOverlay('records-dialog');
};
for(const id of ['records-close','records-return'])el(id).onclick=()=>el('records-dialog').close();
el('another-question').onclick=()=>openOverlay('next-story');el('next-story-close').onclick=()=>el('next-story').close();
for(const button of document.querySelectorAll('[data-story]'))button.onclick=()=>{el('next-story').close();restart(button.dataset.story);};
addEventListener('message',event=>{
  if(!embedded||event.origin!==location.origin||event.source!==parent||event.data?.type!=='microverse.story.visibility'||typeof event.data.visible!=='boolean')return;
  if(!event.data.visible){if(!hostHidden)hostWasPaused=paused;hostHidden=true;paused=true;voice.stop();}
  else if(hostHidden){hostHidden=false;paused=document.querySelector('dialog[open]')?true:hostWasPaused;last=0;}
  sync();
});
addEventListener('keydown',event=>{if(event.key==='Escape'&&embedded&&!document.querySelector('dialog[open]')){event.preventDefault();leave();}});

function render(now){
  if(dead)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;
  if(!document.hidden&&!hostHidden&&(visible||!painted)){
    if(!paused)clock+=dt;
    if(phase==='watch'&&view==='story'&&!paused&&elapsed<13){const before=Math.floor(elapsed);elapsed=Math.min(13,elapsed+dt/1.05);if(elapsed===13)sync();else if(Math.floor(elapsed)!==before)el('time-label').textContent=`Week ${Math.floor(elapsed)}`;}
    const inspecting=view==='moment',week=inspecting?moment.frameWeek:phase==='meet'||phase==='predict'?0:Math.floor(elapsed);
    const next=inspecting?week:Math.min(13,week+1),amount=inspecting||reduced?0:elapsed-week;
    const positions=world.draw(frames[week],frames[next],amount,{branch,clock,reduced,dt,focusId:inspecting?moment.animalId:session.subjectId,showFood:!inspecting&&(phase==='watch'||phase==='reflect'),emphasize:!inspecting&&elapsed>=13,greeting:Math.max(0,Math.sin(Math.min(1,(clock-greetingAt)/.5)*Math.PI))});
    painted=true;el('rabbit-hello').style.left=`${positions.subject.x}px`;el('rabbit-hello').style.top=`${positions.subject.y}px`;
  }
  raf=requestAnimationFrame(render);
}
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)voice.stop();});
addEventListener('pageshow',()=>{last=0;});
addEventListener('pagehide',event=>{voice.stop();if(!event.persisted){dead=true;cancelAnimationFrame(raf);visibility.disconnect();world?.destroy();voice.destroy();}});
sync();
if(embedded)parent.postMessage({type:'microverse.story.ready'},location.origin);
try{images=await loadStoryActors();world=createStoryWorld(el('story-world'),images,session);hide('loading',true);raf=requestAnimationFrame(render);}catch{el('loading').textContent='The meadow could not load. Refresh to try again.';el('rabbit-hello').disabled=true;}
