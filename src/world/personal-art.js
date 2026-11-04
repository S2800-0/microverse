import {fitQuadruped} from '../core/motion/rig-fitting.js';
import {drawPuppet} from '../core/motion/puppet-motion.js';
import {getMotion} from '../core/motion/motion-library.js';
import {GAITS} from '../core/motion/rig.js';
import {movementProfile} from '../core/creature/identity.js';
import {cutPoseGrid} from './sprites.js';
import {posesFromCells} from './creature-motion.js';
// Render the already reviewed puppet locally. No model, upload, or new artwork.
export async function preparePersonalArt(item){
 const profile=movementProfile(item.identity,item.species),base={kind:'personal',image:item.image,displayName:item.name,profile};
 if(item.poseAtlas){try{base.named=posesFromCells(await cutPoseGrid(item.poseAtlas,2,2),0,4);if(item.identity?.family==='fish'){delete base.named.runA;delete base.named.runB}}catch{}}
 if(!item.rigConfig||!profile||profile==='rabbit')return base;
 const candidate=await fitQuadruped({source:item.image,config:item.rigConfig});if(!candidate?.valid)return base;
 const gait=item.rigConfig.gait==='trot'?'trot':'walk',poses=[];
 for(let i=0;i<9;i++){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.translate(128,238);drawPuppet(ctx,candidate.rig,{size:235,phase:i?((i-1)/8):0,moving:i>0,preset:getMotion(profile,gait),phases:GAITS[gait].phase,clock:0});poses.push(canvas.toDataURL('image/png'))}
 return {...base,poses};
}
