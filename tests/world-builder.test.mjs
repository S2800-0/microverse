import test from 'node:test';import assert from 'node:assert/strict';
import {validateBlueprint} from '../src/world/blueprint.js';import {createLivingWorld,SAVED_REEF_PLAN,inZone} from '../src/world/simulation.js';import {createWorldGenerator} from '../server/world-generation.mjs';
test('world plans bound zones, roles and text, and round-trip a normalized plan',()=>{const p=validateBlueprint(SAVED_REEF_PLAN);assert.deepEqual(validateBlueprint(p),p);for(const edit of [{habitat:'anything'},{water:{x:0,y:0,w:2,h:1}},{inhabitants:[{...p.inhabitants[0],motion:'swim'},p.inhabitants[1]]},{title:'<script>'},{inhabitants:p.inhabitants.map(a=>({...a,zone:'land'}))}])assert.throws(()=>validateBlueprint({...p,...edit}));});
test('living worlds repeat exact movement, resources and events for a seed',()=>{const a=createLivingWorld(SAVED_REEF_PLAN),b=createLivingWorld(SAVED_REEF_PLAN);for(let i=0;i<120;i++){a.step();b.step()}assert.deepEqual(a.snapshot(),b.snapshot());assert.notDeepEqual(a.snapshot().agents,createLivingWorld(SAVED_REEF_PLAN).snapshot().agents);assert.ok(a.snapshot().events.some(e=>e.kind==='arrival'||e.kind==='hunt'));assert.ok(a.snapshot().agents.every(a=>inZone(SAVED_REEF_PLAN,'water',a.x,a.y)));});
test('heat changes food through local rules and counts/events match real simulated agents',()=>{const usual=createLivingWorld(SAVED_REEF_PLAN),hot=createLivingWorld(SAVED_REEF_PLAN);hot.setCondition('warm');for(let i=0;i<100;i++){usual.step();hot.step()}assert.ok(hot.snapshot().resource<usual.snapshot().resource);assert.ok(hot.snapshot().heat>usual.snapshot().heat);for(let i=0;i<100;i++)hot.step();assert.equal(hot.snapshot().tick,180);assert.ok(hot.snapshot().agents.length<=22);const ids=hot.snapshot().events.map(e=>e.id);assert.equal(new Set(ids).size,ids.length);assert.throws(()=>hot.setCondition('delete everything'));});
test('plan endpoint validates consent before reserving or making provider requests',async()=>{let calls=0;const g=createWorldGenerator({apiKey:'test',budget:{reserve:async()=>{calls++}},fetchImpl:async()=>{throw Error('No call expected')}});await assert.rejects(()=>g.run('plan',{consent:false}));await assert.rejects(()=>g.run('plan',{consent:true,image:'data:image/png;base64,abc',url:'https://untrusted'}));assert.equal(calls,0);});
import {compileBlueprint} from '../src/world/blueprint.js';
test('the ecology compiler corrects a proposed coral producer before art or rules run',()=>{const raw=structuredClone(SAVED_REEF_PLAN);raw.inhabitants[0].name='Pink coral';const p=compileBlueprint(raw);assert.equal(p.inhabitants[0].name,'Algae');assert.ok(p.assumptions.some(s=>s.includes('Coral is an animal')));assert.equal(raw.inhabitants[0].name,'Pink coral');});
test('an imagined object world can use bounded land behaviors without claiming photo species',()=>{const p=validateBlueprint({...SAVED_REEF_PLAN,title:'A tiny teacup garden',mode:'imagined',habitat:'land',water:{x:0,y:0,w:0,h:0},inhabitants:[{name:'Clover',look:'green clover',role:'producer',motion:'rooted',zone:'land'},{name:'Little hopper',look:'a playful rabbit',role:'grazer',motion:'hop',zone:'land'}]});const normal=createLivingWorld(p),dry=createLivingWorld(p),hot=createLivingWorld(p);dry.setCondition('dry');hot.setCondition('warm');for(let i=0;i<80;i++){normal.step();dry.step();hot.step()}assert.ok(dry.snapshot().resource<normal.snapshot().resource);assert.ok(hot.snapshot().resource<normal.snapshot().resource);assert.ok(dry.snapshot().agents.every(a=>inZone(p,'land',a.x,a.y)));});
test('the real pipeline shape plans once, builds three separate art layers, caches and does not retry failures',async()=>{const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH1sAAAAASUVORK5CYII=';let calls=0,reservations=0;const g=createWorldGenerator({apiKey:'test',budget:{reserve:async()=>{reservations++}},fetchImpl:async(url)=>{calls++;return new Response(JSON.stringify(url.endsWith('chat/completions')?{choices:[{message:{content:JSON.stringify(SAVED_REEF_PLAN)}}]}:{data:[{b64_json:png.split(',')[1]}]}),{status:200})}});const request={consent:true,image:png},p=await g.run('plan',request);await g.run('plan',request);assert.equal(calls,1);const world=await g.run('build',{...request,plan:p.plan});assert.ok(world.atlas&&world.background&&world.sceneryAtlas);await g.run('build',{...request,plan:p.plan});assert.equal(calls,6);assert.equal(reservations,6);assert.equal(Object.keys(world.motionHints).length,0);let failedCalls=0;const failed=createWorldGenerator({apiKey:'test',budget:{reserve:async()=>{}},fetchImpl:async()=>{failedCalls++;return new Response('{}',{status:503})}});await assert.rejects(()=>failed.run('plan',request));assert.equal(failedCalls,1);});
test('AI-proposed event types execute bounded local changes; extra neighbours affect real population',()=>{const s=createLivingWorld(SAVED_REEF_PLAN),before=s.snapshot();s.trigger('new-arrival');assert.equal(s.snapshot().agents.length,before.agents.length+1);assert.equal(s.snapshot().events.at(-1).kind,'arrival');s.trigger('warm-spell');assert.equal(s.snapshot().condition,'warm');assert.throws(()=>s.trigger('dry-spell'));assert.throws(()=>validateBlueprint({...SAVED_REEF_PLAN,events:[{kind:'execute-code',title:'x',why:'x'}]}));});
import {validateMotionHints,motionPoint,motionForSprite} from '../src/world/motion-points.js';
import {environmentKind} from '../src/world/environment-motion.js';
test('motion regions are bounded, unconfirmed parts stay still, roots stay planted and atlas points map to cutouts',()=>{const none={visible:false,x:.5,y:.5,rx:.1,ry:.1},raw=Object.fromEntries(['tail','fin','mouth','eye'].map(k=>[k,{...none}]));const rig=validateMotionHints(raw);assert.deepEqual(motionPoint(.5,.5,1,{rig}),{x:.5,y:.5});assert.deepEqual(motionPoint(.5,1,2,{rooted:true}),{x:.5,y:1});assert.notEqual(motionPoint(.5,.1,2,{rooted:true}).x,.5);assert.throws(()=>validateMotionHints({...raw,eye:{...none,x:99}}));const mapped=motionForSprite({motionSpace:'atlas',motionHints:{1:{...raw,fin:{visible:true,x:.75,y:.25,rx:.025,ry:.025}}}},1,{atlasCrop:{x:.5,y:0,w:.5,h:.5}});assert.equal(mapped.fin.x,.5);assert.equal(mapped.fin.y,.5);assert.equal(environmentKind('snow','usual'),'snow');assert.equal(environmentKind('marine','warm'),'water');assert.equal(environmentKind('land','dry'),'dry');});
import {restoreLivingWorld} from '../src/world/simulation.js';
import {recapFacts} from '../src/spark/recap.js';
import {startModel} from '../src/experience/model-session.ts';
import {createWorldAnswer} from '../server/world-answer.mjs';
import {createAvatarPainter} from '../server/avatar.mjs';
test('a narrated recap follows actual comparisons and restores the original investigation',()=>{const session=startModel({food:'Lots',review:{water:'seen',tree:'seen',grass:'seen'}});session.seek(52);const before=session.export(),facts=recapFacts(session);assert.equal(facts.grassDirection,'less');assert.equal(facts.rabbitDirection,'more');assert.equal(facts.changedRabbits,session.getState().changed.counts.rabbit);assert.deepEqual(session.export(),before);assert.ok(facts.events.length>0);});
test('living-world questions replay actual interventions and reject forged or out-of-order changes',()=>{const s=createLivingWorld(SAVED_REEF_PLAN);for(let i=0;i<9;i++)s.step();s.trigger('new-arrival');s.setCondition('warm');for(let i=0;i<15;i++)s.step();const replay=s.toReplay();assert.deepEqual(restoreLivingWorld(replay).snapshot(),s.snapshot());assert.throws(()=>restoreLivingWorld({...replay,actions:[{tick:1000,kind:'weather',value:'warm'}]}));assert.throws(()=>restoreLivingWorld({...replay,execute:'code'}));});
test('new-world Spark can only select real events, and companion names do not enter world answer payloads',async()=>{const s=createLivingWorld(SAVED_REEF_PLAN);s.step();let sent;const api=createWorldAnswer({apiKey:'test',budget:{reserve:async()=>{}},fetchImpl:async(url,opts)=>{sent=JSON.parse(opts.body);return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({topic:'neighbours',eventIds:[999]})}}]}),{status:200})}});await assert.rejects(()=>api.run({consent:true,question:'Who is here?',replay:s.toReplay()}));assert.ok(!JSON.stringify(sent).includes('MODEL_API_KEY'));});
test('avatar generation requires specific photo consent and never accepts a name for transmission',async()=>{let reserved=0,calls=0;const api=createAvatarPainter({apiKey:'test',budget:{reserve:async()=>{reserved++}},fetchImpl:async()=>{calls++;return new Response('{}',{status:500})}});await assert.rejects(()=>api.run({consent:false,image:'x',details:''}));await assert.rejects(()=>api.run({consent:true,image:'x',details:'',name:'Private name'}));assert.equal(reserved,0);assert.equal(calls,0);});
import {removeSpriteBackground} from '../src/world/sprite-mask.js';
test('sprite cutting removes a closed frame without fixed crops or loss of a tall ear',()=>{const w=100,h=100,p=new Uint8ClampedArray(w*h*4).fill(255);const put=(x,y,r,g,b)=>p.set([r,g,b,255],(y*w+x)*4);for(let x=3;x<97;x++){put(x,3,230,230,230);put(x,96,230,230,230)}for(let y=3;y<97;y++){put(3,y,230,230,230);put(96,y,230,230,230)}for(let y=8;y<75;y++)for(let x=42;x<58;x++)put(x,y,180,115,45);const out=removeSpriteBackground(p,w,h);assert.equal(out[(10*w+42)*4+3],255);assert.equal(out[(30*w+20)*4+3],0);assert.equal(out[(3*w+20)*4+3],0);assert.equal(p[(30*w+20)*4+3],255);});

