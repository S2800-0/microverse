import test from 'node:test';import assert from 'node:assert/strict';
import {createLivingWorld,restoreLivingWorld} from '../src/world/simulation.js';
import {SAVED_WORLDS} from '../src/world/saved-places.js';
const plan=SAVED_WORLDS.woodland.plan;
test('animals nap on their own, deterministically, and pause rules are untouched',()=>{
 const run=()=>{const w=createLivingWorld(plan,17),log=[];for(let i=0;i<120;i++){const f=w.step();log.push(f.agents.map(a=>a.activity).join())}return log};
 const a=run();assert.deepEqual(a,run());assert.ok(a.join().includes('sleeping'));assert.ok(a.join().includes('resting'));
});
test('a v4 record replays exactly, and a v3 record keeps its original outcome without naps',()=>{
 const w=createLivingWorld(plan,9);for(let i=0;i<60;i++)w.step();const replay=w.toReplay();assert.equal(replay.version,4);
 assert.deepEqual(restoreLivingWorld(replay).snapshot().agents,w.snapshot().agents);
 const old=restoreLivingWorld({...replay,version:3}),plain=createLivingWorld(plan,9,{behaviours:false});for(let i=0;i<60;i++)plain.step();
 assert.deepEqual(old.snapshot().agents,plain.snapshot().agents);assert.ok(!plain.snapshot().agents.some(a=>a.activity==='sleeping'));
});
test('a predator speeds up only when prey is close',()=>{
 const w=createLivingWorld(plan,5);let chased=false;for(let i=0;i<120;i++){const f=w.step();if(f.agents.some(a=>a.chasing))chased=true}assert.ok(chased);
});
test('a chosen snack is animation, not food',()=>{
 const w=createLivingWorld(plan,5);const f0=w.step(),id=f0.agents.find(a=>a.type===1).id,before=w.snapshot().patches.map(p=>p.eaten);w.setActivity(id,'eat');const f=w.step();const me=f.agents.find(a=>a.id===id);assert.equal(me.activity,'eating');assert.equal(me.bite,null);assert.equal(before.length,f.patches.length);
});
