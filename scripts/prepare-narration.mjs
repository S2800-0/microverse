// Offline preparation, reusing the already downloaded Kokoro model and voice.
// No provider key or network request. Only fixed, non-personal script text.
import {mkdir,writeFile,readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createNaturalVoice} from '../../microverse-hackathon/server/natural-voice.mjs';
import {NARRATION} from '../src/experience/narration.js';
const out=fileURLToPath(new URL('../public/audio/',import.meta.url));
await mkdir(out,{recursive:true});
let previous={clips:[]};try{previous=JSON.parse(await readFile(out+'credits.json','utf8'))}catch{}
const voice=createNaturalVoice({enabled:true});
if(!voice.status().enabled)throw Error('The existing local model is missing.');
const manifest={provider:'Local Kokoro Heart',model:'Kokoro-82M',voice:'af_heart',modelLicense:'Apache-2.0',mode:'Fixed clips generated once locally; no narration API calls during playback.',clips:[]};
for(const [id,text] of Object.entries(NARRATION)){
 const old=previous.clips.find(c=>c.id===id&&c.text===text);
 if(old){try{await access(out+old.file);manifest.clips.push(old);console.log('Reused '+id);continue}catch{}}
 const result=await voice.run({text});
 const wav='/tmp/microverse-narration-'+id+'.wav';
 await writeFile(wav,Buffer.from(result.audio.split(',')[1],'base64'));
 execFileSync('/opt/homebrew/bin/ffmpeg',['-y','-loglevel','error','-i',wav,'-codec:a','libmp3lame','-q:a','4',out+id+'.mp3']);
 manifest.clips.push({id,text,file:id+'.mp3'});console.log('Prepared '+id);
}
await writeFile(out+'credits.json',JSON.stringify(manifest,null,2));
