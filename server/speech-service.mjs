import{createHash}from'node:crypto';
import{VOICE_MAX_BYTES,VOICE_RESERVATION,validateVoiceWav}from'../src/voice/audio.js';
export function createSpeechProvider({apiKey,fetchImpl=fetch}){
  return {async transcribe(bytes){
    const form=new FormData();form.append('request',new Blob([JSON.stringify({model:'muse-voice-transcribe-1.0',mode:'PUSH_TO_TALK',audioEncoding:'WAV',languageBias:['English'],keywords:['rainfall','ecosystem','wolves','rabbits']})],{type:'application/json'}));form.append('audio',new Blob([bytes],{type:'audio/wav'}),'question.wav');
    const response=await fetchImpl('https://api.meta.ai/v1/asr/transcribe',{method:'POST',redirect:'error',signal:AbortSignal.timeout(45000),headers:{Authorization:`Bearer ${apiKey}`,Accept:'application/json'},body:form});
    if(!response.ok){await response.body?.cancel();throw new Error(`Meta transcription HTTP ${response.status}. No retry.`);}
    let size=0;const chunks=[];for await(const chunk of response.body){size+=chunk.length;if(size>65000)throw new Error('Transcription response too large.');chunks.push(chunk);}
    let result;try{result=JSON.parse(Buffer.concat(chunks).toString());}catch{throw new Error('Invalid transcription response.');}
    if(typeof result.transcript!=='string'||!result.transcript.trim()||result.transcript.length>800||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result.transcript))throw new Error('No short usable question was transcribed.');
    return {transcript:result.transcript.trim(),provider:'Meta · Muse Voice Transcribe',audioDurationMs:result.audioDurationMs};
  }};
}
export function createSpeechService({enabled=false,creditsConfirmed=false,provider,budget}){
  const ready=enabled&&creditsConfirmed&&!!provider&&!!budget,cache=new Map();let active=false;
  return {status:()=>({enabled:!!ready,reservationMicroUsd:VOICE_RESERVATION,reason:ready?'Record up to 15 seconds, listen locally, then choose Send to Meta. Review the transcript before using it.':'Meta dictation is paused. Typing still works.'}),async run(input){
    if(!ready)throw new Error('Dictation is paused.');
    if(!input||Object.keys(input).some(k=>!['audio','consent'].includes(k))||input.consent!==true||typeof input.audio!=='string'||input.audio.length>Math.ceil(VOICE_MAX_BYTES/3)*4||!/^[A-Za-z0-9+/]+={0,2}$/.test(input.audio))throw new Error('Choose to send a bounded recording to Meta.');
    const bytes=Buffer.from(input.audio,'base64');validateVoiceWav(bytes);
    const hash=createHash('sha256').update(bytes).digest('hex');if(cache.has(hash))return {...cache.get(hash),cached:true};if(active)throw new Error('A transcription is already running.');active=true;
    try{await budget.reserve(hash);const result=await provider.transcribe(bytes);if(cache.size>=20)cache.delete(cache.keys().next().value);cache.set(hash,result);return {...result,cached:false};}finally{active=false;}
  }};
}
