import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft,ArrowRight,ArrowUp,ArrowDown} from '@phosphor-icons/react';
import {SparkAvatar} from '../spark/SparkAvatar.jsx';
import {useSparkSpeech} from '../spark/SparkSpeech.jsx';
import {SpeakerHigh} from '@phosphor-icons/react';
import {placeCoachmark} from '../experience/coachmarks.js';

export function Coachmark({step,onDismiss,onSkip}){
  const speech=useSparkSpeech(),voiceKey=step.voiceKey||'hint_world',currentSpeech=useRef(speech);currentSpeech.current=speech;

  const ref=useRef(null),[position,setPosition]=useState(null),[inlineSlot,setInlineSlot]=useState(null),[spot,setSpot]=useState(null);
  useEffect(()=>{if(!position&&!inlineSlot)return;if(currentSpeech.current?.narration)currentSpeech.current.read(voiceKey,{automatic:true,priority:2});return()=>{currentSpeech.current?.cancelAuto(voiceKey);if(currentSpeech.current?.activeKey===voiceKey)currentSpeech.current.stopVoice()}},[voiceKey,speech?.narration,speech?.voice,!!position||!!inlineSlot]);
  useLayoutEffect(()=>{
    const target=document.querySelector(step.target);if(!target)return;
    const media=matchMedia('(max-width:700px)');let slot;
    const sync=()=>{
      slot?.remove();slot=null;
      // Flow content can make room for a hint on a phone. Floating world controls cannot.
      if(media.matches&&!target.closest('.forest-controls')&&!['forest','watch','compare'].some(key=>step.target===({forest:'.forest-controls',watch:'.world-condition',compare:'.compare-action'})[key])){
        slot=document.createElement('div');slot.className='coachmark-slot';target.after(slot);
      }
      setInlineSlot(slot);
    };
    sync();media.addEventListener('change',sync);
    return()=>{media.removeEventListener('change',sync);slot?.remove()};
  },[step]);
  useLayoutEffect(()=>{
    const target=document.querySelector(step.target);if(!target||!ref.current)return;
    const update=()=>{if(!ref.current)return;const b=target.getBoundingClientRect();setSpot({left:b.left-9,top:b.top-9,width:b.width+18,height:b.height+18});if(inlineSlot)return;
      const avoid=[...document.querySelectorAll('.flow-copy h1,.flow-copy>p,.flow-copy button,.site-header button,.photo-toggle,.photo-credit,.forest-invitation,.forest-clock,.ask-guide,.forest-controls button')]
        .filter(el=>el!==target&&!target.contains(el)).map(el=>el.getBoundingClientRect());
      const anchor=innerWidth<=700?(target.closest('.forest-controls')||target):target;
      setPosition(placeCoachmark(anchor.getBoundingClientRect(),{width:innerWidth,height:innerHeight},ref.current.getBoundingClientRect(),avoid));
    };
    target.classList.add('tutorial-target');update();
    const ro=new ResizeObserver(update);ro.observe(target);ro.observe(ref.current);
    window.addEventListener('resize',update);window.addEventListener('scroll',update,{passive:true,capture:true});
    return()=>{ro.disconnect();target.classList.remove('tutorial-target');window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true)};
  },[step,inlineSlot]);
  const side=inlineSlot?'bottom':position?.side||'right';
  const Icon=side==='right'?ArrowLeft:side==='left'?ArrowRight:side==='bottom'?ArrowUp:ArrowDown;
  const note=<aside ref={ref} className={'coachmark coachmark-'+side+(inlineSlot?' coachmark-inline':'')} style={inlineSlot?undefined:position?{left:position.x,top:position.y,width:position.width}:{visibility:'hidden'}} role="note" aria-label="A little helping hand"><div className="coachmark-guide">{speech&&<><SparkAvatar companion={speech.companion} small paused={speech.paused} speaking={speech.speaking&&speech.activeKey===voiceKey}/><strong>{speech.companion.name} says…</strong><button aria-label="Read this hint aloud" onClick={()=>speech.read(voiceKey)}><SpeakerHigh size={20}/></button></>}</div><Icon className="coachmark-arrow" size={24} weight="bold"/><p>{step.text}</p><div className="coachmark-actions"><button onClick={onDismiss}>Got it</button><button onClick={onSkip}>Skip hints</button></div></aside>;
  return <>{spot&&createPortal(<div className="tutorial-spotlight" aria-hidden="true" style={spot}/>,document.body)}{inlineSlot?createPortal(note,inlineSlot):createPortal(note,document.body)}</>;
}
