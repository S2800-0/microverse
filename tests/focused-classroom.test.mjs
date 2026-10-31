import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createStorySession} from '../src/scene/story-session.ts';
import {createExperiment,experimentFromReplay} from '../src/scene/experiment.ts';
import {acceptsStoryMessage} from '../src/scene/story-host.js';
import {createStoryVoice} from '../src/scene/story-voice.js';
import {createStoryWorld} from '../src/scene/story-world.js';
import {storyDownloadLinks} from '../src/scene/story-export.js';

test('hiding and reopening a lesson keeps its last positive viewport and finite camera coordinates',()=>{
  const previousObserver=globalThis.ResizeObserver,previousRatio=globalThis.devicePixelRatio;
  let resize,bounds={width:800,height:600};
  globalThis.devicePixelRatio=1;
  globalThis.ResizeObserver=class{constructor(callback){resize=callback;}observe(){}disconnect(){}};
  const methods={createRadialGradient(...values){assert(values.every(Number.isFinite));return {addColorStop(){}};}};
  const context=new Proxy(methods,{get:(object,key)=>object[key]??(()=>{}),set:(object,key,value)=>{object[key]=value;return true;}});
  const canvas={getContext:()=>context,getBoundingClientRect:()=>bounds};
  try{
    const story=createStorySession(),world=createStoryWorld(canvas,{map:{},rabbit:{naturalWidth:640,naturalHeight:640}},story);
    world.draw(story.frameAt(0),story.frameAt(1),0,{showFood:true,dt:.016});
    bounds={width:0,height:0};resize();assert.equal(canvas.width,800);assert.equal(canvas.height,600);
    bounds={width:390,height:844};resize();
    const result=world.draw(story.frameAt(1),story.frameAt(2),.5,{showFood:true,dt:.016});
    assert(Number.isFinite(result.patch.x));assert(Number.isFinite(result.patch.y));world.destroy();
  }finally{globalThis.ResizeObserver=previousObserver;globalThis.devicePixelRatio=previousRatio;}
});

test('only the owned, same-origin lesson may request a host close or readiness update',()=>{
  const source={},origin='https://microverse.example',context={origin,source};
  const event={source,origin,data:{type:'microverse.story.close'}};
  assert(acceptsStoryMessage(event,context));
  assert(acceptsStoryMessage({...event,data:{type:'microverse.story.ready'}},context));
  for(const variant of [{...event,origin:'https://other.example'},{...event,source:{}},{...event,data:null},
    {...event,data:{type:'microverse.story.close',snapshot:'extra'}},{...event,data:{type:'microverse.story.execute'}},
    {...event,data:['microverse.story.close']}])assert.equal(acceptsStoryMessage(variant,context),false);
  assert.equal(acceptsStoryMessage(event,{origin,source:null}),false);
});

test('the wetter prepared story matches the original model and preserves all learner fields in replay',()=>{
  const story=createStorySession(7,'wet'),expected=createExperiment(story.initial,{kind:'rain',rain:1.5,durationWeeks:52}).seek(13);
  assert.equal(story.frameAt(13).changed.grass,expected.changed.grass);
  const file=story.replay('Plant food','More food. I noticed taller strokes.','At school. Look for plants and insects.');
  const restored=experimentFromReplay(JSON.parse(JSON.stringify(file))).getState();
  assert.deepEqual(restored.changed.world.toSnapshot(),expected.changed.world.toSnapshot());
  assert.equal(file.activity.connection,'At school. Look for plants and insects.');
  assert.equal(file.prediction,'Plant food');assert.equal(file.reflection,'More food. I noticed taller strokes.');
  assert.throws(()=>createStorySession(7,'unknown'));
  assert.throws(()=>story.replay('','', 'x'.repeat(1001)));
  assert.equal(story.replay('','x'.repeat(930),'x'.repeat(930)).elapsed,13);
});

