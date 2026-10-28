import {pngDimensions} from '../creature/contract.js';
import {validateRig} from './snapshot.ts';
export const LIBRARY_KEY='microverse-creatures-v1';
const MAX_CHARS=2_000_000;
export function validateLibraryCreature(value){
  if(!value||!['dog','cat'].includes(value.species)||typeof value.name!=='string'||value.name.trim().length<1||value.name.length>24)throw new Error('Give your dog or cat a name of up to 24 characters.');
  pngDimensions(value.image,640);
  if(value.rigConfig!==undefined)validateRig(value.rigConfig);
  if(value.source!==undefined){const s=value.source;if(!s||s.provider!=='Meta'||s.imageModel!=='muse-image-1.0'||s.maskModel!=='sam-3.1'||s.promptVersion!=='watercolor-side-profile-1')throw new Error('Unrecognised artwork source.');}
  return {name:value.name.trim(),species:value.species,image:value.image,...(value.rigConfig?{rigConfig:structuredClone(value.rigConfig)}:{}),...(value.source?{source:{provider:value.source.provider,imageModel:value.source.imageModel,maskModel:value.source.maskModel,promptVersion:value.source.promptVersion}}:{})};
}
export function createCreatureLibrary(storage,{id=()=>crypto.randomUUID()}={}){
  let items=[],error='';
  try{const raw=storage.getItem(LIBRARY_KEY);if(raw){if(raw.length>MAX_CHARS)throw new Error();const parsed=JSON.parse(raw);if(parsed.version!==1||!Array.isArray(parsed.items)||parsed.items.length>12)throw new Error();const ids=new Set();items=parsed.items.map(v=>{if(typeof v.id!=='string'||v.id.length>80||ids.has(v.id))throw new Error();ids.add(v.id);return {...validateLibraryCreature(v),id:v.id};});}}
  catch{error='Saved creatures could not be read. Export or recover browser data before clearing this collection.';}
  function write(next){if(error)throw new Error(error);const raw=JSON.stringify({version:1,items:next});if(raw.length>MAX_CHARS)throw new Error('This browser collection is full. Save a processed PNG before removing a creature.');try{storage.setItem(LIBRARY_KEY,raw);}catch{throw new Error('This browser could not save the creature. Download its processed PNG and try again when storage is available.');}items=next;return structuredClone(items);}
  return {list:()=>structuredClone(items),status:()=>error,
    add(value){if(items.length>=12)throw new Error('This collection holds up to 12 creatures. Save an image before making room.');const entry={...validateLibraryCreature(value),id:id()};write([...items,entry]);return structuredClone(entry);},
    remove(key){write(items.filter(v=>v.id!==key));},
  };
}
