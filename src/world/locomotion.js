// Local animation tuning, never measured animal speeds or a universal rig.
export const ACTIVITIES=['auto','rest','sleep','move','run','eat'];
export function movementLabel(motion,fast=false){return motion==='hop'?(fast?'Hop faster':'Hop'):motion==='swim'?(fast?'Swim faster':'Swim'):motion==='fly'?(fast?'Fly faster':'Fly'):(fast?'Run':'Walk')}
export function locomotionFrame(motion,time,phase=0,{moving=true,fast=false,activity='auto'}={}){
 const still=!moving||['rest','sleep','eat'].includes(activity),cycle=(time*(fast?9:6)+phase)%(Math.PI*2),lift=still?0:motion==='hop'?Math.max(0,Math.sin(cycle))*14:motion==='walk'?Math.abs(Math.sin(cycle))*.9:0;
 return {lift,squash:still?1:motion==='hop'?1-Math.max(0,-Math.sin(cycle))*.07:1,asleep:activity==='sleep',still};
}
