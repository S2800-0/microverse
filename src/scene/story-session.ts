import {createForestController} from './controller.ts';
import {createExperiment,validateReplay} from './experiment.ts';
import {buildEvidence,worksheetHtml} from '../investigation/evidence.js';

export const STORY_SCENARIOS=Object.freeze({
  dry:Object.freeze({rain:.5,condition:'Less rain',title:'A little less rain',question:'What changes when less rain falls?',invitation:'What if it rains less?',imagine:'Imagine half the usual rain.',connection:'Slower plant growth'}),
  wet:Object.freeze({rain:1.5,condition:'More rain',title:'A little more rain',question:'What changes when more rain falls?',invitation:'What if it rains more?',imagine:'Imagine one and a half times the usual rain.',connection:'Faster plant regrowth'}),
});

// The presentation reads saved frames; its clock never changes ecological draws.
export function createStorySession(seed=7,scenario:'dry'|'wet'='dry'){
  if(!Object.hasOwn(STORY_SCENARIOS,scenario))throw new Error('Choose a prepared rain story.');
  const settings=STORY_SCENARIOS[scenario];
  const initial=createForestController({seed}).toSnapshot();
  const change={kind:'rain' as const,rain:settings.rain,durationWeeks:52};
  const experiment=createExperiment(initial,change);
  const frames:any[]=[];
  function capture(branch:any){return {animals:structuredClone(branch.animals),width:branch.world.params.width,height:branch.world.params.height,
    food:Array.from(branch.world.grass) as number[],open:Array.from(branch.world.open),grass:branch.grass,counts:{...branch.counts},events:structuredClone(branch.world.events)};}
  for(let week=0;week<=13;week++){const s=experiment.seek(week);frames.push({week,baseline:capture(s.baseline),changed:capture(s.changed)});}
  const rabbits=frames[0].changed.animals.filter((a:any)=>a.species==='rabbit');
  const subject=rabbits.find((a:any)=>a.id===20)||rabbits[0];
  const branch=frames[13].changed,w=branch.width;
  let cell=Math.floor(subject.y)*w+Math.floor(subject.x),best=-Infinity;
  for(let y=Math.max(0,Math.floor(subject.y)-4);y<Math.min(branch.height,subject.y+4);y++)for(let x=Math.max(0,Math.floor(subject.x)-4);x<Math.min(w,subject.x+4);x++){
    const i=y*w+x;if(!branch.open[i])continue;
    const difference=Math.abs(frames[13].baseline.food[i]-branch.food[i]);
    if(difference>best){best=difference;cell=i;}
  }
  const patch={x:cell%w+.5,y:Math.floor(cell/w)+.5,cell};
  const packet=buildEvidence(experiment);
  function replay(prediction='',reflection='',connection=''){
    const file=experiment.toReplay(reflection);file.prediction=prediction;file.question=settings.question;
    file.activity={before:'',after:'',teacherNotes:'',connection};validateReplay(file);return file;
  }
  function moment(){
    for(const record of packet.events.filter((e:any)=>e.branch==='changed')){
      const index=Number(record.id.split('.')[2]),event=frames[13].changed.events[index];
      if(event?.type!=='birth'||event.species!=='rabbit')continue;
      const frame=frames.find(f=>f.week>event.t&&f.changed.animals.some((a:any)=>a.id===event.id));
      if(frame)return structuredClone({eventId:record.id,event,frameWeek:frame.week,animalId:event.id,record});
    }return null;
  }
  return {subjectId:subject.id,patch,initial:structuredClone(initial),settings,scenario,
    frameAt(week:number){if(!Number.isInteger(week)||week<0||week>13)throw new Error('Choose a story week from 0 to 13.');return structuredClone(frames[week]);},
    replay,moment,evidence(){return structuredClone(packet);},
    worksheet(prediction='',reflection='',connection=''){return worksheetHtml(replay(prediction,reflection,connection),packet,{connection});},
  };
}

export function foodFinding(reference:number,changed:number){
  if(!Number.isFinite(reference)||!Number.isFinite(changed))throw new Error('Missing food observation.');
  const delta=changed-reference;
  return Math.abs(delta)<.01?'About the same grass food':delta<0?'Less grass food here':'More grass food here';
}
