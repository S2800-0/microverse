import{encodeVoiceWav,VOICE_RATE,VOICE_SECONDS}from'./audio.js';
export async function recordingToWav(blob){
  const context=new AudioContext();let buffer;
  try{buffer=await context.decodeAudioData(await blob.arrayBuffer());}finally{await context.close();}
  if(buffer.duration<.3||buffer.duration>VOICE_SECONDS+.15)throw new Error('Record a question of up to 15 seconds.');
  const frames=Math.min(VOICE_RATE*VOICE_SECONDS,Math.floor(buffer.duration*VOICE_RATE));
  const offline=new OfflineAudioContext(1,frames,VOICE_RATE),source=offline.createBufferSource();source.buffer=buffer;source.connect(offline.destination);source.start();
  return encodeVoiceWav((await offline.startRendering()).getChannelData(0));
}
export function createQuestionRecorder({capture,makeRecorder,convert=recordingToWav,send,onChange=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}){
  let generation=0,stream=null,recorder=null,timer=null,request=null;
  let state={phase:'idle',audio:null,transcript:'',message:'Record locally, then choose whether to send the clip to Meta.'};
  const update=patch=>{state={...state,...patch};onChange({...state});};
  const release=()=>{stream?.getTracks().forEach(track=>track.stop());stream=null;clearTimer(timer);timer=null;};
  function cancel(){generation++;request?.abort();request=null;if(recorder){recorder.onstop=null;recorder.ondataavailable=null;if(recorder.state!=='inactive')recorder.stop();recorder=null;}release();update({phase:'idle',audio:null,transcript:'',message:'Recording discarded. Typing still works.'});}
  return {getState:()=>({...state}),cancel,
    async start(){
      cancel();const current=generation;update({phase:'requesting',message:'Allow the microphone to record one question locally.'});
      try{const obtained=await capture();if(current!==generation){obtained.getTracks().forEach(t=>t.stop());return;}stream=obtained;recorder=makeRecorder(stream);const recording=recorder,chunks=[];let size=0;
        recording.ondataavailable=event=>{if(current!==generation||!event.data.size)return;size+=event.data.size;if(size>2_000_000){cancel();update({phase:'error',message:'Recording exceeded its size limit. Nothing was sent.'});return;}chunks.push(event.data);};
        recording.onerror=()=>{if(current===generation){cancel();update({phase:'error',message:'Microphone recording failed. Nothing was sent.'});}};
        recording.onstop=async()=>{if(current!==generation)return;release();update({phase:'preparing',message:'Preparing the clip locally. Nothing has been sent.'});
          try{const audio=await convert(new Blob(chunks,{type:recording.mimeType}));if(current===generation)update({phase:'ready',audio,message:'Listen to the clip, then choose Send recording to Meta. No automatic upload.'});}catch(error){if(current===generation)update({phase:'error',message:error.message});}
        };
        recording.start(250);update({phase:'recording',message:'Recording locally. Stops automatically after 15 seconds.'});timer=setTimer(()=>{if(current===generation&&recording.state==='recording')recording.stop();},VOICE_SECONDS*1000);
      }catch{if(current===generation){release();update({phase:'error',message:'Microphone unavailable or permission declined. Nothing was sent; you can type instead.'});}}
    },
    stop(){if(recorder?.state==='recording')recorder.stop();},
    async transcribe(){
      if(state.phase!=='ready'||!state.audio)return;const current=generation;request=new AbortController();update({phase:'sending',message:'Sending this clip to Meta for transcription. No automatic retry.'});
      try{const result=await send(state.audio,request.signal);if(current!==generation)return;update({phase:'transcribed',transcript:result.transcript,message:'Review and edit the transcript. Use transcript only fills the question; it does not run an experiment.'});}
      catch(error){if(current===generation)update({phase:'ready',message:error.message||'Transcription failed. No automatic retry.'});}
      finally{if(current===generation)request=null;}
    },
  };
}
