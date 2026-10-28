import {test} from 'node:test';
import assert from 'node:assert/strict';
import {journeyFrame} from '../src/scene/journey.js';
import {foxSpriteRegion,foxWalkFrame} from '../src/motion/sprite-sheet.js';

test('scroll choreography stays bounded and can rewind to the exact initial composition',()=>{
  const start=journeyFrame(0);
  for(const value of [-10,0,.27,.28,.67,.68,1,10,NaN,Infinity]){
    const frame=journeyFrame(value);
    assert(frame.camera>=1.025&&frame.camera<=1.195);
    assert(frame.foxLeft>=48&&frame.foxLeft<=62);
    assert(frame.foregroundCamera>=frame.camera);
    assert(frame.foregroundShift>=0&&frame.foregroundShift<=3.5);
    assert(frame.chapter>=0&&frame.chapter<=2);
  }
  assert.equal(journeyFrame(.28).chapter,1);
  assert.equal(journeyFrame(.68).chapter,2);
  assert.deepEqual(journeyFrame(-1),start);
  assert.deepEqual(journeyFrame(NaN),start);
  assert.deepEqual(journeyFrame(2),journeyFrame(1));
});

test('the fox sheet wraps forward and backward without sampling neighbouring cells',()=>{
  for(const distance of [-150,-1,0,18.75,149.99,150,300])assert(foxWalkFrame(distance)>=0&&foxWalkFrame(distance)<8);
  assert.equal(foxWalkFrame(0),foxWalkFrame(150));
  assert.equal(foxWalkFrame(-1),7);
  assert.deepEqual(foxSpriteRegion(7),{x:1536,y:512,width:512,height:512});
  assert.throws(()=>foxSpriteRegion(8));assert.throws(()=>foxWalkFrame(NaN));
});
