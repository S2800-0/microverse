import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createForestController} from '../src/scene/controller.ts';
import {createExperiment,validateReplay,experimentFromReplay} from '../src/scene/experiment.ts';
import {buildEvidence,modelOnlyReplay,worksheetHtml} from '../src/investigation/evidence.js';
import {GUIDE_CHANGE,discoverySummary,intervalRecord,closerLook,relatedInvestigations,populationStory,nearestAnimal,animalRecord} from '../src/scene/discovery.js';
import {createCreatureLibrary,LIBRARY_KEY} from '../src/scene/creature-library.js';
import {normalizeChange} from '../src/investigation/changes.js';
const sample=async()=>({name:'Pip',species:'dog',image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jE9sAAAAASUVORK5CYII='});
function memory(){const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),data};}

test('the guide observes an early food change without claiming animals must decline or mutating either model',()=>{
 const e=createExperiment(createForestController().toSnapshot(),GUIDE_CHANGE);assert(discoverySummary(buildEvidence(e)).headline.includes('starts'));
 const s=e.seek(1),before=s.changed.world.toSnapshot(),summary=discoverySummary(buildEvidence(e));
 assert(summary.headline.includes('Grass food is lower'));assert(summary.detail.includes('animal counts still match'));assert(summary.why.includes('In this model'));
 assert.deepEqual(s.changed.world.toSnapshot(),before);e.seek(52);const later=discoverySummary(buildEvidence(e));assert(!later.detail.includes('starv'));assert(later.caution.includes('random'));
});
test('history existing at experiment start cannot become a new event invitation or evidence item',()=>{
 const c=createForestController();c.add({species:'dog',name:'Already here'});const e=createExperiment(c.toSnapshot(),GUIDE_CHANGE),s=e.seek(1);
 assert.equal(intervalRecord(s.changed,'dog',s.startWeek,s.eventStartIndex).arrivals,0);
 assert(!buildEvidence(e).events.some(x=>x.text.includes('arrived')));
 const found=closerLook(s.changed,s.startWeek,s.eventStartIndex);if(found)assert(found.id>=s.eventStartIndex);
});
test('animal population records reconcile births, deaths and arrivals with starting counts',()=>{
 const c=createForestController(),start=c.getState().counts,e=createExperiment(c.toSnapshot(),GUIDE_CHANGE),s=e.seek(52);
 for(const species of ['rabbit','deer','fox','wolf']){const r=intervalRecord(s.changed,species,s.startWeek,s.eventStartIndex);assert.equal(start[species]+r.births+r.arrivals-r.deaths,s.changed.counts[species]);}
});
test('related questions remain supported single changes and retain bounded durations',()=>{
 for(const change of [GUIDE_CHANGE,{kind:'rain',rain:0,durationWeeks:1},{kind:'remove',species:'fox'},{kind:'remove',species:'wolf'}])for(const item of relatedInvestigations(change))assert.deepEqual(normalizeChange(item.change),item.change);
});
test('optional everyday reflection survives replay and escapes in the card, but is stripped from provider and rerun payloads',()=>{
 const e=createExperiment(createForestController().toSnapshot(),GUIDE_CHANGE);e.seek(13);const file=e.toReplay('Own explanation');file.activity={before:'',after:'',teacherNotes:'',connection:'PRIVATE <script>connection</script>'};validateReplay(file);
 assert.deepEqual(experimentFromReplay(file).getState().changed.counts,e.getState().changed.counts);
 const html=worksheetHtml(file,buildEvidence(e),file.activity);assert(html.includes('PRIVATE &lt;script&gt;connection'));assert(!html.includes('<script>connection'));
 assert(!JSON.stringify(modelOnlyReplay(file)).includes('PRIVATE'));
 assert.throws(()=>validateReplay({...file,activity:{...file.activity,connection:7}}));assert.throws(()=>validateReplay({...file,activity:{...file.activity,connection:'x'.repeat(1001)}}));
});
test('saved creature collection persists reviewed data independently of forest resets and strips transient fields',async()=>{
 const store=memory(),library=createCreatureLibrary(store,{id:()=> 'one'}),input=await sample();const entry=library.add({...input,originalPhoto:'PRIVATE ORIGINAL',rig:{canvas:'TRANSIENT'},secret:'PRIVATE KEY'});
 assert.equal(library.list().length,1);assert(!store.getItem(LIBRARY_KEY).includes('PRIVATE'));assert(!store.getItem(LIBRARY_KEY).includes('TRANSIENT'));
 const c=createForestController();c.reset();assert.deepEqual(createCreatureLibrary(store).list(),[entry]);
 library.list()[0].name='Changed elsewhere';assert.equal(library.list()[0].name,'Pip');library.remove('one');assert.equal(createCreatureLibrary(store).list().length,0);
});
test('storage failure leaves the prior collection intact and invalid imports do not write',async()=>{
 const store=memory(),library=createCreatureLibrary(store,{id:()=> 'one'}),value=await sample();library.add(value);const before=store.getItem(LIBRARY_KEY);store.setItem=()=>{throw new Error('quota');};
 assert.throws(()=>library.add({...value,name:'Two'}),/could not save/);assert.equal(library.list().length,1);assert.equal(store.getItem(LIBRARY_KEY),before);
 assert.throws(()=>library.add({...value,image:'https://example.com/pet.svg'}));assert.throws(()=>library.add({...value,species:'wolf'}));
});
test('corrupt saved data fails closed rather than silently replacing the collection',async()=>{
 const store=memory();store.setItem(LIBRARY_KEY,'not valid JSON');const library=createCreatureLibrary(store);assert(library.status());const value=await sample();assert.throws(()=>library.add(value),/could not be read/);assert.equal(store.getItem(LIBRARY_KEY),'not valid JSON');
});

