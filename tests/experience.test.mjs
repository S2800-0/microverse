import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canUseForest,validateSceneCheck,routeMessage,photoRouteDestination} from '../src/experience/photo-routing.js';
import {startModel,loadDiscovery,observationChoices} from '../src/experience/model-session.ts';
import {createPhotoCheck} from '../server/photo-check.mjs';
const review={grass:'seen',tree:'seen',water:'unsure'};
const start=(food='Some')=>startModel({food,review});

test('unsupported photos and unresolved plant clues cannot silently become a forest',()=>{
  for(const kind of ['animal','plant-closeup','other-landscape','object','unclear']){
    assert.equal(canUseForest(kind,review),false);assert.throws(()=>startModel({food:'Some',review,route:kind}));assert(routeMessage(kind).text.length>10);
  }
  const no={grass:'not-visible',tree:'unsure',water:'seen'};
  assert.equal(canUseForest('greenspace',no),false);assert.throws(()=>startModel({food:'Some',review:no}));
  assert.equal(canUseForest('greenspace',{...no,tree:'seen'}),true);
  assert.equal(canUseForest('greenspace',null),false);
  assert.throws(()=>startModel({food:'Some',review:{grass:'seen'}}));
});
test('vision uncertainty never becomes automatic approval, and unexpected values are rejected',()=>{
  assert.equal(validateSceneCheck({kind:'greenspace',certainty:'uncertain',features:{grass:true,tree:null,water:false}}).kind,'unclear');
  for(const x of [{kind:'forest',certainty:'clear',features:{}},{kind:'greenspace',certainty:'clear',features:{grass:100,tree:true,water:false}},{kind:'greenspace',certainty:'clear',features:{grass:true,tree:false,water:null},code:'execute'}])assert.throws(()=>validateSceneCheck(x));
});
test('both branches start identical and retain curated rules; reviewed food changes real outcomes',()=>{
  const low=start('A little'),high=start('Lots');
  const a=low.getState().baseline.world.toSnapshot(),b=low.getState().changed.world.toSnapshot();
  assert.equal(a.interventions.length,0);assert.equal(b.interventions.length,1);
  assert.deepEqual({...a,interventions:[]},{...b,interventions:[]});
  assert.deepEqual(low.getState().baseline.world.params,high.getState().baseline.world.params);
  assert(Math.abs(low.getState().baseline.grass-.25)<1e-6);assert(Math.abs(high.getState().baseline.grass-.85)<1e-6);
  low.seek(13);high.seek(13);assert.notEqual(low.getState().changed.grass,high.getState().changed.grass);
  assert(low.getState().changed.grass<low.getState().baseline.grass);
  assert.notEqual(low.getState().changed.counts.rabbit,high.getState().changed.counts.rabbit);
});
test('rewinding and reopening replay reproduces actual state and records, with no photo data',()=>{
  const s=start().setPrediction('Not sure');s.seek(13);const before=s.getState().changed.world.toSnapshot();
  const choices=observationChoices(s),file=s.export([choices[0].id]);
  assert(!JSON.stringify(file).includes('data:image'));assert(!Object.hasOwn(file.context,'image'));
  s.seek(0);s.seek(13);assert.deepEqual(s.getState().changed.world.toSnapshot(),before);
  const restored=loadDiscovery(JSON.parse(JSON.stringify(file))).session;assert.deepEqual(restored.getState().changed.world.toSnapshot(),before);
  assert.equal(restored.experiment.toReplay().prediction,'Not sure');restored.seek(52);s.seek(52);assert.deepEqual(restored.getState().changed.world.toSnapshot(),s.getState().changed.world.toSnapshot());
  const atYear=loadDiscovery(JSON.parse(JSON.stringify(s.export()))).session;
  assert.equal(atYear.getState().elapsed,52);assert.deepEqual(atYear.getState().changed.world.toSnapshot(),s.getState().changed.world.toSnapshot());
  assert.throws(()=>s.export(['grass','grass']));
});
test('forged rules, mismatched initial food, wrong scenario and invented evidence cannot be reopened',()=>{
  const s=start();s.seek(13);const file=s.export();
  for(const mutate of [x=>x.replay.initial.world.params.species.rabbit.speed=999,x=>x.context.startingFood.label='Lots',x=>x.replay.scenario.rain=1.5,x=>x.selectedEvidenceIds=['imaginary.event'],x=>x.replay.initial.world.grass[500]=.99]){
    const bad=structuredClone(file);mutate(bad);assert.throws(()=>loadDiscovery(bad));
  }
  const extra=structuredClone(file);extra.context.review.image='data:image/png;base64,private';const loaded=loadDiscovery(extra).session.export();assert(!JSON.stringify(loaded).includes('private'));
});
test('observation wording follows actual comparisons, including unexpected population directions',()=>{
  const s=start();s.seek(26);const choices=observationChoices(s);const rabbit=choices.find(o=>o.id==='population.rabbit');
  assert.equal(rabbit.text,'More rabbits');assert.equal(rabbit.difference,s.getState().changed.counts.rabbit-s.getState().baseline.counts.rabbit);
});
function png(){const b=Buffer.alloc(33);Buffer.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82]).copy(b);b.writeUInt32BE(2,16);b.writeUInt32BE(2,20);return 'data:image/png;base64,'+b.toString('base64')}
test('optional vision requires funding and consent, uses fixed model, caches and never retries',async()=>{
  let calls=0,reserves=0;
  const result={kind:'object',certainty:'clear',features:{grass:false,tree:false,water:false}};
  const fetchImpl=async(url,opts)=>{calls++;const body=JSON.parse(opts.body);assert.equal(url,'https://inference.baseten.co/v1/chat/completions');assert.equal(body.model,'meta-models/muse-spark-open-1026');assert.equal(opts.redirect,'error');return new Response(JSON.stringify({choices:[{finish_reason:'tool_calls',message:{tool_calls:[{function:{name:'check_scene',arguments:JSON.stringify(result)}}]}}]}))};
  const config={enabled:true,creditsConfirmed:true,apiKey:'fixture',budget:{async reserve(){reserves++}},fetchImpl};
  const off=createPhotoCheck({...config,enabled:false});await assert.rejects(off.run({image:png(),consent:true}));assert.equal(calls,0);
  assert.equal(createPhotoCheck({...config,enabled:'0'}).status().enabled,false);
  assert.equal(createPhotoCheck({...config,creditsConfirmed:false}).status().enabled,false);
  const on=createPhotoCheck(config);await assert.rejects(on.run({image:png(),consent:false}));assert.equal(reserves,0);
  assert.equal((await on.run({image:png(),consent:true})).kind,'object');assert.equal((await on.run({image:png(),consent:true})).cached,true);assert.equal(calls,1);assert.equal(reserves,1);
  const fail=createPhotoCheck({...config,fetchImpl:async()=>{calls++;return new Response('',{status:503})}});await assert.rejects(fail.run({image:png(),consent:true}));assert.equal(calls,2);assert.equal(reserves,2);
});

