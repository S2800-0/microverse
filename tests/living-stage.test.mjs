import test from 'node:test';
import assert from 'node:assert/strict';
import {createLivingWorld,restoreLivingWorld,SAVED_REEF_PLAN} from '../src/world/simulation.js';
import {parseWorldCommand,validateWorldCommand,worldFact} from '../src/world/world-commands.js';
import {sceneTransition,hasPond} from '../src/world/scene-navigation.js';
import {makePondWorld} from '../src/world/pond-world.js';
import {SAVED_WORLDS} from '../src/world/saved-places.js';
import {createNewNeighbour} from '../server/new-neighbour.mjs';
import {createWorldCommand} from '../server/world-command.mjs';
const land={...structuredClone(SAVED_REEF_PLAN),mode:'imagined',habitat:'land',water:{x:.1,y:.1,w:.2,h:.2},objects:[],inhabitants:[{id:0,name:'Clover',look:'green clover',role:'producer',motion:'rooted',zone:'land'},{id:1,name:'Little rabbit',look:'brown rabbit',role:'grazer',motion:'hop',zone:'land'}]};
const context={plan:land,canDive:true,underwater:false};
test('free requests resolve to bounded real commands; unsupported names cannot masquerade as existing species',()=>{
 assert.equal(parseWorldCommand('Please add two rabbits',context).kind,'add-animal');
 assert.equal(parseWorldCommand('Add a monkey',context).kind,'generate-animal');
 assert.equal(parseWorldCommand('Plant two food patches',context).count,2);
 const mousePlan={...land,inhabitants:[land.inhabitants[0],{...land.inhabitants[1],name:'Wood Mouse'}]};assert.equal(parseWorldCommand('Add two mice',{plan:mousePlan}).kind,'add-animal');
 assert.equal(parseWorldCommand('Where are the plants?',context).kind,'focus-plants');
 assert.equal(parseWorldCommand('Go into the pond',context).kind,'enter-water');
 assert.throws(()=>validateWorldCommand({kind:'add-animal',target:'monkey'},context));
 for(const raw of [{kind:'eval',value:'alert(1)'},{kind:'plant-food',count:100},{kind:'weather',value:'flood'},{kind:'add-object',target:'tree',script:'x'}])assert.throws(()=>validateWorldCommand(raw,context));
 assert.throws(()=>validateWorldCommand({kind:'enter-water'},{...context,canDive:false}));
 assert.throws(()=>validateWorldCommand({kind:'weather',value:'dry'},{plan:SAVED_REEF_PLAN}));
});
test('world changes alter food/population/habitat and replay or undo without corrupting the initial blueprint',()=>{
 const sim=createLivingWorld(land),initial=sim.snapshot(),planBefore=structuredClone(land);
 sim.mutate({kind:'add-animal',target:'Little rabbit',count:2});sim.step();
 sim.mutate({kind:'plant-food',count:3});sim.mutate({kind:'add-object',target:'tree'});
 assert.equal(sim.snapshot().agents.length,initial.agents.length+2);assert.equal(sim.snapshot().patches.length,25);assert.equal(sim.plan.objects.length,1);assert.deepEqual(land,planBefore);
 for(let i=0;i<30;i++)sim.step();assert.deepEqual(restoreLivingWorld(sim.toReplay()).snapshot(),sim.snapshot());
 const undo=sim.toReplay();undo.actions.pop();const without=restoreLivingWorld(undo);assert.equal(without.plan.objects.length,0);assert.equal(without.snapshot().tick,sim.snapshot().tick);
 const evil=sim.toReplay();evil.actions.push({tick:evil.tick,kind:'command',value:{kind:'add-object',target:'script'}});assert.throws(()=>restoreLivingWorld(evil));
});
test('pond routing has cancellable transitions and only aquatic residents with correct atlas indices',()=>{
 assert.equal(sceneTransition('surface','ENTER'),'entering');assert.equal(sceneTransition('entering','RETURN'),'surface');assert.equal(sceneTransition('entering','READY'),'underwater');assert.equal(sceneTransition('underwater','RETURN'),'returning');assert.equal(sceneTransition('returning','READY'),'surface');
 const garden=SAVED_WORLDS.garden;assert.ok(hasPond(garden));const pond=makePondWorld(garden);assert.ok(pond.underwater);assert.equal(hasPond(pond),false);assert.ok(pond.plan.inhabitants.every(t=>t.zone==='water'));assert.ok(!pond.plan.inhabitants.some(t=>t.motion==='fly'));assert.equal(pond.atlasIndices.length,pond.plan.inhabitants.length);assert.ok(pond.atlasIndices.some((id,i)=>id!==i));
 const parent=createLivingWorld(garden.plan),child=createLivingWorld(pond.plan),before=parent.snapshot();child.step();assert.deepEqual(parent.snapshot(),before);assert.equal(child.snapshot().tick,1);
});
const descriptor={id:'a'.repeat(64),name:'Macaque',zone:'land',motion:'walk',family:'primate'};
test('generated visitors move in their zone and replay greetings without inventing feeding roles',()=>{
 const sim=createLivingWorld(land);sim.addVisitor(descriptor);for(let i=0;i<45;i++)sim.step();const v=sim.snapshot().visitors[0];assert.ok(v.x!==sim.toReplay().plan.water.x);assert.ok(!('energy' in v)&&!('bite' in v));assert.deepEqual(restoreLivingWorld(sim.toReplay()).snapshot(),sim.snapshot());
 assert.throws(()=>sim.addVisitor(descriptor));assert.throws(()=>sim.addVisitor({...descriptor,id:'b'.repeat(64),zone:'water',motion:'fly'}));
 const reef=createLivingWorld(SAVED_REEF_PLAN);assert.throws(()=>reef.addVisitor(descriptor));
});
test('new animal pipeline checks consent, reserves both calls, caches art and never retries a failed provider',async()=>{
 const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH1sAAAAASUVORK5CYII=';let calls=0,reservations=0;
 const service=createNewNeighbour({apiKey:'fake',budget:{reserve:async()=>{reservations++}},fetchImpl:async(url)=>{calls++;return new Response(JSON.stringify(url.endsWith('chat/completions')?{choices:[{message:{content:JSON.stringify({animal:'Macaque',look:'brown monkey with a long tail',zone:'land',motion:'walk',family:'primate',fits:true})}}]}:{data:[{b64_json:png}]}))}});
 const input={consent:true,animal:'monkey',replay:createLivingWorld(land).toReplay()};await assert.rejects(()=>service.run({...input,consent:false}));assert.equal(calls,0);
 const result=await service.run(input);assert.equal(result.visitor.name,'Macaque');assert.equal(calls,2);assert.equal(reservations,2);assert.ok((await service.run(input)).cached);assert.equal(calls,2);
 let failures=0;const broken=createNewNeighbour({apiKey:'fake',budget:{reserve:async()=>{}},fetchImpl:async()=>{failures++;return new Response('{}',{status:503})}});await assert.rejects(()=>broken.run(input));assert.equal(failures,1);
});
test('custom command interpretation rejects invented commands and free commands do not spend',async()=>{
 let calls=0;const service=createWorldCommand({apiKey:'fake',budget:{reserve:async()=>{calls++}},fetchImpl:async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({kind:'add-animal',target:'unicorn',value:'',count:1})}}]}))});
 const input={consent:true,question:'plant food',replay:createLivingWorld(land).toReplay(),canDive:true,underwater:false};assert.equal((await service.run(input)).command.kind,'plant-food');assert.equal(calls,0);await assert.rejects(()=>service.run({...input,question:'Could a new creature appear from the sky please'}));assert.equal(calls,1);
});
test('cancellation or an incomplete budget reservation stops before any provider call',async()=>{
 const input={consent:true,animal:'monkey',replay:createLivingWorld(land).toReplay()};let calls=0,reservations=0;
 const make=budget=>createNewNeighbour({apiKey:'fake',budget,fetchImpl:async()=>{calls++;throw Error('No call expected')}});
 const stopped=new AbortController();stopped.abort();await assert.rejects(()=>make({reserve:async()=>{reservations++}}).run(input,{signal:stopped.signal}));assert.equal(reservations,0);assert.equal(calls,0);
 await assert.rejects(()=>make({reserve:async()=>{if(++reservations===2)throw Error('Allowance exhausted')}}).run(input));assert.equal(calls,0);
});
test('an incompatible animal design stops before spending an image call',async()=>{
 let calls=0;const service=createNewNeighbour({apiKey:'fake',budget:{reserve:async()=>{}},fetchImpl:async()=>{calls++;return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({animal:'Flying fish',look:'blue fish',zone:'water',motion:'fly',family:'fish',fits:true})}}]}))}});
 await assert.rejects(()=>service.run({consent:true,animal:'fish',replay:createLivingWorld(land).toReplay()}));assert.equal(calls,1);
});
test('Spark understands how children ask, and every activity is a real controller',()=>{
 const plan=SAVED_WORLDS.woodland.plan,context={plan,companions:[]},kind=q=>parseWorldCommand(q,context)?.kind;
 for(const q of ['can you add a fox','Could you add a fox please','i want a fox','spark add a fox','bring a fox','get rid of the fox','take away a mouse'])assert.ok(['add-animal','remove-animal'].includes(kind(q)),q);
 for(const [q,value] of [['make the fox sleep','sleep'],['put the owl to bed','sleep'],['Can you make the mouse run?','run'],['feed the fox','eat'],['wake the fox up','auto'],['wake up the owl','auto'],['let the fox rest','rest'],['make the owl walk','move']]){const c=parseWorldCommand(q,context);assert.equal(c.kind,'set-activity',q);assert.equal(c.value,value,q)}
 assert.throws(()=>parseWorldCommand('make the dragon sleep',context),/no dragon/);
 assert.equal(kind('where is the owl'),'focus-animal');assert.equal(kind('add a dragon'),'generate-animal');assert.equal(kind('stop the rain'),'weather');
 assert.equal(parseWorldCommand('put a tree by the pond',context),null);
 assert.throws(()=>validateWorldCommand({kind:'set-activity',target:'Woodland Fox',value:'dance'},context));
 const w=createLivingWorld(plan,5),fox=w.snapshot().agents.find(a=>plan.inhabitants[a.type].name==='Woodland Fox');w.setActivity(fox.id,'sleep');for(let i=0;i<6;i++)w.step();assert.equal(w.snapshot().agents.find(a=>a.id===fox.id).activity,'sleeping');
 const frame=w.snapshot();assert.match(worldFact('how many foxes are there?',{plan,frame}),/Woodland Fox/);assert.match(worldFact('how much food is left',{plan,frame}),/food/);assert.equal(worldFact('why is the food going down',{plan,frame}),null);assert.match(worldFact('what eats the mouse?',{plan,frame}),/Woodland Owl and Woodland Fox hunt Wood Mouse/);assert.match(worldFact('what hunts the fox',{plan,frame}),/Nothing hunts/);
});
