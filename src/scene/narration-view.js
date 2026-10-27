import {createNarrator} from './narration.js';

export function installNarration(){
  const all=selector=>document.querySelectorAll(selector);
  const narrator=createNarrator({speech:window.speechSynthesis,Utterance:window.SpeechSynthesisUtterance,onChange:s=>{
    for(const button of all('[data-narration-toggle]')){button.textContent=`Narration: ${s.enabled?'On':'Off'}`;button.setAttribute('aria-pressed',String(s.enabled));}
    for(const panel of all('[data-narration-panel]'))panel.hidden=!s.enabled;
    for(const caption of all('[data-narration-caption]')){caption.textContent=s.text;caption.setAttribute('aria-live',s.voiceEnabled&&s.canSpeak?'off':'polite');}
    for(const input of all('[data-narration-voice]')){input.checked=s.voiceEnabled;input.disabled=!s.canSpeak;}
    for(const note of all('[data-narration-status]'))note.textContent=s.voiceStatus;
    for(const button of all('[data-narration-repeat]'))button.disabled=!s.enabled||!s.voiceEnabled||!s.canSpeak;
  }});
  for(const button of all('[data-narration-toggle]'))button.onclick=()=>narrator.setEnabled(!narrator.state().enabled);
  for(const input of all('[data-narration-voice]'))input.onchange=()=>narrator.setVoice(input.checked);
  for(const button of all('[data-narration-repeat]'))button.onclick=()=>narrator.repeat();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)narrator.stop();});
  window.addEventListener('pagehide',()=>narrator.stop());
  return narrator;
}
