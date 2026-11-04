import {seasonOf} from '../core/sim/engine.ts';
import {createForestController} from '../core/scene/controller.ts';
import {validateSceneSnapshot} from '../core/scene/snapshot.ts';

export const FOREST_PROFILES={
 rabbit:{name:'Rabbit',plural:'Rabbits',image:'/assets/rabbit.png',needs:'Grass is food for rabbits in this little world.',connection:'Less grass can change their energy, breeding and survival.'},
 deer:{name:'Deer',plural:'Deer',image:'/assets/deer.png',needs:'Deer browse leaves and shrubs in this little world.',connection:'The same rain can affect several kinds of plant food.'},
 fox:{name:'Red fox',plural:'Foxes',image:'/assets/fox-portrait.png',needs:'Foxes can hunt rabbits in this little world.',connection:'A change in plants can travel through the food web.'},
 wolf:{name:'Wolf',plural:'Wolves',image:'/assets/wolf.png',needs:'Wolves can hunt deer and rabbits in this little world.',connection:'Food, hunting, births and arrivals can all change a population.'},
};
export function createExploration(snapshot:any){
 validateSceneSnapshot(snapshot);
 // Fork, never mutate the completed experiment or its RNG/records.
 const initial=structuredClone(snapshot),forest=createForestController();forest.restore(initial);
 const startWeek=initial.world.week,startEventIndex=initial.world.events.length;
 return {startWeek,getState:()=>forest.getState(),
  step(){if(forest.getState().week-startWeek>=52)throw Error('This exploration year is complete. Replay it or return to your experiment.');return forest.step(1)},
  restart(){forest.restore(initial);return forest.getState()},
  records(){return forestRecords(forest.getState(),startEventIndex)},
  snapshot(){return forest.toSnapshot()},
 };
}
export function forestRecords(state:any,startIndex=0){
 const events=state.world.events;
 return events.map((event:any,index:number)=>({event,index})).filter(({event,index}:any)=>index>=startIndex&&['birth','arrive','death','kill'].includes(event.type)).map(({event:e,index}:any)=>{
  const species=e.species||(e.type==='kill'?state.world.animals.find((a:any)=>a.id===e.id)?.species:null);
  const name=FOREST_PROFILES[species as keyof typeof FOREST_PROFILES]?.name.toLowerCase()||'animal';
  const title=e.type==='birth'?`A ${name} was born.`:e.type==='arrive'?`A ${name} arrived.`:e.type==='death'?`A ${name} died.`:'A hunt was recorded.';
  const detail=e.type==='birth'?'A new neighbour joined this run.':e.type==='arrive'?'An animal entered from outside this little world.':e.type==='death'?(e.cause==='starved'?'The model recorded starvation.':e.cause==='eaten'?'The model recorded that a predator caught this animal.':`The model recorded ${e.cause||'a death'}.`):`A predator caught a ${e.preySpecies}. This is part of the model’s food web.`;
  const alive=state.animals.find((a:any)=>a.id===e.id);
  return {id:`forest.event.${index}`,eventIndex:index,type:e.type,week:e.t,title,detail,species,animalId:e.id,livingAnimalId:alive?.id??null,record:structuredClone(e)};
 }).reverse();
}
export function neighbourChoices(state:any){
 return Object.entries(FOREST_PROFILES).map(([species,profile])=>({species,...profile,animalId:state.animals.find((a:any)=>a.species===species)?.id??null}));
}
export function forestTime(week:number){
 const raw=seasonOf(week),season=raw[0].toUpperCase()+raw.slice(1);
 return {season,year:Math.floor(week/52)+1,week,label:`${season} · year ${Math.floor(week/52)+1}`};
}
