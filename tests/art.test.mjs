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

test('owner-supplied intro art remains byte-identical to its recorded provenance',async()=>{
  const base=new URL('../public/intro/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));
  assert.equal(manifest.version,1);assert.equal(manifest.assets.length,2);
  for(const asset of manifest.assets){
    assert.match(asset.file,/^(forest|fox)\.png$/);
    assert.match(asset.origin,/Owner-supplied artwork/);
    const bytes=await readFile(new URL(asset.file,base));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.file);
  }
});
