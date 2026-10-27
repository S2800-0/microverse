import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createForestController} from '../src/scene/controller.ts';
import {createExperiment} from '../src/scene/experiment.ts';
import {GUIDE_CHANGE} from '../src/scene/discovery.js';
import {buildEvidence} from '../src/investigation/evidence.js';
import {FOLLOW_UPS,validateGuide,guideSchema,guideLocal,guideReply,narrowGuide} from '../src/investigation/guide.js';
import {createSparkService} from '../server/spark-service.mjs';
import {createSparkProvider} from '../server/spark-provider.mjs';

function run(weeks){const e=createExperiment(createForestController().toSnapshot(),GUIDE_CHANGE,'','q');e.seek(weeks);return e;}
const answer=packet=>({status:'answer',observationIds:['population.rabbit','grass'],eventIds:packet.events.slice(0,1).map(e=>e.id),mechanismIds:['rabbit-food'],followUpId:'check-rabbits',lookId:'population.rabbit'});

test('guide replies may only cite evidence in this run and only point at what they cite',()=>{
  const packet=buildEvidence(run(13)),ok=answer(packet);
  assert.deepEqual(validateGuide(ok,packet),ok);
  for(const bad of [{...ok,observationIds:['population.dragon']},{...ok,eventIds:['event.changed.9999']},{...ok,mechanismIds:['magic']},{...ok,followUpId:'delete-everything'},{...ok,lookId:'deer-food'},{...ok,extra:1},{...ok,status:'run'},{...ok,observationIds:[],eventIds:[]},{...ok,observationIds:['grass','grass']}])assert.throws(()=>validateGuide(bad,packet));
  assert.throws(()=>validateGuide(null,packet));
});
test('a clarification or refusal keeps only a short message and never carries evidence',()=>{
  const packet=buildEvidence(run(13));
  const reply=validateGuide({status:'clarify',message:'  Which animal do you mean?  ',observationIds:['grass'],eventIds:[],mechanismIds:[],followUpId:'x',lookId:'grass'},packet);
  assert.deepEqual(reply,{status:'clarify',message:'Which animal do you mean?'});
  assert.throws(()=>validateGuide({status:'unsupported',message:''},packet));assert.throws(()=>validateGuide({status:'unsupported',message:'x'.repeat(201)},packet));
});
test('the local guide answers common questions from the run and asks for clarity otherwise',()=>{
  const packet=buildEvidence(run(13));
  const rabbits=guideLocal('Why are there fewer rabbits?',packet);
  assert.equal(rabbits.status,'answer');assert(rabbits.observationIds.includes('population.rabbit'));assert(rabbits.mechanismIds.includes('rabbit-food'));
  assert.equal(guideLocal('What about the grass and the rain?',packet).observationIds[0],'grass');
  for(const id of rabbits.eventIds)assert(packet.events.find(e=>e.id===id).text.includes('rabbit #'),'a rabbit question lists only rabbit moments');
  assert.deepEqual(guideLocal('What about the grass and the rain?',packet).eventIds,[]);
  assert.equal(guideLocal('Did anything get born?',packet).status,'answer');
  assert.equal(guideLocal('how do purple elephants fly',packet).status,'clarify');assert.equal(guideLocal('',packet).status,'clarify');
  assert.equal(guideLocal('hello',buildEvidence(run(1))).status,'clarify');
});
test('replies are rendered from the evidence packet: provider text never reaches the page, chips point only at cited ids',()=>{
  const packet=buildEvidence(run(13)),result=validateGuide(answer(packet),packet),reply=guideReply(result,packet,'Meta Muse Spark');
  assert.equal(reply.kind,'answer');assert.equal(reply.followUp,FOLLOW_UPS['check-rabbits']);
  const cited=new Set([...result.observationIds,...result.eventIds,...result.mechanismIds]);
  assert(reply.chips.length>0&&reply.chips.every(c=>cited.has(c.id)));assert.equal(reply.chips[0].id,'population.rabbit');
  assert(reply.lines.every(l=>typeof l.text==='string'));
  const clarify=guideReply({status:'clarify',message:'Which animal?'},packet,'Local');assert.deepEqual([clarify.kind,clarify.chips.length,clarify.followUp],['clarify',0,null]);
});
test('the Spark guide service validates, caches once and receives no private learner data',async()=>{
  let calls=0,reservations=0,sent;
  const file=run(13).toReplay('PRIVATE REFLECTION');file.activity={before:'PRIVATE BEFORE',after:'PRIVATE AFTER',teacherNotes:'PRIVATE TEACHER'};
  const service=createSparkService({enabled:true,creditsConfirmed:true,provider:{label:'fixture',async request(op,payload){calls++;sent=JSON.stringify([op,payload]);return {value:answer(payload.evidence)};}},budget:{async reserve(){reservations++;}}});
  const input={operation:'guide',question:'Why are there fewer rabbits?',replay:file,consent:true};
  const a=await service.run(input),b=await service.run(input);
  assert.equal(a.value.status,'answer');assert.equal(b.cached,true);assert.equal(calls,1);assert.equal(reservations,1);
  for(const secret of ['PRIVATE','appearances','data:image'])assert(!sent.includes(secret));
  await assert.rejects(createSparkService({enabled:true,creditsConfirmed:true,provider:{async request(){return {value:{status:'answer',observationIds:['nope']}};}},budget:{async reserve(){}}}).run({...input,question:'another question'}));
  await assert.rejects(service.run({...input,consent:false,question:'unsent question'}),/paused|sending/);
  await assert.rejects(service.run({operation:'guide',question:'before any weeks',replay:run(0).toReplay(''),consent:true}),/Advance/);
});
test('the guide provider sends one strict tool, stays inside the size bound at week 52 and rejects non-tool replies',async()=>{
  const packet=buildEvidence(run(52));
  let sent;
  const ok=async(url,options)=>{sent=JSON.parse(options.body);return new Response(JSON.stringify({choices:[{finish_reason:'tool_calls',message:{tool_calls:[{type:'function',function:{name:'guide_learner',arguments:JSON.stringify(answer(packet))}}]}}],usage:{prompt_tokens:1,completion_tokens:1}}));};
  const result=await createSparkProvider({provider:'meta',apiKey:'test key',fetchImpl:ok}).request('guide',{question:'Why fewer rabbits?',evidence:packet});
  assert.equal(sent.tools.length,1);assert.equal(sent.tools[0].function.name,'guide_learner');assert.equal(sent.parallel_tool_calls,false);
  assert.deepEqual(sent.tools[0].function.parameters,guideSchema(packet));assert(Buffer.byteLength(JSON.stringify(sent))<=11000);
  assert.equal(validateGuide(result.value,packet).status,'answer');
  const textOnly=async()=>new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'Here is a long answer'}}]}));
  await assert.rejects(createSparkProvider({provider:'meta',apiKey:'k',fetchImpl:textOnly}).request('guide',{question:'q',evidence:packet}),/did not return/);
  await assert.rejects(createSparkProvider({provider:'meta',apiKey:'k',fetchImpl:ok}).request('drop_tables',{question:'q'}),/Unsupported/);
});

