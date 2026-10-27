import { createForestController } from './controller.ts';
import { ART } from './art.js';
import { buildRig, GAITS } from '../motion/rig.js';
import { assessRig } from '../motion/rig-analysis.js';
import { prepareJointPieces, drawPuppet } from '../motion/puppet-motion.js';
import { getMotion } from '../motion/motion-library.js';
import { installCreatureImport } from './creature-import.js';
import { installExperimentView } from './experiment-view.js';
import { installQuestions } from '../investigation/questions-view.js';
import {installNarration} from './narration-view.js';
import {forestNarration,narrationSnapshot} from './narration.js';
import {installPlaceReview} from '../place/view.js';

const el=id=>document.getElementById(id);
const forest=createForestController();
const narrator=installNarration();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const assets=new Map(),actors=new Map();
let playing=false,speed=1,accumulator=0,progress=1,last=0,clock=0,pending=null;
let needsDraw=true;
const cam={x:0,y:0,zoom:1,minZoom:1,width:0,height:0};
const status=message=>{el('status').textContent=message;};
function setPlaying(value){playing=value;if(!value)narrator.stop();el('play').textContent=value?'Pause':'Play';el('play').setAttribute('aria-pressed',String(value));}

async function loadArt(){
  let failures=0;
  await Promise.all(Object.entries(ART).map(async([species,art])=>{
    if(!art.image)return;
    try{
      const image=new Image();image.src=art.image;await image.decode();
      let rig=null;
      if(art.cut){try{const candidate=await buildRig(art.image,art.cut);if(!assessRig(candidate).warnings.length)rig=prepareJointPieces(candidate);}catch{/* Labeled whole-image rendering remains available. */}}
      assets.set(species,{image,rig});
    }catch{failures++;}
  }));
  el('loading').hidden=true;
  needsDraw=true;
  status(failures?`${failures} image(s) unavailable; model creatures still work. Click a creature to inspect its record.`:'Ready. Click a creature, or bring someone into the clearing.');
}
function nameOf(a){return forest.getState().appearances.get(a.id)?.name||a.name||`${ART[a.species]?.label||a.species} ${a.id}`;}
function actorFor(animal){
  let actor=actors.get(animal.id);if(actor)return actor;
  const button=document.createElement('button');button.className='animal';button.dataset.id=animal.id;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=180;
  const label=document.createElement('span');label.className='animal-label';
  label.textContent=nameOf(animal);button.append(canvas,label);
  button.setAttribute('aria-label',`${nameOf(animal)}, ${animal.species}`);
  button.onclick=()=>{el('notes').hidden=true;forest.select(animal.id);updateCard();};
  button.onfocus=()=>{
    const v=el('viewport'),sx=cam.x+animal.x/100*cam.width*cam.zoom,sy=cam.y+animal.y/forest.getState().world.params.height*cam.height*cam.zoom;
    if(sx<30||sx>v.clientWidth-30||sy<125||sy>v.clientHeight-170){cam.x=v.clientWidth/2-animal.x/100*cam.width*cam.zoom;cam.y=v.clientHeight/2-animal.y/forest.getState().world.params.height*cam.height*cam.zoom;clampCamera();}
  };
  el('animals').append(button);
  actor={button,canvas,x:animal.x,y:animal.y,fromX:animal.x,fromY:animal.y,toX:animal.x,toY:animal.y,phase:animal.id*.37,dir:1};
  actors.set(animal.id,actor);return actor;
}
function sync(animate=false){
  needsDraw=true;
  const state=forest.getState(),live=new Set(state.animals.map(a=>a.id));
  for(const [id,actor]of actors)if(!live.has(id)){actor.button.remove();actors.delete(id);}
  for(const a of state.animals){const actor=actorFor(a);actor.fromX=actor.x;actor.fromY=actor.y;actor.toX=a.x;actor.toY=a.y;if(!animate){actor.x=a.x;actor.y=a.y;actor.fromX=a.x;actor.fromY=a.y;}}
  el('empty').hidden=state.animals.length>0;
  el('calendar').textContent=`${state.season[0].toUpperCase()+state.season.slice(1)} · year ${Math.floor(state.week/52)+1}`;
  el('week').textContent=`Week ${state.week}`;
  el('counts').textContent=Object.entries(state.counts).filter(([,n])=>n).map(([s,n])=>`${n} ${s}`).join(' · ')||'No creatures yet.';
  el('resources').textContent=`Grass cover ${Math.round(state.grass*100)}% · browse cover ${Math.round(state.browse*100)}% (model indices)`;
  el('place-summary').hidden=!state.place;
  if(state.place)el('place-summary').textContent=`Place-inspired start at model week ${state.place.atWeek}. Reviewed photo grass share ${Number((state.place.reviewed.grass*100).toFixed(1))}%; chosen food indices: grass ${Number((state.place.start.grass*100).toFixed(1))}%, shrubs ${Number((state.place.start.browse*100).toFixed(1))}%. Image shares are not ground area or measured food supply. Map layout and animal roles stay curated.`;
  el('resource-tint').style.opacity=String(Math.max(0,.8-state.grass)*.35);
  const list=el('events');list.replaceChildren();
  for(const e of state.world.events.slice(-8).reverse()){const li=document.createElement('li');li.textContent=eventText(e);list.append(li);}
  updateCard();
}
function eventText(e){
  const prefix=`Week ${e.t}: `;
  if(e.type==='birth')return `${prefix}${e.species} ${e.id} was born (parent ${e.parent}).`;
  if(e.type==='death')return `${prefix}${e.species} ${e.id} ${e.cause==='eaten'?'was caught':e.cause==='removed'?'was removed':`died: ${e.cause}`}.`;
  if(e.type==='kill')return `${prefix}animal ${e.id} caught ${e.preySpecies} ${e.prey}.`;
  if(e.type==='arrive')return `${prefix}${e.species} ${e.id} arrived.`;
  if(e.type==='disturb')return `${prefix}companion ${e.id} startled animal ${e.other}.`;
  return `${prefix}${e.detail}.`;
}
function updateCard(){
  const state=forest.getState(),a=state.world.animals.find(a=>a.id===state.selectedId);
  el('creature-card').hidden=!a;if(!a)return;
  const art=ART[a.species],custom=state.appearances.get(a.id);
  const src=custom?.image||art?.image;
  el('portrait').hidden=!src;if(src)el('portrait').src=src;
  el('creature-name').textContent=nameOf(a);
  el('creature-kind').textContent=`${art?.label||a.species} · ${['dog','cat','penguin'].includes(a.species)?'cared-for companion rules':'curated model role'}${custom?.source?' · Meta artwork':''}`;
  el('creature-facts').textContent=`In this model: ${a.sex==='f'?'female':'male'}, ${a.age} weeks old, ${Math.max(0,Math.round(a.energy/state.world.params.species[a.species].energyMax*100))}% energy. ${a.alive?'Living in the forest.':'No longer alive.'} Species artwork is illustrative.`;
  const list=el('life-events');list.replaceChildren();
  const events=state.world.events.filter(e=>e.id===a.id||e.parent===a.id||e.by===a.id||e.prey===a.id||e.other===a.id).slice(-10);
  if(!events.length){const li=document.createElement('li');li.textContent='No events recorded yet.';list.append(li);}
  for(const e of events){const li=document.createElement('li');li.textContent=eventText(e);list.append(li);}
}
function step(animate){const before=narrationSnapshot(forest.getState());forest.step();progress=animate?0:1;sync(animate);narrator.say(forestNarration(before,forest.getState()),{automatic:animate});}
function reset(populated){setPlaying(false);accumulator=0;progress=1;forest.reset(populated);for(const a of actors.values())a.button.remove();actors.clear();sync();narrator.context(forestNarration(null,forest.getState()));status(populated?'Forest reset to seed 7.':'A fresh clearing. Add a neighbor or bring a creature.');}
function add(input){const before=narrationSnapshot(forest.getState()),animal=forest.add(input);sync();narrator.context(forestNarration(before,forest.getState()));status(`${nameOf(animal)} joined the forest as a ${animal.species}.`);return animal;}
el('play').onclick=()=>setPlaying(!playing);el('step').onclick=()=>{setPlaying(false);step(false);};
el('fast').onclick=()=>{speed=speed===1?4:1;el('fast').setAttribute('aria-pressed',String(speed===4));};
el('reset').onclick=()=>reset(true);el('clear').onclick=()=>reset(false);
el('add').onclick=()=>{try{add({species:el('species').value});}catch(error){status(error.message);}};
el('fieldnotes').onclick=()=>{const open=el('notes').hidden;forest.select(null);updateCard();el('notes').hidden=!open;};el('notes-close').onclick=()=>{el('notes').hidden=true;};
el('card-close').onclick=()=>{forest.select(null);updateCard();};
const importer=installCreatureImport({onAdd:add,onPause:()=>setPlaying(false)});el('bring').onclick=()=>importer.open();
const placeReview=installPlaceReview({onPause:()=>setPlaying(false),getState:()=>forest.getState(),onApply:record=>{forest.applyPlaceStart(record);sync();narrator.context(forestNarration(null,forest.getState()));status('Reviewed place start applied. Your creatures and map layout are retained. Field notes records the chosen food inputs.');}});el('place-photo').onclick=()=>placeReview.open();
const experiments=installExperimentView({snapshot:()=>forest.toSnapshot(),eventText,onStatus:status,narrator,onReturn:()=>narrator.context(forestNarration(null,forest.getState()))});
const questions=installQuestions({onPause:()=>setPlaying(false),onRecord:()=>narrator.stop(),onRun:(...args)=>experiments.open(...args)});
el('investigate').onclick=()=>questions.open();
el('open-replay').onclick=()=>{setPlaying(false);experiments.chooseReplay();};
for(const button of document.querySelectorAll('[data-experiment]'))button.onclick=()=>{
  setPlaying(false);pending=button.dataset.experiment;
  el('experiment-title').textContent=pending==='drought'?'What if there were less rain?':'What if the wolves disappeared?';
  el('experiment-description').textContent=pending==='drought'?'Rainfall will change from the model baseline to 40% for 156 weeks (three model years).':'All wolves will be removed on the next tick, and wolf immigration will be disabled.';
  el('experiment-dialog').showModal();
};
el('cancel-experiment').onclick=()=>el('experiment-dialog').close();
el('run-experiment').onclick=()=>{
  try{experiments.open(pending,el('prediction').value);el('experiment-dialog').close();status('Your forest is paused. Compare both experiment worlds and inspect their records.');}
  catch(error){el('experiment-description').textContent=error.message;}
};

