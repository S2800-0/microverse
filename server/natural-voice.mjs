import{existsSync}from'node:fs';
import{fileURLToPath}from'node:url';
const modelPath=fileURLToPath(new URL('../runtime/kokoro-model/',import.meta.url));
export function createNaturalVoice({enabled=false,loadModel}={}){
  let modelPromise=null,active=false,pending=null;const cache=new Map();
  const ready=()=>enabled&&(!!loadModel||existsSync(modelPath+'onnx/model_quantized.onnx'));
  async function load(){
    if(!modelPromise)modelPromise=(async()=>{
      if(loadModel)return loadModel();
      const {env,RawAudio}=await import('@huggingface/transformers');env.allowRemoteModels=false;env.allowLocalModels=true;
      const {KokoroTTS}=await import('kokoro-js'),tts=await KokoroTTS.from_pretrained(modelPath,{dtype:'q8',device:'cpu'});
      // Generate sentence-sized chunks so the library's tokenizer cannot silently
      // truncate a complete multi-sentence caption at its 512-token boundary.
      return {async generate(text,options){const parts=[];let length=0;for(const sentence of text.split(/(?<=[.!?])\s+/)){if(sentence.length>350)throw new Error('Narration sentence too long.');const audio=await tts.generate(sentence,options);length+=audio.audio.length;if(length>24000*90)throw new Error('Narration exceeded 90 seconds.');parts.push(audio.audio);}const pcm=new Float32Array(length);let offset=0;for(const part of parts){pcm.set(part,offset);offset+=part.length;}return new RawAudio(pcm,24000);}};
    })().catch(error=>{modelPromise=null;throw error;});return modelPromise;
  }
  async function execute(text){
    active=true;
    try{
      if(cache.has(text))return {audio:cache.get(text),provider:'Local Kokoro Heart',cached:true};
      const tts=await load(),audio=await tts.generate(text,{voice:'af_heart',speed:1});const blob=await audio.toBlob();if(blob.size>4_000_000)throw new Error('Narration audio exceeded the limit.');const data='data:audio/wav;base64,'+Buffer.from(await blob.arrayBuffer()).toString('base64');if(cache.size>=6)cache.delete(cache.keys().next().value);cache.set(text,data);return {audio:data,provider:'Local Kokoro Heart',cached:false};
    }finally{active=false;if(pending){const next=pending;pending=null;execute(next.text).then(next.resolve,next.reject);}}
  }
  return {status:()=>({enabled:!!ready(),reason:ready()?'Local neural voice · Kokoro Heart. No Meta or paid speech call.':'Natural voice is unavailable. Captions still work.'}),async run(input){
    if(!ready())throw new Error('Run the local voice setup first.');
    if(!input||Object.keys(input).some(k=>k!=='text')||typeof input.text!=='string'||!input.text.trim()||input.text.length>700)throw new Error('Use a short narration caption.');
    if(cache.has(input.text))return {audio:cache.get(input.text),provider:'Local Kokoro Heart',cached:true};
    if(active)return new Promise((resolve,reject)=>{pending?.reject(new Error('A newer caption replaced this pending narration.'));pending={text:input.text,resolve,reject};});
    return execute(input.text);
  }};
}
