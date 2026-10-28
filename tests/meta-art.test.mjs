import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {META_ART_PLAN,META_ART_CAP} from '../scripts/meta-art-plan.mjs';
const base=new URL('../public/meta-art/',import.meta.url);
test('Meta review exports match provenance and include the retained failed attempt',async()=>{
 const manifest=JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));
 assert.equal(manifest.assets.length,15);assert.equal(manifest.attempts.length,16);
 assert.equal(manifest.attempts.filter(a=>a.status==='failed').length,1);
 assert.equal(manifest.attempts.reduce((n,a)=>n+a.imageCalls,0),14);assert.equal(manifest.attempts.reduce((n,a)=>n+a.samCalls,0),12);
 for(const item of [...manifest.assets,...manifest.derived,...manifest.guide.frames,manifest.guide.atlas]){
  assert.match(item.file,/^[a-z-]+\.png$/);const bytes=await readFile(new URL(item.file,base));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,item.file);
  assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[item.width,item.height],item.file);
 }
 assert.equal(manifest.assets.find(a=>a.id==='cat').state,'Portrait only');
 assert.equal(manifest.assets.find(a=>a.id==='foreground-left').state,'Mask needs review');
 const registration=JSON.parse(await readFile(new URL('walk-frames.json',base),'utf8'));
 assert.equal(registration.frames.length,8);const grounds=registration.frames.map(f=>f.baseline);assert(Math.max(...grounds)-Math.min(...grounds)<=2);
 for(const frame of registration.frames){const [x,y,r,b]=frame.occupiedBounds;assert(x>0&&y>0&&r<512&&b<512);}
});
test('the explicit art plan fits its allowance and refers only to public art or prior candidates',()=>{
 assert(META_ART_PLAN.length*12500<=250000);assert.equal(META_ART_CAP,75000+250000);
 const prior=new Set();for(const job of META_ART_PLAN){assert(!prior.has(job.id));for(const source of job.sources)if(source.startsWith('@'))assert(prior.has(source.slice(1)));else assert.match(source,/^public\/[a-z/-]+\.png$/);prior.add(job.id);}
});
