import {createExperiment,experimentFromReplay,validateReplay,runContinuation} from './experiment.ts';
import {createForestController} from './controller.ts';
import {guideLocal,guideReply,narrowGuide} from '../investigation/guide.js';
import {nearestAnimal,animalRecord,GUIDE_CHANGE,worldLabels,discoverySummary,compareFood,closerLook,intervalRecord,relatedInvestigations,guideContent,plural,populationStory,describeForPeople} from './discovery.js';
import {ART,DOE_FROM_BUCK,variantKey,sizeJitter,makeDoeUrl} from './art.js';
import {buildRig,GAITS} from '../motion/rig.js';
import {assessRig} from '../motion/rig-analysis.js';
import {prepareJointPieces,drawPuppet} from '../motion/puppet-motion.js';
import {getMotion} from '../motion/motion-library.js';
import {describeChange,changeLabel} from '../investigation/changes.js';
import {buildEvidence,defaultSelection,validateEvidenceSelection,explanationLines,worksheetHtml,modelOnlyReplay} from '../investigation/evidence.js';
import {readSparkService,askSpark} from '../investigation/client.js';
import {validateGuide} from '../investigation/guide.js';
import {comparisonNarration} from './narration.js';

// The comparison view owns its canvases/timer; it never advances the exploring forest.
export function installExperimentView({snapshot,eventText,onStatus=()=>{},narrator,onReturn=()=>{}}){
  const el=id=>document.getElementById(id),dialog=el('comparison-dialog');
  let experiment=null,timer=null,revision=0,startWeek=0,analysisRevision=0;
  let packet=null,selection=null,beforeResponse='',sparkService={enabled:false},explanationRevision=0,explanationRequest=null;
  const images=new Map(),rigs=new Map();
  let initial=null,guideStep=null,visibleBranch='changed',focus=null,notice=null,pendingRelated=null;
  const dismissed=new Set();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const message=text=>{el('comparison-status').textContent=text;};
  const evidenceId=id=>`evidence-${id.replaceAll('.','-')}`;
  function invalidateExplanation(){explanationRevision++;explanationRequest?.abort();explanationRequest=null;selection=null;el('grounded-explanation').hidden=true;el('grounded-explanation').replaceChildren();el('explanation-status').textContent='';}
  function fileWithNotes(){const file=experiment.toReplay(el('reflection').value);file.activity={before:beforeResponse,after:el('transfer-response').value,teacherNotes:el('teacher-notes').value,connection:el('connection-response').value};validateReplay(file);return file;}
  function reveal(value,source){
    selection=validateEvidenceSelection(value,packet);const list=el('grounded-explanation');list.replaceChildren();
    const groups=new Map(),headings={observation:'What the comparison shows',event:'Moments in the record',mechanism:'Connections to investigate',limit:'What this cannot tell us'};
    for(const line of explanationLines(packet,selection)){
      if(!groups.has(line.kind)){const section=document.createElement('section'),heading=document.createElement('h4'),items=document.createElement('ul');heading.textContent=headings[line.kind];section.append(heading,items);list.append(section);groups.set(line.kind,items);}
      const li=document.createElement('li');li.textContent=line.text;
      if(line.ref&&!packet.mechanisms.some(m=>m.id===line.ref)){
        const button=document.createElement('button');button.textContent=line.kind==='event'?'Open this record':'See measurement';button.setAttribute('aria-label',`${button.textContent}: ${line.text}`);button.className='evidence-ref';button.onclick=()=>{el('comparison-evidence-details').open=true;document.getElementById(evidenceId(line.ref))?.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});};li.append(' ',button);
      }groups.get(line.kind).append(li);
    }
    const follow=document.createElement('p');follow.textContent=`Question to consider: ${selection.followUp}`;list.append(follow);list.hidden=false;
    el('explanation-status').textContent=`${source}. Values and events are rendered from this run; possible model connections are not proven causes.`;
  }
  function canExplain(){if(!experiment?.getState().elapsed){el('explanation-status').textContent='Advance at least one week first.';return false;}if(!el('reflection').value.trim()){el('explanation-status').textContent='Record your own explanation first, even if it is “I am not sure yet”. Then compare it with the evidence.';return false;}return true;}
  function pause(){clearInterval(timer);timer=null;narrator?.stop();el('comparison-play').textContent='Watch it unfold';}
  function renderWorld(canvas,state){
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#c6c79c';ctx.fillRect(0,0,w,h);
    const map=images.get('/maps/spring.png');if(map)ctx.drawImage(map,0,0,w,h);
    ctx.fillStyle=`rgba(151,114,68,${Math.max(0,.8-state.grass)*.35})`;ctx.fillRect(0,0,w,h);
    if(el('food-layer').checked){const {width,height}=state.world.params;for(let i=0;i<state.world.grass.length;i++){if(!state.world.open[i])continue;const food=state.world.grass[i];ctx.fillStyle=`rgba(${food>.5?'73,117,48':'166,112,48'},.26)`;ctx.fillRect((i%width)/width*w,Math.floor(i/width)/height*h,w/width+1,h/height+1);}}
    for(const a of [...state.animals].sort((a,b)=>a.y-b.y)){
      const custom=state.appearances.get(a.id),vkey=variantKey(a),art=vkey==='doe'?DOE_FROM_BUCK:ART[vkey]||ART[a.species],src=custom?.image||(vkey==='doe'?'doe':art?.image);
      const image=images.get(src),rig=rigs.get(src),x=a.x/state.world.params.width*w,y=a.y/state.world.params.height*h;
      const size=44*(art?.size||1)*sizeJitter(a.id);
      ctx.save();ctx.translate(x,y);
      if(rig){ctx.scale(size/180,size/180);drawPuppet(ctx,rig,{size:180,phase:a.id*.37,moving:false,preset:getMotion(art?.motion==='cat'?'cat':'dog'),phases:GAITS.walk.phase,clock:0});}
      else if(image)ctx.drawImage(image,-size/2,-size*.85,size,size);
      else{ctx.fillStyle='#f4eedf';ctx.beginPath();ctx.arc(0,-5,5,0,Math.PI*2);ctx.fill();}
      ctx.restore();
      if(custom){ctx.font='11px system-ui';ctx.textAlign='center';const name=custom.name;
        const tw=ctx.measureText(name).width;const labelX=Math.max(tw/2+3,Math.min(w-tw/2-3,x));
        ctx.fillStyle='#f4eedfe8';ctx.fillRect(labelX-tw/2-3,y+2,tw+6,15);ctx.fillStyle='#2b2a26';ctx.fillText(name,labelX,y+13);}
    }
  }
  async function prepareArt(initial){
    const current=++revision;images.clear();rigs.clear();
    const sources=new Map([['/maps/spring.png',null]]);
    for(const art of Object.values(ART))if(art.image)sources.set(art.image,art.cut||null);
    for(const a of initial.appearances)if(a.image)sources.set(a.image,a.rigConfig||null);
    let unavailable=0,rigFallbacks=0;
    await Promise.all([...sources].map(async([src,cut])=>{
      try{
        const image=new Image();image.src=src;await image.decode();if(current!==revision)return;images.set(src,image);
        if(cut){try{const candidate=await buildRig(src,cut);if(current!==revision)return;if(assessRig(candidate).warnings.length)throw new Error();rigs.set(src,prepareJointPieces(candidate));}catch{rigFallbacks++;}}
      }catch{unavailable++;}
    }));
    try{const url=await makeDoeUrl();const image=new Image();image.src=url;await image.decode();if(current!==revision)return;images.set('doe',image);try{const candidate=await buildRig(url,DOE_FROM_BUCK.cut);if(!assessRig(candidate).warnings.length)rigs.set('doe',prepareJointPieces(candidate));}catch{}}catch{/* bucks stand in for does */}
    if(current===revision&&dialog.open){render();message(unavailable?`${unavailable} image(s) unavailable. Model records remain intact.`:rigFallbacks?`${rigFallbacks} illustration(s) use whole-image display.`:'Ready. Watch this forest change, then explore what you notice.');}
  }
  function render(){
    if(!experiment)return;const s=experiment.getState(),a=s.baseline,b=s.changed;packet=buildEvidence(experiment);
    el('comparison-week').textContent=String(s.elapsed);el('comparison-seek').value=s.elapsed;
    el('evidence-caption').textContent=`Elapsed week ${s.elapsed} · forest week ${a.week} · changed minus baseline`;
    for(const [prefix,state]of [['baseline',a],['changed',b]]){
      renderWorld(el(`${prefix}-world`),state);
      el(`${prefix}-summary`).textContent=`Forest week ${state.week} · ${state.animals.length} creatures · grass ${Math.round(state.grass*100)}% · browse ${Math.round(state.browse*100)}%`;
      const list=el(`${prefix}-events`);list.replaceChildren();
      const events=packet.events.filter(e=>e.branch===prefix).reverse();
      if(!events.length){const li=document.createElement('li');li.textContent='No events since this experiment began.';list.append(li);}
      for(const e of events){const li=document.createElement('li');li.id=evidenceId(e.id);li.textContent=`${e.id} · Week ${e.week}: ${e.text}`;list.append(li);}
    }
    const rows=el('comparison-evidence');rows.replaceChildren();
    for(const o of packet.observations){const tr=document.createElement('tr');tr.id=evidenceId(o.id);for(const [i,value]of [o.label,o.baseline,o.changed,o.difference].entries()){
      const cell=document.createElement(i===0?'th':'td');if(!i)cell.scope='row';cell.textContent=typeof value==='number'?`${i===3&&value>0?'+':''}${value}`:value;tr.append(cell);
    }rows.append(tr);}
    const identities=[...a.appearances].map(([id,v])=>`${v.name} (#${id}): baseline ${a.animals.some(x=>x.id===id)?'alive':'absent'}, changed ${b.animals.some(x=>x.id===id)?'alive':'absent'}`);
    el('comparison-identity').textContent=identities.join(' · ');
    const end=s.elapsed===156;el('comparison-step').disabled=end;el('comparison-season').disabled=end;
    if(end)pause();
    el('explain-spark').disabled=!sparkService.enabled||!s.elapsed;
    const labels=worldLabels(s.scenario),summary=discoverySummary(packet);
    el('baseline-label').textContent=labels.baseline;el('changed-label').textContent=labels.changed;
    el('evidence-baseline-label').textContent=labels.baseline;el('evidence-changed-label').textContent=labels.changed;
    el('baseline-summary').textContent=`${a.animals.length} animals · week ${s.elapsed}`;el('changed-summary').textContent=`${b.animals.length} animals · week ${s.elapsed}`;
    el('discovery-headline').textContent=summary.headline;el('discovery-detail').textContent=summary.detail;
    el('comparison-context').textContent=`${labels.changed} compared with ${labels.baseline.toLowerCase()}`;el('rabbit-story').textContent=populationStory(s,'rabbit');
    el('why-copy').textContent=summary.why;el('why-caution').textContent=summary.caution;
    el('why-chain').textContent=s.scenario.kind==='rain'?'Rain → plant food → animals that eat plants → animals that hunt them':'Food, hunters and new arrivals connect the populations.';
    const foodRoot=el('food-comparison');foodRoot.replaceChildren();
    for(const [key,label]of [['grass','Grass food'],['browse','Shrub food']]){const section=document.createElement('section');section.className='food-pair';const heading=document.createElement('h4');heading.textContent=label;section.append(heading);for(const [branch,state]of [['baseline',a],['changed',b]]){const row=document.createElement('div');row.className='food-bar';const text=document.createElement('span');text.textContent=labels[branch];const meter=document.createElement('meter');meter.min=0;meter.max=1;meter.value=state[key];meter.setAttribute('aria-label',`${label}, ${labels[branch]}: ${Math.round(state[key]*100)} out of 100 on the model scale`);row.append(text,meter);section.append(row);}const caption=document.createElement('strong');caption.textContent=compareFood(a[key],b[key]).replace(' here',` · ${labels.changed}`);section.append(caption);foodRoot.append(section);}
    const animals=el('animal-comparison');animals.replaceChildren();
    for(const species of ['rabbit','deer','fox','wolf']){const row=document.createElement('div');row.className='animal-row';const name=document.createElement('span'),value=document.createElement('span');name.textContent=plural(species);const difference=b.counts[species]-a.counts[species];value.textContent=difference?`${Math.abs(difference)} ${difference>0?'more':'fewer'}`:'Same number';value.title=`${labels.baseline}: ${a.counts[species]}; ${labels.changed}: ${b.counts[species]}`;row.append(name,value);animals.append(row);}
    const split=el('comparison-layout').value==='split';el('experiment-worlds').classList.toggle('single-world',!split);el('baseline-panel').hidden=!split&&visibleBranch!=='baseline';el('changed-panel').hidden=!split&&visibleBranch!=='changed';el('comparison-switch').hidden=split;el('comparison-switch').textContent=`View ${labels[visibleBranch==='changed'?'baseline':'changed'].toLowerCase()}`;
    notice=s.elapsed?(s.scenario.kind==='rain'&&Math.abs(a.grass-b.grass)>.005?{key:'food',kind:'food'}:null):null;
    const recent=closerLook(b,startWeek,initial.world.events.length);if(recent&&s.elapsed>1)notice={key:`event-${recent.id}`,kind:'event',...recent};
    el('notice').hidden=!notice||dismissed.has(notice.key)||guideStep!==null;if(notice)el('notice-copy').textContent=notice.kind==='food'?'The meadow’s food has changed. Want to look closer?':notice.event.type==='birth'?`A new ${notice.event.species} was born in this forest. Want to meet them?`:notice.event.type==='arrive'?`A ${notice.event.species} arrived from outside. Want to meet them?`:`A ${notice.event.species} ${notice.event.cause==='removed'?'was removed from':'died in'} this forest. Explore the record?`;
    fillAnimalPick();el('guide-ask-spark').disabled=!sparkService.enabled||!s.elapsed||!!pendingBubble;if(asked){const stillThere=animalRecord(experiment.getState()[asked.branch],asked.id,initial.world.events.length);if(!stillThere){asked=null;el('animal-card').hidden=true;}else showAnimal(stillThere,asked.branch);}
    renderGuide();if(focus&&focus.kind==='event'&&b.week<focus.event.t){focus=null;el('closeup').hidden=true;}if(focus)renderCloseup();
  }
  function seek(week,automatic=false){try{invalidateExplanation();guideToken++;discardPending();staleChips();experiment.seek(week);render();narrator?.say(comparisonNarration(packet),{automatic:automatic&&week!==156});}catch(error){pause();message(error.message);}}
  function show(next,prediction,reflection,activity={},guided=null){
    pause();analysisRevision++;experiment=next;initial=next.toReplay().initial;guideStep=guided;visibleBranch='changed';focus=null;notice=null;asked=null;el('animal-card').hidden=true;resetGuide();dismissed.clear();pendingRelated=null;el('related-form').hidden=true;el('closeup').hidden=true;el('comparison-layout').value='single';el('why-panel').hidden=true;el('why-toggle').setAttribute('aria-expanded','false');el('food-layer').checked=false;el('guide-status').textContent='';
    invalidateExplanation();beforeResponse=activity.before||'';el('transfer-response').value=activity.after||'';el('teacher-notes').value=activity.teacherNotes||'';el('connection-response').value=activity.connection||'';
    el('continuation-results').textContent='';el('run-continuations').disabled=false;
    const file=next.toReplay();
    el('comparison-title').textContent=file.question?file.question.length>120?file.question.slice(0,117)+'…':file.question:`What happens ${file.scenario.kind==='rain'?'with ':''}${worldLabels(file.scenario).changed.toLowerCase()}?`;
    startWeek=file.initial.world.week;
    el('saved-prediction').textContent=prediction?`Your prediction: ${prediction}`:'No prediction recorded. You can still inspect and explain the evidence.';
    el('reflection').value=reflection;
    el('comparison-description').textContent=`${file.question?file.question+' ':''}${describeChange(file.scenario)}`;
    const place=file.initial.place;el('comparison-place').hidden=!place;
    el('comparison-place').textContent=place?`Place-inspired starting food chosen at forest week ${place.atWeek}: grass ${Number((place.start.grass*100).toFixed(1))}%, shrubs ${Number((place.start.browse*100).toFixed(1))}%. Reviewed image shares are context, not measured biomass or a reconstruction of the real site. The place photo is not saved in this replay.`:'';
    el('changed-label').textContent=`Changed · ${changeLabel(file.scenario)}`;
    renderRelated();if(!dialog.open)dialog.showModal();render();narrator?.context(comparisonNarration(packet));message('Preparing illustrations locally…');prepareArt(file.initial);
    readSparkService().then(s=>{if(dialog.open){sparkService=s;el('explain-spark').disabled=!s.enabled||!experiment?.getState().elapsed;el('guide-ask-spark').disabled=!s.enabled||!experiment?.getState().elapsed;}});
  }
  function renderGuide(){el('learner-explanation').hidden=guideStep!==null&&guideStep<3;el('connection-reflection').hidden=guideStep!==null&&guideStep<4;el('related-section').hidden=guideStep!==null&&guideStep<4;const panel=el('guide-panel');panel.hidden=guideStep===null;dialog.classList.toggle('guided',guideStep!==null);el('closeup-continue').hidden=guideStep!==2;el('discovery-next').hidden=![1,3].includes(guideStep);el('discovery-next').textContent=guideStep===1?'Look closer at the meadow':'Explain what I noticed';if(guideStep===null)return;const guide=guideContent(guideStep);el('guide-progress').textContent=`GUIDED INVESTIGATION · ${guideStep+1} OF 5`;el('guide-title').textContent=guide.title;el('guide-copy').textContent=guide.text;el('guide-next').textContent=guide.action;}
  function renderCloseup(){if(!focus||!experiment)return;const closeBranch=focus.branch||'changed',state=experiment.getState()[closeBranch],canvas=el('closeup-world'),source=el(`${closeBranch}-world`),ctx=canvas.getContext('2d');let x=source.width/2,y=source.height/2,foodCell=false;
    if(focus.kind==='food'){let index=-1,difference=0;const base=experiment.getState().baseline.world;for(let i=0;i<state.world.grass.length;i++){const delta=Math.abs(state.world.grass[i]-base.grass[i]);if(state.world.open[i]&&delta>.005&&delta>difference){index=i;difference=delta;}}if(index>=0){foodCell=true;x=(index%state.world.params.width+.5)/state.world.params.width*source.width;y=(Math.floor(index/state.world.params.width)+.5)/state.world.params.height*source.height;}
      el('closeup-title').textContent='Follow the grass food.';el('closeup-copy').textContent=index>=0?'This highlighted model area has a grass-food difference between the two conditions. The coloured layer shows simulated food; the painting itself is illustrative.':'No area shows a clear grass-food difference yet. The coloured layer shows simulated food; the painting itself is illustrative.';el('closeup-rule').textContent='Model connection: rainfall affects regrowth, and rabbits gain energy by eating grass. This view shows the current week, not a photograph or past-event animation.';
    }else{const e=focus.event,animal=state.world.animals.find(a=>a.id===e.id);if(animal){x=animal.x/state.world.params.width*source.width;y=animal.y/state.world.params.height*source.height;}
      el('closeup-title').textContent=e.type==='death'?`The story of ${e.species} #${e.id}.`:`Meet ${e.species} #${e.id}.`;el('closeup-copy').textContent=`In week ${e.t}, this ${e.species} ${e.type==='birth'?'was born':e.type==='arrive'?'arrived':e.cause==='removed'?'was removed':`died (${e.cause==='eaten'?'caught by a predator':e.cause})`}. This is a recorded model event.`;el('closeup-rule').textContent=`${populationStory(experiment.getState(),e.species)} ${animal?(animal.alive?'The close-up shows their current location, not a reconstruction of the past event.':'The close-up shows their last recorded location, not a reconstruction of the past event.'):'The individual’s location is no longer retained, so this is the current forest view.'} Counts alone do not establish why the forests differ.`;
      if(!animal){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,0,0,canvas.width,canvas.height);return;}
    }
    const sw=source.width*.42,sh=sw*canvas.height/canvas.width,sx=Math.max(0,Math.min(source.width-sw,x-sw/2)),sy=Math.max(0,Math.min(source.height-sh,y-sh/2));ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,sx,sy,sw,sh,0,0,canvas.width,canvas.height);if(focus.kind!=='food'||foodCell){ctx.strokeStyle='#f5e3a0';ctx.lineWidth=3;ctx.beginPath();ctx.arc((x-sx)/sw*canvas.width,(y-sy)/sh*canvas.height,22,0,Math.PI*2);ctx.stroke();}
  }
  // Ask the guide: a thread of bubbles. The local guide answers at once; Spark only on an explicit click.
  // Every reply is rendered from this run's evidence packet, never from provider text.
  let guideToken=0,pendingBubble=null;
  function resetGuide(){guideToken++;pendingBubble=null;el('guide-thread').replaceChildren();}
  // The forest moved on (or a new question started) before Spark answered: the late reply is ignored, and the bubble says so.
  function discardPending(){if(!pendingBubble)return;pendingBubble.replaceChildren(Object.assign(document.createElement('span'),{className:'bubble-source',textContent:'Meta · Muse Spark'}),Object.assign(document.createElement('p'),{textContent:'The forest moved on before Spark answered, so that reply was skipped. Ask again if you like.'}));pendingBubble=null;el('guide-ask-spark').disabled=!sparkService.enabled||!experiment?.getState().elapsed;}
  // Completed bubbles keep their words, but their chips point at the run as it was then: switch them off once the forest moves.
  function staleChips(){for(const b of el('guide-thread').querySelectorAll('.bubble-chips button')){b.disabled=true;b.title='This points at an earlier moment. Ask again to refresh it.';}}
  function bubble(kind,label){const b=document.createElement('div');b.className=`bubble ${kind}`;if(label){const l=document.createElement('span');l.className='bubble-source';l.textContent=label;b.append(l);}el('guide-thread').append(b);b.scrollIntoView({block:'nearest',behavior:reduced.matches?'instant':'smooth'});return b;}
  function openChip(chip){
    pause();
    if(chip.kind==='rule'){el('why-panel').hidden=false;el('why-toggle').setAttribute('aria-expanded','true');el('why-panel').scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});return;}
    if(chip.kind==='event'){
      const [,branch,index]=chip.id.split('.'),event=experiment.getState()[branch]?.world.events[Number(index)];
      if(event&&['birth','death','arrive'].includes(event.type)){openLook({kind:'event',branch,id:Number(index),event});return;}
    }
    el('comparison-evidence-details').open=true;document.getElementById(evidenceId(chip.id))?.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});
  }
  function showReply(reply,target){
    const b=target||bubble('guide');b.className='bubble guide';b.replaceChildren();
    const label=document.createElement('span');label.className='bubble-source';label.textContent=`${reply.source} · week ${experiment?.getState().elapsed??0}`;b.append(label);
    if(reply.kind!=='answer'){const p=document.createElement('p');p.textContent=reply.text;b.append(p);return;}
    const list=document.createElement('ul');for(const line of reply.lines){const li=document.createElement('li');li.textContent=line.text;list.append(li);}b.append(list);
    if(reply.chips.length){const row=document.createElement('div');row.className='bubble-chips';for(const chip of reply.chips){const button=document.createElement('button');button.type='button';button.textContent=chip.label;button.setAttribute('aria-label',`${chip.label}: ${chip.id}`);button.onclick=()=>openChip(chip);row.append(button);}b.append(row);}
    if(reply.followUp){const p=document.createElement('p');p.className='bubble-follow';const ask=document.createElement('button');ask.type='button';ask.textContent=reply.followUp;ask.onclick=()=>{el('guide-question').value=reply.followUp;el('guide-question').focus();};p.append('Something to look at next: ',ask);b.append(p);}
    b.scrollIntoView({block:'nearest',behavior:reduced.matches?'instant':'smooth'});
  }
  function localReply(question){
    if(!experiment?.getState().elapsed)return guideReply({status:'clarify',message:'Watch the forest for a week or two first, then ask. The guide can only talk about what has been recorded.'},packet,'Local evidence guide');
    return guideReply(narrowGuide(guideLocal(question,packet),packet,question),packet,'Local evidence guide');
  }
  function askQuestion(){const q=el('guide-question').value.trim();if(!q)return null;el('guide-question').value='';bubble('child').textContent=q;return q;}
  el('guide-form').onsubmit=event=>{event.preventDefault();const q=askQuestion();if(!q||!packet)return;guideToken++;discardPending();showReply(localReply(q));};
  el('guide-ask-spark').onclick=async()=>{
    if(pendingBubble)return;
    const q=askQuestion();if(!q||!packet||!sparkService.enabled)return;
    if(!experiment.getState().elapsed){showReply(localReply(q));return;}
    const current=++guideToken,target=bubble('guide','Meta · Muse Spark');target.textContent='Spark is choosing what to show…';pendingBubble=target;el('guide-ask-spark').disabled=true;
    try{
      const result=await askSpark(sparkService,{operation:'guide',question:q,replay:modelOnlyReplay(fileWithNotes())},new AbortController().signal);
      if(current!==guideToken)return;
      const validated=validateGuide(result.value,packet);
      showReply(guideReply(narrowGuide(validated,packet,q),packet,`${result.provider||'Meta · Muse Spark'} chose this evidence`),target);
    }catch(error){
      if(current!==guideToken)return;
      showReply(localReply(q),target);const note=document.createElement('p');note.className='small-note';note.textContent='Spark could not answer, so this is the free local guide. No automatic retry was made.';target.append(note);
    }finally{if(current===guideToken){pendingBubble=null;el('guide-ask-spark').disabled=!sparkService.enabled||!experiment?.getState().elapsed;}}
  };
  // Tap-to-ask: local and free. Shows only what the model recorded about one animal in the forest that was tapped.
  let asked=null;
  const drawnSize=a=>{const vkey=variantKey(a),art=vkey==='doe'?DOE_FROM_BUCK:ART[vkey]||ART[a.species];return 44*(art?.size||1)*sizeJitter(a.id);};
  function openAnimal(branch,id){
    if(!experiment)return;
    const record=animalRecord(experiment.getState()[branch],id,initial.world.events.length);
    if(!record){asked=null;el('animal-card').hidden=true;return;}
    asked={branch,id};showAnimal(record,branch);
    el('animal-card').hidden=false;el('animal-card-title').focus();
  }
  // Re-read the card from the displayed week, so it never keeps facts from a later or earlier moment.
  function showAnimal(record,branch){
    const names=worldLabels(experiment.getState().scenario),which=branch==='changed'?names.changed:names.baseline;
    el('animal-card-title').textContent=`${record.species[0].toUpperCase()}${record.species.slice(1)} #${record.id}`;
    el('animal-card-facts').textContent=`In this model, in the ${which.toLowerCase()} forest: ${record.sex}, ${record.age} weeks old, ${record.energy}% energy. ${record.alive?'Living in the forest.':'No longer alive.'}`;
    el('animal-card-note').textContent=record.events.length?'The model recorded moments for this animal during this experiment.':'No birth, arrival or death was recorded for this animal during this experiment. Its history before the experiment is not shown.';
    el('animal-card-moment').hidden=!record.events.length;
    el('animal-card-compare').textContent=`Compare ${plural(record.species)} in both forests`;
  }
  for(const [branch,id] of [['baseline','baseline-world'],['changed','changed-world']]){
    const canvas=el(id);canvas.style.cursor='pointer';
    canvas.addEventListener('click',event=>{
      if(!experiment)return;
      const rect=canvas.getBoundingClientRect(),state=experiment.getState()[branch];
      const hit=nearestAnimal(state.animals,state.world.params,(event.clientX-rect.left)/rect.width*canvas.width,(event.clientY-rect.top)/rect.height*canvas.height,canvas.width,canvas.height,drawnSize);
      if(hit){pause();openAnimal(branch,hit.id);el('animal-pick').value=`${branch}:${hit.id}`;}
    });
  }
  function fillAnimalPick(){
    const select=el('animal-pick'),previous=select.value;select.replaceChildren(new Option('Choose…',''));
    if(!experiment)return;
    const split=el('comparison-layout').value==='split',names=worldLabels(experiment.getState().scenario);
    for(const branch of split?['baseline','changed']:[visibleBranch]){
      const target=split?Object.assign(document.createElement('optgroup'),{label:names[branch]}):select;if(split)select.append(target);
      for(const a of [...experiment.getState()[branch].animals].filter(a=>a.alive!==false).sort((p,q)=>p.species.localeCompare(q.species)||p.id-q.id))target.append(new Option(`${a.species[0].toUpperCase()}${a.species.slice(1)} #${a.id}`,`${branch}:${a.id}`));
    }
    if([...select.querySelectorAll('option')].some(o=>o.value===previous))select.value=previous;
  }
  el('animal-pick').onchange=()=>{const [branch,id]=el('animal-pick').value.split(':');if(branch){pause();openAnimal(branch,Number(id));}};
  el('animal-card-close').onclick=()=>{asked=null;el('animal-card').hidden=true;};
  el('animal-card-compare').onclick=()=>{if(!asked)return;el('animal-comparison').scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});el('animal-comparison').classList.add('flash');setTimeout(()=>el('animal-comparison').classList.remove('flash'),1600);};
  el('animal-card-moment').onclick=()=>{if(!asked)return;const record=animalRecord(experiment.getState()[asked.branch],asked.id,initial.world.events.length);const first=record?.events.at(-1);if(first)openLook({kind:'event',branch:asked.branch,...first});};
  function openLook(value){pause();visibleBranch=value.branch||'changed';focus=value;el('closeup').hidden=false;if(value.kind==='food'){el('food-layer').checked=true;render();}else render();el('closeup-title').focus();el('closeup').scrollIntoView({block:'nearest',behavior:reduced.matches?'instant':'smooth'});}
  function renderRelated(){const root=el('related-questions');root.replaceChildren();for(const item of relatedInvestigations(experiment.getState().scenario)){const button=document.createElement('button');button.textContent=item.question;button.onclick=()=>{pause();pendingRelated=item;el('related-description').textContent=describeForPeople(item.change);el('related-form').hidden=false;el('related-prediction').value='';el('related-prediction').focus();};root.append(button);}}
  el('related-form').onsubmit=event=>{event.preventDefault();if(!pendingRelated)return;const item=pendingRelated,prediction=el('related-prediction').value;show(createExperiment(initial,item.change,prediction,item.question),prediction,'');dialog.scrollTop=0;};
  el('related-cancel').onclick=()=>{pendingRelated=null;el('related-form').hidden=true;};
  el('comparison-layout').onchange=()=>render();el('comparison-switch').onclick=()=>{visibleBranch=visibleBranch==='changed'?'baseline':'changed';render();};el('food-layer').onchange=()=>render();
  el('why-toggle').onclick=()=>{const open=el('why-panel').hidden;el('why-panel').hidden=!open;el('why-toggle').setAttribute('aria-expanded',String(open));};
  el('notice-look').onclick=()=>{if(notice)openLook(notice);};el('notice-dismiss').onclick=()=>{if(notice)dismissed.add(notice.key);el('notice').hidden=true;};el('closeup-close').onclick=()=>{focus=null;el('closeup').hidden=true;};
  el('guide-next').onclick=()=>{pause();if(guideStep===0){guideStep=1;seek(1);}else if(guideStep===1){guideStep=2;openLook({kind:'food'});el('why-panel').hidden=false;el('why-toggle').setAttribute('aria-expanded','true');renderGuide();narrator?.say(guideContent(2).text);}else if(guideStep===2){guideStep=3;focus=null;el('closeup').hidden=true;seek(13);}else if(guideStep===3){if(!el('reflection').value.trim()){el('guide-status').textContent='Write what you think happened below. “I am not sure yet” is a useful starting point.';el('reflection').focus();return;}el('guide-status').textContent='';reveal(defaultSelection(packet),'Local evidence guide');guideStep=4;renderGuide();el('connection-response').focus();}else{guideStep=null;renderGuide();el('related-questions').scrollIntoView({block:'nearest'});}if([1,3].includes(guideStep)){el('discovery-headline').focus();el('discovery-headline').scrollIntoView({block:'start'});}else if(guideStep===0){el('guide-title').focus();}};
  el('guide-skip').onclick=()=>{guideStep=null;renderGuide();};
  el('closeup-continue').onclick=()=>el('guide-next').click();
  el('discovery-next').onclick=()=>{if(guideStep===1)el('guide-next').click();else el('reflection').focus();};
  el('comparison-play').onclick=()=>{
    if(timer){pause();return;}if(experiment.getState().elapsed===156)seek(0);
    el('comparison-play').textContent='Pause';timer=setInterval(()=>{if(!document.hidden)seek(Math.min(156,experiment.getState().elapsed+1),true);},reduced.matches?1200:650);
  };
  el('comparison-step').onclick=()=>{pause();seek(Math.min(156,experiment.getState().elapsed+1));};
  el('comparison-season').onclick=()=>{pause();seek(Math.min(156,experiment.getState().elapsed+13));};
  el('comparison-restart').onclick=()=>{pause();seek(0);};
  el('comparison-seek').oninput=()=>pause();
  el('comparison-seek').onchange=()=>seek(Number(el('comparison-seek').value));
  el('comparison-close').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{pause();revision++;analysisRevision++;invalidateExplanation();experiment=null;images.clear();rigs.clear();el('replay-file').value='';onReturn();});
  el('explain-local').onclick=()=>{pause();if(canExplain()){reveal(defaultSelection(packet),'Local evidence guide · no AI call');if(guideStep===3){guideStep=4;renderGuide();el('connection-response').focus();}}};
  el('explain-spark').onclick=async()=>{
    pause();if(!canExplain()||!sparkService.enabled)return;
    const current=++explanationRevision;explanationRequest=new AbortController();el('explain-spark').disabled=true;
    el('explanation-status').textContent='Sending only the question and model record locally; the provider receives compact evidence, not photos or learner responses.';
    try{const file=fileWithNotes();const result=await askSpark(sparkService,{operation:'explain',question:file.question||changeLabel(file.scenario),replay:modelOnlyReplay(file)},explanationRequest.signal);
      if(current!==explanationRevision||!dialog.open)return;reveal(result.value,`${result.provider} selected evidence`);
    }catch(error){if(current===explanationRevision)el('explanation-status').textContent=error.message;}
    finally{if(current===explanationRevision){explanationRequest=null;el('explain-spark').disabled=!sparkService.enabled;}}
  };
  el('download-worksheet').onclick=()=>{
    try{const file=fileWithNotes(),html=worksheetHtml(file,packet,{...file.activity,selection:selection||defaultSelection(packet)}),url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download='microverse-investigation.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Worksheet saved with learner notes and a model-only replay link. No pictures are included.');
    }catch(error){message(error.message);}
  };
  el('run-continuations').onclick=async()=>{
    pause();const current=++analysisRevision,file=experiment.toReplay(),results=[];
    el('run-continuations').disabled=true;
    // Yield after each replicate so the dialog remains responsive and close cancels.
    try{for(let randomState=1;randomState<=10;randomState++){
      if(current!==analysisRevision)return;
      results.push(runContinuation(file.initial,file.scenario,randomState));
      el('continuation-results').textContent=`Checking continuation ${randomState} of 10…`;
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    if(current!==analysisRevision)return;
    const delta=(key,species)=>results.map(r=>species?r.changed.counts[species]-r.baseline.counts[species]:(r.changed[key]-r.baseline[key])*100);
    const range=values=>`${Math.min(...values).toFixed(1)} to ${Math.max(...values).toFixed(1)}`;
    el('continuation-results').textContent=`At elapsed week 156, changed minus baseline: grass ${range(delta('grass'))} percentage points; rabbits ${range(delta(null,'rabbit'))}; deer ${range(delta(null,'deer'))}. Range across 10 fixed random continuation states (1–10). Starting creatures and resources stay fixed; only future random draws vary. This is variation within the model, not a confidence interval or forecast.`;
    }catch(error){if(current===analysisRevision)el('continuation-results').textContent=`Continuation check could not finish: ${error.message}`;}
    finally{if(current===analysisRevision)el('run-continuations').disabled=false;}
  };
  el('download-replay').onclick=()=>{
    try{const file=fileWithNotes(),url=URL.createObjectURL(new Blob([JSON.stringify(file)],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download=`microverse-experiment-week-${file.elapsed}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      message('Replay saved locally, including your creature images and notes.');
    }catch(error){message(error.message);}
  };
  el('replay-file').onchange=async()=>{
    pause();const file=el('replay-file').files[0];if(!file)return;
    const current=++revision;
    try{
      if(file.size>16_000_000)throw new Error('Choose a replay under 16 MB.');
      const input=JSON.parse(await file.text());validateReplay(input);
      if(current!==revision)return;
      show(experimentFromReplay(input),input.prediction,input.reflection,input.activity||{});
    }catch(error){if(current===revision){const text=`Replay could not be opened: ${error.message}`;message(text);if(!dialog.open)onStatus(text);}}
    finally{el('replay-file').value='';}
  };
  return {open(scenario,prediction,question='',activity={}){show(createExperiment(snapshot(),scenario,prediction,question),prediction,'',activity);},
    openGuide(prediction='',visitor=null){
      // a fresh seed-7 forest; an invited companion enters the shared starting state, so both branches are identical except rainfall
      const forest=createForestController();
      if(visitor)forest.add({species:visitor.species,name:visitor.name,image:visitor.image,rigConfig:visitor.rigConfig,source:visitor.source});
      show(createExperiment(forest.toSnapshot(),GUIDE_CHANGE,prediction,'What changes first when rainfall is halved?'),prediction,'',{},0);
    },
    chooseReplay(){el('replay-file').click();}};
}