test('child-facing guide wording preserves an unexpected result and its evidence IDs',async()=>{
 const {childReply}=await import('../src/spark/child-reply.js');
 const packet={observations:[{id:'population.rabbit',changed:18,baseline:15,difference:3},{id:'browse',changed:10,baseline:20,difference:-10}],mechanisms:[{id:'rain-growth',text:'rule'}]};
 const original={source:'Prepared',lines:[{kind:'observation',ref:'population.rabbit',text:'old'},{kind:'observation',ref:'browse',text:'old'},{kind:'mechanism',ref:'rain-growth',text:'old'}]};
 const reply=childReply(original,packet);
 assert.match(reply.lines[0].text,/18 rabbits.*15/);
 assert.match(reply.lines[1].text,/fewer leaves/);
 assert.deepEqual(reply.lines.map(l=>l.ref),original.lines.map(l=>l.ref));
 assert.equal(original.lines[0].text,'old');
 assert.equal(childReply(original,packet,'What do rabbits eat?').lines[0].ref,'rain-growth');
});

test('a direct food question retains the validated diet rule before incidental population records',async()=>{
 const {guideLocal,narrowGuide}=await import('../src/core/investigation/guide.js');
 const packet={observations:[{id:'population.fox'},{id:'population.wolf'}],events:[{id:'event.changed.1',branch:'changed',text:'fox #3 arrived.'}],mechanisms:[{id:'predation'}]};
 const result=narrowGuide(guideLocal('What do foxes eat?',packet),packet,'What do foxes eat?');
 assert.deepEqual(result.mechanismIds,['predation']);
 assert.equal(result.eventIds.length,0);
 assert.ok(result.observationIds.every(id=>packet.observations.some(o=>o.id===id)));
});

