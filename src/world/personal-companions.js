import {validateLibraryCreature} from '../core/scene/creature-library.js';
import {animalLabel} from '../core/creature/identity.js';
// Personal names and artwork never enter a replay or a provider request.
export function companionLocomotion(item){
 const name=animalLabel(item.species),family=item.identity?.family||(/\b(?:fish|goldfish|guppy|shark)\b/.test(name)?'fish':/\b(?:bird|parrot|owl|duck)\b/.test(name)?'bird':/\b(?:monkey|ape)\b/.test(name)?'primate':'other');
 return {family:family==='unknown'?'other':family,zone:family==='fish'?'water':family==='bird'?'air':'land',motion:family==='fish'?'swim':family==='bird'?'fly':/\b(?:rabbit|bunny|hare)\b/.test(name)?'hop':'walk'};
}
export function companionFits(item,plan){const {zone}=companionLocomotion(item);return zone==='water'?!!(plan.water.w&&plan.water.h):zone==='land'?plan.water.w*plan.water.h<.98:true}
export async function personalVisitor(item,plan){
 const checked=validateLibraryCreature(item);if(typeof item.id!=='string'||!item.id||item.id.length>80)throw Error('Choose a companion from your collection.');
 if(!companionFits(checked,plan))throw Error(companionLocomotion(checked).zone==='water'?'This friend needs water. Enter the pond or choose the reef first.':'This friend needs dry ground. Choose the garden or woodland.');
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('personal:'+item.id));
 return {id:Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join(''),name:checked.species,...companionLocomotion(checked)};
}
export function companionReference(question,items=[]){
 const q=question.toLowerCase().replace(/[?!.,]/g,'').replace(/\s+/g,' ').trim();
 if(!/\b(?:add|bring|put|place|join|come)\b/.test(q))return null;
 const named=items.filter(i=>i.name.toLowerCase()!=='little friend'&&(' '+q+' ').includes(' '+i.name.toLowerCase()+' '));
 const reference=/\b(?:my|our|saved|created) (?:new |own )?(?:companion|pet|creature|friend|guide)\b/.test(q)||/\b(?:companion|pet|creature|cat|dog|animal)\b.*\b(?:just made|just created|already made|already created|saved)\b/.test(q)||/\b(?:add|bring|put|place) (?:them|him|her|it)\b/.test(q);
 if(!reference&&!named.length)return null;
 return {kind:'place-companion',target:named.length===1?named[0].id:'',value:'',count:1};
}

export const TRAVELLING_COMPANION_KEY='microverse-travelling-companion-v1';
export function readTravellingCompanion(storage){try{const raw=storage.getItem(TRAVELLING_COMPANION_KEY);if(!raw||raw.length>2_000_000)return null;const value=JSON.parse(raw);if(value.version!==1||typeof value.item?.id!=='string'||value.item.id.length>80)return null;return {...validateLibraryCreature(value.item),id:value.item.id}}catch{return null}}
export function rememberTravellingCompanion(storage,item){const checked={...validateLibraryCreature(item),id:item.id};if(typeof checked.id!=='string'||!checked.id||checked.id.length>80)throw Error('Choose a reviewed companion first.');const raw=JSON.stringify({version:1,item:checked});if(raw.length>2_000_000)throw Error('This companion is too large for a temporary copy.');storage.setItem(TRAVELLING_COMPANION_KEY,raw);return checked}