test('event-only and empty-event questions render or clarify instead of throwing, at every checkpoint',()=>{
  for(const weeks of [1,13,52,156]){
    const packet=buildEvidence(run(weeks));
    for(const question of ['Did anything get born?','what died?','Why?','what eats rabbits','hello there']){
      const reply=guideReply(guideLocal(question,packet),packet,'Local evidence guide'); // must never throw
      assert(['answer','clarify'].includes(reply.kind));
      if(reply.kind==='answer')assert(reply.lines.length>0,`${question} at week ${weeks} gave an answer with no lines`);
    }
  }
  const packet=buildEvidence(run(13)),born=guideReply(guideLocal('Did anything get born?',packet),packet,'x');
  assert.equal(born.kind,'answer');assert(born.lines.every(l=>l.kind!=='observation'));assert(born.chips.some(c=>c.kind==='event'));
});
test('lookId accepts an explicit none and the provider tool schema has no nullable branch',()=>{
  const packet=buildEvidence(run(13)),ok=answer(packet);
  assert.equal(validateGuide({...ok,lookId:'none'},packet).lookId,null);
  assert.equal(validateGuide({...ok,lookId:null},packet).lookId,null);
  const schema=guideSchema(packet);assert(schema.properties.lookId.enum.includes('none'));assert(!JSON.stringify(schema).includes('anyOf')&&!JSON.stringify(schema).includes('"null"'));
});
test('the guide request stays inside the size bound at every checkpoint',async()=>{
  for(const weeks of [1,13,52,156]){
    const packet=buildEvidence(run(weeks));let bytes=0;
    const fetchImpl=async(u,o)=>{bytes=Buffer.byteLength(o.body);return new Response(JSON.stringify({choices:[{finish_reason:'tool_calls',message:{tool_calls:[{type:'function',function:{name:'guide_learner',arguments:JSON.stringify({status:'clarify',message:'Which animal?',observationIds:[],eventIds:[],mechanismIds:[],followUpId:'compare-food',lookId:'none'})}}]}}]}));};
    await createSparkProvider({provider:'meta',apiKey:'k',fetchImpl}).request('guide',{question:'x'.repeat(200),evidence:packet});
    assert(bytes>0&&bytes<=11000,`week ${weeks}: ${bytes} bytes`);
  }
});