import {placeCoachmark} from '../src/experience/coachmarks.js';
import {PLACE_LIBRARY} from '../src/experience/library.js';
import {NARRATION,narrationKey} from '../src/experience/narration.js';
import {readFileSync,existsSync} from 'node:fs';

test('tutorial notes stay inside phone/desktop viewports around edge targets',()=>{
  for(const viewport of [{width:390,height:844},{width:320,height:568},{width:1280,height:800},{width:2560,height:1440}]){
    for(const target of [{left:20,top:95,width:180,height:60},{left:viewport.width-160,top:viewport.height-80,width:140,height:60},{left:viewport.width/2-50,top:viewport.height/2-30,width:100,height:60}]){
      const rect={...target,right:target.left+target.width,bottom:target.top+target.height};
      const p=placeCoachmark(rect,viewport,{height:236});
      assert(p.x>=16&&p.y>=16);assert(p.x+p.width<=viewport.width-16);assert(p.y+236<=viewport.height-16);
    }
  }
});
test('three photo choices use local files and only garden claims saved SAM',()=>{
  assert.deepEqual(PLACE_LIBRARY.map(p=>p.id),['garden','woodland','reef']);
  assert.equal(PLACE_LIBRARY.filter(p=>p.kind==='sample').length,1);
  for(const p of PLACE_LIBRARY){assert(p.src.startsWith('/assets/'));assert(existsSync(new URL('../public'+p.src,import.meta.url)));assert(p.credit);if(p.id!=='reef')assert(p.source.startsWith('https://commons.wikimedia.org/'));else assert.equal(p.source,null);assert(p.width<=1600&&p.height<=1600)}
});
test('every narrated state maps to a real prepared clip and the same fixed script',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../public/audio/credits.json',import.meta.url)));
  for(const [id,text] of Object.entries(NARRATION)){const clip=manifest.clips.find(c=>c.id===id);assert.equal(clip.text,text);const bytes=readFileSync(new URL('../public/audio/'+clip.file,import.meta.url));assert(bytes.length>1000);}
  assert.equal(narrationKey('review',2),'review_grass');assert.equal(narrationKey('camera'),null);assert.equal(narrationKey('watch'),'watch');
});

