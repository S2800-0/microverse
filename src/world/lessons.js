// One small lesson for each world: a question, a guess, one change, then this world compared with itself.
// Cards are written in our own words from sources whose terms allow it. OpenStax is deliberately not used:
// its textbooks forbid being fed to generative AI without written permission.
import {restoreLivingWorld} from './simulation.js';

const DROUGHT={label:'NOAA and NIDIS, Drought.gov: Ecological Drought',url:'https://www.drought.gov/what-is-drought/ecological-drought'};
const CORAL={label:'NOAA National Ocean Service: What is coral bleaching?',url:'https://oceanservice.noaa.gov/facts/coral_bleach.html'};
const OXYGEN={label:'U.S. Geological Survey: Temperature and Water',url:'https://www.usgs.gov/special-topics/water-science-school/science/temperature-and-water'};
const CAPACITY={label:'Wikipedia: Carrying capacity (CC BY-SA 4.0)',url:'https://en.wikipedia.org/wiki/Carrying_capacity'};
const FOOD_GUESSES=[['less','There will be less food'],['same','Nothing much will change'],['more','There will be more food']];

export const WATCH_DAYS=40;
export const LESSONS={
 'rain-and-plants':{id:'rain-and-plants',title:'When the rain thins out',hook:'Everyone here eats because plants grow, and plants grow because of water.',question:'If it rains less for 40 days, what happens to the food?',guesses:FOOD_GUESSES,action:{kind:'weather',value:'dry'},doing:'Less rain has started. Watch the plants first, then the neighbours.',real:'In real places, drought can slow plant growth and leave animals with poorer habitat.',rule:'This small world only models the first step: less water, slower growth.',source:DROUGHT},
 'warm-reef':{id:'warm-reef',title:'When the sea warms',hook:'A reef feeds a crowd, but only within a narrow range of warmth.',question:'If the water stays warm for 40 days, what happens to the food?',guesses:FOOD_GUESSES,action:{kind:'weather',value:'warm'},doing:'The water is warming. Watch the food patches.',real:'On real reefs, water that stays too warm makes corals push out the algae living in them. They turn white and are stressed, though not dead yet.',rule:'This small world does not model coral. It only slows food growth while the water is warm.',source:CORAL},
 'warm-pond':{id:'warm-pond',title:'When the pond warms',hook:'Fish and snails breathe the oxygen held in the water.',question:'If the pond stays warm for 40 days, what happens to the food?',guesses:FOOD_GUESSES,action:{kind:'weather',value:'warm'},doing:'The pond is warming. Watch the food patches.',real:'Real warm water holds less dissolved oxygen, and each kind of animal has a temperature range it prefers.',rule:'This small world does not model oxygen. It only slows food growth while the water is warm.',source:OXYGEN},
 'sharing-food':{id:'sharing-food',title:'How many can this place feed?',hook:'A place has only so much food, water and shelter to share.',question:'If three more plant-eaters move in, what happens to the food?',guesses:FOOD_GUESSES,action:{kind:'arrive',count:3},doing:'Three more neighbours have arrived. Watch how fast the patches shrink.',real:'Ecologists call the most animals a place can keep supporting its carrying capacity. Above it, numbers tend to fall.',rule:'This small world uses teaching rules, so its numbers are not a measurement of any real place.',source:CAPACITY}
};

function fits(lesson,plan){
 const water=plan.water.w*plan.water.h>.98;
 if(lesson==='rain-and-plants')return plan.habitat!=='marine'&&!water;
 if(lesson==='warm-reef')return plan.habitat==='marine';
 if(lesson==='warm-pond')return plan.habitat==='freshwater';
 if(lesson==='sharing-food')return plan.inhabitants.some(t=>t.role==='grazer');
 return false;
}
// A choice made when the world was planned wins only if the world can really run it.
export function lessonFor(plan,place=''){
 if(plan.lesson&&LESSONS[plan.lesson]&&fits(plan.lesson,plan))return LESSONS[plan.lesson];
 if(place==='woodland'&&fits('sharing-food',plan))return LESSONS['sharing-food'];
 if(plan.habitat==='marine')return LESSONS['warm-reef'];
 if(plan.habitat==='freshwater')return LESSONS['warm-pond'];
 if(plan.habitat==='arid'||!plan.inhabitants.some(t=>t.role==='grazer'))return LESSONS['rain-and-plants'];
 if(plan.habitat==='snow')return LESSONS['sharing-food'];
 return LESSONS['rain-and-plants'];
}
export function lessonCommand(lesson,plan){
 if(lesson.action.kind!=='arrive')return lesson.action;
 return {kind:'add-animal',target:plan.inhabitants.find(t=>t.role==='grazer').name,count:lesson.action.count};
}
const grazers=(plan,frame)=>{const ids=plan.inhabitants.filter(t=>t.role==='grazer').map(t=>t.id);return frame.agents.filter(a=>ids.includes(a.type)).length};
// Replays this exact world from the same seed with only the lesson's change taken out.
export function compareWithoutChange(sim,actionIndex){
 const changedFrame=sim.snapshot(),record=sim.toReplay();record.actions.splice(actionIndex,1);
 const unchangedFrame=restoreLivingWorld(record).snapshot();
 return {changed:{food:changedFrame.resource,neighbours:grazers(sim.plan,changedFrame)},unchanged:{food:unchangedFrame.resource,neighbours:grazers(sim.plan,unchangedFrame)}};
}
const NOTICEABLE=.03;
export function outcomeOf(result){const d=result.changed.food-result.unchanged.food;return d<=-NOTICEABLE?'less':d>=NOTICEABLE?'more':'same'}
export function resultLine(result){
 const outcome=outcomeOf(result),a=Math.round(result.changed.food*100),b=Math.round(result.unchanged.food*100);
 if(outcome==='less')return `Food fell to ${a}%. The same world without your change has ${b}%.`;
 if(outcome==='more')return `Food is at ${a}%, higher than ${b}% without your change. Living worlds can surprise us, and one run is not proof.`;
 return `Food is at ${a}%, and ${b}% without your change. Hardly any difference this time, and one run is not proof.`;
}
export function guessLine(guess,result){return guess===outcomeOf(result)?'That matches your guess.':'That is not what you guessed. Good: now you know something new.'}
