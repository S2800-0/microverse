// Both Spark and the UI use these commands. No generated JavaScript or arbitrary parameter edits.
import {companionReference} from './personal-companions.js';
export const COMMAND_KINDS=['place-companion','weather','add-animal','remove-animal','plant-food','add-object','focus-animal','set-activity','focus-plants','show-meal','enter-water','leave-water','undo','pause','resume','generate-animal','clarify'];
const clean=s=>String(s||'').toLowerCase().replace(/[?!.,]/g,'').replace(/\s+/g,' ').trim();
const plural={mice:'mouse',geese:'goose',foxes:'fox',wolves:'wolf',deer:'deer',fish:'fish',sheep:'sheep',species:'species'};
// How a child actually asks: the polite wrapper carries no meaning, so it is removed before matching.
const POLITE=/^(?:(?:hey |hi |hello |ok |okay )?spark |please |can you |could you |would you |will you |can we |could we |let's |lets |i want you to |i'd like you to |i would like you to )+/;
const WANT=/^(?:i want|i'd like|i would like|we want|we need|i wish there was|give me|can i have|can we have|could i have|could we have|bring in|bring)\s+(?=(?:a|an|another|one|two|three|1|2|3|some|more|the)\s)/;
const tidy=q=>q.replace(POLITE,'').replace(/ (?:please|for me|now)$/,'').replace(WANT,'add ').trim();
// Activities mirror the buttons on a selected animal. A snack is animation only: it uses no food.
export const ANIMAL_ACTIVITIES=['auto','move','run','eat','rest','sleep'];
const ACTIVITY_WORDS={sleep:'sleep',nap:'sleep','go to sleep':'sleep','go to bed':'sleep',rest:'rest','sit down':'rest',sit:'rest',run:'run',race:'run','run around':'run','run fast':'run',walk:'move',move:'move',explore:'move',eat:'eat',snack:'eat','have a snack':'eat'};
function activityRequest(q){
 let m;
 if((m=q.match(/^(?:make|let|have|tell|get) (?:the |my |a )?(.+?) (?:to )?(go to sleep|go to bed|sleep|nap|rest|sit down|sit|run around|run fast|run|race|walk|move|explore|have a snack|snack|eat)$/)))return {animal:m[1],value:ACTIVITY_WORDS[m[2]]};
 if((m=q.match(/^put (?:the |my |a )?(.+?) to (?:bed|sleep)$/)))return {animal:m[1],value:'sleep'};
 if((m=q.match(/^feed (?:the |my |a )?(.+)$/)))return {animal:m[1],value:'eat'};
 if((m=q.match(/^wake (?:up )?(?:the |my |a )?(.+?)(?: up)?$/)))return {animal:m[1],value:'auto'};
 return null;
}
const label=s=>{const words=clean(s).replace(/^(?:a|an|the|another|one|two|three|1|2|3|some|more) /,'').split(' '),last=words.pop();words.push(plural[last]||(last.endsWith('ies')?last.slice(0,-3)+'y':last.endsWith('s')&&!last.endsWith('ss')&&!last.endsWith('us')?last.slice(0,-1):last));return words.join(' ')};
export function commandAnimal(name,plan){const n=label(name);return plan.inhabitants.find(a=>a.role!=='producer'&&(label(a.name)===n||label(a.name).endsWith(' '+n)||n.endsWith(' '+label(a.name))))||null}
export function validateWorldCommand(raw,{plan,canDive=false,underwater=false}={}){
 if(!raw||Object.keys(raw).some(k=>!['kind','target','value','count'].includes(k))||!COMMAND_KINDS.includes(raw.kind))throw Error('Spark proposed a change this world does not support.');
 const count=raw.count??1;if(!Number.isSafeInteger(count)||count<1||count>3)throw Error('We can change one to three neighbours or plants at a time.');
 const kind=raw.kind,target=raw.target??'',value=raw.value??'';
 if(typeof target!=='string'||target.length>55||typeof value!=='string'||value.length>120||/[<>\u0000-\u001f]/.test(target+value))throw Error('The proposed change needs a clearer name.');
 if(kind==='place-companion'&&target&&!/^[\w-]{1,55}$/.test(target))throw Error('Choose a saved companion.');
 if(kind==='weather'&&!['usual','dry','warm'].includes(value))throw Error('Try usual weather, less rain or a warm spell.');
 if(['add-animal','remove-animal','focus-animal'].includes(kind)&&!commandAnimal(target,plan))throw Error('That animal needs its own artwork and movement first.');
 if(kind==='set-activity'&&(!commandAnimal(target,plan)||!ANIMAL_ACTIVITIES.includes(value)))throw Error('Name a neighbour in this world, then ask them to sleep, rest, run, walk or snack.');
 if(kind==='add-object'&&!['tree','bush','rock'].includes(target))throw Error('Choose a tree, bush or rock.');
 if(kind==='generate-animal'&&companionReference('add '+target))throw Error('Use Add my companion to bring an existing friend. No new painting is needed.');
 if(kind==='generate-animal'&&(!/^[\p{L}][\p{L} '\-]{0,47}$/u.test(target)||!target.trim()))throw Error('Give the new animal a short common name.');
 if(kind==='enter-water'&&!canDive)throw Error('There is no enterable pond in this scene yet.');
 if(kind==='leave-water'&&!underwater)throw Error('We are already on the surface.');
 if(kind==='weather'&&plan.habitat==='marine'&&value==='dry')throw Error('Try warmer water in this underwater world. Rainfall is not a controller here.');
 if(kind==='add-object'&&(underwater||plan.habitat==='marine'||plan.water.w*plan.water.h>.98)&&['tree','bush'].includes(target))throw Error('Trees need land. Try adding a plant to this underwater world.');
 return {kind,target,value,count};
}
export function parseWorldCommand(question,context){
 const personal=companionReference(question,context.companions);if(personal)return personal;
 const q=tidy(clean(question));let c=null,m;
 if(/^(undo|undo that|take that back|go back one change)$/.test(q))c={kind:'undo'};
 else if(/^(pause|stop|pause the world|stop time)$/.test(q))c={kind:'pause'};
 else if(/^(play|resume|let it live|start time)$/.test(q))c={kind:'resume'};
 else if(/^(?:go back|back to (?:the )?(?:surface|garden|woodland)|leave (?:the )?(?:pond|water)|go to the surface)$/.test(q))c={kind:'leave-water'};
 else if(/^(?:enter|explore|go into|go to|go inside|dive into|show me inside|take me into|take me to) (?:the )?(?:water|pond|lake)$/.test(q)||/^(?:go|take me|dive) underwater$/.test(q))c={kind:'enter-water'};
 else if(/^(?:make it |bring |turn |start )?(?:rain|rainy|usual weather|normal weather|bring back the rain)$/.test(q)||/^(?:make it rain|make it rain more|more rain|bring back (?:the )?rain|make the rain normal)$/.test(q))c={kind:'weather',value:'usual'};
 else if(/^(?:make it |let it |what if it |try |make the weather )?(?:rain less|rains less|dry|drier|a drought|less rain)$/.test(q)||/^stop (?:the )?rain$/.test(q))c={kind:'weather',value:'dry'};
 else if(/^(?:make it |try |start |add )?(?:warm|warmer|hot|hotter|a warm spell|a heatwave)$/.test(q))c={kind:'weather',value:'warm'};
 else if(/^(?:show me|find|look at|where (?:is|are)) (?:the |some )?(?:plants|food|plant food)$/.test(q))c={kind:'focus-plants'};
 else if(/^(?:show me (?:a meal|an animal eating|who is eating|the animals eating)|watch (?:them|an animal) eat)$/.test(q))c={kind:'show-meal'};
 else if((m=q.match(/^(?:plant|grow|add) (?:some |more |a |one |two |three )?(?:plants|plant|food|food patch|food patches|grass|algae|flowers)$/)))c={kind:'plant-food',count:/\b(?:three|3)\b/.test(q)?3:/\b(?:two|2)\b/.test(q)?2:1};
 else if((m=q.match(/^(?:add|plant|grow) (?:a |an |another |one |two |three |1 |2 |3 |more )?(tree|trees|bush|bushes|rock|rocks)$/)))c={kind:'add-object',target:m[1].startsWith('bush')?'bush':m[1].replace(/s$/,''),count:/\b(?:three|3)\b/.test(q)?3:/\b(?:two|2)\b/.test(q)?2:1};
 else if((m=activityRequest(q))){const animal=commandAnimal(m.animal,context.plan);if(!animal)throw Error('There is no '+label(m.animal)+' in this world yet. Try: add a '+label(m.animal)+'.');c={kind:'set-activity',target:animal.name,value:m.value};}
 else if((m=q.match(/^(add|put|remove|take away|send away|get rid of|show me|find|look at|look for|follow|watch|where is|where are) (?:a |an |another |one |two |three |1 |2 |3 |more |the |some )?(.+)$/))){const add=m[1]==='add'||m[1]==='put',gone=['remove','take away','send away','get rid of'].includes(m[1]),animal=commandAnimal(m[2],context.plan);if(animal)c={kind:add?'add-animal':gone?'remove-animal':'focus-animal',target:animal.name,count:/\b(?:three|3)\b/.test(q)?3:/\b(?:two|2)\b/.test(q)?2:1};else if(m[1]==='add'&&!/ (?:by|near|next to|beside|in|on|under) /.test(m[2]))c={kind:'generate-animal',target:label(m[2])};}
 return c?validateWorldCommand(c,context):null;
}
// Questions the current frame already answers. These are counts from the record, so they need no AI.
export function worldFact(question,{plan,frame}){
 const q=tidy(clean(question));let m;
 if(/^how much food(?: is there| is left| do they have)?$/.test(q))return frame.resource>.65?'There is plenty of food right now.':frame.resource>.3?'There is some food left.':'Food is getting scarce right now.';
 if((m=q.match(/^(?:what|who) (?:eats|hunts|chases) (?:the |a |an )?(.+)$/))){
  const named=n=>plan.inhabitants.find(a=>label(a.name)===label(n)||label(a.name).endsWith(' '+label(n))),who=named(m[1]);if(!who)return null;
  const list=role=>plan.inhabitants.filter(a=>a.role===role).map(a=>a.name).join(' and ');
  if(who.role==='producer')return list('grazer')?list('grazer')+' eats '+who.name+' in this world.':'Nothing eats '+who.name+' in this world yet.';
  if(who.role==='grazer')return list('predator')?list('predator')+' hunt '+who.name+' in this world.':'Nothing hunts '+who.name+' in this world yet. You could add a hunter.';
  return 'Nothing hunts '+who.name+' in this world’s rules.';
 }
 if(!(m=q.match(/^how many (.+?)(?: are there| are here| are left| live here| do we have| in this world)?$/)))return null;
 const moving=frame.agents,all=/^(?:animals|neighbours|neighbors|creatures)$/.test(m[1]);
 if(all)return moving.length===1?'There is 1 neighbour in this world right now.':'There are '+moving.length+' neighbours in this world right now.';
 const animal=commandAnimal(m[1],plan);if(!animal)return null;
 const n=moving.filter(a=>a.type===animal.id).length;
 return n===0?'There are no '+m[1]+' here right now. You can ask me to add one.':n===1?'There is 1 '+animal.name+' here right now.':'There are '+n+' '+m[1]+' here right now.';
}
export const WORLD_COMMAND_SCHEMA={type:'object',additionalProperties:false,properties:{kind:{type:'string',enum:COMMAND_KINDS},target:{type:'string'},value:{type:'string'},count:{type:'integer'}},required:['kind','target','value','count']};
