export const SCENE_KINDS=['greenspace','plant-closeup','animal','other-landscape','object','unclear'];
export const MANUAL_ROUTES=[
  {kind:'greenspace',label:'An outdoor place',hint:'Make a world from this landscape'},
  {kind:'plant-closeup',label:'A plant up close',hint:'Imagine a tiny world around it'},
  {kind:'animal',label:'An animal',hint:'A pet or creature'},
  {kind:'other',label:'Something else',hint:'Another landscape, object or unclear photo'},
];
export function validateSceneCheck(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['kind','certainty','features'].includes(k))||!SCENE_KINDS.includes(value.kind)||!['clear','uncertain'].includes(value.certainty))throw new Error('The photo check was unclear. Choose what is in your photo instead.');
  const f=value.features;if(!f||typeof f!=='object'||Object.keys(f).length!==3||!['grass','tree','water'].every(k=>Object.hasOwn(f,k)&&[true,false,null].includes(f[k])))throw new Error('The photo check had no usable clues.');
  return {kind:value.certainty==='uncertain'?'unclear':value.kind,certainty:value.certainty,features:{...f}};
}
// Uploaded landscapes must enter generation; only an explicit lesson uses the meadow.
export function photoRouteDestination(kind){
  if(['greenspace','plant-closeup','other-landscape'].includes(kind))return 'world-paint';
  return kind==='other'?'other-kind':'route-help';
}
export function canUseForest(kind,answers){return kind==='greenspace'&&(answers?.grass==='seen'||answers?.tree==='seen')}
export function routeMessage(kind){return ({
  'plant-closeup':{title:'A little closer than we need.',text:'You found a plant. Step back so we can see the place around it.'},
  animal:{title:'Someone familiar!',text:'This is an animal photo. Our place experiment needs a view of its surroundings.'},
  'other-landscape':{title:'A different kind of world.',text:'Use this photo to design its own landscape and possible neighbours. We’ll show you the AI’s guesses before painting it.'},
  object:{title:'An imagined world?',text:'We can use these shapes and colours for a playful habitat. You will review its creatures and guesses before it is painted.'},
  unclear:{title:'Let’s take another look.',text:'Try a brighter spot or a wider view. You can also tell us what you see.'},
  other:{title:'What kind of picture?',text:'A place can be interesting even when our forest model doesn’t fit.'},
  'no-clues':{title:'We need a wider view.',text:'We haven’t confirmed grass or trees. Try the surroundings, or explore the example garden.'},
})[kind]||{title:'Check this place.',text:'Tell us what you can see before choosing a model.'}}
