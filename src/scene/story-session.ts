import {createForestController} from './controller.ts';
import {createExperiment} from './experiment.ts';

// The presentation reads saved frames; its clock never changes ecological draws.
export function createStorySession(seed=7){
  const initial=createForestController({seed}).toSnapshot();
  const experiment=createExperiment(initial,{kind:'rain',rain:.5,durationWeeks:52});
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
    const difference=frames[13].baseline.food[i]-branch.food[i];
    if(difference>best){best=difference;cell=i;}
  }
  const patch={x:cell%w+.5,y:Math.floor(cell/w)+.5,cell};
  return {subjectId:subject.id,patch,initial,
    frameAt(week:number){if(!Number.isInteger(week)||week<0||week>13)throw new Error('Choose a story week from 0 to 13.');return structuredClone(frames[week]);},
    replay(prediction='',reflection=''){const e=createExperiment(initial,{kind:'rain',rain:.5,durationWeeks:52},prediction,'What changes when less rain falls?');e.seek(13);return e.toReplay(reflection);},
  };
}

export function foodFinding(reference:number,changed:number){
  if(!Number.isFinite(reference)||!Number.isFinite(changed))throw new Error('Missing food observation.');
  const delta=changed-reference;
  return Math.abs(delta)<.01?'About the same grass food':delta<0?'Less grass food here':'More grass food here';
}
