import {META_RIG_CONFIGS} from './meta-art-approved.js';
// Meta reference edits with local exports and reviewed cut settings. Original
// source art stays in /animals for comparison; see public/meta-art manifests.
export const SCENE_MAP='/meta-art/game-map-live.png';
export const ART={
 dog:{label:'Dog',image:'/meta-art/game-dog.png',size:1.15,motion:'dog',cut:META_RIG_CONFIGS.dog},
 cat:{label:'Cat',image:'/meta-art/game-cat-standing.png',size:.8,motion:'cat'},
 fox:{label:'Red fox',image:'/meta-art/game-fox.png',size:1,motion:'dog',cut:META_RIG_CONFIGS.fox},
 wolf:{label:'Grey wolf',image:'/meta-art/game-wolf.png',size:1.3,motion:'dog',cut:META_RIG_CONFIGS.wolf},
 deer:{label:'Buck',image:'/meta-art/game-deer.png',size:1.5,motion:'dog',cut:META_RIG_CONFIGS.deer},
 doe:{label:'Doe',image:'/meta-art/game-doe.png',size:1.4,motion:'dog',cut:META_RIG_CONFIGS.doe},
 fawn:{label:'Fawn',image:'/meta-art/game-fawn.png',size:1,motion:'dog',cut:META_RIG_CONFIGS.fawn},
 rabbit:{label:'Rabbit',image:'/meta-art/game-rabbit.png',size:.6,motion:'rabbit'},
 penguin:{label:'Penguin visitor',image:null,size:.85,motion:'penguin'},
};
export const FAWN_WEEKS=52;
export function variantKey(animal){if(animal.species!=='deer')return animal.species;return animal.age<FAWN_WEEKS?'fawn':animal.sex==='f'?'doe':'deer';}
export const artForAnimal=animal=>ART[variantKey(animal)]||ART[animal.species];
export function sizeJitter(id){let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))>>>0;return .92+(h%17)/100;}
