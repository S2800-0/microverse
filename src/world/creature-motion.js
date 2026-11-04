// What a creature is visibly doing, and how its one painting bends when no drawn pose exists.
// Artistic animation only: never a measured gait, and it never feeds back into the simulation.
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const mix=(a,b,t)=>a+(b-a)*t;
export const DEFAULT_HEAD={x:.8,y:.3};
export const POSE_NAMES=['eat','sleep','runA','runB'];

// The one place that decides the behaviour shown. Eating and sleeping win over movement.
export function chooseBehaviour({motion='walk',moving=false,fast=false,activity='',activityMode='auto',perched=false}={}){
 if(motion==='rooted')return 'still';
 if(activity==='sleeping'||activityMode==='sleep')return 'sleep';
 if(activity==='resting'||activityMode==='rest')return 'rest';
 if(activity==='eating'||activityMode==='eat')return 'eat';
 if(perched||!moving)return 'idle';
 const quick=fast||activityMode==='run';
 if(motion==='swim')return quick?'run':'swim';
 if(motion==='fly'||motion==='hop')return motion;
 return quick?'run':'walk';
}

// A swimmer cannot lie down, and a darting fish still waves. The painting's bend, when no drawing exists.
export function warpFor(behaviour,motion){if(motion==='swim')return behaviour==='sleep'||behaviour==='rest'||behaviour==='eat'?'idle':'swim';return behaviour}

// Which drawn pose fits, when this creature has a pose sheet. Null means bend the painting instead.
export function poseFor(behaviour,time,phase,poses){
 if(!poses)return null;
 // Keep each drawing's size relative to the others on its sheet. A curled fox is shorter than a running one.
 const ref=poses.runA||poses.runB,size=(t,fallback)=>ref?.width&&t?.width?t.width/ref.width*1.2:fallback;
 if(behaviour==='eat'&&poses.eat)return {texture:poses.eat,scale:size(poses.eat,1),bob:0,tilt:Math.sin(time*8+phase)*.018,breath:Math.sin(time*9+phase)*.018};
 if(behaviour==='sleep'&&poses.sleep)return {texture:poses.sleep,scale:size(poses.sleep,1),bob:0,tilt:0,breath:Math.sin(time*1.5+phase)*.022};
 if((behaviour==='run'||behaviour==='fly')&&(poses.runA||poses.runB)){const frame=Math.floor(time*9+phase)%2;const t=(frame?poses.runB:poses.runA)||poses.runA||poses.runB;return {texture:t,scale:size(t,1.1),bob:Math.abs(Math.sin(time*9+phase))*4,tilt:0,breath:0}}
 return null;
}

function rotate(x,y,cx,cy,angle){const c=Math.cos(angle),s=Math.sin(angle),dx=x-cx,dy=y-cy;return {x:cx+dx*c-dy*s,y:cy+dx*s+dy*c}}
function headWeight(x,y,head){return Math.exp(-(((x-head.x)/.26)**2)-(((y-head.y)/.3)**2))}

// Input and output are 0..1 painting coordinates, facing right, feet at y=1. The field is continuous,
// so a dense mesh never tears. No per-frame randomness, and time 0 is close to the painted pose.
export function deformPoint(x,y,behaviour,time,phase=0,{head=DEFAULT_HEAD}={}){
 if(behaviour==='still')return {x,y};
 const legs=smooth(.58,.98,y),body=1-legs,nearHead=headWeight(x,y,head);
 if(behaviour==='walk'||behaviour==='run'){
  const fast=behaviour==='run',cycle=time*(fast?12:6.5)+phase,step=mix(Math.sin(cycle),Math.sin(cycle+Math.PI),smooth(.35,.65,x)),reach=fast?.075:.04;
  let nx=x+step*reach*legs,ny=y-Math.max(0,step)*(fast?.05:.028)*legs+Math.sin(cycle*2)*(fast?.016:.008)*body+Math.sin(cycle*2+.7)*(fast?.012:.014)*nearHead;
  if(fast){const p=rotate(nx,ny,.5,.62,Math.sin(cycle)*.05*(1-legs*.6));nx=p.x+.012;ny=p.y}
  return {x:nx,y:ny};
 }
 if(behaviour==='eat'){
  const front=smooth(.46,.76,x)*(1-smooth(.68,.96,y)),angle=(.72+Math.sin(time*7+phase)*.05)*front,p=rotate(x,y,mix(.5,head.x-.12,.7),.52,angle);
  return {x:mix(x,p.x,front),y:mix(y,p.y,front)+front*.08};
 }
 if(behaviour==='sleep'){
  const breath=Math.sin(time*1.4+phase)*.014*(1-y);
  return {x:.5+(x-.5)*1.07,y:1-(1-y)*.6+nearHead*.14+breath};
 }
 if(behaviour==='rest'){
  const sit=mix(.68,.94,smooth(.2,.8,x)),breath=Math.sin(time*1.6+phase)*.012*(1-y),look=Math.sin(time*.5+phase)*.05*nearHead;
  return {x:x+look*.2,y:1-(1-y)*sit+breath-look*.1};
 }
 if(behaviour==='swim'){
  const wave=Math.sin(time*5.5+phase-x*5.5)*.06*(1-x)**1.3;
  return {x:x+Math.sin(time*5.5+phase)*.008,y:y+wave};
 }
 if(behaviour==='fly'){
  const wing=(1-smooth(.1,.58,y))*Math.sin(time*13+phase)*.07,beat=Math.sin(time*13+phase+.8)*.012;
  return {x,y:y+wing+beat};
 }
 if(behaviour==='hop'){
  const cycle=time*6+phase,tuck=Math.max(0,Math.sin(cycle))*.05*legs;
  return {x:x+Math.max(0,Math.sin(cycle))*.02*legs,y:y-tuck};
 }
 // idle: a breathing body and an occasional turn of the head.
 const breath=Math.sin(time*1.9+phase)*.009*(1-y),glance=Math.sin(time*.55+phase)*smooth(.55,1,Math.sin(time*.27+phase*2))*.035*nearHead;
 return {x:x+glance,y:y+breath-Math.abs(glance)*.2};
}

// One drawn sheet, cut by the renderer: columns are POSE_NAMES, rows the animals that move.
export function poseRow(inhabitants,typeId){return inhabitants.filter(a=>a.role!=='producer').findIndex(a=>a.id===typeId)}
export function posesFromCells(cells,row,cols=POSE_NAMES.length){
 const out={};if(row<0)return out;
 POSE_NAMES.forEach((name,col)=>{const cell=cells[row*cols+col];if(cell)out[name]=cell});
 return out;
}
