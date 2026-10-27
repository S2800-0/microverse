import {changeLabel} from '../investigation/changes.js';

const percent=n=>Number((n*100).toFixed(1));
const plural={rabbit:'rabbits',deer:'deer',fox:'foxes',wolf:'wolves',dog:'dogs',cat:'cats',penguin:'penguins'};
const animalLabel=(species,count)=>count===1?species:plural[species]||'creatures';
export function narrationSnapshot(state){
  return {week:state.week,season:state.season,grass:state.grass,browse:state.browse,counts:{...state.counts},eventCount:state.world.events.length};
}
export function forestNarration(before,state){
  const current=narrationSnapshot(state),lines=[`Model week ${current.week}, ${current.season}.`];
  if(!before){
    const count=Object.values(current.counts).reduce((a,b)=>a+b,0);
    lines.push(`${count} creatures. Grass cover ${percent(current.grass)} percent; shrub food cover ${percent(current.browse)} percent.`);
    lines.push('Advance a week to hear recorded changes. These are model observations.');return lines.join(' ');
  }
  lines.push(`Changes since model week ${before.week}:`);
  for(const [label,delta]of [['Grass cover',Number((percent(current.grass)-percent(before.grass)).toFixed(1))],['Shrub food cover',Number((percent(current.browse)-percent(before.browse)).toFixed(1))]]){
    if(Math.abs(delta)>=.1)lines.push(`${label} ${delta>0?'rose':'fell'} by ${Number(Math.abs(delta).toFixed(1))} percentage points.`);
  }
  const changes=Object.keys(current.counts).map(species=>({species,delta:current.counts[species]-(before.counts[species]||0)})).filter(v=>v.delta).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));
  for(const {species,delta}of changes.slice(0,2))lines.push(`${Math.abs(delta)} ${delta>0?'more':'fewer'} ${animalLabel(species,Math.abs(delta))} than before.`);
  const events=state.world.events.slice(before.eventCount),counts=type=>events.filter(e=>e.type===type).length;
  const records=[['birth','birth','births'],['kill','successful hunt','successful hunts'],['death','death','deaths'],['arrive','arrival','arrivals'],['disturb','companion disturbance','companion disturbances']].filter(([type])=>counts(type)).slice(0,3);
  if(records.length)lines.push(`The event log records ${records.map(([type,one,many])=>`${counts(type)} ${counts(type)===1?one:many}`).join(', ')}.`);
  if(lines.length===2)lines.push('No population or rounded food-cover change was recorded in this step.');
  lines.push('Inspect the event log for details.');return lines.join(' ');
}
export function comparisonNarration(packet){
  const lines=[`Experiment week ${packet.elapsed}. ${changeLabel(packet.change)}.`];
  if(!packet.elapsed)return `${lines[0]} Both worlds start from the same forest. Advance them together, then compare the records.`;
  for(const id of ['grass','browse']){
    const o=packet.observations.find(v=>v.id===id),difference=Math.abs(o.difference);
    lines.push(`${id==='grass'?'Grass':'Shrub food'} cover is ${difference?`${difference} percentage points ${o.difference>0?'higher':'lower'}`:'the same at the recorded precision'} in the changed world.`);
  }
  const changed=packet.observations.filter(o=>o.id.startsWith('population.')&&o.difference).sort((a,b)=>Math.abs(b.difference)-Math.abs(a.difference));
  for(const o of changed.slice(0,2))lines.push(`The changed world has ${Math.abs(o.difference)} ${o.difference>0?'more':'fewer'} ${animalLabel(o.id.split('.')[1],Math.abs(o.difference))} than the baseline.`);
  if(!changed.length)lines.push('Population counts currently match.');
  lines.push('These differences are observations, not proof of a cause. Inspect the evidence and write your explanation.');
  return lines.join(' ');
}

// Only explicitly local English voices qualify. No photos, names, questions or
// learner responses enter the generated caption or the speech service.
export function createNarrator({speech=null,Utterance=null,now=Date.now,onChange=()=>{}}={}){
  let enabled=false,voiceEnabled=true,latest='',text='',speaking=false,voice=null,voiceFailed=false,last=-Infinity,generation=0;
  const state=()=>({enabled,voiceEnabled,text,speaking,canSpeak:!!voice&&!voiceFailed,
    voiceStatus:voiceFailed?'Voice playback failed. Captions still work.':voice?`Device voice: ${voice.name}. No Meta call.`:'No local English voice available. Captions still work.'});
  const notify=()=>onChange(state());
  function stop(){generation++;speaking=false;try{speech?.cancel();}catch{}notify();}
  function read(){
    stop();if(!enabled||!voiceEnabled||!voice||voiceFailed||!text)return;
    const current=generation,utterance=new Utterance(text);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.95;
    utterance.onend=()=>{if(current===generation){speaking=false;notify();}};
    utterance.onerror=()=>{if(current===generation){voiceFailed=true;speaking=false;notify();}};
    speaking=true;notify();try{speech.speak(utterance);}catch{utterance.onerror();}
  }
  function refreshVoices(){
    const previous=voice;
    try{const voices=Utterance?speech?.getVoices()||[]:[];voice=voices.find(v=>v.localService===true&&/^en(?:[-_]|$)/i.test(v.lang)&&v.default)||voices.find(v=>v.localService===true&&/^en(?:[-_]|$)/i.test(v.lang))||null;}catch{voice=null;}
    if(previous&&previous!==voice)stop();notify();
    // Voice discovery never starts speech without another explicit user action.
  }
  refreshVoices();speech?.addEventListener?.('voiceschanged',refreshVoices);
  return {state,stop,
    setEnabled(value){enabled=!!value;if(enabled){text=latest;last=now();notify();read();}else stop();},
    setVoice(value){voiceEnabled=!!value;voiceFailed=false;notify();read();},
    say(value,{automatic=false}={}){
      if(typeof value!=='string'||value.length>1200)throw new Error('Invalid narration text.');latest=value;
      if(automatic&&enabled&&(speaking||now()-last<8000))return;
      if(text===value)return;text=value;notify();if(enabled){last=now();read();}
    },
    context(value){stop();last=-Infinity;latest='';text='';this.say(value);},
    repeat(){if(enabled){last=now();read();}},
    dispose(){stop();speech?.removeEventListener?.('voiceschanged',refreshVoices);},
  };
}
