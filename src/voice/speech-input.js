import{createQuestionRecorder}from'./recorder.js';
export function installSpeechInput({dialog,onUse,onBeforeRecord=()=>{}}){
  const el=id=>document.getElementById(id);let service={enabled:false},audioRef=null,url=null;
  const supported=!!navigator.mediaDevices?.getUserMedia&&!!window.MediaRecorder&&!!window.AudioContext&&!!window.OfflineAudioContext;
  const controller=createQuestionRecorder({capture:()=>navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true},video:false}),makeRecorder:stream=>new MediaRecorder(stream),
    send:async(bytes,signal)=>{
      let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
      const response=await fetch('/api/speech/run',{method:'POST',signal,headers:{'Content-Type':'application/json','X-Microverse-Session':service.session},body:JSON.stringify({audio:btoa(binary),consent:true})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Transcription failed. No automatic retry.');return result;
    },onChange:s=>{
      const busy=['requesting','recording','preparing','sending'].includes(s.phase);
      el('speech-record').disabled=!supported||!service.enabled||busy;el('speech-stop').disabled=s.phase!=='recording';el('speech-cancel').disabled=s.phase==='idle';el('speech-send').disabled=s.phase!=='ready'||!service.enabled;
      el('speech-status').textContent=s.message;el('speech-transcript-field').hidden=s.phase!=='transcribed';el('speech-use').hidden=s.phase!=='transcribed';
      if(s.phase==='transcribed')el('speech-transcript').value=s.transcript;
      if(s.audio!==audioRef){el('speech-playback').pause();if(url)URL.revokeObjectURL(url);url=null;audioRef=s.audio;if(s.audio){url=URL.createObjectURL(new Blob([s.audio],{type:'audio/wav'}));el('speech-playback').src=url;}else{el('speech-playback').removeAttribute('src');el('speech-playback').load();}el('speech-playback').hidden=!s.audio;}
    }});
  el('speech-record').onclick=()=>{if(service.enabled&&supported){onBeforeRecord();controller.start();}};
  el('speech-stop').onclick=()=>controller.stop();el('speech-cancel').onclick=()=>controller.cancel();el('speech-send').onclick=()=>controller.transcribe();
  el('speech-use').onclick=()=>{const text=el('speech-transcript').value.trim();if(!text||text.length>800){el('speech-status').textContent='Keep the question between 1 and 800 characters.';return;}onUse(text);controller.cancel();};
  dialog.addEventListener('close',()=>controller.cancel());document.addEventListener('visibilitychange',()=>{if(document.hidden)controller.cancel();});
  return {async open(){controller.cancel();try{const r=await fetch('/api/speech/status',{cache:'no-store'}),s=await r.json();service=r.ok&&typeof s.session==='string'?s:{enabled:false};}catch{service={enabled:false};}
    el('speech-record').disabled=!supported||!service.enabled;el('speech-status').textContent=!supported?'This browser cannot record audio here. Typing still works.':service.reason||'Meta dictation is unavailable here. Typing still works.';
  }};
}
