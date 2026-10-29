import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {entranceFrame} from '../src/scene/entrance-motion.js';
import {cachedPose} from '../src/motion/cached-walk.js';

test('entrance motion stays bounded and reversing scroll restores the same composition',()=>{
  const start=entranceFrame(0),end=entranceFrame(1);
  for(const value of [-Infinity,NaN,-10])assert.deepEqual(entranceFrame(value),start);
  assert.deepEqual(entranceFrame(10),end);
  for(const value of [0,.4,1,.4,0]){
    const frame=entranceFrame(value);
    assert(frame.camera>=start.camera&&frame.camera<=end.camera);
    assert(frame.foreground>=frame.camera);
    assert(frame.titleOpacity>=end.titleOpacity&&frame.titleOpacity<=1);
    assert(frame.foxPercent>=45&&frame.foxPercent<=62);
  }
  assert.equal(cachedPose(0),cachedPose(.8));
  assert.equal(cachedPose(-.1),cachedPose(.7));
  for(let i=-100;i<100;i++)assert(cachedPose(i/37)>=0&&cachedPose(i/37)<24);
});

test('shipped entrance files match recorded provenance and contain complete walk atlases',async()=>{
  const root=new URL('../public/entrance/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
  for(const asset of manifest.assets){
    const bytes=await readFile(new URL(asset.file,root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.file);
    if(asset.source.startsWith('public/')){
      const source=await readFile(new URL('../'+asset.source,import.meta.url));
      assert.equal(createHash('sha256').update(source).digest('hex'),asset.sourceSha256);
    }
    if(asset.frames){
      assert.equal(asset.frames,24);assert.equal(asset.columns*asset.rows,24);
      assert.equal(asset.width,asset.columns*asset.cellWidth);
      assert.equal(asset.height,asset.rows*asset.cellHeight);
    }
  }
  const photo=manifest.assets.find(asset=>asset.file==='dog-photo.jpg');
  const painting=manifest.assets.find(asset=>asset.file==='dog-watercolor.webp');
  assert.equal(photo.sourceLicense,'CC0 1.0');assert.equal(photo.source,painting.source);
  assert.match(painting.model,/muse-image/);
});
