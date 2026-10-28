import {test} from 'node:test';
import assert from 'node:assert/strict';
import {journeyFrame} from '../src/scene/journey.js';

test('scroll choreography stays bounded and can rewind to the exact initial composition',()=>{
  const start=journeyFrame(0);
  for(const value of [-10,0,.27,.28,.67,.68,1,10,NaN,Infinity]){
    const frame=journeyFrame(value);
    assert(frame.camera>=1.025&&frame.camera<=1.195);
    assert(frame.foxLeft>=48&&frame.foxLeft<=62);
    assert(frame.chapter>=0&&frame.chapter<=2);
  }
  assert.equal(journeyFrame(.28).chapter,1);
  assert.equal(journeyFrame(.68).chapter,2);
  assert.deepEqual(journeyFrame(-1),start);
  assert.deepEqual(journeyFrame(NaN),start);
  assert.deepEqual(journeyFrame(2),journeyFrame(1));
});
