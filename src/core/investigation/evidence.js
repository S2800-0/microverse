import {discoverySummary,worldLabels,plural,conditionPhrase} from '../scene/discovery.js';
import {normalizeChange,changeLabel} from './changes.js';
const round=n=>Number(n.toFixed(2));
export function eventSentence(e){
  if(e.type==='intervention')return e.kind==='remove'?`The chosen species was removed.`:`The rainfall change began.`;
  if(e.type==='birth')return `${e.species} #${e.id} was born; parent #${e.parent}.`;
  if(e.type==='death')return e.cause==='removed'?`${e.species} #${e.id} was removed.`:`${e.species} #${e.id} died (${e.cause}).`;
  if(e.type==='kill')return `Animal #${e.id} caught ${e.preySpecies} #${e.prey}.`;
  if(e.type==='arrive')return `${e.species} #${e.id} arrived.`;
  return `Companion #${e.id} disturbed animal #${e.other}.`;
}
export function buildEvidence(experiment){
  const s=experiment.getState(),startWeek=s.startWeek;
  const a=s.baseline,b=s.changed,observations=[];
  for(const [id,label,baseline,changed,unit]of [
    ['grass','Grass food (model scale)',a.grass*100,b.grass*100,'model points'],['browse','Shrub food (model scale)',a.browse*100,b.browse*100,'model points'],
    ...Object.keys(a.counts).map(k=>[`population.${k}`,`${k} population`,a.counts[k],b.counts[k],'animals']),
  ])observations.push({id,label,baseline:round(baseline),changed:round(changed),difference:round(changed-baseline),unit});
  const events=[];
  for(const [branch,state]of [['baseline',a],['changed',b]]){
    const all=state.world.events.map((e,index)=>({e,index})).filter(({e,index})=>index>=(s.eventStartIndex??0)&&e.t>=startWeek);
    const selected=[...all.filter(({e})=>e.type==='intervention'),...all.filter(({e})=>e.type!=='disturb').slice(-5)];
    for(const {e,index}of [...new Map(selected.map(v=>[v.index,v])).values()].slice(-10))events.push({id:`event.${branch}.${index}`,branch,week:e.t,text:eventSentence(e)});
  }
  const change=normalizeChange(s.scenario);
  const mechanisms=[
    {id:'rain-growth',text:'Model rule: rainfall scales grass and browse regrowth. Below-normal rainfall also dries standing grass.'},
    {id:'rabbit-food',text:'Model rule: rabbits gain energy by grazing grass. Low energy can prevent breeding or cause starvation.'},
    {id:'deer-food',text:'Model rule: deer gain energy by browsing shrubs. Food, energy and population caps affect breeding.'},
    {id:'predation',text:'Model rule: foxes can hunt rabbits; wolves can hunt deer and rabbits. Encounters and hunts are stochastic.'},
    {id:'immigration',text:'Model rule: scarce native species can arrive from outside; a removal disables that species’ immigration.'},
  ];
  return {version:1,seed:s.seed,startWeek,endWeek:a.week,elapsed:s.elapsed,change,observations,events,mechanisms};
}
export function defaultSelection(packet){
  const observations=packet.change.kind==='rain'?['grass','browse','population.rabbit','population.deer']:
    [`population.${packet.change.species}`,'population.rabbit','population.deer','grass'];
  return {observationIds:[...new Set(observations)],eventIds:packet.events.filter(e=>e.branch==='changed').slice(0,3).map(e=>e.id),
    mechanismIds:packet.change.kind==='rain'?['rain-growth','rabbit-food','deer-food']:['predation','immigration'],
    followUp:'Which recorded change supports your explanation, and what would you test next?'};
}
export function validateEvidenceSelection(value,packet){
  if(!value||typeof value!=='object'||Object.keys(value).some(k=>!['observationIds','eventIds','mechanismIds','followUp'].includes(k)))throw new Error('Invalid evidence selection.');
  for(const [key,source,max]of [['observationIds',packet.observations,6],['eventIds',packet.events,6],['mechanismIds',packet.mechanisms,4]]){
    if(!Array.isArray(value[key])||value[key].length>max||new Set(value[key]).size!==value[key].length||value[key].some(id=>!source.some(s=>s.id===id)))throw new Error('The explanation cited evidence that is not in this run.');
  }
  if(!value.observationIds.length||typeof value.followUp!=='string'||value.followUp.length>240)throw new Error('Invalid explanation prompt.');
  return structuredClone(value);
}
export function evidenceSelectionSchema(packet){
  const ids=(source,max)=>({type:'array',items:{type:'string',enum:source.map(v=>v.id)},maxItems:max});
  return {type:'object',additionalProperties:false,properties:{observationIds:ids(packet.observations,6),eventIds:ids(packet.events,6),mechanismIds:ids(packet.mechanisms,4),followUp:{type:'string'}},required:['observationIds','eventIds','mechanismIds','followUp']};
}
export function explanationLines(packet,selection=defaultSelection(packet)){
  validateEvidenceSelection(selection,packet);
  const lines=[];
  const labels=worldLabels(packet.change),condition=conditionPhrase(packet.change);
  for(const id of selection.observationIds){const o=packet.observations.find(x=>x.id===id);let text;
    if(id==='grass'||id==='browse')text=`${id==='grass'?'Grass':'Shrub'} food is ${o.difference<0?'lower':o.difference>0?'higher':'the same'} in the forest ${condition}. The measurements show the exact difference.`;
    else{const species=id.split('.')[1];text=o.difference?`${condition[0].toUpperCase()+condition.slice(1)}, there are ${Math.abs(o.difference)} ${o.difference>0?'more':'fewer'} ${Math.abs(o.difference)===1?species:plural(species)} than in the reference forest.`:`The number of ${plural(species)} still matches the reference forest.`;}
    lines.push({ref:id,kind:'observation',text});
  }
  for(const id of selection.eventIds){const e=packet.events.find(x=>x.id===id);lines.push({ref:id,kind:'event',text:`${labels[e.branch]}, week ${e.week}: ${e.text}`});}
  const plain={
    'rain-growth':'In this model, rainfall affects how quickly plants regrow. Lower rain also dries grass.',
    'rabbit-food':'Rabbits eat grass in this model. Their food and energy can affect breeding and survival.',
    'deer-food':'Deer eat shrub food in this model. Their food, energy and population can affect breeding.',
    predation:'Foxes can hunt rabbits; wolves can hunt deer and rabbits. Whether they meet and catch prey involves chance.',
    immigration:'New animals can arrive when a species becomes scarce. Removing a species also stops its new arrivals.',
  };
  for(const id of selection.mechanismIds)lines.push({ref:id,kind:'mechanism',text:`Possible connection to investigate: ${plain[id]}`});
  lines.push({ref:null,kind:'limit',text:'These observations and model rules suggest possible explanations. A single paired run does not isolate every stochastic cause or predict a real ecosystem.'});
  return lines;
}
export function modelOnlyReplay(file){
  const copy=structuredClone(file);copy.initial.appearances=[];copy.initial.selectedId=null;
  for(const animal of copy.initial.world.animals)delete animal.name;
  copy.prediction='';copy.reflection='';copy.question='';delete copy.activity;return copy;
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function worksheetHtml(file,packet,{before='',after='',teacherNotes='',connection='',selection=defaultSelection(packet)}={}){
  const summary=discoverySummary(packet);
  const modelRecord=encodeURIComponent(JSON.stringify(modelOnlyReplay(file)));
  const place=file.initial.place;
  const placeLine=place?`<h2>Place-inspired start</h2><p>At forest week ${escape(place.atWeek)}, reviewed image shares were grass ${escape(Number((place.reviewed.grass*100).toFixed(1)))}%, trees ${escape(Number((place.reviewed.tree*100).toFixed(1)))}%, water ${escape(Number((place.reviewed.water*100).toFixed(1)))}%. Chosen model food indices: grass ${escape(Number((place.start.grass*100).toFixed(1)))}%, shrubs ${escape(Number((place.start.browse*100).toFixed(1)))}%. These are illustrative inputs, not ground-area or biomass measurements. The place photo/masks are not saved.</p>`:'';
  const rows=packet.observations.map(o=>`<tr><th>${escape(o.label)}</th><td>${o.baseline}</td><td>${o.changed}</td><td>${o.difference}</td></tr>`).join('');
  const lines=file.reflection.trim()?explanationLines(packet,selection).map(l=>`<li>${escape(l.text)} ${l.ref?`[${escape(l.ref)}]`:''}</li>`).join(''):'<li>Record a learner explanation first, then compare it with the evidence guide in the application.</li>';
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Microverse discovery card</title><style>body{font:16px/1.5 system-ui;max-width:850px;margin:32px auto;padding:20px;color:#222}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #aaa;padding:6px;text-align:left}p{white-space:pre-wrap}@media print{.rerun{display:none}body{margin:0;padding:0;font-size:11pt}}</style><h1>Microverse discovery card</h1><h2>${escape(summary.headline)}</h2><p>${escape(summary.detail)}</p><p>Question: ${escape(file.question||changeLabel(file.scenario))}</p><p>Seed ${packet.seed}; forest weeks ${packet.startWeek}–${packet.endWeek}; elapsed ${packet.elapsed} weeks. Simplified model outcomes.</p><h2>Prediction</h2><p>${escape(file.prediction)}</p><h2>Change</h2><p>${escape(changeLabel(file.scenario))}</p>${placeLine}<h2>What the model recorded</h2><table><tr><th>Measure</th><th>Baseline</th><th>Changed</th><th>Difference</th></tr>${rows}</table><h2>Learner explanation</h2><p>${escape(file.reflection)}</p><h2>Evidence and possible model connections</h2><ul>${lines}</ul><h2>Before-use reasoning</h2><p>${escape(before)}</p><h2>Transfer question response</h2><p>${escape(after)}</p><h2>A connection beyond this forest</h2><p>${escape(connection)}</p><h2>Facilitator notes</h2><p>${escape(teacherNotes)}</p><p class="rerun"><a download="microverse-model-only-replay.json" href="data:application/json;charset=utf-8,${modelRecord}">Download model-only rerun data</a> (no pictures, creature names or learner notes). Open it through Field notes → Open a saved experiment in this model version.</p><p>Use the ten-continuation check to inspect variability. This activity has not yet been evaluated with teachers or learners; it does not establish learning gains or real-world ecological predictions.</p></html>`;
}
