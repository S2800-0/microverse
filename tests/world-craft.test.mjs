import test from 'node:test';
import assert from 'node:assert/strict';
import {creatureWidth,flightWidth} from '../src/world/creature-scale.js';
import {deformPoint,legStations,poseFor,stickerFrames,DEFAULT_LEGS} from '../src/world/creature-motion.js';
import {isWalkable,nextWaypoint,groundFromPixels,validateGround,walkablePixel} from '../src/world/walk-grid.js';
import {isWaterPixel,waterWave} from '../src/world/water-art.js';
import {createLivingWorld,restoreLivingWorld} from '../src/world/simulation.js';
import {SAVED_WORLDS} from '../src/world/saved-places.js';
import {compileBlueprint,WORLD_SCHEMA} from '../src/world/blueprint.js';
import {LESSONS,WATCH_DAYS,compareWithoutChange,lessonCommand,lessonFor,outcomeOf,resultLine} from '../src/world/lessons.js';

test('an owl is smaller than a fox and larger than a mouse, even with wings spread',()=>{
 assert.ok(creatureWidth({name:'Woodland Owl'})<creatureWidth({name:'Woodland Fox'}));
 assert.ok(creatureWidth({name:'Wood Mouse'})<creatureWidth({name:'Woodland Owl'}));
 assert.ok(flightWidth({name:'Woodland Owl'})<creatureWidth({name:'Woodland Fox'}));
 assert.equal(creatureWidth({name:'Unknown beast',role:'predator'}),72);
});
test('a runner stays one drawing instead of swapping between two',()=>{
 const poses={runA:{width:10,id:'a'},runB:{width:10,id:'b'}};
 const seen=new Set();for(let t=0;t<3;t+=.03)seen.add(poseFor('run',t,0,poses).texture.id);
 assert.deepEqual([...seen],['a']);assert.equal(poseFor('run',0,0,poses).warp,'run');
});
test('legs are found from the drawing, and legs swing while the back stays attached',()=>{
 const cover=new Array(96).fill(0);for(let i=20;i<26;i++)cover[i]=5;for(let i=70;i<76;i++)cover[i]=5;
 assert.equal(legStations(cover).length,2);assert.deepEqual(legStations(new Array(96).fill(0)),DEFAULT_LEGS);
 const at=t=>deformPoint(.26,.95,'walk',t,0,{legs:DEFAULT_LEGS}),xs=[0,.2,.4,.6,.8].map(t=>at(t).x);
 assert.ok(Math.max(...xs)-Math.min(...xs)>.03,'the foot moves');
 const back=[0,.2,.4,.6,.8].map(t=>deformPoint(.5,.1,'walk',t,0,{legs:DEFAULT_LEGS}).x);
 assert.ok(Math.max(...back)-Math.min(...back)<.01,'the back holds');
});
test('stickers: nom pops up to three times and z rises and grows',()=>{
 let most=0;for(let t=0;t<2;t+=.02)most=Math.max(most,stickerFrames('eat',t,0).length);assert.equal(most,3);
 const zs=[0,.4,.8,1.2,1.6,2].map(t=>stickerFrames('sleep',t,0)[0]);const wrap=zs.findIndex((z,i)=>i&&z.y>zs[i-1].y);
 assert.ok(wrap===-1||wrap>1);assert.ok(zs[1].y<zs[0].y,'rises');assert.ok(zs[1].scale>zs[0].scale,'grows');
 assert.deepEqual(stickerFrames('idle',1,0),[]);
});
test('the ground map is valid, and blue, deep shade and bright rock are not walkable',()=>{
 assert.throws(()=>validateGround({cols:8,rows:8,cells:'1'}));
 assert.equal(walkablePixel(70,130,190),false);assert.equal(walkablePixel(20,40,20),false);assert.equal(walkablePixel(205,180,130),true);
 assert.equal(groundFromPixels(new Uint8ClampedArray(4*100*100),100,100),null,'a painting it cannot read leaves animals free');
});
test('routes go around a wall, and no grid means walk straight',()=>{
 const cols=10,rows=10;let cells='';for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)cells+=x===5&&y<8?'0':'1';const g={cols,rows,cells};
 let p={x:.15,y:.15};const to={x:.85,y:.15};for(let i=0;i<400&&Math.hypot(p.x-to.x,p.y-to.y)>.03;i++){const aim=nextWaypoint(g,p,to),d=Math.hypot(aim.x-p.x,aim.y-p.y)||1;p={x:p.x+(aim.x-p.x)/d*.02,y:p.y+(aim.y-p.y)/d*.02};assert.ok(isWalkable(g,p.x,p.y),'stepped into a wall at '+p.x+','+p.y)}
 assert.ok(Math.hypot(p.x-to.x,p.y-to.y)<=.03,'arrived');assert.deepEqual(nextWaypoint(null,p,to),to);
});
for(const id of ['garden','woodland'])test(id+' land animals stay on walkable ground and still eat, the same way every time',()=>{
 const plan=SAVED_WORLDS[id].plan,run=()=>{const w=createLivingWorld(plan,17);let bites=0,bad=0;for(let i=0;i<180;i++){const f=w.step();for(const a of f.agents){if(a.bite)bites++;if(plan.inhabitants[a.type].zone==='land'&&a.perchId===null&&!isWalkable(plan.ground,a.x,a.y))bad++}}return {bites,bad,end:JSON.stringify(w.snapshot().agents)}};
 const a=run(),b=run();assert.equal(a.bad,0);assert.ok(a.bites>0);assert.equal(a.end,b.end);
});
test('the walkable map survives planning and replay',()=>{
 const plan=SAVED_WORLDS.garden.plan,w=createLivingWorld(plan,17);for(let i=0;i<20;i++)w.step();
 assert.ok(compileBlueprint(plan).ground);
 assert.equal(JSON.stringify(restoreLivingWorld(w.toReplay()).snapshot().agents),JSON.stringify(w.snapshot().agents));
 assert.ok(JSON.stringify(w.toReplay()).length<24000,'small enough for the world command route');
});
test('water helpers: blue is water, leaves are not, and the wave is small',()=>{
 assert.equal(isWaterPixel(70,130,190),true);assert.equal(isWaterPixel(90,150,70),false);
 for(let t=0;t<20;t+=1.3){const w=waterWave(300,200,t);assert.ok(Math.abs(w.x)<=4.1&&Math.abs(w.y)<=1.6)}
});
test('the planner schema obeys strict mode: every property of every object is required',()=>{
 const walk=(n,path)=>{if(!n||typeof n!=='object')return;if(n.type==='object'){assert.equal(n.additionalProperties,false,path);assert.deepEqual([...(n.required||[])].sort(),Object.keys(n.properties||{}).sort(),path)}for(const [k,v] of Object.entries(n.properties||{}))walk(v,path+'.'+k);if(n.items)walk(n.items,path+'[]')};
 walk(WORLD_SCHEMA,'$');
});
test('each saved world has its own fitting lesson with a source',()=>{
 assert.equal(lessonFor(SAVED_WORLDS.garden.plan,'garden').id,'rain-and-plants');
 assert.equal(lessonFor(SAVED_WORLDS.woodland.plan,'woodland').id,'sharing-food');
 assert.equal(lessonFor(SAVED_WORLDS.reef.plan,'reef').id,'warm-reef');
 assert.equal(lessonFor({...SAVED_WORLDS.reef.plan,lesson:'rain-and-plants'}).id,'warm-reef','a planner choice the world cannot run is ignored');
 assert.equal(lessonFor({...SAVED_WORLDS.woodland.plan,lesson:'sharing-food'}).id,'sharing-food');
 for(const l of Object.values(LESSONS)){assert.match(l.source.url,/^https:\/\//);assert.doesNotMatch(l.source.url,/openstax/);assert.ok(l.rule)}
});
test('the comparison is this world with only the lesson change removed, and it shows less food',()=>{
 for(const id of ['garden','woodland','reef']){const plan=SAVED_WORLDS[id].plan,lesson=lessonFor(plan,id),w=createLivingWorld(plan,17);for(let i=0;i<10;i++)w.step();const index=w.toReplay().actions.length,c=lessonCommand(lesson,plan);if(c.kind==='weather')w.setCondition(c.value);else w.mutate(c);for(let i=0;i<WATCH_DAYS;i++)w.step();
  const r=compareWithoutChange(w,index),clean=createLivingWorld(plan,17);for(let i=0;i<10+WATCH_DAYS;i++)clean.step();
  assert.equal(r.unchanged.food,clean.snapshot().resource,id+' baseline');assert.equal(outcomeOf(r),'less',id+': '+resultLine(r))}
});
