import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

test('public art matches the recorded import provenance',async()=>{
  const base=new URL('../public/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('art-manifest.json',base),'utf8'));
  assert.equal(manifest.version,1);
  assert.equal(manifest.assets.length,12);
  for(const asset of manifest.assets){
    assert.match(asset.file,/^(animals|maps)\/[a-z-]+\.png$/);
    const bytes=await readFile(new URL(asset.file,base));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.file);
  }
});

test('display scale and pose rules keep companions as imported and pick fawn/rabbit poses',async()=>{
  const {bodyScale,poseFor,POSES}=await import('../src/scene/art.js');
  const params={species:{deer:{matureAge:52},rabbit:{matureAge:20},dog:{matureAge:52}}};
  const deer=(age,id=1,sex='m')=>({species:'deer',age,id,sex});
  assert.equal(bodyScale({species:'dog',age:0,id:3,sex:'f'},params),1);
  assert(bodyScale(deer(2),params)<bodyScale(deer(200),params),'young deer draw smaller than adults');
  assert.equal(bodyScale(deer(200,5),params),bodyScale(deer(200,5),params));
  assert(bodyScale(deer(200,5,'f'),params)<bodyScale(deer(200,5,'m'),params));
  assert.equal(poseFor(deer(10,1),params,true),'fawn-running');
  assert.equal(poseFor(deer(10,1),params,false),'fawn-standing');
  assert.equal(poseFor(deer(10,3),params,false),'fawn-grazing');
  assert.equal(poseFor(deer(200),params,true),null,'adult deer keep the rigged adult art');
  assert.equal(poseFor({species:'rabbit',age:30,id:2},params,true),'rabbit-running');
  assert.equal(poseFor({species:'rabbit',age:30,id:1},params,false),'rabbit-grazing');
  assert.equal(poseFor({species:'rabbit',age:30,id:2},params,false),null);
  assert.equal(poseFor({species:'dog',age:0,id:1},params,true),null);
  for(const key of ['fawn-standing','fawn-grazing','fawn-running','rabbit-grazing','rabbit-running'])assert(POSES[key],key);
});
