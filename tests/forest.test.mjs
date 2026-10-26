import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createForestController} from '../src/scene/controller.ts';
import {buildTerrain,MEADOW_V2_TERRAIN} from '../src/scene/terrain.js';
import {World,SCENE_PARAMS} from '../src/sim/engine.ts';
import {validatePhotoFile} from '../src/scene/creature-import.js';

test('the same scene seed reproduces the model independently of selection',()=>{
  const a=createForestController(),b=createForestController();
  a.select(1);a.step(52);b.step(52);
  assert.deepEqual(a.getState().world.animals,b.getState().world.animals);
  assert.deepEqual(a.getState().world.events,b.getState().world.events);
  assert.equal(b.getState().selectedId,null);
});
test('custom identity is retained and reset clears image/rig memory',()=>{
  const c=createForestController({populated:false});
  const a=c.add({species:'dog',name:'Maple',image:'local-png',rig:{reviewed:true}});
  assert.equal(c.getState().appearances.get(a.id).name,'Maple');
  assert.equal(c.getState().selectedId,a.id);
  c.reset(false);assert.equal(c.getState().appearances.size,0);
  assert.equal(c.getState().selectedId,null);assert.equal(c.getState().animals.length,0);
});
test('terrain initialization, births and arrivals stay on open ground',()=>{
  const c=createForestController();
  for(let i=0;i<104;i++){
    const s=c.getState();
    for(const a of s.animals)assert(s.terrain.walkable(a.x,a.y/s.world.params.height*100),`animal ${a.id} at week ${i}`);
    c.step();
  }
});
test('a model change preserves an imported companion',()=>{
  const c=createForestController({populated:false});
  c.add({species:'dog',name:'Maple'});c.add({species:'wolf'});
  c.schedule('remove-wolves');c.step();
  assert.equal(c.getState().counts.wolf,0);assert.equal(c.getState().counts.dog,1);
  assert.equal(c.getState().appearances.get(c.getState().animals[0].id).name,'Maple');
  assert.throws(()=>c.schedule('invented'),/Unsupported/);
  assert.throws(()=>c.step(Infinity),/between/);
});
test('reset restores the same seed and initial resources',()=>{
  const c=createForestController(),original=structuredClone(c.getState().world.animals);
  const grass=Array.from(c.getState().world.grass);
  c.step(30);c.add({species:'cat'});c.reset(true);
  assert.deepEqual(c.getState().world.animals,original);
  assert.deepEqual(Array.from(c.getState().world.grass),grass);
});
test('terrain rejects invalid coordinates and checks both ends of a path',()=>{
  const t=buildTerrain(MEADOW_V2_TERRAIN);
  assert(!t.walkable(-1,50));assert(!t.walkable(NaN,20));assert(!t.walkable(100,50));
  assert(!t.clear(50,50,Infinity,20));assert(!t.clear(0,0,50,50));assert(!t.clear(50,50,0,0));
});
test('predators cannot walk or hunt across a blocked channel',()=>{
  const p=structuredClone(SCENE_PARAMS);p.width=20;p.height=20;p.initial={};delete p.immigration;
  const walkable=(x,y)=>x>=0&&y>=0&&x<20&&y<20&&(x<9||x>11);
  const traverse=(x0,y0,x1,y1)=>{for(let i=0;i<=100;i++)if(!walkable(x0+(x1-x0)*i/100,y0+(y1-y0)*i/100))return false;return true;};
  const w=new World(p,7,[],walkable,traverse);
  w.addCreature({species:'wolf',x:8,y:10});w.addCreature({species:'deer',x:12,y:10});
  for(let i=0;i<5;i++){
    const before=new Map(w.animals.map(a=>[a.id,{x:a.x,y:a.y}]));w.step();
    for(const a of w.animals.filter(a=>a.alive)){const b=before.get(a.id);if(b)assert(traverse(b.x,b.y,a.x,a.y));}
  }
  assert(!w.events.some(e=>e.type==='kill'));
});
test('fully blocked terrain fails instead of spawning in an obstacle',()=>{
  assert.throws(()=>new World(structuredClone(SCENE_PARAMS),7,[],()=>false),/no open ground/);
});
test('photo import rejects unsupported files and oversized inputs',()=>{
  validatePhotoFile({type:'image/png',size:100});
  assert.throws(()=>validatePhotoFile({type:'image/svg+xml',size:100}),/JPEG/);
  assert.throws(()=>validatePhotoFile({type:'image/png',size:11*1024*1024}),/10 MB/);
});
