import{test}from'node:test';import assert from'node:assert/strict';
import{encodeVoiceWav,validateVoiceWav,VOICE_RATE}from'../src/voice/audio.js';
import{createSpeechProvider,createSpeechService}from'../server/speech-service.mjs';
import{createQuestionRecorder}from'../src/voice/recorder.js';
import{createNaturalVoice}from'../server/natural-voice.mjs';
import{createNarrator}from'../src/scene/narration.js';
import{createPreviewServer}from'../scripts/preview.mjs';import{createCreatureApi}from'../server/creature-api.mjs';
const wav=()=>encodeVoiceWav(Float32Array.from({length:VOICE_RATE},(_,i)=>Math.sin(i*.1)*.1));
const input=()=>({audio:Buffer.from(wav()).toString('base64'),consent:true});
test('canonical audio derives duration from PCM bytes and rejects silence, forged headers and long clips',()=>{
  const bytes=wav();assert.equal(validateVoiceWav(bytes).durationSeconds,1);
  assert.throws(()=>encodeVoiceWav(new Float32Array(VOICE_RATE*16)));
  assert.throws(()=>validateVoiceWav(encodeVoiceWav(new Float32Array(VOICE_RATE))),/silent/);
  const bad=bytes.slice();new DataView(bad.buffer).setUint32(24,48000,true);assert.throws(()=>validateVoiceWav(bad),/encoding/);
});
test('Meta dictation uses one bounded official multipart request and validates returned text',async()=>{
  let sent,calls=0;const p=createSpeechProvider({apiKey:'fixture',fetchImpl:async(url,options)=>{calls++;sent={url,options};return new Response(JSON.stringify({transcript:'What if it rains less?',audioDurationMs:1000}));}});
  const result=await p.transcribe(wav());assert.equal(result.transcript,'What if it rains less?');assert.equal(calls,1);assert.equal(sent.url,'https://api.meta.ai/v1/asr/transcribe');assert.equal(sent.options.redirect,'error');
  const settings=JSON.parse(await sent.options.body.get('request').text());assert.equal(settings.mode,'PUSH_TO_TALK');assert.equal(settings.audioEncoding,'WAV');assert.equal(settings.model,'muse-voice-transcribe-1.0');assert.equal(sent.options.body.get('audio').size,wav().length);
  const fail=createSpeechProvider({apiKey:'fixture',fetchImpl:async()=>{calls++;return new Response('private upstream',{status:429});}});await assert.rejects(fail.transcribe(wav()),/429/);assert.equal(calls,2);
});
test('transcription gates consent/funding, reserves before one attempt and caches only successful results',async()=>{
  let calls=0,reserves=0;const provider={async transcribe(){calls++;return {transcript:'What if it rains less?'};}},budget={async reserve(){reserves++;}};
  const off=createSpeechService({provider,budget});await assert.rejects(off.run(input()),/paused/);assert.equal(calls,0);
  const on=createSpeechService({enabled:true,creditsConfirmed:true,provider,budget});await assert.rejects(on.run({...input(),consent:false}));await assert.rejects(on.run({...input(),code:'bad'}));assert.equal(reserves,0);
  await on.run(input());assert.equal((await on.run(input())).cached,true);assert.equal(reserves,1);assert.equal(calls,1);
  const fail=createSpeechService({enabled:true,creditsConfirmed:true,provider:{async transcribe(){calls++;throw Error('failed');}},budget});await assert.rejects(fail.run(input()));assert.equal(reserves,2);assert.equal(calls,2);
});
test('late microphone permission after cancel releases every track without recording or sending',async()=>{
  let grant,stops=0,records=0,sends=0;const controller=createQuestionRecorder({capture:()=>new Promise(r=>grant=r),makeRecorder:()=>records++,send:()=>sends++});
  const pending=controller.start();controller.cancel();grant({getTracks:()=>[{stop:()=>stops++}]});await pending;
  assert.equal(stops,1);assert.equal(records,0);assert.equal(sends,0);assert.equal(controller.getState().audio,null);
});
test('recording stops locally before sending; cancellation suppresses late transcript results',async()=>{
  let stopped=0,sends=0,resolveSend,recording;const controller=createQuestionRecorder({capture:async()=>({getTracks:()=>[{stop:()=>stopped++}]}),
    makeRecorder:()=>recording={state:'inactive',start(){this.state='recording';},stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['audio'])});this.onstop?.();}},convert:async()=>wav(),setTimer:()=>1,clearTimer:()=>{},send:()=>{sends++;return new Promise(r=>resolveSend=r);}});
  await controller.start();assert.equal(controller.getState().phase,'recording');controller.stop();await new Promise(r=>setImmediate(r));
  assert.equal(stopped,1);assert.equal(sends,0);assert.equal(controller.getState().phase,'ready');
  const pending=controller.transcribe();assert.equal(sends,1);controller.cancel();resolveSend({transcript:'stale'});await pending;assert.equal(controller.getState().transcript,'');assert.equal(controller.getState().audio,null);
});
test('a usable transcript is a review state and never executes or fills an experiment automatically',async()=>{
  let recording;const c=createQuestionRecorder({capture:async()=>({getTracks:()=>[{stop(){}}]}),makeRecorder:()=>recording={state:'inactive',start(){this.state='recording';},stop(){this.state='inactive';this.ondataavailable({data:new Blob(['x'])});this.onstop();}},convert:async()=>wav(),setTimer:()=>1,clearTimer:()=>{},send:async()=>({transcript:'What if the wolves disappear?'})});
  await c.start();c.stop();await new Promise(r=>setImmediate(r));await c.transcribe();assert.equal(c.getState().phase,'transcribed');assert.equal(c.getState().transcript,'What if the wolves disappear?');c.cancel();
});
test('natural voice is opt-in, local and cached with no silent device fallback',async()=>{
  let loads=0,generations=0;const loadModel=async()=>{loads++;return {async generate(){generations++;return {toBlob:()=>new Blob(['RIFF fixture'])};}};};
  const off=createNaturalVoice({loadModel});await assert.rejects(off.run({text:'Model week 1.'}));assert.equal(loads,0);
  const on=createNaturalVoice({enabled:true,loadModel});await on.run({text:'Model week 1.'});assert.equal((await on.run({text:'Model week 1.'})).cached,true);assert.equal(loads,1);assert.equal(generations,1);await assert.rejects(on.run({text:'x'.repeat(701)}));
  const n=createNarrator({voiceInitially:false});n.say('Model week 1.');n.setEnabled(true);assert.equal(n.state().voiceEnabled,false);
});
test('local neural voice keeps only the newest waiting caption while one is generating',async()=>{
  const releases=[],texts=[];const service=createNaturalVoice({enabled:true,loadModel:async()=>({generate:text=>{texts.push(text);return new Promise(resolve=>releases.push(()=>resolve({toBlob:()=>new Blob(['audio'])})));}})});
  const first=service.run({text:'First.'});await new Promise(r=>setImmediate(r));
  const stale=service.run({text:'Stale.'});const staleRejected=assert.rejects(stale,/newer caption/);const latest=service.run({text:'Latest.'});await staleRejected;
  releases.shift()();await first;await new Promise(r=>setImmediate(r));assert.deepEqual(texts,['First.','Latest.']);releases.shift()();await latest;
});
test('new local voice routes retain session/origin guards and hide cached models/recordings',async()=>{
  const fake={status:()=>({enabled:true}),async run(){return {transcript:'fixture'};}};
  const server=createPreviewServer({speechApi:createCreatureApi(fake,{prefix:'/api/speech',action:'run'}),narrationApi:createCreatureApi(fake,{prefix:'/api/narration',action:'run'})});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
  try{for(const route of ['speech','narration']){const s=await fetch(`${base}/api/${route}/status`).then(r=>r.json());assert.equal((await fetch(`${base}/api/${route}/run`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,403);assert.equal((await fetch(`${base}/api/${route}/run`,{method:'POST',headers:{'Content-Type':'application/json',Origin:base,'X-Microverse-Session':s.session},body:'{}'})).status,200);}
    for(const path of ['/runtime/kokoro-model/config.json','/runtime/dictation-synthetic-question.wav','/.env'])assert.equal((await fetch(base+path)).status,404);
  }finally{await new Promise(r=>server.close(r));}
});
