import {createExperiment,experimentFromReplay,validateReplay,runContinuation} from './experiment.ts';
import {ART,POSES,poseFor,bodyScale} from './art.js';
import {buildRig,GAITS} from '../motion/rig.js';
import {assessRig} from '../motion/rig-analysis.js';
import {prepareJointPieces,drawPuppet} from '../motion/puppet-motion.js';
import {getMotion} from '../motion/motion-library.js';
import {describeChange,changeLabel} from '../investigation/changes.js';
import {buildEvidence,defaultSelection,validateEvidenceSelection,explanationLines,worksheetHtml,modelOnlyReplay} from '../investigation/evidence.js';
import {readSparkService,askSpark} from '../investigation/client.js';
import {comparisonNarration} from './narration.js';

// The comparison view owns its canvases/timer; it never advances the exploring forest.
export function installExperimentView({snapshot,eventText,onStatus=()=>{},narrator,onReturn=()=>{}}){
  const el=id=>document.getElementById(id),dialog=el('comparison-dialog');
  let experiment=null,timer=null,revision=0,startWeek=0,analysisRevision=0;
  let packet=null,selection=null,beforeResponse='',sparkService={enabled:false},explanationRevision=0,explanationRequest=null;
  const images=new Map(),rigs=new Map();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const message=text=>{el('comparison-status').textContent=text;};
  const evidenceId=id=>`evidence-${id.replaceAll('.','-')}`;
  function invalidateExplanation(){explanationRevision++;explanationRequest?.abort();explanationRequest=null;selection=null;el('grounded-explanation').hidden=true;el('grounded-explanation').replaceChildren();el('explanation-status').textContent='';}
  function fileWithNotes(){const file=experiment.toReplay(el('reflection').value);file.activity={before:beforeResponse,after:el('transfer-response').value,teacherNotes:el('teacher-notes').value};validateReplay(file);return file;}
  function reveal(value,source){
    selection=validateEvidenceSelection(value,packet);const list=el('grounded-explanation');list.replaceChildren();
    for(const line of explanationLines(packet,selection)){
      const li=document.createElement('li');li.textContent=line.text;
      if(line.ref&&!packet.mechanisms.some(m=>m.id===line.ref)){
        const button=document.createElement('button');button.textContent=`Inspect ${line.ref}`;button.className='evidence-ref';button.onclick=()=>{el('comparison-evidence-details').open=true;document.getElementById(evidenceId(line.ref))?.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});};li.append(' ',button);
      }list.append(li);
    }
    const follow=document.createElement('li');follow.textContent=`Question to consider: ${selection.followUp}`;list.append(follow);list.hidden=false;
    el('explanation-status').textContent=`${source}. Values and events are rendered from this run; possible model connections are not proven causes.`;
  }
  function canExplain(){if(!experiment?.getState().elapsed){el('explanation-status').textContent='Advance at least one week first.';return false;}if(!el('reflection').value.trim()){el('explanation-status').textContent='Record your own explanation first, even if it is “I am not sure yet”. Then compare it with the evidence.';return false;}return true;}
  function pause(){clearInterval(timer);timer=null;narrator?.stop();el('comparison-play').textContent='Play';}
  function renderWorld(canvas,state){
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#c6c79c';ctx.fillRect(0,0,w,h);
    const map=images.get('/maps/spring.png');if(map)ctx.drawImage(map,0,0,w,h);
    ctx.fillStyle=`rgba(151,114,68,${Math.max(0,.8-state.grass)*.35})`;ctx.fillRect(0,0,w,h);
    for(const a of [...state.animals].sort((a,b)=>a.y-b.y)){
      const custom=state.appearances.get(a.id),art=ART[a.species],src=custom?.image||art?.image;
      const pose=custom?null:images.get(POSES[poseFor(a,state.world.params,false)]),image=pose||images.get(src),rig=pose?null:rigs.get(src),x=a.x/state.world.params.width*w,y=a.y/state.world.params.height*h;
      const size=44*(art?.size||1)*bodyScale(a,state.world.params);
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
    for(const src of Object.values(POSES))sources.set(src,null);
    for(const a of initial.appearances)if(a.image)sources.set(a.image,a.rigConfig||null);
    let unavailable=0,rigFallbacks=0;
    await Promise.all([...sources].map(async([src,cut])=>{
      try{
        const image=new Image();image.src=src;await image.decode();if(current!==revision)return;images.set(src,image);
        if(cut){try{const candidate=await buildRig(src,cut);if(current!==revision)return;if(assessRig(candidate).warnings.length)throw new Error();rigs.set(src,prepareJointPieces(candidate));}catch{rigFallbacks++;}}
      }catch{unavailable++;}
    }));
    if(current===revision&&dialog.open){render();message(unavailable?`${unavailable} image(s) unavailable. Model records remain intact.`:rigFallbacks?`${rigFallbacks} illustration(s) use whole-image display.`:'Ready. Advance both worlds together, then inspect the evidence.');}
  }
  function render(){
    if(!experiment)return;const s=experiment.getState(),a=s.baseline,b=s.changed;packet=buildEvidence(experiment);
    el('comparison-week').textContent=`${s.elapsed} ${s.elapsed===1?'week':'weeks'}`;el('comparison-seek').value=s.elapsed;
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
  }
  function seek(week,automatic=false){try{invalidateExplanation();experiment.seek(week);render();narrator?.say(comparisonNarration(packet),{automatic:automatic&&week!==156});}catch(error){pause();message(error.message);}}
  function show(next,prediction,reflection,activity={}){
    pause();analysisRevision++;experiment=next;
    invalidateExplanation();beforeResponse=activity.before||'';el('transfer-response').value=activity.after||'';el('teacher-notes').value=activity.teacherNotes||'';
    el('continuation-results').textContent='';el('run-continuations').disabled=false;
    const file=next.toReplay();
    startWeek=file.initial.world.week;
    el('saved-prediction').textContent=prediction?`Your prediction: ${prediction}`:'No prediction recorded. You can still inspect and explain the evidence.';
    el('reflection').value=reflection;
    el('comparison-description').textContent=`${file.question?file.question+' ':''}${describeChange(file.scenario)}`;
    const place=file.initial.place;el('comparison-place').hidden=!place;
    el('comparison-place').textContent=place?`Place-inspired starting food chosen at forest week ${place.atWeek}: grass ${Number((place.start.grass*100).toFixed(1))}%, shrubs ${Number((place.start.browse*100).toFixed(1))}%. Reviewed image shares are context, not measured biomass or a reconstruction of the real site. The place photo is not saved in this replay.`:'';
    el('changed-label').textContent=`Changed · ${changeLabel(file.scenario)}`;
    if(!dialog.open)dialog.showModal();render();narrator?.context(comparisonNarration(packet));message('Preparing illustrations locally…');prepareArt(file.initial);
    readSparkService().then(s=>{if(dialog.open){sparkService=s;el('explain-spark').disabled=!s.enabled||!experiment?.getState().elapsed;}});
  }
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
  el('explain-local').onclick=()=>{pause();if(canExplain())reveal(defaultSelection(packet),'Local evidence guide · no AI call');};
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
    chooseReplay(){el('replay-file').click();}};
}