test('answers are narrowed to at most 3 lines and 3 chips, keeping what was asked about and what Spark pointed at',()=>{
  const packet=buildEvidence(run(13));
  const events=packet.events.map(e=>e.id).slice(0,3);
  // the shape of the real reply Spark returned for "Why are there fewer rabbits in the dry forest?"
  const spark=validateGuide({status:'answer',observationIds:['grass','population.rabbit','population.fox'],eventIds:events,mechanismIds:['rain-growth','rabbit-food'],followUpId:'compare-food',lookId:'grass'},packet);
  const narrow=narrowGuide(spark,packet,'Why are there fewer rabbits in the dry forest?');
  const reply=guideReply(narrow,packet,'Meta · Muse Spark');
  assert(reply.lines.length<=3&&reply.chips.length<=3,`${reply.lines.length} lines, ${reply.chips.length} chips`);
  assert(!narrow.observationIds.includes('population.fox'),'the fox count is not about rabbits');
  assert.equal(reply.chips[0].id,'grass');assert(narrow.observationIds.includes('population.rabbit'));assert.equal(narrow.mechanismIds.length,1,'a why question keeps one model rule');assert(['rain-growth','rabbit-food'].includes(narrow.mechanismIds[0]));
  // never adds evidence Spark did not cite, and stays valid
  const cited=new Set([...spark.observationIds,...spark.eventIds,...spark.mechanismIds]);
  for(const id of [...narrow.observationIds,...narrow.eventIds,...narrow.mechanismIds])assert(cited.has(id));
  assert.equal(validateGuide(narrow,packet).status,'answer');
  // clarifications pass through; unrelated questions still keep something; moment questions keep moments
  assert.deepEqual(narrowGuide({status:'clarify',message:'x'},packet,'q'),{status:'clarify',message:'x'});
  const any=narrowGuide(spark,packet,'tell me something');assert(any.observationIds.length+any.eventIds.length>0);
  for(const weeks of [1,13,52,156]){const p=buildEvidence(run(weeks));for(const q of ['Did anything get born?','Why are there fewer rabbits?','What about the grass?','what happened to the wolves']){
    const n=narrowGuide(guideLocal(q,p),p,q),r=guideReply(n,p,'x');assert(r.kind==='clarify'||(r.lines.length>0&&r.lines.length<=3&&r.chips.length<=3),`${q} @${weeks}`);}}
});