function layout(){
  needsDraw=true;
  const v=el('viewport');cam.width=Math.max(v.clientWidth,v.clientHeight*1672/941);cam.height=cam.width*941/1672;
  cam.minZoom=Math.min(v.clientWidth/cam.width,v.clientHeight/cam.height);
  el('stage').style.width=`${cam.width}px`;el('stage').style.height=`${cam.height}px`;clampCamera();
}
function clampCamera(){
  const v=el('viewport'),w=cam.width*cam.zoom,h=cam.height*cam.zoom;
  cam.x=w<v.clientWidth?(v.clientWidth-w)/2:Math.min(0,Math.max(v.clientWidth-w,cam.x));
  cam.y=h<v.clientHeight?(v.clientHeight-h)/2:Math.min(0,Math.max(v.clientHeight-h,cam.y));
  el('stage').style.transform=`translate(${cam.x}px,${cam.y}px) scale(${cam.zoom})`;
}
function zoom(factor){const v=el('viewport'),z=Math.max(cam.minZoom,Math.min(2.5,cam.zoom*factor));cam.x=v.clientWidth/2-(v.clientWidth/2-cam.x)*z/cam.zoom;cam.y=v.clientHeight/2-(v.clientHeight/2-cam.y)*z/cam.zoom;cam.zoom=z;clampCamera();}
el('zoom-in').onclick=()=>zoom(1.2);el('zoom-out').onclick=()=>zoom(1/1.2);
el('reset-view').onclick=()=>{cam.zoom=cam.minZoom;clampCamera();};
el('viewport').addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey)zoom(Math.exp(-e.deltaY*.01));else{cam.x-=e.deltaX;cam.y-=e.deltaY;clampCamera();}},{passive:false});
let drag=null;
el('viewport').onpointerdown=e=>{if(e.button!==0||e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY};el('viewport').setPointerCapture(e.pointerId);};
el('viewport').onpointermove=e=>{if(!drag)return;cam.x+=e.clientX-drag.x;cam.y+=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};clampCamera();};
el('viewport').onpointerup=el('viewport').onpointercancel=()=>{drag=null;};
addEventListener('keydown',e=>{
  if(e.target.closest('input,select,textarea,dialog'))return;
  if(e.key==='Escape'){forest.select(null);updateCard();el('notes').hidden=true;}
  const directions={ArrowLeft:[25,0],ArrowRight:[-25,0],ArrowUp:[0,25],ArrowDown:[0,-25]};
  if(directions[e.key]){e.preventDefault();cam.x+=directions[e.key][0];cam.y+=directions[e.key][1];clampCamera();}
});
addEventListener('resize',layout);document.addEventListener('visibilitychange',()=>{last=0;});
new ResizeObserver(()=>document.documentElement.style.setProperty('--footer-height',`${document.querySelector('.bottom').offsetHeight+24}px`)).observe(document.querySelector('.bottom'));
function render(now){
  const dt=last?Math.max(0,Math.min((now-last)/1000,.05)):0;last=now;
  if(document.hidden||(!playing&&!needsDraw)){requestAnimationFrame(render);return;}
  if(playing&&!document.hidden){clock+=dt*speed;accumulator+=dt*speed/1.2;progress=Math.min(1,progress+dt*speed/1.2);while(accumulator>=1){accumulator--;step(true);}}
  const state=forest.getState();
  needsDraw=false;
  for(const animal of state.animals){
    const actor=actorFor(animal),art=ART[animal.species],custom=state.appearances.get(animal.id);
    const x=reduced.matches?actor.toX:actor.fromX+(actor.toX-actor.fromX)*progress;
    const y=reduced.matches?actor.toY:actor.fromY+(actor.toY-actor.fromY)*progress;
    const moved=Math.hypot(x-actor.x,(y-actor.y)*1.7);
    if(Math.abs(x-actor.x)>.001)actor.dir=x<actor.x?-1:1;
    actor.x=x;actor.y=y;
    const size=Math.max(38,Math.min(105,cam.width*.045))*(art?.size||1);
    actor.button.style.left=`${x}%`;actor.button.style.top=`${y/state.world.params.height*100}%`;
    actor.button.style.setProperty('--size',`${size}px`);actor.button.style.zIndex=String(Math.round(y*10));
    const ctx=actor.canvas.getContext('2d');ctx.clearRect(0,0,180,180);ctx.save();ctx.translate(90,153);ctx.scale(actor.dir,1);
    const loaded=assets.get(animal.species),rig=custom?.rig||(!custom?.image&&loaded?.rig);
    if(rig){const preset=getMotion(art?.motion==='cat'?'cat':'dog');if(playing)actor.phase+=moved*cam.width/100*preset.duty/preset.stride;
      drawPuppet(ctx,rig,{size:180,phase:actor.phase,moving:playing&&moved>.001&&!reduced.matches,preset,phases:GAITS.walk.phase,clock:reduced.matches?0:clock});
    }else{
      let image=loaded?.image;
      if(custom?.image){if(!actor.image){actor.image=new Image();actor.image.onload=()=>{needsDraw=true;};actor.image.src=custom.image;}image=actor.image;}
      if(image?.complete&&image.naturalWidth){ctx.drawImage(image,-90,-153,180,180);}
      else {ctx.fillStyle='#f4eedf';ctx.beginPath();ctx.arc(0,-45,30,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2b2a26';ctx.font='14px system-ui';ctx.textAlign='center';ctx.fillText(animal.species,0,-40);}
    }
    ctx.restore();
  }
  requestAnimationFrame(render);
}
layout();cam.x=(innerWidth-cam.width)/2;cam.y=(innerHeight-cam.height)/2;clampCamera();sync();narrator.context(forestNarration(null,forest.getState()));loadArt();requestAnimationFrame(render);
