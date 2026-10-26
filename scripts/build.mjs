import { readdir, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';

const root=fileURLToPath(new URL('..',import.meta.url));
async function copyTree(from,to,code=false){
  await mkdir(to,{recursive:true});
  for(const entry of await readdir(from,{withFileTypes:true})){
    const source=join(from,entry.name),destination=join(to,entry.name.replace(/\.ts$/,'.js'));
    if(entry.isDirectory())await copyTree(source,destination,code);
    else if(code&&/\.(js|ts)$/.test(entry.name)){
      let content=await readFile(source,'utf8');
      if(entry.name.endsWith('.ts'))content=stripTypeScriptTypes(content);
      content=content.replace(/(['"][^'"\n]+)\.ts(['"])/g,'$1.js$2');
      await writeFile(destination,content);
    }else await copyFile(source,destination);
  }
}
await copyTree(join(root,'app'),join(root,'dist'));
await copyTree(join(root,'src'),join(root,'dist','src'),true);
await copyTree(join(root,'public'),join(root,'dist'));
await copyTree(join(root,'examples'),join(root,'dist','examples'));
console.log('Static browser build written to dist/ (no API keys or uploads).');