test('tutorial notes avoid the question when there is space above the photo',()=>{
  const target={left:220,right:586,top:277,bottom:762,width:366,height:485};
  const question={left:794,right:1260,top:350,bottom:585};
  const p=placeCoachmark(target,{width:1487,height:1058},{height:160},[question]);
  assert(p.x+p.width<=question.left||p.x>=question.right||p.y+160<=question.top||p.y>=question.bottom);
  assert(p.x+p.width<=target.left||p.x>=target.right||p.y+160<=target.top||p.y>=target.bottom);
});

import {backNavigation,creatureBackLabel} from '../src/experience/navigation.js';
test('back destinations distinguish a saved world, uploaded photo, review step and edited prediction',()=>{
 assert.deepEqual(backNavigation('living-world',{photo:{id:'garden'}}),{to:'library',label:'Choose a world'});
 assert.deepEqual(backNavigation('living-world',{photo:{kind:'personal'}}),{to:'triage',label:'Your photo'});
 assert.deepEqual(backNavigation('review',{review:2}),{to:'previous-review',label:'Tree check'});
 assert.equal(backNavigation('predict',{elapsed:13}).to,'watch');assert.equal(backNavigation('predict',{elapsed:0}).to,'assumptions');
 assert.equal(creatureBackLabel('pet-look','personal'),'Their details');assert.equal(creatureBackLabel('pet-look','recorded-pair'),'Choose a creature');
});
test('changing a prediction preserves the elapsed experiment and measured results',()=>{
 const a=start('Lots');a.seek(13);const before=a.getState(),b=a.setPrediction('The animals');assert.equal(b.getState().elapsed,13);assert.deepEqual(b.getState().changed.counts,before.changed.counts);assert.deepEqual(b.getState().baseline.counts,before.baseline.counts);assert.equal(a.getState().elapsed,13);assert.equal(b.export().replay.prediction,'The animals');
});

// Regression: these previously routed a new photo into the fixed meadow lesson.
test('new landscape routes enter the photo world builder, never the prepared meadow',()=>{
  for(const kind of ['greenspace','plant-closeup','other-landscape'])assert.equal(photoRouteDestination(kind),'world-paint');
  assert.equal(photoRouteDestination('animal'),'route-help');
  assert.equal(photoRouteDestination('other'),'other-kind');
  assert.equal(photoRouteDestination('unclear'),'route-help');
  assert(!routeMessage('other-landscape').text.includes('working experiment is a meadow'));
});