test('a real bite consumes its exact patch and regrowth is accounted for locally',()=>{
 const world=createLivingWorld(SAVED_REEF_PLAN);let previous=world.snapshot(),found=false;
 for(let i=0;i<30;i++){const frame=world.step();for(const patch of frame.patches){const old=previous.patches.find(p=>p.id===patch.id);assert.ok(Math.abs(patch.biomass-(old.biomass+patch.grown-patch.eaten))<1e-9);assert.ok(patch.biomass>=0&&patch.biomass<=1)}
  for(const a of frame.agents.filter(a=>a.bite)){found=true;assert.equal(a.activity,'eating');const p=frame.patches.find(p=>p.id===a.bite.patchId);assert.ok(p.eaten>=a.bite.amount-1e-9);assert.ok(Math.hypot(a.x-p.x,a.y-p.y)<.033)}
  assert.ok(Math.abs(frame.resource-frame.patches.reduce((n,p)=>n+p.biomass,0)/frame.patches.length)<1e-9);previous=frame;
 }assert.ok(found);
});
test('AI event names cannot promise an unimplemented species, and food must be reachable',()=>{
 const raw=structuredClone(SAVED_REEF_PLAN);raw.habitat='freshwater';raw.water={x:0,y:.6,w:1,h:.4};raw.inhabitants[0].zone='land';raw.events=[{kind:'new-arrival',title:'A duck family arrives',why:'Ducks are added'}];
 const plan=compileBlueprint(raw);assert.equal(plan.inhabitants[0].zone,'water');assert.match(plan.events[0].title,/Yellow Reef Fish/);assert.doesNotMatch(plan.events[0].title,/duck/);
});
test('land feeding telemetry reports real nonzero bites without entering replay snapshots',()=>{
 const s=startModel({food:'Lots',review:{water:'seen',tree:'seen',grass:'seen'}}),state=s.seek(1);assert.ok(state.changed.world.lastFeeding.some(b=>b.amount>0));assert.ok(!JSON.stringify(s.export()).includes('lastFeeding'));assert.ok(state.changed.world.lastFeeding.every(b=>b.food==='grass'||b.food==='browse'));
});

