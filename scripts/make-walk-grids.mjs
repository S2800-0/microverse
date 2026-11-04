// Local and free: reads each saved map's colours and stores where land animals can walk.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {groundFromPixels} from '../src/world/walk-grid.js';
const run=promisify(execFile),root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),W=560,H=380,out={};
for(const [id,file] of [['garden','garden-ground-v11.webp'],['woodland','woodland-ground-v11.webp']]){
 const {stdout}=await run('magick',[resolve(root,'public/assets',file),'-resize',W+'x'+H+'!','-depth','8','RGBA:-'],{encoding:'buffer',maxBuffer:1<<26});
 const ground=groundFromPixels(stdout,W,H);if(!ground)throw Error(id+' has too little open ground');
 out[id]=ground;console.log(id,Math.round([...ground.cells].filter(c=>c==='1').length/ground.cells.length*100)+'% walkable');
 for(let r=0;r<ground.rows;r+=1)console.log(ground.cells.slice(r*ground.cols,(r+1)*ground.cols).replace(/0/g,'#').replace(/1/g,'.'));
}
await writeFile(resolve(root,'src/world/walk-grids.json'),JSON.stringify(out)+'\n');
