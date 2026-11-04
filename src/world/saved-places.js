import garden from './saved-garden-v11.json' with {type:'json'};
import woodland from './saved-woodland-v11.json' with {type:'json'};
import reef from './saved-reef-v12.json' with {type:'json'};
import fish from './fish-motion-reviewed.json' with {type:'json'};
const region=(x,y,rx,ry)=>({visible:true,x,y,rx,ry});const goldfish={tail:region(.15,.48,.13,.25),fin:region(.62,.72,.13,.12),mouth:region(.96,.48,.035,.04),eye:region(.83,.4,.035,.04)},parrotfish={tail:region(.12,.53,.1,.22),fin:region(.61,.68,.1,.12),mouth:region(.96,.43,.035,.04),eye:region(.83,.32,.035,.04)};
const gardenSurface={...woodland,title:'The Living Garden',habitat:'land',landscape:garden.landscape,visible:garden.visible,water:garden.water,objects:[...woodland.objects.filter(o=>o.x>.4),{id:3,kind:'bush',name:'Garden fern',x:.42,y:.46,radius:.04},{id:4,kind:'bush',name:'Shady fern',x:.65,y:.72,radius:.035},{id:5,kind:'tree',name:'Garden perch',x:.47,y:.68,radius:.045}].map((o,id)=>({...o,id})),assumptions:['A garden scene inspired by the library photo.','Land neighbours are curated teaching examples; the pond opens a separate freshwater model.']};
export const SAVED_WORLDS={
 garden:{plan:gardenSurface,pondTemplate:{plan:garden,atlas:'/assets/garden-neighbours-v12.png',poseAtlas:'/assets/pond-poses-v19.png'},poseAtlas:'/assets/woodland-poses-v19.png',background:'/assets/garden-ground-v11.webp',atlas:'/assets/woodland-neighbours-v12.png',props:true,flightType:2,pondMotionHints:{2:goldfish}},
 woodland:{plan:woodland,background:'/assets/woodland-ground-v11.webp',atlas:'/assets/woodland-neighbours-v12.png',poseAtlas:'/assets/woodland-poses-v19.png',props:true,flightType:2},
 reef:{plan:reef,background:'/assets/reef-live-ground-v8.webp',atlas:'/assets/reef-neighbours-v12.png',poseAtlas:'/assets/reef-poses-v19.png',motionHints:{1:fish.rig,3:parrotfish}},
};
