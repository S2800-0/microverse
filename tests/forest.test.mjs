import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startModel} from '../src/experience/model-session.ts';
import {createExploration,forestRecords,neighbourChoices,forestTime} from '../src/forest/exploration.ts';
function experiment(){const s=startModel({food:'Some',review:{grass:'seen',tree:'seen',water:'unsure'}});s.seek(52);return s}
function snapshot(s){return {...s.experiment.toReplay().initial,selectedId:null,appearances:[],world:s.getState().baseline.world.toSnapshot()}}

test('open exploration forks the usual-rain forest without altering experiment or its random state',()=>{
 const s=experiment(),before=JSON.stringify(s.export()),copy=snapshot(s),original=JSON.stringify(copy),f=createExploration(copy);
 for(let i=0;i<10;i++)f.step();assert.equal(f.getState().week,62);
 assert.equal(JSON.stringify(s.export()),before);assert.equal(JSON.stringify(copy),original);assert.equal(f.getState().world.interventions.length,0);
});
test('the exploring year is bounded, and restarting repeats its exact states and records',()=>{
 const f=createExploration(snapshot(experiment()));for(let i=0;i<52;i++)f.step();const end=f.snapshot(),records=f.records();assert.throws(()=>f.step());f.restart();assert.equal(f.getState().week,52);assert.equal(f.records().length,0);for(let i=0;i<52;i++)f.step();assert.deepEqual(f.snapshot(),end);assert.deepEqual(f.records(),records);
});
test('journal IDs refer to real new events and never invent or expose pre-exploration moments',()=>{
 const f=createExploration(snapshot(experiment()));const start=f.getState().world.events.length;for(let i=0;i<8;i++)f.step();const all=f.getState().world.events,records=f.records();assert(records.length>0);
 for(const r of records){assert(r.eventIndex>=start);assert.deepEqual(r.record,all[r.eventIndex]);assert.equal(r.id,'forest.event.'+r.eventIndex);assert(['birth','arrive','death','kill'].includes(r.type));if(r.livingAnimalId!==null)assert(f.getState().animals.some(a=>a.id===r.livingAnimalId));}
});
test('death and hunt records do not offer absent creatures as living close-ups',()=>{
 const state={world:{animals:[{id:2,species:'fox'}],events:[{type:'death',t:1,id:1,species:'rabbit',cause:'eaten'},{type:'kill',t:1,id:2,prey:1,preySpecies:'rabbit'}]},animals:[{id:2,species:'fox'}]};
 const [hunt,death]=forestRecords(state);assert.equal(hunt.species,'fox');assert.equal(hunt.livingAnimalId,2);assert.equal(death.livingAnimalId,null);assert(death.detail.includes('predator'));assert.equal(hunt.record.prey,1);
});
test('neighbour choices disable absent species and model clock follows real season boundaries',()=>{
 const choices=neighbourChoices({animals:[{id:7,species:'rabbit'}]});assert.equal(choices.length,4);assert.equal(choices.find(c=>c.species==='rabbit').animalId,7);assert(choices.filter(c=>c.species!=='rabbit').every(c=>c.animalId===null));
 for(const [w,season]of [[0,'Spring'],[13,'Summer'],[26,'Autumn'],[39,'Winter'],[52,'Spring']])assert.equal(forestTime(w).season,season);assert.equal(forestTime(52).year,2);
});
