// Plain-language views of recorded model state. These functions never advance it.
export const GUIDE_CHANGE=Object.freeze({kind:'rain',rain:.5,durationWeeks:52});
export function worldLabels(change){return change.kind==='rain'?{baseline:'Usual rainfall',changed:change.rain<1?'Less rainfall':change.rain>1?'More rainfall':'Same rainfall'}:{baseline:'Original conditions',changed:`Without ${plural(change.species)}`};}
export function conditionPhrase(change){const label=worldLabels(change).changed.toLowerCase();return change.kind==='rain'?`with ${label}`:label;}
export const plural=species=>({rabbit:'rabbits',deer:'deer',fox:'foxes',wolf:'wolves',dog:'dogs',cat:'cats',penguin:'penguins'})[species]||'animals';
export function compareFood(baseline,changed){
  const difference=changed-baseline;
  return Math.abs(difference)<.00005?'About the same food':difference<0?'Less food here':'More food here';
}
export function discoverySummary(packet){
  const grass=packet.observations.find(o=>o.id==='grass'),browse=packet.observations.find(o=>o.id==='browse');
  const animals=packet.observations.filter(o=>o.id.startsWith('population.')&&o.difference!==0);
  let headline='The investigation starts here.',detail='Both worlds start with the same creatures and food. Only your chosen change is different.';
  if(packet.elapsed){
    const food=packet.change.kind==='rain'?grass:browse;
    headline=Math.abs(food.difference)<.01?'The food levels are similar so far.':`${food.id==='grass'?'Grass':'Shrub'} food is ${food.difference<0?'lower':'higher'} here.`;
    detail=animals.length?'Some animal counts differ too. Look at their records before deciding why.':'The animal counts still match. Food and animal populations do not have to change at the same time.';
  }
  if(packet.elapsed&&packet.change.kind==='remove'){headline=`The ${plural(packet.change.species)} have been removed.`;detail='Watch the other animals and their food. A change to one population can affect several connections over time.';}
  if(packet.elapsed)headline=headline.replace(' here.','.');
  const why=packet.change.kind==='rain'?'In this model, rainfall affects how quickly grass and shrubs regrow. Below-normal rain also dries grass. Rabbits eat grass; deer eat shrub food.':`In this model, ${packet.change.species==='wolf'?'wolves hunt deer and rabbits':packet.change.species==='fox'?'foxes hunt rabbits':packet.change.species==='rabbit'?'rabbits eat grass and can be hunted by foxes and wolves':'deer eat shrub food and can be hunted by wolves'}. Removing a species also stops its new arrivals.`;
  return {headline,detail,why,caution:'Food, breeding, hunting and random encounters can all affect animal counts. These records help us investigate; they do not prove one cause or predict a real place.'};
}
export function populationRecord(state,species){
  const record={births:0,deaths:0,arrivals:0,removed:0};
  for(const e of state.world.events){if(e.species!==species)continue;if(e.type==='birth')record.births++;if(e.type==='death'){record.deaths++;if(e.cause==='removed')record.removed++;}if(e.type==='arrive')record.arrivals++;}
  return record;
}
export function intervalRecord(state,species,startWeek,firstEvent=0){
  return populationRecord({world:{events:state.world.events.slice(firstEvent).filter(e=>e.t>=startWeek)}},species);
}
export function closerLook(state,startWeek,firstEvent=0){
  // Only show events within the experiment, with their original record identity.
  for(let i=state.world.events.length-1;i>=firstEvent;i--){const e=state.world.events[i];if(e.t<startWeek)break;if(['birth','death','arrive'].includes(e.type))return {id:i,event:e};}
  return null;
}
export function relatedInvestigations(change){
  if(change.kind==='rain')return [
    {question:'What if this change lasted less time?',change:{kind:'rain',rain:change.rain,durationWeeks:Math.max(1,Math.floor(change.durationWeeks/2))}},
    {question:change.rain>1?'What if there were a dry year?':'What if there were a wetter year?',change:{kind:'rain',rain:change.rain>1?.5:1.5,durationWeeks:52}},
  ];
  return [{question:'What if rainfall were halved for a year?',change:{...GUIDE_CHANGE}},{question:'What if the foxes disappeared?',change:{kind:'remove',species:change.species==='fox'?'wolf':'fox'}}].map(item=>item.change.species==='wolf'?{...item,question:'What if the wolves disappeared?'}:item);
}
export function guideContent(step){return [
  {title:'One change. What responds first?',text:'We will halve rainfall for one model year. A second forest keeps usual rainfall so we have something to compare with.',action:'Watch the first week'},
  {title:'Look at the food first.',text:'Compare the labelled food bars. Do the animal counts match? A change in plants can appear before a change in animal numbers.',action:'Look closer at the meadow'},
  {title:'Why does rain matter?',text:'Rainfall affects plant regrowth in this model. Rabbits eat grass, and deer eat shrub food. Those connections give us something to investigate.',action:'Watch the first 13 weeks'},
  {title:'What do you notice?',text:'Write your own explanation below, even if it is “I am not sure yet”. Then we will open the records and possible connections together.',action:'Explore the explanation'},
  {title:'Take the question outside.',text:'Think of plants near home or school. What depends on them? What would you observe before deciding how to help? Save your discovery or try a related question.',action:'Explore on my own'},
][step];}

