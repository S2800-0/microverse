// Existing pre-event generated art; see the provenance manifest.
export const ART = {
  dog:{label:'Dog',image:'/animals/dog-standing.png',size:1.15,motion:'dog',cut:{knee:.73,hindMaxX:.55}},
  cat:{label:'Cat',image:'/animals/tabby-character-preview.png',size:.8,motion:'cat'},
  fox:{label:'Red fox',image:'/animals/fox-standing.png',size:1,motion:'dog',cut:{knee:.70,minX:.24}},
  wolf:{label:'Grey wolf',image:'/animals/wolf-standing.png',size:1.3,motion:'dog',cut:{knee:.70,minX:.12,splitX:[.175,.27]}},
  deer:{label:'Deer',image:'/animals/deer-standing.png',size:1.5,motion:'dog',cut:{knee:.73,hindMaxX:.5,splitX:[.185,.688]}},
  rabbit:{label:'Rabbit',image:'/animals/rabbit-standing.png',size:.6,motion:'rabbit'},
  penguin:{label:'Penguin visitor',image:null,size:.85,motion:'penguin'},
};

// Display-only variety: young animals draw smaller, adult females slightly smaller, plus a small stable per-animal jitter.
export function bodyScale(animal,params){
  const mature=params?.species?.[animal.species]?.matureAge??0;
  const age=animal.age<mature?.45+.55*animal.age/Math.max(1,mature):1;
  return age*(animal.sex==='f'?.92:1)*(.94+((animal.id*37)%13)/100);
}