import {readFileSync} from 'node:fs';
import {boundView,panView,pondView} from '../src/world/exploration-camera.js';
test('saved maps each have three animal types, reachable food and deterministic interactions',()=>{
 for(const file of ['saved-garden-v11.json','saved-woodland-v11.json','saved-reef-v12.json']){
  const plan=compileBlueprint(JSON.parse(readFileSync(new URL('../src/world/'+file,import.meta.url),'utf8')));
  assert.equal(plan.inhabitants.filter(t=>t.role!=='producer').length,3);
  const a=createLivingWorld(plan),b=createLivingWorld(plan);assert.ok(a.snapshot().agents.length<=12);
  const seen=new Set(a.snapshot().agents.map(a=>a.type));assert.equal(seen.size,3);
  for(let i=0;i<120;i++){
   const f=a.step();b.step();for(const animal of f.agents){const type=plan.inhabitants[animal.type];assert.ok(inZone(plan,type.zone,animal.x,animal.y));if(type.zone!=='air')assert.ok(plan.objects.every(o=>Math.hypot(animal.x-o.x,animal.y-o.y)>=o.radius*.3-1e-9));}
  }
  assert.deepEqual(a.snapshot(),b.snapshot());assert.deepEqual(restoreLivingWorld(a.toReplay()).snapshot(),a.snapshot());
  assert.ok(a.snapshot().events.some(e=>e.kind==='feed'));
  if(file.includes('woodland')){const perch=a.snapshot().events.find(e=>e.kind==='perch');assert.ok(perch);assert.ok(plan.objects.some(o=>o.id===perch.treeId&&o.kind==='tree'));}
 }
});
test('exploration stays bounded, pond close-up uses real geometry and bad input recovers',()=>{
 assert.deepEqual(boundView({zoom:99,x:-4,y:7}),{zoom:2.75,x:.03,y:.97});
 const moved=panView({zoom:1.5,x:.5,y:.5},999,-999,600,500);assert.equal(moved.zoom,1.5);assert.equal(moved.x,.03);assert.equal(moved.y,.97);
 assert.deepEqual(panView({},NaN,1,0,0),boundView());
 const p=pondView({x:.1,y:.7,w:.8,h:.3});assert.equal(p.x,.5);assert.ok(Math.abs(p.y-.85)<1e-9);assert.equal(p.zoom,2.15);
});

