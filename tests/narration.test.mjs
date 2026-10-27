import {test} from 'node:test';
import assert from 'node:assert/strict';
import {forestNarration,narrationSnapshot,comparisonNarration,createNarrator} from '../src/scene/narration.js';
import {createForestController} from '../src/scene/controller.ts';
import {createExperiment} from '../src/scene/experiment.ts';
import {buildEvidence} from '../src/investigation/evidence.js';

const local={name:'Local English',lang:'en-US',localService:true,default:true};
function fixture(voices=[local]){
  let clock=0,cancels=0;const spoken=[],listeners=new Map();
  const speech={getVoices:()=>voices,cancel:()=>cancels++,speak:u=>spoken.push(u),addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
  const narrator=createNarrator({speech,Utterance:class{constructor(text){this.text=text;}},now:()=>clock});
  return {narrator,spoken,listeners,speech,advance:n=>clock+=n,cancels:()=>cancels,setVoices:value=>{voices=value;listeners.get('voiceschanged')?.();}};
}
test('forest captions summarize actual deltas and events without personal creature names',()=>{
  const forest=createForestController(),before=narrationSnapshot(forest.getState());
  forest.add({species:'dog',name:'PRIVATE NAME'});
  const text=forestNarration(before,forest.getState());
  assert(text.includes('1 more dog'));assert(text.includes('1 arrival'));assert(!text.includes('PRIVATE NAME'));
  assert(!text.includes('because'));assert.equal(before.counts.dog,0);
  assert(forestNarration(null,forest.getState()).includes('55 creatures'));
});
test('comparison captions render exact packet differences and avoid causal explanations or learner notes',()=>{
  const e=createExperiment(createForestController().toSnapshot(),{kind:'rain',rain:.5,durationWeeks:52},'PRIVATE PREDICTION','PRIVATE QUESTION');
  assert(comparisonNarration(buildEvidence(e)).includes('Both worlds start from the same forest'));
  e.seek(13);const packet=buildEvidence(e),text=comparisonNarration(packet),grass=packet.observations.find(v=>v.id==='grass');
  assert(text.includes(`${Math.abs(grass.difference)} percentage points lower`));assert(text.includes('not proof of a cause'));assert(!text.includes('PRIVATE'));
});
test('narration leaves the model, event log and random continuation unchanged',()=>{
  const a=createForestController(),b=createForestController();
  for(let week=0;week<8;week++){
    const before=narrationSnapshot(a.getState());a.step();b.step();
    const recorded=a.toSnapshot();forestNarration(before,a.getState());
    assert.deepEqual(a.toSnapshot(),recorded);
  }
  assert.deepEqual(a.toSnapshot(),b.toSnapshot());
});
test('narration starts off, selects only local English speech and cancels immediately when switched off',()=>{
  const f=fixture([{...local,name:'Remote',localService:false},local]),n=f.narrator;
  n.say('Model week 1.');assert.equal(f.spoken.length,0);assert.equal(n.state().enabled,false);
  n.setEnabled(true);assert.equal(f.spoken.length,1);assert.equal(f.spoken[0].voice,local);
  n.setEnabled(false);assert.equal(n.state().speaking,false);assert(f.cancels()>0);
  f.spoken[0].onend();assert.equal(n.state().enabled,false);assert.equal(n.state().speaking,false);
});
test('fast playback neither queues speech nor interrupts a reading, and manual seeking replaces it',()=>{
  const f=fixture(),n=f.narrator;n.say('Week 0.');n.setEnabled(true);
  f.advance(9000);n.say('Week 1.',{automatic:true});assert.equal(f.spoken.length,1);
  f.spoken[0].onend();n.say('Week 2.',{automatic:true});assert.equal(f.spoken.length,2);
  n.say('Week 13.');assert.equal(f.spoken.length,3);assert.equal(n.state().text,'Week 13.');
  f.spoken[1].onend();assert.equal(n.state().speaking,true); // stale completion cannot end the newer reading
  f.spoken[2].onend();f.advance(1000);n.say('Week 14.',{automatic:true});assert.equal(f.spoken.length,3);
  n.stop();assert.equal(n.state().speaking,false);
});
test('caption-only mode works without APIs or local voices; remote/default voices are never used',()=>{
  const f=fixture([{...local,localService:false},{...local,lang:'fr-FR'}]),n=f.narrator;
  n.context('Week 1.');n.setEnabled(true);assert.equal(n.state().text,'Week 1.');assert.equal(n.state().canSpeak,false);assert.equal(f.spoken.length,0);
  const absent=createNarrator();absent.say('Week 2.');absent.setEnabled(true);assert.equal(absent.state().text,'Week 2.');assert.equal(absent.state().canSpeak,false);
  f.setVoices([local]);assert.equal(n.state().canSpeak,true);assert.equal(f.spoken.length,0);
  n.repeat();assert.equal(f.spoken.length,1);n.setVoice(false);n.say('Week 3.');assert.equal(f.spoken.length,1);assert.equal(n.state().text,'Week 3.');
  n.dispose();assert.equal(f.listeners.size,0);
});
test('speech failure keeps captions and context changes cancel stale audio',()=>{
  const f=fixture(),n=f.narrator;n.say('Forest.');n.setEnabled(true);f.spoken[0].onerror();
  assert.equal(n.state().canSpeak,false);assert.equal(n.state().text,'Forest.');
  n.context('Experiment week 0.');assert.equal(n.state().text,'Experiment week 0.');assert.equal(f.spoken.length,1);
  n.setVoice(true);assert.equal(f.spoken.length,2);assert.equal(f.spoken[1].text,'Experiment week 0.');
});
