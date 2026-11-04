import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {NARRATION} from '../src/experience/narration.js';
const requireMain=createRequire(new URL('../../microverse-hackathon/package.json',import.meta.url));
const transformers=await import(requireMain.resolve('@huggingface/transformers').replace('.cjs','.mjs'));const env=transformers.env;env.allowRemoteModels=false;env.allowLocalModels=true;
const {KokoroTTS}=await import(requireMain.resolve('kokoro-js').replace('.cjs','.js'));
const tts=await KokoroTTS.from_pretrained(fileURLToPath(new URL('../../microverse-hackathon/runtime/kokoro-model/',import.meta.url)),{dtype:'q8',device:'cpu'});
for(const [id,voice] of [['bella','af_bella'],['emma','bf_emma']]){
 const dir=new URL('../public/audio/'+id+'/',import.meta.url);await mkdir(dir,{recursive:true});
 let previous={clips:[]};try{previous=JSON.parse(await readFile(new URL('credits.json',dir),'utf8'))}catch{}
 const manifest={model:'Kokoro-82M',voice,license:'Apache-2.0',mode:'Prepared locally once, no remote speech calls',clips:[]};
 for(const [key,text] of Object.entries(NARRATION)){
  const file=key+'.mp3',old=previous.clips.find(c=>c.id===key&&c.text===text);try{if(old){await access(new URL(file,dir));manifest.clips.push(old);continue}}catch{}
  const audio=await tts.generate(text,{voice,speed:.96});const blob=await audio.toBlob();const wav='/tmp/microverse-'+id+'-'+key+'.wav';await writeFile(wav,Buffer.from(await blob.arrayBuffer()));execFileSync('/opt/homebrew/bin/ffmpeg',['-y','-loglevel','error','-i',wav,'-codec:a','libmp3lame','-q:a','4',fileURLToPath(new URL(file,dir))]);manifest.clips.push({id:key,text,file});await writeFile(new URL('credits.json',dir),JSON.stringify(manifest,null,2));console.log(id+' '+key);
 }
 await writeFile(new URL('credits.json',dir),JSON.stringify(manifest,null,2));
}