export function populationStory(state,species){
  const a=intervalRecord(state.baseline,species,state.startWeek,state.eventStartIndex),b=intervalRecord(state.changed,species,state.startWeek,state.eventStartIndex),condition=conditionPhrase(state.scenario),lines=[];
  for(const [key,verb]of [['births','were born'],['deaths','died'],['arrivals','arrived'],['removed','were removed']]){const difference=key==='deaths'?(b.deaths-b.removed)-(a.deaths-a.removed):b[key]-a[key];if(difference)lines.push(`${difference>0?'More':'Fewer'} ${plural(species)} ${verb} in the forest ${condition}.`);}
  return lines.length?lines.join(' '):'Birth, death and arrival counts match so far. Keep watching before drawing a conclusion.';
}
export function describeForPeople(change){
 if(change.kind==='remove')return `Remove all ${plural(change.species)} and stop new ${plural(change.species)} arriving. We will compare this with the same starting forest under its original conditions.`;
 const amount=change.rain===.5?'half the usual amount':change.rain===1?'the usual amount':change.rain===1.5?'one and a half times the usual amount':`${Number((change.rain*100).toFixed(1))}% of the usual amount`;
 const duration=change.durationWeeks===52?'one model year':change.durationWeeks===156?'three model years':`${change.durationWeeks} model weeks`;
 return `Rainfall will be ${amount} for ${duration}. Afterward, the earlier rainfall conditions resume. We will compare it with the same starting forest under usual rainfall.`;
}

// Tap-to-ask: which living animal is drawn at this canvas point? Uses the investigation renderer's mapping and sprite sizes;
// where drawings overlap, the one painted on top (larger y, drawn last) wins.
export function nearestAnimal(animals,params,px,py,w,h,sizeOf=()=>44){
  let best=null,bestY=-Infinity;
  for(const a of animals){
    if(a.alive===false)continue;
    const x=a.x/params.width*w,y=a.y/params.height*h,size=sizeOf(a);
    if(Math.abs(px-x)>size*.45||py<y-size*.85||py>y+size*.1)continue;
    if(y>bestY||(y===bestY&&a.id>best.id)){best=a;bestY=y;}
  }
  return best;
}
// Everything the model recorded about one animal during this experiment, with original record identities.
export function animalRecord(state,id,firstEvent=0){
  const a=state.world.animals.find(x=>x.id===id);if(!a)return null;
  const max=state.world.params.species[a.species]?.energyMax||1;
  const events=[];state.world.events.forEach((e,i)=>{if(i>=firstEvent&&e.id===id&&['birth','death','arrive'].includes(e.type))events.push({id:i,event:e});});
  return {id:a.id,species:a.species,sex:a.sex==='f'?'female':'male',age:a.age,energy:Math.max(0,Math.round(a.energy/max*100)),alive:a.alive!==false,events};
}
