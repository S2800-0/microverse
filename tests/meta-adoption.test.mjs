import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ART,SCENE_MAP,artForAnimal} from '../src/scene/art.js';
const base=new URL('../public/meta-art/',import.meta.url);
test('adopted sprites and forest exports match their source records and registration',async()=>{
 const manifest=JSON.parse(await readFile(new URL('adoption.json',base),'utf8'));
 assert.equal(manifest.active.length,9);assert.equal(manifest.forest.restCompositeExact,true);assert.equal(manifest.forest.walkCorridorClear,true);
 for(const item of manifest.assets){
  const bytes=await readFile(new URL(item.file,base));assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,item.file);
  assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[item.width,item.height]);
  for(const source of item.sources)assert.equal(createHash('sha256').update(await readFile(new URL(source.file,base))).digest('hex'),source.sha256);
  if(item.file.startsWith('game-')&&item.file!=='game-map-live.png'){assert.equal(item.width,640);assert.equal(item.height,640);assert(Math.abs(item.occupiedBounds[3]-570)<=1);}
 }
 assert.equal(SCENE_MAP,'/meta-art/game-map-live.png');
 for(const role of ['dog','cat','fox','wolf','deer','doe','fawn','rabbit'])assert(manifest.assets.some(item=>`/meta-art/${item.file}`===ART[role].image));
});
test('female and juvenile deer select their own art, while rejected rigs stay disabled',async()=>{
 assert.equal(artForAnimal({species:'deer',sex:'f',age:80}),ART.doe);
 assert.equal(artForAnimal({species:'deer',sex:'m',age:80}),ART.deer);
 for(const sex of ['m','f'])assert.equal(artForAnimal({species:'deer',sex,age:51}),ART.fawn);
 assert.equal(ART.cat.cut,undefined);assert.equal(ART.rabbit.cut,undefined);
 const report=JSON.parse(await readFile(new URL('rig-review.json',base),'utf8'));
 for(const record of report.records){
  assert.equal(createHash('sha256').update(await readFile(new URL(record.image.slice('/meta-art/'.length),base))).digest('hex'),record.sha256);
  if(record.visualDecision==='articulated'){assert.equal(record.warnings.length,0);assert.equal(record.legs.filter(l=>l.hind).length,2);assert.equal(record.legs.filter(l=>!l.hind).length,2);assert.deepEqual(ART[record.id].cut,record.config);}
 }
});
