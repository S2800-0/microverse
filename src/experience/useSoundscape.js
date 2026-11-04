import {createVoiceCues} from './voice-cues.js';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {NARRATION,narrationKey} from './narration.js';
// Original, quiet synthesized notes; no third-party recording or streaming call.
function createMusic(){
  const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw Error('Audio is unavailable in this browser.');
  const context=new Context(),master=context.createGain();master.gain.value=.018;master.connect(context.destination);
  const notes=[261.63,329.63,392,523.25,440,392,329.63,293.66];let index=0,timer=null;
  const play=()=>{if(document.hidden)return;const now=context.currentTime,o=context.createOscillator(),gain=context.createGain();o.type='sine';o.frequency.value=notes[index++%notes.length];gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.6,now+.25);gain.gain.exponentialRampToValueAtTime(.001,now+3.5);o.connect(gain);gain.connect(master);o.start(now);o.stop(now+3.6);o.onended=()=>{o.disconnect();gain.disconnect()}};
  const resume=()=>context.resume();resume();play();timer=setInterval(play,2200);
  const visibility=()=>{if(document.hidden)context.suspend();else context.resume()};document.addEventListener('visibilitychange',visibility);
  return {stop(){clearInterval(timer);document.removeEventListener('visibilitychange',visibility);context.close()},duck(on){master.gain.setTargetAtTime(on ? .006 : .018,context.currentTime,.1)}};
}
export function useSoundscape(screen,review,overrideKey=null){
  const [narration,setNarration]=useState(true),[music,setMusic]=useState(true),[voice,setVoice]=useState('heart'),[status,setStatus]=useState(''),[speaking,setSpeaking]=useState(false),[activeKey,setActiveKey]=useState(null),[voiceBusy,setVoiceBusy]=useState(false),[spokenText,setSpokenText]=useState('');
  const audio=useRef(null),bed=useRef(null),enabled=useRef(true),musicWanted=useRef(true),unlocked=useRef(false),wanted=useRef(null),currentKey=useRef(null),voiceRequest=useRef(null);
  const cues=useRef(null);cues.current??=createVoiceCues();
  useLayoutEffect(()=>{cues.current.begin(screen+'/'+review+'/'+(overrideKey||''))},[screen,review,overrideKey]);
  const key=overrideKey||narrationKey(screen,review);currentKey.current=key;
  function stopVoice(){cues.current.stop();voiceRequest.current?.abort();voiceRequest.current=null;setVoiceBusy(false);setSpeaking(false);if(audio.current){audio.current.pause();audio.current.removeAttribute('src');audio.current.load()}bed.current?.duck(false)}
  function playClip(nextKey=key){wanted.current=nextKey;stopVoice();if(!nextKey||!unlocked.current)return;setActiveKey(nextKey);audio.current??=new Audio();const player=audio.current;player.src=(voice==='heart'?'/audio/':'/audio/'+voice+'/')+nextKey+'.mp3';player.volume=.85;player.onplaying=()=>setSpeaking(true);player.onpause=()=>setSpeaking(false);player.onended=()=>{setSpeaking(false);bed.current?.duck(false)};player.onerror=()=>{setSpeaking(false);setStatus('The voice could not load. The words are still on screen.');bed.current?.duck(false)};bed.current?.duck(true);player.play().then(()=>setStatus('')).catch(()=>{setStatus('Tap “Read this again” to start the voice.');bed.current?.duck(false)})}
  function read(nextKey=key,{automatic=false,priority=1}={}){wanted.current=nextKey;if(!unlocked.current)return;if(automatic)cues.current.automatic(nextKey,priority,()=>playClip(nextKey));else cues.current.manual(()=>playClip(nextKey))}
  async function speakText(text){
   if(!text?.trim()||text.length>700)return;stopVoice();const request=new AbortController();voiceRequest.current=request;setVoiceBusy(true);setSpokenText(text);setActiveKey('custom_answer');
   try{const status=await(await fetch('/api/world-tools/status',{signal:request.signal})).json();if(!status.localVoiceEnabled)throw Error('The local voice is unavailable.');const r=await fetch('/api/world-tools/speak',{method:'POST',signal:request.signal,headers:{'Content-Type':'application/json','X-Microverse-Session':status.session},body:JSON.stringify({text})});const d=await r.json();if(!r.ok)throw Error(d.error||'The voice could not finish.');if(request.signal.aborted)return;audio.current??=new Audio();const player=audio.current;player.src=d.audio;player.volume=.85;player.onplaying=()=>setSpeaking(true);player.onpause=()=>setSpeaking(false);player.onended=()=>{setSpeaking(false);bed.current?.duck(false)};bed.current?.duck(true);await player.play();setStatus('');}catch(e){if(e.name!=='AbortError')setStatus('The answer is still here to read. Its voice could not start.')}finally{if(voiceRequest.current===request)setVoiceBusy(false)}
  }
  function toggleNarration(){const next=!enabled.current;enabled.current=next;setNarration(next);if(next)read();else stopVoice()}
  function toggleMusic(){musicWanted.current=!musicWanted.current;setMusic(musicWanted.current);if(!musicWanted.current){bed.current?.stop();bed.current=null}else startMusic()}
  function startMusic(){if(!musicWanted.current||bed.current)return;try{bed.current=createMusic();if(enabled.current)bed.current.duck(true)}catch{setStatus('Music is unavailable in this browser.')}}
  useEffect(()=>{const unlock=()=>{if(unlocked.current)return;unlocked.current=true;window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);startMusic();setTimeout(()=>{if(enabled.current)read(wanted.current||currentKey.current,{automatic:true,priority:0})},0)};window.addEventListener('pointerdown',unlock,{once:true});window.addEventListener('keydown',unlock,{once:true});return()=>{window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock)}},[]);
  useEffect(()=>{if(enabled.current&&key)read(key,{automatic:true,priority:1});return stopVoice},[key,voice]);
  useEffect(()=>{const hide=()=>{if(document.hidden)stopVoice()};document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);stopVoice();bed.current?.stop()}},[]);
  return {voiceScope:scope=>cues.current.begin(screen+'/'+review+'/'+(overrideKey||'')+'/'+scope),cancelAuto:key=>cues.current.stop(key),narration,music,status,key,activeKey,speaking,voiceBusy,speakText,stopVoice,caption:activeKey==='custom_answer'?spokenText:narration&&(activeKey||key)?NARRATION[activeKey||key]:null,toggleNarration,toggleMusic,read,voice,setVoice};
}
