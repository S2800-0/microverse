// Both Spark and the UI use these commands. No generated JavaScript or arbitrary parameter edits.
import {companionReference} from './personal-companions.js';
export const COMMAND_KINDS=['place-companion','weather','add-animal','remove-animal','plant-food','add-object','focus-animal','focus-plants','show-meal','enter-water','leave-water','undo','pause','resume','generate-animal','clarify'];
const clean=s=>String(s||'').toLowerCase().replace(/[?!.,]/g,'').replace(/\s+/g,' ').trim();
const plural={mice:'mouse',geese:'goose',foxes:'fox',wolves:'wolf',deer:'deer',fish:'fish',sheep:'sheep',species:'species'};
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
 const q=clean(question).replace(/^please /,'');let c=null,m;
 if(/^(undo|undo that|take that back|go back one change)$/.test(q))c={kind:'undo'};
 else if(/^(pause|stop|pause the world|stop time)$/.test(q))c={kind:'pause'};
 else if(/^(play|resume|let it live|start time)$/.test(q))c={kind:'resume'};
 else if(/^(?:go back|back to (?:the )?(?:surface|garden|woodland)|leave (?:the )?(?:pond|water)|go to the surface)$/.test(q))c={kind:'leave-water'};
 else if(/^(?:enter|explore|go into|go to|go inside|dive into|show me inside|take me into) (?:the )?(?:water|pond|lake)$/.test(q))c={kind:'enter-water'};
 else if(/^(?:make it |bring |turn |start )?(?:rain|rainy|usual weather|normal weather|bring back the rain)$/.test(q)||/^(?:make it rain|bring back (?:the )?rain|make the rain normal)$/.test(q))c={kind:'weather',value:'usual'};
 else if(/^(?:make it |let it |what if it |try |make the weather )?(?:rain less|rains less|dry|drier|a drought|less rain)$/.test(q))c={kind:'weather',value:'dry'};
 else if(/^(?:make it |try |start |add )?(?:warm|warmer|hot|hotter|a warm spell|a heatwave)$/.test(q))c={kind:'weather',value:'warm'};
 else if(/^(?:show me|find|look at|where (?:is|are)) (?:the |some )?(?:plants|food|plant food)$/.test(q))c={kind:'focus-plants'};
 else if(/^(?:show me (?:a meal|an animal eating|who is eating|the animals eating)|watch (?:them|an animal) eat)$/.test(q))c={kind:'show-meal'};
 else if((m=q.match(/^(?:plant|grow|add) (?:some |more |a |one |two |three )?(?:plants|plant|food|food patch|food patches|grass|algae|flowers)$/)))c={kind:'plant-food',count:/\b(?:three|3)\b/.test(q)?3:/\b(?:two|2)\b/.test(q)?2:1};
 else if((m=q.match(/^(?:add|plant|grow) (?:a |an |another |one |two |three |1 |2 |3 |more )?(tree|trees|bush|bushes|rock|rocks)$/)))c={kind:'add-object',target:m[1].startsWith('bush')?'bush':m[1].replace(/s$/,''),count:/\b(?:three|3)\b/.test(q)?3:/\b(?:two|2)\b/.test(q)?2:1};
 else if((m=q.match(/^(add|remove|show me|find|look at) (?:a |an |another |one |two |three |1 |2 |3 |more |the )?(.+)$/))){const animal=commandAnimal(m[2],context.plan);if(animal)c={kind:m[1]==='add'?'add-animal':m[1]==='remove'?'remove-animal':'focus-animal',target:animal.name,count:/\b(?:three|3)\b/.test(q)?3:/\b(?:two|2)\b/.test(q)?2:1};else if(m[1]==='add')c={kind:'generate-animal',target:label(m[2])};}
 return c?validateWorldCommand(c,context):null;
}
export const WORLD_COMMAND_SCHEMA={type:'object',additionalProperties:false,properties:{kind:{type:'string',enum:COMMAND_KINDS},target:{type:'string'},value:{type:'string'},count:{type:'integer'}},required:['kind','target','value','count']};
