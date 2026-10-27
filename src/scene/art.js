// Existing pre-event generated art; see the provenance manifest.
export const ART = {
  dog:{label:'Dog',image:'/animals/dog-standing.png',size:1.15,motion:'dog',cut:{knee:.73,hindMaxX:.55}},
  cat:{label:'Cat',image:'/animals/tabby-character-preview.png',size:.8,motion:'cat'},
  fox:{label:'Red fox',image:'/animals/fox-standing.png',size:1,motion:'dog',cut:{knee:.70,minX:.24}},
  wolf:{label:'Grey wolf',image:'/animals/wolf-standing.png',size:1.3,motion:'dog',cut:{knee:.70,minX:.12,splitX:[.175,.27]}},
  deer:{label:'Deer',image:'/animals/deer-standing.png',size:1.5,motion:'dog',cut:{knee:.73,hindMaxX:.5,splitX:[.185,.688]}},
  fawn:{label:'Fawn',image:'/animals/fawn-standing.png',size:1,motion:'dog',cut:{knee:.67,hindMaxX:.5}},
  rabbit:{label:'Rabbit',image:'/animals/rabbit-standing.png',size:.6,motion:'rabbit'},
  penguin:{label:'Penguin visitor',image:null,size:.85,motion:'penguin'},
};

// Does reuse the buck drawing with the antlers erased (placeholder until a real doe is drawn).
export const DOE_FROM_BUCK={from:'/animals/deer-standing.png',erase:[[[.68,0],[1,0],[1,.198],[.68,.198]]],cut:ART.deer.cut,size:1.4};
export const FAWN_WEEKS=52;
export function variantKey(animal){
  if(animal.species!=='deer')return animal.species;
  return animal.age<FAWN_WEEKS?'fawn':animal.sex==='f'?'doe':'deer';
}
// Stable +-8% size variation per animal so a herd doesn't look cloned.
export function sizeJitter(id){let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))>>>0;return .92+(h%17)/100;}
