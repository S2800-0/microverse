import {createNarrator} from './narration.js';

// Callers provide only the fixed/current guide caption, never learner notes.
export function createStoryVoice({speaker,onChange=()=>{}}){
  let generation=0,disposed=false,initialized=null;
  const narrator=createNarrator({speech:speaker,Utterance:class{constructor(text){this.text=text;}},voiceInitially:true,voiceLabel:'Natural voice',onChange});
  return {
    caption:text=>narrator.say(text),state:()=>narrator.state(),stop:()=>narrator.stop(),repeat:()=>narrator.repeat(),
    async enable(value){const current=++generation;if(!value){narrator.setEnabled(false);return;}
      initialized??=Promise.resolve().then(()=>speaker.initialize()).catch(()=>{});await initialized;
      if(disposed||current!==generation)return;narrator.setEnabled(true);
    },
    destroy(){disposed=true;generation++;narrator.dispose();},
  };
}
