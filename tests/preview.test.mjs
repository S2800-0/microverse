import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewServer} from '../scripts/preview.mjs';

test('preview serves browser modules and hides repository internals',async()=>{
  const server=createPreviewServer({testSprite:null});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    const page=await fetch(base).then(r=>r.text());assert.match(page,/Living ecosystem/);
    const ts=await fetch(`${base}/src/scene/controller.ts`);assert.match(ts.headers.get('content-type'),/javascript/);
    const source=await ts.text();assert(!source.includes('import type'));assert.match(source,/createForestController/);
    for(const path of ['/.git/config','/.env','/scripts/preview.mjs','/PROVENANCE.md','/test-fixture.png'])assert.equal((await fetch(base+path)).status,404);
    assert.equal((await fetch(base+'/animals/dog-standing.png',{method:'HEAD'})).status,200);
    const storyboard=await fetch(base+'/storyboard.html');assert.equal(storyboard.status,200);assert.match(await storyboard.text(),/big consequences/);
    for(const page of ['/behind.html','/build-with.html'])assert.equal((await fetch(base+page)).status,200);
    for(const page of ['/forest-story.html','/discovery.html','/examples/forest/story-frames.html','/examples/forest/animal-acting.html'])assert.equal((await fetch(base+page)).status,200);
    assert.match((await fetch(base+'/discovery.css')).headers.get('content-type'),/text\/css/);
    assert.match((await fetch(base+'/forest-story.css')).headers.get('content-type'),/text\/css/);
    assert.match((await fetch(base+'/entrance.css')).headers.get('content-type'),/text\/css/);
    assert.match((await fetch(base+'/entrance/fox-walk.webp',{method:'HEAD'})).headers.get('content-type'),/image\/webp/);
    assert.match((await fetch(base+'/entrance/dog-photo.jpg',{method:'HEAD'})).headers.get('content-type'),/image\/jpeg/);
    assert.equal((await fetch(base+'/entrance/manifest.json')).status,200);
    const stylesheet=await fetch(base+'/storyboard.css');assert.match(stylesheet.headers.get('content-type'),/text\/css/);
    assert.match((await fetch(base+'/journey.css')).headers.get('content-type'),/text\/css/);
    assert.equal((await fetch(base+'/intro/forest.png',{method:'HEAD'})).status,200);
    assert.equal((await fetch(base+'/intro/fox.png',{method:'HEAD'})).status,200);
    for(const file of ['clean-plate','foreground-left','foreground-right','fox-walk','fox-poster'])assert.equal((await fetch(`${base}/intro/${file}.png`,{method:'HEAD'})).status,200);
    assert.equal((await fetch(base+'/intro/manifest.json')).status,404);
    assert.equal((await fetch(base+'/src/motion/fox-scene.js')).status,200);
    assert.equal((await fetch(base+'/art-review.html')).status,200);
    assert.equal((await fetch(base+'/meta-art.css')).status,200);
    assert.equal((await fetch(base+'/meta-art/manifest.json')).status,200);
    for(const name of ['adoption','rig-review'])assert.equal((await fetch(`${base}/meta-art/${name}.json`)).status,200);
    for(const file of ['guide-atlas','fox-walk-atlas','cat-standing'])assert.equal((await fetch(`${base}/meta-art/${file}.png`,{method:'HEAD'})).status,200);
    assert.equal((await fetch(base+'/runtime/meta-art-batch-2026-10-28/fox.json')).status,404);
    assert.equal((await fetch(base,{method:'POST'})).status,404);
  }finally{await new Promise(r=>server.close(r));}
});
