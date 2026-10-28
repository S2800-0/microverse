import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

test('public art matches the recorded import provenance',async()=>{
  const base=new URL('../public/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('art-manifest.json',base),'utf8'));
  assert.equal(manifest.version,1);
  assert.equal(manifest.assets.length,8);
  for(const asset of manifest.assets){
    assert.match(asset.file,/^(animals|maps)\/[a-z-]+\.png$/);
    const bytes=await readFile(new URL(asset.file,base));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.file);
  }
});

test('owner-supplied intro art and local derivatives match their recorded provenance',async()=>{
  const base=new URL('../public/intro/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));
  assert.equal(manifest.version,1);assert.equal(manifest.assets.length,7);
  for(const asset of manifest.assets){
    assert.match(asset.file,/^(forest|fox|clean-plate|foreground-left|foreground-right|fox-walk|fox-poster)\.png$/);
    assert.match(asset.origin,/Owner-supplied artwork/);
    const bytes=await readFile(new URL(asset.file,base));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.file);
  }
});

test('the registered atlas contains eight unclipped poses with a shared ground line',async()=>{
  const base=new URL('../public/intro/',import.meta.url);
  const metadata=JSON.parse(await readFile(new URL('walk-frames.json',base),'utf8'));
  const atlas=await readFile(new URL('fox-walk.png',base));
  assert.equal(createHash('sha256').update(atlas).digest('hex'),metadata.atlasSha256);
  assert.deepEqual([atlas.readUInt32BE(16),atlas.readUInt32BE(20)],[2048,1024]);
  assert.equal(metadata.frames.length,8);
  const grounds=metadata.frames.map(frame=>frame.baseline);
  assert(Math.max(...grounds)-Math.min(...grounds)<=1);
  for(const frame of metadata.frames){const [x,y,right,bottom]=frame.occupiedBounds;assert(x>0&&y>0&&right<512&&bottom<512);}
});
