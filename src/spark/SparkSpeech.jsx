import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {SpeakerHigh} from '@phosphor-icons/react';
import {SparkAvatar} from './SparkAvatar.jsx';
export const SparkSpeechContext=createContext(null);
export const useSparkSpeech=()=>useContext(SparkSpeechContext);
export function DialogGuide({dialogRef,clip='dialog_records'}){
 const speech=useSparkSpeech(),current=useRef(speech),[visible,setVisible]=useState(false);current.current=speech;
 useEffect(()=>{const el=dialogRef.current;if(!el)return;const update=()=>{setVisible(el.open);if(el.open&&current.current?.narration)current.current.read(clip,{automatic:true,priority:3});else if(!el.open&&current.current?.activeKey===clip)current.current.stopVoice()};const observer=new MutationObserver(update);observer.observe(el,{attributes:true,attributeFilter:['open']});update();return()=>observer.disconnect()},[dialogRef,clip]);
 if(!speech||!visible)return null;return <div className="dialog-spark"><SparkAvatar companion={speech.companion} small paused={speech.paused} speaking={speech.speaking&&speech.activeKey===clip}/><span>{speech.companion.name} is here to help.</span><button aria-label="Hear Spark explain this dialog" onClick={()=>speech.read(clip)}><SpeakerHigh size={21}/></button></div>;
}
