// What a creature is visibly doing, and how its one painting bends when no drawn pose exists.
// Artistic animation only: never a measured gait, and it never feeds back into the simulation.
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const mix=(a,b,t)=>a+(b-a)*t;
export const DEFAULT_HEAD={x:.8,y:.3};
export const POSE_NAMES=['eat','sleep','runA','runB'];
export const DEFAULT_LEGS=[.26,.4,.62,.76];
// Finds legs from how much of each column is filled along the bottom of the drawing.
export function legStations(coverage){
 const top=Math.max(0,...coverage);if(!top)return DEFAULT_LEGS;const n=coverage.length,found=[];let start=-1;
 for(let i=0;i<=n;i++){const on=i<n&&coverage[i]>top*.35;if(on&&start<0)start=i;if(!on&&start>=0){found.push(((start+i)/2)/n);start=-1}}
 const legs=found.filter(x=>x>.08&&x<.97);return legs.length>=2?legs.slice(-4):DEFAULT_LEGS;
}
// The stickers over an animal, in world units around its head. Each one pops, drifts up and fades.
export function stickerFrames(kind,time,phase=0){
 if(kind==='eat'){const t=(((time+phase)/1.6)%1+1)%1;return [0,1,2].flatMap(i=>{const local=(t-i*.2)/.56;if(local<0||local>1)return [];const pop=local<.16?.4+(local/.16)*.8:local<.26?1.2-(local-.16)/.1*.2:1;return [{i,x:[-30,18,-16][i]+Math.sin(local*3+i)*2,y:-[0,24,50][i]-local*9,scale:pop*[.8,1,.9][i],alpha:local>.74?(1-local)/.26:1,rotation:[-.14,.05,.12][i]}]})}
 if(kind==='sleep')return [0,1,2].map(i=>{const t=(((time*.32+phase)%1+1)%1+i/3)%1;return {i,x:12+t*24+Math.sin(t*7+i)*6,y:-t*70,scale:.42+t*.78,alpha:t<.12?t/.12:t>.68?(1-t)/.32:1,rotation:Math.sin(t*5+i)*.14}});
 if(kind==='chase')return [{i:0,x:0,y:-4-Math.abs(Math.sin(time*7+phase))*7,scale:1,alpha:1,rotation:Math.sin(time*9+phase)*.08}];
 return [];
}

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
 // One stretched drawing moved by its legs, never two drawings swapped back and forth.
 if((behaviour==='run'||behaviour==='fly')&&(poses.runA||poses.runB)){const t=poses.runA||poses.runB;return {texture:t,warp:behaviour,scale:size(t,1.1),bob:0,tilt:0,breath:0}}
 return null;
}

function rotate(x,y,cx,cy,angle){const c=Math.cos(angle),s=Math.sin(angle),dx=x-cx,dy=y-cy;return {x:cx+dx*c-dy*s,y:cy+dx*s+dy*c}}
function headWeight(x,y,head){return Math.exp(-(((x-head.x)/.26)**2)-(((y-head.y)/.3)**2))}

// Input and output are 0..1 painting coordinates, facing right, feet at y=1. The field is continuous,
// so a dense mesh never tears. No per-frame randomness, and time 0 is close to the painted pose.
export function deformPoint(x,y,behaviour,time,phase=0,{head=DEFAULT_HEAD,legs:stations=DEFAULT_LEGS}={}){
 if(behaviour==='still')return {x,y};
 const legs=smooth(.58,.98,y),body=1-legs,nearHead=headWeight(x,y,head);
 if(behaviour==='walk'||behaviour==='run'){
  // Each leg swings from its own hip. Walking crosses the pairs, running reaches and gathers them.
  const fast=behaviour==='run',cycle=time*(fast?11:6.5)+phase,band=smooth(.5,.95,y),reach=fast?.13:.07,raise=fast?.055:.032;let dx=0,dy=0,total=0;
  stations.forEach((cx,i)=>{const front=cx>=.5,offset=fast?(front?2.1:0)+(i%2)*.5:(i%2?Math.PI:0)+(front?Math.PI/2:0),weight=Math.exp(-(((x-cx)/.09)**2))*band,swing=cycle+offset;dx+=weight*Math.sin(swing)*reach*(y-.5)*2;dy-=weight*Math.max(0,Math.cos(swing))*raise;total+=weight});
  const norm=Math.max(1,total);let nx=x+dx/norm,ny=y+dy/norm;
  const bodyPart=1-band,tail=(1-smooth(.1,.34,x))*(1-band*.7);
  ny+=Math.sin(cycle*2)*(fast?.018:.009)*bodyPart+Math.sin(cycle*2+.7)*(fast?.014:.016)*nearHead+Math.sin(cycle+x*4)*(fast?.035:.024)*tail;
  if(fast){const stretch=Math.sin(cycle)*.035*bodyPart;nx+=(x-.5)*stretch;const p=rotate(nx,ny,.5,.62,Math.sin(cycle)*.055*(1-band*.6));nx=p.x;ny=p.y}
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
  const wing=(1-smooth(.1,.58,y))*Math.sin(time*9+phase)*.1,beat=Math.sin(time*9+phase+.8)*.014;
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