test('the close-up cites a real birth and a saved state containing that exact animal',()=>{
  const story=createStorySession(),moment=story.moment(),packet=story.evidence();assert(moment);
  assert(packet.events.some(e=>e.id===moment.eventId&&e.branch==='changed'));
  assert.equal(moment.event.type,'birth');assert.equal(moment.event.species,'rabbit');
  assert.equal(moment.record.week,moment.event.t);assert(moment.frameWeek>moment.event.t);
  const saved=story.frameAt(moment.frameWeek).changed.animals.find(a=>a.id===moment.animalId);
  assert(saved);assert.equal(saved.species,'rabbit');
  moment.event.id=-1;packet.events.length=0;
  assert(story.moment().event.id>0);assert(story.evidence().events.length>0);
});

test('a discovery card escapes learner text and embeds a model-only rerun without notes',()=>{
  const story=createStorySession(),note='<img src=x onerror=alert(1)>',connection='<script>private note</script>';
  const links=storyDownloadLinks(story,'Plant food',note,connection);
  assert(links.replay.startsWith('/discovery.html?view=experiment#'));
  assert(links.card.startsWith('/discovery.html#'));
  assert(links.card.length<1500000);
  const fullReplay=JSON.parse(decodeURIComponent(links.replay.split('#')[1]));
  assert.equal(fullReplay.reflection,note);assert.equal(fullReplay.activity.connection,connection);
  const html=story.worksheet('Plant food',note,connection);
  assert(!html.includes(note));assert(!html.includes(connection));
  assert(html.includes('&lt;img'));assert(html.includes('&lt;script&gt;private note'));
  const encoded=html.match(/href="data:application\/json;charset=utf-8,([^"]+)"/)[1];
  const rerun=JSON.parse(decodeURIComponent(encoded));
  assert.equal(rerun.reflection,'');assert.equal(rerun.prediction,'');assert.equal(rerun.activity,undefined);
  assert.deepEqual(rerun.initial.appearances,[]);assert.equal(experimentFromReplay(rerun).getState().elapsed,13);
});

function speakerFixture({deferred=false}={}){
  let ready=false,finish;const listeners=new Set(),spoken=[];let initializations=0;
  const speaker={getVoices:()=>ready?[{name:'Local natural voice',lang:'en-US',localService:true,default:true}]:[],
    addEventListener:(_,listener)=>listeners.add(listener),removeEventListener:(_,listener)=>listeners.delete(listener),cancel(){},
    speak(utterance){spoken.push(utterance.text);utterance.onend?.();},
    async initialize(){initializations++;if(deferred)await new Promise(resolve=>{finish=resolve;});ready=true;for(const listener of listeners)listener();},
  };
  return {speaker,spoken,finish:()=>finish(),initializations:()=>initializations};
}
test('story read-aloud initializes only on opt-in and follows the current guide caption',async()=>{
  const fixture=speakerFixture(),voice=createStoryVoice({speaker:fixture.speaker});
  voice.caption('Tap the rabbit to say hello.');assert.equal(fixture.initializations(),0);assert.deepEqual(fixture.spoken,[]);
  await voice.enable(true);assert.equal(fixture.initializations(),1);assert.deepEqual(fixture.spoken,['Tap the rabbit to say hello.']);
  voice.caption('Look at the highlighted meadow patch.');assert.equal(fixture.spoken.at(-1),'Look at the highlighted meadow patch.');
  await voice.enable(false);voice.caption('More rain changes the food.');assert.equal(fixture.spoken.length,2);voice.destroy();
});
test('turning read-aloud off during local voice discovery cannot start it later',async()=>{
  const fixture=speakerFixture({deferred:true}),voice=createStoryVoice({speaker:fixture.speaker});
  voice.caption('A guide caption.');const enabling=voice.enable(true);await Promise.resolve();
  await voice.enable(false);fixture.finish();await enabling;
  assert.deepEqual(fixture.spoken,[]);assert.equal(voice.state().enabled,false);voice.destroy();
});
