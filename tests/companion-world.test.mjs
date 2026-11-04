import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {companionReference,companionLocomotion,companionFits,personalVisitor} from '../src/world/personal-companions.js';
import {parseWorldCommand,validateWorldCommand} from '../src/world/world-commands.js';
import {createLivingWorld,restoreLivingWorld} from '../src/world/simulation.js';
import {SAVED_WORLDS} from '../src/world/saved-places.js';
import {locomotionFrame} from '../src/world/locomotion.js';
import {movementProfile} from '../src/core/creature/identity.js';
import {compileBlueprint} from '../src/world/blueprint.js';
import {readJsonResponse} from '../src/core/creature/json-response.js';
import {modelJson} from '../server/model-json.mjs';
const image='data:image/png;base64,'+readFileSync(new URL('../public/assets/companion-cat.png',import.meta.url)).toString('base64');
const cat={id:'local-cat',name:'Private pet name',species:'cat',image},plan=SAVED_WORLDS.garden.plan;
test('references to a created companion are local placement requests, never a new species painting',()=>{
 for(const q of ['I made a companion cat just now, add them','Add my companion that I just made','Put my pet here','Bring them','Add Private pet name']){
  const c=parseWorldCommand(q,{plan,companions:[cat]});assert.equal(c.kind,'place-companion',q);assert.ok(!JSON.stringify(c).includes(cat.name));
 }
 assert.equal(companionReference('Add a monkey',[cat]),null);
 assert.equal(parseWorldCommand('Add a monkey',{plan}).kind,'generate-animal');
 assert.throws(()=>validateWorldCommand({kind:'generate-animal',target:'my companion that i just made'},{plan}));
 assert.equal(companionReference('add my companion',[]).target,'');
});
test('a personal arrival reuses an opaque ID and sends no photo, personal name or rig into the world record',async()=>{
 const descriptor=await personalVisitor(cat,plan),sim=createLivingWorld(plan);assert.equal(descriptor.name,'cat');assert.equal(descriptor.zone,'land');
 sim.addVisitor(descriptor);sim.step();const record=JSON.stringify(sim.toReplay());for(const secret of [cat.name,cat.image,cat.id])assert.ok(!record.includes(secret));
 assert.deepEqual(restoreLivingWorld(sim.toReplay()).snapshot(),sim.snapshot());assert.throws(()=>sim.addVisitor(descriptor));
 assert.deepEqual(await personalVisitor(cat,plan),descriptor);
});
test('rabbits hop, fish require water, and land companions cannot be placed in an all-water reef',async()=>{
 assert.equal(movementProfile({family:'quadruped'},'rabbit'),'rabbit');assert.equal(companionLocomotion({species:'bunny'}).motion,'hop');
 const fish={...cat,species:'goldfish'};assert.equal(companionLocomotion(fish).zone,'water');assert.equal(companionFits(cat,SAVED_WORLDS.reef.plan),false);
 await assert.rejects(()=>personalVisitor(cat,SAVED_WORLDS.reef.plan),/dry ground/);
 const dry={...plan,water:{x:0,y:0,w:0,h:0}};await assert.rejects(()=>personalVisitor(fish,dry),/needs water/);
 assert.equal(companionFits(fish,plan),true);
});
test('rest and sleep actually stop an animal, moving resumes, and choices replay deterministically',()=>{
 const sim=createLivingWorld(plan),id=sim.snapshot().agents[0].id;
 for(const activity of ['rest','sleep']){sim.setActivity(id,activity);const before=sim.snapshot().agents.find(a=>a.id===id);for(let i=0;i<5;i++)sim.step();const after=sim.snapshot().agents.find(a=>a.id===id);assert.equal(after.x,before.x);assert.equal(after.y,before.y);assert.equal(after.bite,null);assert.equal(after.activity,activity==='sleep'?'sleeping':'resting')}
 sim.setActivity(id,'run');for(let i=0;i<5;i++)sim.step();sim.setActivity(id,'auto');assert.deepEqual(restoreLivingWorld(sim.toReplay()).snapshot(),sim.snapshot());
 assert.throws(()=>sim.setActivity(id,'invented'));assert.throws(()=>sim.setActivity('not-present','sleep'));
 const bad=sim.toReplay();bad.actions.at(-1).value.script='x';assert.throws(()=>restoreLivingWorld(bad));
});
test('saved visitors have the same replayable activity controls without an invented food role',async()=>{
 const sim=createLivingWorld(plan),v=await personalVisitor(cat,plan);sim.addVisitor(v);sim.setActivity(v.id,'sleep');const before=sim.snapshot().visitors[0];sim.step();assert.equal(sim.snapshot().visitors[0].x,before.x);assert.equal(sim.snapshot().visitors[0].activity,'sleeping');sim.setActivity(v.id,'run');sim.step();assert.deepEqual(restoreLivingWorld(sim.toReplay()).snapshot(),sim.snapshot());
});
test('hop has an airborne arc and landing compression, while rest, sleep and reduced motion stay still',()=>{
 assert.ok(locomotionFrame('hop',Math.PI/12).lift>10);assert.ok(locomotionFrame('hop',Math.PI/4).squash<1);
 for(const activity of ['rest','sleep'])assert.equal(locomotionFrame('hop',1,0,{activity}).lift,0);
 assert.equal(locomotionFrame('hop',1,0,{moving:false}).lift,0);assert.equal(locomotionFrame('hop',1,0,{activity:'sleep'}).asleep,true);
});
test('an interrupted HTTP or model reply produces a useful error, and no parser exception or retry',async()=>{
 for(const body of ['', '{', '[]','null'])await assert.rejects(()=>readJsonResponse(new Response(body)),/interrupted/);
 await assert.rejects(()=>readJsonResponse(new Response(JSON.stringify({error:'Unexpected end of JSON input'}),{status:502})),/interrupted/);
 for(const content of ['',undefined,'{'])assert.throws(()=>modelJson({choices:[{message:{content}}]}),/complete|incomplete/);
 assert.throws(()=>modelJson({choices:[{finish_reason:'length',message:{content:'{}'}}]}),/reply limit/);
 assert.deepEqual(modelJson({choices:[{message:{content:'{"ok":true}'}}]}),{ok:true});
});
test('source sky/ground observations are bounded and absence of visible ground is labelled imagined',()=>{
 const base=structuredClone(plan);base.sourceScene={sky:'visible',ground:'not-visible',water:'not-visible'};const result=compileBlueprint(base);assert.equal(result.mode,'imagined');assert.ok(result.assumptions.some(s=>/ground/.test(s)));
 assert.deepEqual(result.sourceScene,base.sourceScene);assert.throws(()=>compileBlueprint({...base,sourceScene:{...base.sourceScene,mask:'invented'}}));
 const rabbit=structuredClone(plan);rabbit.mode='nature';rabbit.inhabitants[1]={...rabbit.inhabitants[1],name:'Rabbit',motion:'walk'};assert.equal(compileBlueprint(rabbit).inhabitants[1].motion,'hop');
});

import {readTravellingCompanion,rememberTravellingCompanion,TRAVELLING_COMPANION_KEY} from '../src/world/personal-companions.js';
test('the explicit travel action survives a refresh in tab storage without saving an original upload or silently writing the permanent library',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};assert.equal(readTravellingCompanion(storage),null);assert.equal(map.size,0);
 rememberTravellingCompanion(storage,{...cat,original:'private source',pixels:'temporary data'});assert.equal(map.size,1);assert.ok(map.has(TRAVELLING_COMPANION_KEY));assert.equal(readTravellingCompanion(storage).id,cat.id);assert.ok(!map.get(TRAVELLING_COMPANION_KEY).includes('private source'));
 storage.setItem(TRAVELLING_COMPANION_KEY,'{broken');assert.equal(readTravellingCompanion(storage),null);
});