import {createVoiceCues} from '../src/experience/voice-cues.js';
import {preparedQuestion} from '../src/spark/prepared-questions.js';
test('automatic voice waits for the visible step, prioritizes hints, and does not repeat the same cue',()=>{
 const jobs=new Map();let id=0,heard=[];const cues=createVoiceCues({schedule:(fn,delay)=>{jobs.set(++id,{fn,delay});return id},cancel:key=>jobs.delete(key)});
 const flush=()=>{const work=[...jobs.values()];jobs.clear();work.forEach(j=>j.fn())};
 cues.begin('predict');cues.automatic('predict',1,()=>heard.push('screen'));assert.equal(heard.length,0);
 cues.automatic('hint_predict',2,()=>heard.push('hint'));assert.equal(jobs.size,1);flush();assert.deepEqual(heard,['hint']);
 assert.equal(cues.automatic('predict',1,()=>heard.push('screen')),false);assert.equal(cues.automatic('hint_predict',2,()=>heard.push('repeat')),false);
 cues.manual(()=>heard.push('explicit replay'));assert.equal(heard.at(-1),'explicit replay');
 cues.begin('watch');cues.automatic('watch',1,()=>heard.push('watch'));cues.stop('watch');flush();assert(!heard.includes('watch'));
 cues.begin('predict');cues.automatic('hint_predict',2,()=>heard.push('new visit'));flush();assert.equal(heard.at(-1),'new visit');
});
test('common typed questions map to free prepared answers, without pretending to answer unsupported requests',()=>{
 for(const q of ['What are they eating?','what do the animals eat','Where are the plants?'])assert.equal(preparedQuestion(q,{world:true}),'What are they eating?');
 assert.equal(preparedQuestion('What is happening?',{world:true}),'What just happened?');assert.equal(preparedQuestion('What if it rains less?',{world:true}),'What can I change?');
 assert.equal(preparedQuestion('Why did the grass change?'),'Why did the grass change?');assert.equal(preparedQuestion('Can monkeys solve arithmetic?',{world:true}),null);
});

import {routeHash,parseRoute,canShow} from '../src/experience/navigation.js';
test('header Back never loops and every lesson screen has a way out',()=>{
 const photo={id:'garden',kind:'sample'};
 assert.deepEqual(backNavigation('watch',{elapsed:13,photo}),{to:'assumptions',label:'Food choice'});
 assert.equal(backNavigation('watch',{elapsed:0,photo}).to,'predict');
 assert.equal(backNavigation('watch',{elapsed:52}).to,'home');
 assert.equal(backNavigation('finish').to,'start-own');assert.equal(backNavigation('forest').to,'finish');
 // Walk Back from each screen after time has passed: it must reach Home without revisiting a screen.
 for(const start of ['explain','recap','start-own','finish','forest','watch']){
  const seen=new Set();let screen=start;
  while(screen!=='home'){assert(!seen.has(screen),start+' loops at '+screen);seen.add(screen);
   screen=backNavigation(screen,{elapsed:52,photo}).to;
   if(screen==='review')screen='library';}
 }
});
test('route help returns to where the child actually came from',()=>{
 const photo={kind:'personal'};
 assert.equal(backNavigation('route-help',{photo,route:'unclear'}).to,'other-kind');
 assert.equal(backNavigation('route-help',{photo,route:'object'}).to,'other-kind');
 assert.equal(backNavigation('route-help',{photo,route:'animal'}).to,'triage');
 assert.equal(backNavigation('route-help',{photo:{id:'garden',kind:'sample'},route:'no-clues'}).to,'review');
 assert.equal(backNavigation('library',{fromAdventure:true}).to,'start-own');
 assert.equal(backNavigation('pet-collection',{fromAdventure:true}).to,'start-own');
 assert.equal(backNavigation('library').to,'home');
});
test('browser history restores only screens that can really draw',()=>{
 assert.equal(routeHash('home'),'');assert.equal(routeHash('library'),'#/library');
 assert.equal(routeHash('living-world',{id:'reef'}),'#/living-world/reef');
 assert.deepEqual(parseRoute('#/library',['garden']),{screen:'library'});
 assert.deepEqual(parseRoute('#/living-world/garden',['garden']),{screen:'living-world',placeId:'garden'});
 for(const hash of ['','#/watch','#/living-world','#/living-world/mars','#/nonsense'])assert.equal(parseRoute(hash,['garden']).screen,'home');
 assert.equal(canShow('triage',{photo:{id:'garden',kind:'sample'}}),false);
 assert.equal(canShow('triage',{photo:{kind:'personal'}}),true);
 assert.equal(canShow('watch',{}),false);assert.equal(canShow('forest',{}),false);assert.equal(canShow('living-world',{}),false);
 assert.equal(canShow('pet-motion',{}),false);assert.equal(canShow('pet-collection',{}),true);assert.equal(canShow('home',{}),true);
});
