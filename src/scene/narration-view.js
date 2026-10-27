import {createNarrator} from './narration.js';
import {createNaturalSpeaker} from '../voice/natural-speaker.js';

export function installNarration(){
  const all=selector=>document.querySelectorAll(selector);
  const speaker=createNaturalSpeaker();
  const narrator=createNarrator({speech:speaker,Utterance:class{constructor(text){this.text=text;}},voiceInitially:false,voiceLabel:'Local neural voice',unavailableLabel:'Natural voice is not ready here. Captions still work.',onChange:s=>{
    for(const button of all('[data-narration-toggle]')){button.textContent=`Narration: ${s.enabled?'On':'Off'}`;button.setAttribute('aria-pressed',String(s.enabled));}
    for(const panel of all('[data-narration-panel]'))panel.hidden=!s.enabled;
    for(const caption of all('[data-narration-caption]')){caption.textContent=s.text;caption.setAttribute('aria-live',s.voiceEnabled&&s.canSpeak?'off':'polite');}
    for(const input of all('[data-narration-voice]')){input.checked=s.voiceEnabled;input.disabled=!s.canSpeak&&!s.voiceFailed;}
    for(const note of all('[data-narration-status]'))note.textContent=s.speaking?`${s.voiceStatus} Preparing or playing this caption…`:s.voiceStatus;
    for(const button of all('[data-narration-repeat]'))button.disabled=s.speaking||!s.enabled||!s.voiceEnabled||(!s.canSpeak&&!s.voiceFailed);
  }});
  for(const button of all('[data-narration-toggle]'))button.onclick=()=>narrator.setEnabled(!narrator.state().enabled);
  for(const input of all('[data-narration-voice]'))input.onchange=()=>narrator.setVoice(input.checked);
  for(const button of all('[data-narration-repeat]'))button.onclick=()=>narrator.repeat();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)narrator.stop();});
  window.addEventListener('pagehide',()=>narrator.stop());
  speaker.initialize();
  return narrator;
}
