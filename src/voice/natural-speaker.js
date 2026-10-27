export function createNaturalSpeaker(){
  let session=null,ready=false,request=null,audio=null,generation=0;const listeners=new Set();
  const voice={name:'Kokoro Heart',lang:'en-US',localService:true,default:true};
  function cancel(){generation++;request?.abort();request=null;if(audio){audio.pause();audio.src='';audio=null;}}
  const speaker={getVoices:()=>ready?[voice]:[],cancel,addEventListener:(name,fn)=>{if(name==='voiceschanged')listeners.add(fn);},removeEventListener:(name,fn)=>listeners.delete(fn),
    async speak(utterance){
      const current=++generation;request=new AbortController();
      try{const response=await fetch('/api/narration/run',{method:'POST',signal:request.signal,headers:{'Content-Type':'application/json','X-Microverse-Session':session},body:JSON.stringify({text:utterance.text})});const result=await response.json();if(!response.ok||typeof result.audio!=='string'||!/^data:audio\/wav;base64,[A-Za-z0-9+/]+=*$/.test(result.audio))throw new Error();if(current!==generation)return;
        audio=new Audio(result.audio);audio.onended=()=>{if(current===generation)utterance.onend?.();};audio.onerror=()=>{if(current===generation)utterance.onerror?.();};await audio.play();
      }catch{if(current===generation)utterance.onerror?.();}
    },async initialize(){
      try{const response=await fetch('/api/narration/status',{cache:'no-store'});const value=await response.json();session=value.session;ready=response.ok&&value.enabled===true&&typeof session==='string';}catch{ready=false;}for(const listener of listeners)listener();
    },
  };return speaker;
}
