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