import {SPECIES_CATALOG,validateSpeciesCatalog,speciesFor,speciesAnswer,validateKnownAnimals,importRigFor} from '../src/world/species-catalog.js';
test('reviewed species records have unambiguous sources and unknown animals do not borrow facts or rigs',()=>{
 assert.equal(validateSpeciesCatalog(SPECIES_CATALOG).length,9);assert.equal(speciesFor('Pond Goldfish').id,'goldfish');assert.equal(speciesFor('yellow reef fish'),null);assert.equal(speciesFor('arctic fox'),null);assert.equal(importRigFor('penguin'),null);assert.equal(importRigFor('cat').family,'quadruped');
 assert.equal(speciesAnswer('Will goldfish go extinct tomorrow?'),null);assert.equal(speciesAnswer('What do foxes eat?').profileId,'red-fox-example');assert.equal(speciesAnswer('Tell me about this animal','Pond Goldfish').profileId,'goldfish');assert.throws(()=>validateSpeciesCatalog([...SPECIES_CATALOG,SPECIES_CATALOG[0]]));
});
test('known animal compatibility rejects marine goldfish but keeps labelled imagined worlds possible',()=>{
 const raw=structuredClone(SAVED_REEF_PLAN);raw.inhabitants[1]={...raw.inhabitants[1],name:'Goldfish'};assert.throws(()=>validateKnownAnimals(validateBlueprint(raw)),/habitat/);assert.doesNotThrow(()=>validateKnownAnimals(validateBlueprint({...raw,mode:'imagined'})));
});
test('a checked animal diet answer uses its source with no paid request or reservation',async()=>{
 let calls=0;const api=createWorldAnswer({apiKey:'test',budget:{reserve:async()=>calls++},fetchImpl:async()=>{calls++;throw Error('No provider call expected')}});const sim=createLivingWorld(SAVED_REEF_PLAN);const answer=await api.run({consent:true,question:'What do goldfish eat?',replay:sim.toReplay()});assert.equal(calls,0);assert.match(answer.provider,/no AI call/);assert.match(answer.sourceUrl,/usgs.gov/);assert.match(answer.text,/omnivores/);assert.match(answer.lines[0].text,/not an observation/);
});

import {plantPatchVisual} from '../src/world/plant-visuals.js';
test('visible plant stems reflect actual food rather than inventing extra simulation biomass',()=>{
 assert.equal(plantPatchVisual(0).count,0);assert.equal(plantPatchVisual(.04).count,0);assert(plantPatchVisual(.2).count<plantPatchVisual(.8).count);assert.equal(plantPatchVisual(999).count,6);assert.equal(plantPatchVisual(NaN).count,0);
 const sim=createLivingWorld(SAVED_REEF_PLAN),snapshot=sim.snapshot();snapshot.patches.forEach(p=>plantPatchVisual(p.biomass));assert.deepEqual(sim.snapshot(),snapshot);
});

import {initialWorldView} from '../src/world/exploration-camera.js';
test('the opening camera centers actual neighbours, including a pond at the map edge',()=>{
 assert.deepEqual(initialWorldView({agents:[{x:.2,y:.85},{x:.8,y:.9}]}),{zoom:1,x:.5,y:.875});assert.deepEqual(initialWorldView({agents:[]}),boundView());
});
