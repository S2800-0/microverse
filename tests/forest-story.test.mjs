import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createStorySession,foodFinding} from '../src/scene/story-session.ts';
import {experimentFromReplay,createExperiment} from '../src/scene/experiment.ts';
import {createActorTrack,distancePhase} from '../src/motion/actor-track.js';

test('story observations and replay come from the unchanged paired model, independent of presentation reads',()=>{
  const story=createStorySession(),first=story.frameAt(0),last=story.frameAt(13);
  assert.deepEqual(first.baseline.food,first.changed.food);
  assert(first.changed.animals.some(a=>a.id===story.subjectId&&a.species==='rabbit'));
  const expected=createExperiment(story.initial,{kind:'rain',rain:.5,durationWeeks:52}).seek(13);
  assert.equal(last.baseline.grass,expected.baseline.grass);
  assert.equal(last.changed.grass,expected.changed.grass);
  assert.deepEqual(last.changed.counts,expected.changed.counts);
  first.changed.food.fill(-99);last.changed.animals[0].x=-99;
  assert(story.frameAt(0).changed.food.every(n=>n>=0));
  assert(story.frameAt(13).changed.animals.every(a=>a.x>=0));
  const replay=story.replay('I think plants change first.','Less food. It grew more slowly.');
  const restored=experimentFromReplay(JSON.parse(JSON.stringify(replay))).getState();
  assert.equal(restored.changed.grass,expected.changed.grass);
  assert.deepEqual(restored.changed.world.events,expected.changed.world.events);
  assert.equal(replay.prediction,'I think plants change first.');
  assert.equal(replay.reflection,'Less food. It grew more slowly.');
  for(const invalid of [-1,14,.5,NaN])assert.throws(()=>story.frameAt(invalid));
});

test('highlighted patch is an actual open food cell and wording accepts all directions of change',()=>{
  const story=createStorySession(),frame=story.frameAt(13),patch=story.patch;
  assert(frame.changed.open[patch.cell]);assert.equal(Math.floor(patch.y)*frame.changed.width+Math.floor(patch.x),patch.cell);
  assert.equal(foodFinding(.8,.5),'Less grass food here');
  assert.equal(foodFinding(.5,.8),'More grass food here');
  assert.equal(foodFinding(.5,.505),'About the same grass food');
  assert.throws(()=>foodFinding(.5,NaN));
});

test('movement reaches a destination without overshoot, turns before travel and stop cancels movement',()=>{
  const actor=createActorTrack({x:100,y:200,speed:80});actor.goTo(180,200);
  let pose;for(let i=0;i<20;i++)pose=actor.tick(.1);
  assert.equal(pose.x,180);assert.equal(pose.distance,80);assert.equal(pose.moving,false);
  actor.goTo(20,200);pose=actor.tick(.1);assert(pose.turning);assert.equal(pose.x,180);
  actor.tick(.2);pose=actor.tick(.5);assert.equal(pose.direction,-1);assert(pose.x<180&&pose.x>=20);
  actor.stop();const stopped=actor.tick(0);assert.deepEqual(actor.tick(3),stopped);
  assert.equal(distancePhase(80,330),distancePhase(160,660));
  assert.throws(()=>actor.tick(-1));assert.throws(()=>actor.goTo(NaN,5));assert.throws(()=>distancePhase(10,0));
});