test('removing a species is described as removal rather than a natural death',()=>{
 const e=createExperiment(createForestController().toSnapshot(),{kind:'remove',species:'wolf'}),s=e.seek(1),record=intervalRecord(s.changed,'wolf',s.startWeek,s.eventStartIndex);
 assert.equal(record.removed,3);const story=populationStory(s,'wolf');assert(story.includes('were removed'));assert(!story.includes('died'));
});

test('tap-to-ask picks the animal drawn on top, respects sprite size and reports only recorded facts',()=>{
  const params={width:100,height:100},w=1000,h=1000;
  const animals=[{id:1,x:50,y:50,alive:true},{id:2,x:50,y:51,alive:true},{id:3,x:10,y:50,alive:false}];
  assert.equal(nearestAnimal(animals,params,500,480,w,h,()=>44)?.id,2); // overlap: the one painted last (larger y) wins
  assert.equal(nearestAnimal(animals,params,500,300,w,h,()=>44),null); // above a small sprite
  assert.equal(nearestAnimal(animals,params,500,470,w,h,()=>44)?.id,1); // only the first sprite reaches this high
  assert.equal(nearestAnimal([animals[0]],params,500,500-55,w,h,()=>70)?.id,1); // a larger sprite reaches higher
  assert.equal(nearestAnimal(animals,params,100,500,w,h,()=>44),null); // dead animals cannot be tapped
  assert.equal(nearestAnimal(animals,params,-500,-500,w,h),null);

  const experiment=createExperiment(createForestController().toSnapshot(),GUIDE_CHANGE,'','q');
  experiment.seek(13);
  const state=experiment.getState().changed;
  const rabbit=state.world.animals.find(a=>a.species==='rabbit'&&a.alive);
  const record=animalRecord(state,rabbit.id);
  assert.equal(record.species,'rabbit');assert.match(record.sex,/^(fe)?male$/);
  assert(Number.isInteger(record.age)&&record.energy>=0&&record.energy<=100&&record.alive);
  assert.equal(animalRecord(state,-1),null);
  const born=state.world.events.findIndex(e=>e.type==='birth');
  if(born>=0){const baby=state.world.events[born].id;assert(animalRecord(state,baby,0).events.some(e=>e.id===born));assert.equal(animalRecord(state,baby,born+1).events.length,0);}
});
