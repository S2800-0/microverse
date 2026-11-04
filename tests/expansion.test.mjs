import test from 'node:test';import assert from 'node:assert/strict';
import {reefState} from '../src/reef/reef-model.js';
import {FOOD_LEVELS,startModel} from '../src/experience/model-session.ts';
import {landscapePrompt} from '../server/world-tools.mjs';
import {appearanceFor,FOOD_PATCHES} from '../src/experience/world-appearance.js';
test('reef teaching state is bounded, repeatable, and cooling changes the outcome without claiming death',()=>{
 const hot=reefState(12),usual=reefState(12,{warm:false}),cool=reefState(12,{coolAfter:6});assert.deepEqual(hot,reefState(12));assert(hot.paleness>cool.paleness);assert.equal(usual.paleness,0);assert(hot.paleness<=1);assert(hot.events.some(e=>e.kind==='paling'));assert(!('deaths' in hot));assert.throws(()=>reefState(13));assert.throws(()=>reefState(2,{coolAfter:3}));
});
test('None starts both land branches with no supplied food, then rules still run',()=>{
 assert.equal(FOOD_LEVELS.None,0);assert.equal(FOOD_PATCHES.None,0);
 const session=startModel({food:'None',review:{water:'seen',tree:'seen',grass:'seen'}});assert.equal(session.getState().baseline.grass,0);assert.equal(session.getState().changed.grass,0);assert(session.seek(1).baseline.grass>0);
});
test('distinct places select their own paintings and personal painting remains local context',()=>{
 assert.notEqual(appearanceFor({id:'garden'}).map,appearanceFor({id:'woodland'}).map);assert.notEqual(appearanceFor({id:'reef'}).map,appearanceFor({id:'garden'}).map);assert.equal(appearanceFor({habitat:'woodland',painting:'data:image/png;base64,test'}).map,'data:image/png;base64,test');assert.throws(()=>landscapePrompt('unknown'));assert(landscapePrompt('reef').includes('no text'));
});

import {guideLocal,narrowGuide} from '../src/core/investigation/guide.js';
import {loadDiscovery} from '../src/experience/model-session.ts';
import {NARRATION} from '../src/experience/narration.js';
import {readFileSync,existsSync} from 'node:fs';
test('saved land worlds retain their identity and reject invented habitats',()=>{
 const s=startModel({food:'None',habitat:'woodland',review:{water:'seen',tree:'seen',grass:'seen'}});s.seek(4);const saved=s.export();assert.equal(loadDiscovery(saved).session.context.habitat,'woodland');saved.context.habitat='invented';assert.throws(()=>loadDiscovery(saved));
});
test('prepared reasoning understands hunting and keeps a relevant model connection',()=>{
 const s=startModel({food:'Some',review:{water:'seen',tree:'seen',grass:'seen'}});s.seek(1);const packet=s.packet(),q='Could food and hunting affect the rabbits?';const reply=narrowGuide(guideLocal(q,packet),packet,q);assert.equal(reply.status,'answer');assert(reply.mechanismIds.length>0);assert(reply.observationIds.includes('population.rabbit'));assert.equal(guideLocal('How do I make pizza?',packet).status,'clarify');
});
test('both additional narration voices have a complete matching local script',()=>{
 for(const voice of ['bella','emma']){const dir=new URL('../public/audio/'+voice+'/',import.meta.url),m=JSON.parse(readFileSync(new URL('credits.json',dir)));assert.equal(m.clips.length,Object.keys(NARRATION).length);for(const [id,text] of Object.entries(NARRATION)){const clip=m.clips.find(c=>c.id===id);assert.equal(clip.text,text);assert(existsSync(new URL(clip.file,dir)))}}
});
