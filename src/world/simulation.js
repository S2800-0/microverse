import {ACTIVITIES} from './locomotion.js';
import {validateVisitor} from './visitors.js';
import {compileBlueprint} from './blueprint.js';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
function random(seed){let a=seed|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function inZone(plan,zone,x,y){const w=plan.water,wet=w.w>0&&w.h>0&&x>=w.x&&x<=w.x+w.w&&y>=w.y&&y<=w.y+w.h;return zone==='air'||(zone==='water'?wet:!wet)}
// behaviours (replay v4+) adds naps and quicker chases. Older records replay without them, so their outcomes stay identical.
export function createLivingWorld(raw,seed=17,{behaviours=true}={}){
 const initialPlan=compileBlueprint(raw),plan=structuredClone(initialPlan);if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error('Choose a bounded world seed.');
 const actions=[],rnd=random(seed);let tick=0,nextId=1,nextEvent=1,resource=.7,water=.8,heat=0,condition='usual',agents=[],patches=[],events=[],visitors=[];
 function onGround(x,y){return !plan.objects.some(o=>Math.hypot(x-o.x,y-o.y)<o.radius*.3)}
 function place(zone){for(let n=0;n<400;n++){const x=.05+rnd()*.9,y=.07+rnd()*.84;if(inZone(plan,zone,x,y)&&(zone==='air'||onGround(x,y)))return{x,y}}const z=plan.water;if(zone==='water'&&z.w&&z.h)return{x:z.x+z.w*.5,y:z.y+z.h*.5};for(let iy=1;iy<99;iy++)for(let ix=1;ix<99;ix++){const x=ix/100,y=iy/100;if(inZone(plan,zone,x,y)&&(zone==='air'||onGround(x,y)))return{x,y}}throw Error('There is no usable area for this inhabitant.');}
 const plant=plan.inhabitants.find(a=>a.role==='producer');for(let i=0;i<22;i++)patches.push({...place(plant.zone),id:i,phase:rnd()*6,biomass:.55+rnd()*.3,grown:0,eaten:0});
 const foodMean=()=>patches.reduce((n,p)=>n+p.biomass,0)/patches.length;resource=foodMean();
 function spawn(type){const a={id:nextId++,type:type.id,...place(type.zone),energy:.7,phase:rnd()*6,direction:1,target:null,activity:'exploring',foodPatchId:null,bite:null,feedingStreak:0,perchId:null};agents.push(a);return a}
 const groups=plan.inhabitants.filter(a=>a.role!=='producer'),grazerGroups=groups.filter(a=>a.role==='grazer').length,predatorGroups=groups.filter(a=>a.role==='predator').length;
 for(const type of groups)for(let i=0;i<(type.role==='predator'?Math.max(1,Math.floor(2/predatorGroups)):type.role==='companion'?1:Math.max(3,Math.floor(8/grazerGroups)))&&agents.length<22;i++)spawn(type);
 function log(kind,text,extra={}){events.push({id:nextEvent++,tick,kind,text,...extra});if(events.length>200)events.shift()}
 function step(){
  if(tick>=180)return snapshot();tick++;const marine=plan.habitat==='marine',old=resource;water=clamp(water+(condition==='dry'?-.018:condition==='warm'?-.008:.012));heat=clamp(heat+(condition==='warm'?.025:-.012));
  for(const p of patches){const before=p.biomass,rate=marine?.019*(1-heat):.027*water;p.biomass=clamp(p.biomass+rate*(1-p.biomass*.75));p.grown=p.biomass-before;p.eaten=0;}
  for(const a of [...agents]){
   if(!agents.includes(a))continue;const type=plan.inhabitants[a.type];a.bite=null;a.chasing=false;if(['rest','sleep','eat'].includes(a.activityMode)){a.activity=a.activityMode==='sleep'?'sleeping':a.activityMode==='eat'?'eating':'resting';continue;}if(['move','run'].includes(a.activityMode)){if(!a.target||Math.hypot(a.x-a.target.x,a.y-a.target.y)<.025)a.target=place(type.zone);const dx=a.target.x-a.x,dy=a.target.y-a.y,len=Math.hypot(dx,dy)||1,speed=(type.motion==='fly'?.025:type.motion==='hop'?.018:.012)*(a.activityMode==='run'?1.8:1),distance=Math.min(speed,len),x=a.x+dx/len*distance,y=a.y+dy/len*distance;if(inZone(plan,type.zone,x,y)&&(type.zone==='air'||onGround(x,y))){a.x=x;a.y=y;if(Math.abs(dx)>.001)a.direction=dx>=0?1:-1}else a.target=null;a.activity=type.motion==='hop'?'hopping':type.motion==='fly'?'flying':type.motion==='swim'?'swimming':a.activityMode==='run'?'running':'walking';a.perchId=null;continue;}if(behaviours&&type.motion!=='rooted'&&a.energy>.25&&(type.motion!=='fly'||a.perchId!==null)){const nap=(tick+a.id*41)%90;if(nap<10){a.activity=nap<2||nap>7?'resting':'sleeping';continue}}a.bite=null;a.activity=type.role==='companion'?'exploring':'looking';let target;
   const tree=type.motion==='fly'&&type.role==='predator'&&a.energy>.45?plan.objects.filter(o=>o.kind==='tree').sort((b,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(a.x-c.x,a.y-c.y))[0]:null;
   a.perchId=null;if(tree)target=tree;else if(type.role==='predator')target=agents.filter(b=>plan.inhabitants[b.type].role==='grazer').sort((b,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(a.x-c.x,a.y-c.y))[0];
   else if(type.role==='grazer'){
    const available=patches.filter(p=>p.biomass>.14&&inZone(plan,type.zone,p.x,p.y));
    const current=available.find(p=>p.id===a.foodPatchId);
    target=current&&a.feedingStreak<4?current:available.filter(p=>a.feedingStreak<4||p.id!==a.foodPatchId).sort((b,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(a.x-c.x,a.y-c.y))[0];
    if(target&&target.id!==a.foodPatchId){a.foodPatchId=target.id;a.feedingStreak=0;}
   }else target=a.target;
   if(!target||(type.role==='companion'&&Math.hypot(a.x-target.x,a.y-target.y)<.025))target=a.target=place(type.zone);
   const dx=target.x-a.x,dy=target.y-a.y,len=Math.hypot(dx,dy),chase=behaviours&&type.role==='predator'&&target?.type!==undefined&&len<.16,speed=(type.motion==='rooted'?0:type.motion==='fly'?.025:type.motion==='swim'?.016:type.motion==='hop'?.018:.011)*(chase?1.7:1);a.chasing=chase;
   // Stop at the actual food patch; do not overshoot and flip left/right every tick.
   if(tree&&len<.028){a.perchId=tree.id;a.activity='perched';a.x=tree.x;a.y=tree.y;if(!events.some(e=>e.kind==='perch'&&e.agentId===a.id&&e.treeId===tree.id))log('perch',type.name+' rested in '+tree.name+'.',{agentId:a.id,treeId:tree.id});}
   const atFood=type.role==='grazer'&&target.biomass!==undefined&&len<.032;
   if(!atFood&&a.perchId===null){const step=Math.min(speed,len),x=clamp(a.x+dx/(len||1)*step,.02,.98),y=clamp(a.y+dy/(len||1)*step,.03,.97);if(inZone(plan,type.zone,x,y)&&(type.zone==='air'||onGround(x,y))){if(Math.abs(dx)>.001)a.direction=dx>=0?1:-1;a.x=x;a.y=y}else{a.target=null;const side=a.id%2?1:-1,sx=clamp(a.x-dy/(len||1)*speed*side,.02,.98),sy=clamp(a.y+dx/(len||1)*speed*side,.03,.97);if(inZone(plan,type.zone,sx,sy)&&(type.zone==='air'||onGround(sx,sy))){a.x=sx;a.y=sy}}}
   if(type.role==='grazer'){
    if(atFood&&target.biomass>.14){const amount=Math.min(.09,target.biomass-.06);target.biomass-=amount;target.eaten+=amount;a.bite={tick,patchId:target.id,amount};a.activity='eating';a.feedingStreak++;a.energy=clamp(a.energy+.018-(heat>.7?.005:0));if(a.feedingStreak===1)log('feed',type.name+' is eating '+plant.name+'.',{agentId:a.id,patchId:target.id,amount});}
    else a.energy=clamp(a.energy-(resource>.25?.003:.012)-(heat>.7?.005:0));
   }
   if(type.role==='predator'){if(a.perchId===null)a.activity=tree?'flying to a perch':'following';a.energy=clamp(a.energy-.004);if(target?.type!==undefined&&Math.hypot(a.x-target.x,a.y-target.y)<.035&&agents.includes(target)){agents=agents.filter(b=>b!==target);a.energy=.9;a.activity='eating';log('hunt',type.name+' caught a '+plan.inhabitants[target.type].name+'.',{agentId:a.id,preyId:target.id});}}
   if(a.energy<=0){agents=agents.filter(b=>b!==a);log('leave',type.name+' could not find enough food.',{agentId:a.id});}
  }
  for(const v of visitors){
   if(['rest','sleep','eat'].includes(v.activityMode)){v.activity=v.activityMode==='sleep'?'sleeping':v.activityMode==='eat'?'nibbling':'resting';continue;}if(behaviours&&v.motion!=='fly'){const nap=(tick+visitors.indexOf(v)*29)%90;if(nap<10){v.activity=nap<2||nap>7?'resting':'sleeping';continue}}
   if(!v.target||Math.hypot(v.x-v.target.x,v.y-v.target.y)<.025)v.target=place(v.zone);
   const dx=v.target.x-v.x,dy=v.target.y-v.y,len=Math.hypot(dx,dy),speed=(v.motion==='fly'?.022:v.motion==='swim'?.015:v.motion==='hop'?.018:.012)*(v.activityMode==='run'?1.8:1);
   const x=clamp(v.x+dx/(len||1)*Math.min(speed,len),.02,.98),y=clamp(v.y+dy/(len||1)*Math.min(speed,len),.03,.97);
   if(inZone(plan,v.zone,x,y)&&(v.zone==='air'||onGround(x,y))){v.x=x;v.y=y;if(Math.abs(dx)>.001)v.direction=dx>=0?1:-1}else v.target=null;
   v.activity='exploring';const neighbour=agents.find(a=>Math.hypot(a.x-v.x,a.y-v.y)<.07&&inZone(plan,v.zone,a.x,a.y));
   if(neighbour){v.activity='meeting a neighbour';if(!events.some(e=>e.kind==='greeting'&&e.visitorId===v.id&&e.agentId===neighbour.id))log('greeting',v.name+' met a '+plan.inhabitants[neighbour.type].name+'.',{visitorId:v.id,agentId:neighbour.id});}
  }
  resource=foodMean();if(old>=.35&&resource<.35)log('food','There is less food to share.');if(old<.6&&resource>=.6)log('growth','The plants are growing back.');
  if(tick%30===0&&resource>.5&&agents.length<22){const type=plan.inhabitants.find(a=>a.role==='grazer'),a=spawn(type);log('arrival','A new '+type.name+' joined the world.',{agentId:a.id});}
  if(tick===1)log('start','Plants grow. Plant-eaters look for a meal.');if(condition==='warm'&&tick%24===0)log('heat',marine?'The water is still warm. Watch the food.':'The warm spell is using up water.');return snapshot();
 }
 function snapshot(){return {tick,resource,water,heat,condition,visitors:visitors.map(v=>({...v,target:v.target?{...v.target}:null})),agents:agents.map(a=>({...a,bite:a.bite?{...a.bite}:null,target:a.target?{...a.target}:null})),patches:patches.map(p=>({...p})),events:events.map(e=>({...e}))}}
 function mutate(command){
  if(actions.length>=64)throw Error('Start this world again for more changes.');
  const {kind,target='',count=1}=command;if(!Number.isSafeInteger(count)||count<1||count>3)throw Error('Choose one to three changes.');
  if(!['add-animal','remove-animal','plant-food','add-object'].includes(kind))throw Error('Unsupported world change.');
  const type=plan.inhabitants.find(a=>a.name===target&&a.role!=='producer');
  if(['add-animal','remove-animal'].includes(kind)&&!type)throw Error('That animal has no controller in this world.');
  if(kind==='add-animal'&&agents.length+count>22)throw Error('This little world is full.');
  if(kind==='plant-food'&&patches.length+count>48)throw Error('This world has enough food patches for now.');
  if(kind==='add-object'&&(!['tree','bush','rock'].includes(target)||plan.objects.length+count>32||plan.water.w*plan.water.h>.98&&['tree','bush'].includes(target)))throw Error('That habitat piece does not fit this scene.');
  if(kind==='remove-animal'&&agents.filter(a=>a.type===type.id).length<count)throw Error('There are not that many of this neighbour here.');
  let focusId=null;
  for(let i=0;i<count;i++){
   if(kind==='add-animal'){const a=spawn(type);focusId=a.id;log('arrival',type.name+' arrived to share this world.',{agentId:a.id});}
   if(kind==='remove-animal'){const a=agents.find(a=>a.type===type.id);agents=agents.filter(b=>b!==a);log('departure',type.name+' moved out of this scene.',{agentId:a.id});}
   if(kind==='plant-food'){const p={...place(plant.zone),id:Math.max(-1,...patches.map(p=>p.id))+1,phase:rnd()*6,biomass:.9,grown:.9,eaten:0};patches.push(p);focusId='plant:'+p.id;log('plant','A new '+plant.name+' patch can grow and feed neighbours.',{patchId:p.id});}
   if(kind==='add-object'){const point=place(plan.water.w*plan.water.h>.98?'water':'land'),object={id:Math.max(-1,...plan.objects.map(o=>o.id))+1,kind:target,name:target==='tree'?'New tree':target==='bush'?'New bush':'New rock',...point,radius:target==='tree'?.045:.03};plan.objects.push(object);focusId='object:'+object.id;log('habitat','A '+target+' joined the habitat.',{objectId:object.id});}
  }
  resource=foodMean();actions.push({tick,kind:'command',value:{kind,target,count}});return {frame:snapshot(),focusId};
 }
 function setActivity(target,value){if(actions.length>=64)throw Error('Start this world again for more changes.');if(!ACTIVITIES.includes(value))throw Error('Choose an activity shown here.');const animal=agents.find(a=>a.id===target)||visitors.find(v=>v.id===target);if(!animal)throw Error('Select a neighbour first.');animal.activityMode=value;animal.target=null;animal.bite=null;animal.activity=value==='sleep'?'sleeping':value==='rest'?'resting':value==='eat'?'nibbling':'exploring';actions.push({tick,kind:'activity',value:{target,activity:value}});log('activity',(animal.name||plan.inhabitants[animal.type].name)+' is '+animal.activity+'. This is your animation choice.',animal.type===undefined?{visitorId:animal.id}:{agentId:animal.id});return snapshot();}
 function addVisitor(raw){if(actions.length>=64||visitors.length>=3)throw Error('There is room for three new visitors. Start again to try different ones.');const descriptor=validateVisitor(raw,plan);if(visitors.some(v=>v.id===descriptor.id))throw Error('This visitor is already here.');const v={...descriptor,...place(descriptor.zone),direction:1,phase:rnd()*6,target:null,activity:'exploring'};visitors.push(v);actions.push({tick,kind:'visitor',value:descriptor});log('visitor',v.name+' arrived as an imagined visitor. Their food-web role is not modelled.',{visitorId:v.id});return snapshot()}
 return {plan,snapshot,step,mutate,addVisitor,setActivity,toReplay(){return {format:'microverse-living-world',version:4,seed,tick,plan:structuredClone(initialPlan),actions:actions.map(a=>({...a}))}},trigger(kind){if(!plan.events.some(e=>e.kind===kind))throw Error('Choose an event proposed for this world.');if(kind==='new-arrival'){if(actions.length>=64)throw Error('Start this world again for more changes.');if(agents.length>=22)throw Error('This little world is full.');actions.push({tick,kind:'new-arrival'});const a=spawn(plan.inhabitants.find(a=>a.role==='grazer'));log('arrival','Another '+plan.inhabitants[a.type].name+' arrived to share the food.',{agentId:a.id});return snapshot()}return this.setCondition(kind==='warm-spell'?'warm':'dry')},setCondition(value){if(!['usual','dry','warm'].includes(value))throw Error('Choose an available experiment.');if(actions.length>=64)throw Error('Start this world again for more changes.');actions.push({tick,kind:'weather',value});condition=value;log('change',value==='dry'?'Less rain starts now.':value==='warm'?'A warm spell starts now.':'Usual weather returns.');return snapshot()}};
}
export {default as SAVED_REEF_PLAN} from './saved-reef.json' with {type:'json'};
export function restoreLivingWorld(replay){
 if(!replay||Object.keys(replay).some(k=>!['format','version','seed','tick','plan','actions'].includes(k))||replay.format!=='microverse-living-world'||![2,3,4].includes(replay.version)||!Number.isSafeInteger(replay.tick)||replay.tick<0||replay.tick>180||!Array.isArray(replay.actions)||replay.actions.length>64)throw Error('Choose a valid little-world replay.');
 const world=createLivingWorld(replay.plan,replay.seed,{behaviours:replay.version>=4});let elapsed=0;
 for(const a of replay.actions){if(!a||!Number.isSafeInteger(a.tick)||a.tick<elapsed||a.tick>replay.tick||!['weather','new-arrival',...(replay.version>=3?['command','visitor','activity']:[])].includes(a.kind)||Object.keys(a).some(k=>!['tick','kind','value'].includes(k)))throw Error('Unsupported recorded world change.');while(elapsed<a.tick){world.step();elapsed++}if(a.kind==='weather')world.setCondition(a.value);else if(a.kind==='visitor')world.addVisitor(a.value);else if(a.kind==='activity'){const v=a.value;if(!v||Object.keys(v).length!==2||!Object.hasOwn(v,'target')||!Object.hasOwn(v,'activity'))throw Error('Unsupported recorded activity.');world.setActivity(v.target,v.activity);}else if(a.kind==='command'){const value=a.value;if(!value||Object.keys(value).some(k=>!['kind','target','count'].includes(k)))throw Error('Unsupported recorded command.');world.mutate(value)}else world.trigger('new-arrival')}
 while(elapsed<replay.tick){world.step();elapsed++}return world;
}
