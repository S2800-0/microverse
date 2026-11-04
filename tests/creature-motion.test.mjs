import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chooseBehaviour,deformPoint,poseFor,posesFromCells,poseRow,warpFor} from '../src/world/creature-motion.js';
import {creaturePosePrompt,worldPosePrompt} from '../src/core/creature/pose-sheet.js';
import {creatureDesignPrompt} from '../src/core/creature/identity.js';
test('behaviour: eating and sleeping beat moving, and swimmers never lie down',()=>{
 assert.equal(chooseBehaviour({motion:'walk',moving:true,activity:'eating'}),'eat');
 assert.equal(chooseBehaviour({motion:'walk',moving:true,activity:'sleeping'}),'sleep');
 assert.equal(chooseBehaviour({motion:'walk',moving:true,fast:true}),'run');
 assert.equal(chooseBehaviour({motion:'walk',moving:false}),'idle');
 assert.equal(chooseBehaviour({motion:'fly',moving:true}),'fly');
 assert.equal(chooseBehaviour({motion:'swim',moving:true,fast:true}),'run');
 assert.equal(warpFor('sleep','swim'),'idle');assert.equal(warpFor('run','swim'),'swim');assert.equal(warpFor('sleep','walk'),'sleep');
});
test('motion field has no tears: close points stay close in every behaviour',()=>{
 for(const b of ['walk','run','eat','sleep','rest','idle','swim','fly','hop'])for(const t of [0,.4,1.7,5.3])for(let x=0;x<1;x+=.04)for(let y=0;y<1;y+=.04){
  const a=deformPoint(x,y,b,t),c=deformPoint(x+.01,y,b,t),d=deformPoint(x,y+.01,b,t);
  assert.ok(Math.hypot(a.x-c.x,a.y-c.y)<.06,b+' tears across x at '+x);assert.ok(Math.hypot(a.x-d.x,a.y-d.y)<.06,b+' tears across y at '+y);
 }
});
test('feet stay planted while eating and sleep lowers the body',()=>{
 const foot=deformPoint(.75,1,'eat',1);assert.ok(Math.abs(foot.y-1)<.01&&Math.abs(foot.x-.75)<.01);
 const head=deformPoint(.82,.3,'eat',1);assert.ok(head.y>.45,'head goes down');
 assert.ok(deformPoint(.3,.3,'sleep',1).y>.5,'back comes down');assert.ok(Math.abs(deformPoint(.3,1,'sleep',1).y-1)<.001,'ground stays');
});
test('drawn poses are picked by behaviour and missing ones fall back',()=>{
 const poses={eat:'E',sleep:'S',runA:'A',runB:'B'};
 assert.equal(poseFor('eat',1,0,poses).texture,'E');assert.equal(poseFor('sleep',1,0,poses).texture,'S');assert.ok(['A','B'].includes(poseFor('run',1,0,poses).texture));assert.ok(['A','B'].includes(poseFor('fly',1,0,poses).texture));
 assert.equal(poseFor('walk',1,0,poses),null);assert.equal(poseFor('eat',1,0,{}),null);assert.equal(poseFor('eat',1,0,null),null);
 assert.deepEqual(posesFromCells(['a','b','c','d','e','f','g','h'],1),{eat:'e',sleep:'f',runA:'g',runB:'h'});assert.deepEqual(posesFromCells(['a'],-1),{});
 assert.equal(poseRow([{id:0,role:'producer'},{id:1,role:'grazer'},{id:2,role:'predator'}],2),1);assert.equal(poseRow([{id:0,role:'producer'}],0),-1);
});
test('pose and paint prompts face right and drop loose props',()=>{
 for(const family of ['quadruped','primate','bird','fish','other']){const p=creatureDesignPrompt({identity:{animal:'x',family,certainty:'clear',features:[]},appearance:''});assert.match(p,/[Rr]ight-facing/);assert.match(p,/no leads, ropes/)}
 assert.match(creaturePosePrompt({animal:'fish',family:'fish',features:[]}),/TOP LEFT: nibbling/);assert.match(creaturePosePrompt({animal:'dog',family:'quadruped',features:[]}),/lying down/);
 assert.match(worldPosePrompt([{name:'fox',look:'red',family:'default'},{name:'owl',look:'brown',family:'bird'}]),/2 ROWS and 4 COLUMNS/);
});
