import {createForestController} from '../core/scene/controller.ts';
import {createExperiment,experimentFromReplay} from '../core/scene/experiment.ts';
import {buildEvidence,eventSentence} from '../core/investigation/evidence.js';
import {canUseForest} from './photo-routing.js';

export const FOOD_LEVELS={ None:0,'A little':.25,Some:.55,Lots:.85 } as const;
export const OBSERVATION_WEEKS=[0,1,4,13,26,52];
export const RAIN_CHANGE={kind:'rain' as const,rain:.5,durationWeeks:52};
// The lesson opens on a run that shows the usual result at every food level. It is not a rigged result:
// RAIN_RUNS reports how often that result happened, and a test recomputes the table from the model.
export const LESSON_SEED=12;
export const RAIN_RUNS={runs:20,week:52,'None':{fewer:11,more:7,same:2},'A little':{fewer:17,more:3,same:0},'Some':{fewer:18,more:2,same:0},'Lots':{fewer:15,more:5,same:0}} as const;
export function rainRunsNote(session:any){
  const tally=(RAIN_RUNS as any)[session.context?.startingFood?.label];if(!tally)return '';
  return `We also ran this ${RAIN_RUNS.runs} times with different luck. By week ${RAIN_RUNS.week}, less rain had fewer rabbits in ${tally.fewer} of them.`;
}
export function startModel({food,review,route='greenspace',source='manual',sourceHash='',dimensions=null,seed=LESSON_SEED,habitat='meadow'}:any){
  if(!['garden','woodland','meadow'].includes(habitat))throw new Error('Choose a supported land world.');
  if(!Object.hasOwn(FOOD_LEVELS,food)||!canUseForest(route,review))throw new Error('Review an outdoor place and choose starting food first.');
  if(Object.keys(review).length!==3||!['grass','tree','water'].every(k=>['seen','unsure','not-visible'].includes(review[k])))throw new Error('Finish the three photo-review choices first.');
  const forest=createForestController({seed});const start=forest.toSnapshot();
  const chosen=FOOD_LEVELS[food as keyof typeof FOOD_LEVELS];
  for(let i=0;i<start.world.open.length;i++){
    start.world.grass[i]=start.world.open[i]?chosen:0;
    start.world.browse[i]=start.world.open[i]?chosen:0;
  }
  // The photo review records presence/uncertainty, not invented image percentages.
  // Restore through the existing scene validator; ecological rules stay curated.
  forest.restore(start);
  const context={source,sourceHash,dimensions,habitat,sceneKind:route,review:{...review},startingFood:{label:food,grass:chosen,browse:chosen},map:'fixed-meadow-model',shareMeasurements:null};
  return makeSession(forest.toSnapshot(),context);
}
function makeSession(initial:any,context:any,prediction='',elapsed=0,scenario:any=RAIN_CHANGE){
  const experiment=createExperiment(initial,scenario,prediction,'What if rainfall is halved for a year?');
  let frame=experiment.seek(elapsed);
  return {context,experiment,getState:()=>frame,
    seek(week:number){frame=experiment.seek(week);return frame},
    setPrediction(text:string){return makeSession(initial,context,text,frame.elapsed,scenario)},
    packet(){return buildEvidence(experiment)},
    export(selectedIds:string[]=[]){
      const packet=buildEvidence(experiment),valid=new Set([...packet.observations,...packet.events].map((o:any)=>o.id));
      if(!Array.isArray(selectedIds)||selectedIds.length>3||new Set(selectedIds).size!==selectedIds.length||selectedIds.some(id=>!valid.has(id)))throw new Error('Choose observations from this experiment.');
      return {format:'microverse-discovery',version:1,context:structuredClone(context),selectedEvidenceIds:[...selectedIds],replay:experiment.toReplay('')};
    },
  };
}
export function loadDiscovery(input:any){
  if(!input||input.format!=='microverse-discovery'||input.version!==1)throw new Error('Choose a saved Microverse discovery.');
  // Core replay validation checks bounded state, terrain, model rules and change.
  if(JSON.stringify(input.replay.initial).includes('data:image')||input.replay.initial?.appearances?.length||input.replay.initial?.world?.interventions?.length)throw new Error('This activity reopens built-in model art with no pre-existing changes.');
  const check=experimentFromReplay(input.replay);
  const change=check.getState().scenario;
  if(change.kind!=='rain'||change.rain!==.5||change.durationWeeks!==52||input.replay.initial.world.week!==0||check.getState().elapsed>52)throw new Error('This activity supports half rainfall for one year, viewed through week 52.');
  const c=input.context;
  if(!c||!['manual','recorded-sam'].includes(c.source)||typeof c.sourceHash!=='string'||(c.sourceHash!==''&&!/^[a-f0-9]{64}$/.test(c.sourceHash))||!canUseForest(c.sceneKind,c.review)||!Object.hasOwn(FOOD_LEVELS,c.startingFood?.label)||c.startingFood.grass!==FOOD_LEVELS[c.startingFood.label as keyof typeof FOOD_LEVELS]||c.startingFood.browse!==c.startingFood.grass||c.map!=='fixed-meadow-model'||c.shareMeasurements!==null)throw new Error('This discovery has an unsupported place review.');
  if(!['grass','tree','water'].every(k=>['seen','unsure','not-visible'].includes(c.review[k])))throw new Error('This review is incomplete.');
  if(c.dimensions!==null&&(!c.dimensions||!['width','height'].every(k=>Number.isSafeInteger(c.dimensions[k])&&c.dimensions[k]>0&&c.dimensions[k]<=1600)))throw new Error('Invalid photo dimensions.');
  if(c.habitat!==undefined&&!['garden','woodland','meadow'].includes(c.habitat))throw Error('Unsupported saved world.');
  const context={habitat:c.habitat||'meadow',source:c.source,sourceHash:c.sourceHash,dimensions:c.dimensions?{width:c.dimensions.width,height:c.dimensions.height}:null,sceneKind:c.sceneKind,review:Object.fromEntries(['grass','tree','water'].map(k=>[k,c.review[k]])),startingFood:{label:c.startingFood.label,grass:c.startingFood.grass,browse:c.startingFood.browse},map:c.map,shareMeasurements:null};
  const chosen=c.startingFood.grass;
  if(input.replay.initial.world.grass.some((n:number,i:number)=>Math.abs(n-(input.replay.initial.world.open[i]?chosen:0))>1e-6)||input.replay.initial.world.browse.some((n:number,i:number)=>Math.abs(n-(input.replay.initial.world.open[i]?chosen:0))>1e-6))throw new Error('The saved starting food does not match the experiment.');
  const session=makeSession(input.replay.initial,context,input.replay.prediction,check.getState().elapsed,input.replay.scenario);
  session.export(input.selectedEvidenceIds||[]);
  return {session,selectedEvidenceIds:input.selectedEvidenceIds||[]};
}
export function observationChoices(session:any){
  const p=session.packet();
  const label=(o:any)=>{
    const dir=o.difference<-.01?'Less':o.difference>.01?'More':'Similar';
    if(o.id==='grass')return `${dir} grass to eat`;
    if(o.id==='browse')return `${dir} leaves to eat`;
    const noun=o.id.split('.')[1];return `${o.difference<0?'Fewer':o.difference>0?'More':'The same number of'} ${noun==='fox'?'foxes':noun==='deer'?'deer':noun+'s'}`;
  };
  const ids=['grass','population.rabbit','population.deer'];
  return ids.map(id=>p.observations.find((o:any)=>o.id===id)).filter(Boolean).map((o:any)=>({...o,text:label(o)}));
}
export function modelCaption(session:any){
  const s=session.getState();if(!s.elapsed)return {title:'This rabbit needs grass.',text:'Let’s give the world less rain. Watch the bright grass patches: will there still be enough to eat?'};
  const food=s.changed.grass-s.baseline.grass;
  if(s.elapsed>=13){const rabbits=s.changed.counts.rabbit-s.baseline.counts.rabbit;return {title:rabbits<0?'There are fewer rabbits here.':rabbits>0?'There are more rabbits here.':'Both worlds have the same number of rabbits.',text:`${s.changed.counts.rabbit} rabbits here, ${s.baseline.counts.rabbit} with usual rain. Only the rain is different. Food, hunters and chance all play a part.`}}
  return {title:Math.abs(food)<.00005?'The grass looks much the same so far.':food<0?'Less grass for the animals.':'More grass for the animals.',text:s.elapsed===1?(Math.abs(food)<.00005?'Both worlds still have about the same grass. Keep watching.':food<0?'There is a little less grass than in the usual-rain world. The animals have not all changed yet. Keep watching.':'There is a little more grass than in the usual-rain world. Keep watching.'):'Compare the bright food patches with the usual-rain world. What do you notice?'};
}
export function recordedMoment(session:any,branch:'baseline'|'changed'='changed'){
  const s=session.getState();const all=s[branch].world.events;
  for(let i=all.length-1;i>=s.eventStartIndex;i--){const e=all[i];if(e.type==='birth'||e.type==='arrive')return {id:`event.${branch}.${i}`,week:e.t,text:e.type==='birth'?`A baby ${e.species} was born.`:`A ${e.species} joined this world.`,animalId:e.id,event:e};}
  return null;
}
