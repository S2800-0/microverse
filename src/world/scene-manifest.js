// Typed scene pieces, independent of renderer and of the ecological rules.
export const SCENERY_ASSETS={trunk:'/assets/woodland-props-0-v11.png',canopy:'/assets/woodland-props-1-v11.png',grass:'/assets/woodland-props-2-v11.png',bush:'/assets/woodland-props-3-v11.png'};
export function sceneLayers(world){const plan=world.plan;return {version:1,ground:{source:world.background,mode:world.terrainMode||'painted'},water:plan.water,scenery:plan.objects.map(o=>({...o,layer:o.kind==='tree'?'canopy':'ground'})),food:{typeId:plan.inhabitants.find(t=>t.role==='producer').id,source:'simulation patches'},life:plan.inhabitants.filter(t=>t.role!=='producer'),air:{underwater:!!world.underwater||plan.habitat==='marine'}}}
export function depthAt(y,height=0){return y*1000+height*.001}
export function plantMeshPoint(x,y,time,phase=0){return {x:x+Math.sin(time*1.4+phase+y*2)*(1-y)**2*.035,y}}
export function canopyMeshPoint(x,y,time,phase=0){const pin=Math.sin(Math.PI*x)*Math.sin(Math.PI*y);return {x:x+Math.sin(time*.9+phase+y*3)*.018*pin,y:y+Math.sin(time*1.1+phase+x*4)*.012*pin}}
export function waterMeshPoint(x,y,time){return {x:x+Math.sin(y*18+time*1.4)*.005,y:y+Math.cos(x*20+time*1.1)*.004}}
