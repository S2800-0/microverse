// The learner's question guide. A reply is a selection of evidence that already exists in this run
// (observations, recorded events, model rules) plus a follow-up from a reviewed list. Sentences, numbers and
// action chips are always rendered here, never taken from a provider. Meta Spark may choose the selection;
// the local guide chooses it with plain keyword matching and is also the fallback for every failure.
import {explanationLines} from './evidence.js';

export const FOLLOW_UPS={
  'compare-food':'Compare the food bars. Which forest has less grass or shrub food?',
  'check-rabbits':'Look at the rabbit numbers. Do both forests match?',
  'find-moment':'Open a recorded moment. What happened in that week?',
  'read-rule':'Read the model rule behind this. What else could affect it?',
  'next-weeks':'Advance a few weeks. Does the pattern change?',
  'at-home':'Where might you look for something like this near home?',
};
const MAX={observationIds:6,eventIds:6,mechanismIds:4};

function pickIds(value,packet){
  const sources={observationIds:packet.observations,eventIds:packet.events,mechanismIds:packet.mechanisms};
  const out={};
  for(const key of Object.keys(MAX)){
    const list=value[key];
    if(!Array.isArray(list)||list.length>MAX[key]||new Set(list).size!==list.length||list.some(id=>typeof id!=='string'||!sources[key].some(s=>s.id===id)))throw new Error('The guide cited evidence that is not in this run.');
    out[key]=[...list];
  }
  return out;
}

// Returns {status:'answer',observationIds,eventIds,mechanismIds,followUpId,lookId} or {status,message,...empty}.
// A clarification or refusal keeps only its short message: it can never carry evidence, actions or changes.
export function validateGuide(value,packet){
  if(!value||typeof value!=='object'||Object.keys(value).some(k=>!['status','message','observationIds','eventIds','mechanismIds','followUpId','lookId'].includes(k)))throw new Error('Invalid guide reply.');
  if(!['answer','clarify','unsupported'].includes(value.status))throw new Error('Invalid guide reply.');
  if(value.status!=='answer'){
    if(typeof value.message!=='string'||!value.message.trim()||value.message.length>200)throw new Error('Invalid guide reply.');
    return {status:value.status,message:value.message.trim()};
  }
  const ids=pickIds(value,packet);
  if(!ids.observationIds.length&&!ids.eventIds.length)throw new Error('The guide cited no evidence.');
  if(typeof value.followUpId!=='string'||!Object.hasOwn(FOLLOW_UPS,value.followUpId))throw new Error('Invalid guide follow-up.');
  const selected=new Set([...ids.observationIds,...ids.eventIds,...ids.mechanismIds]);
  const look=value.lookId==='none'?null:value.lookId??null;
  if(look!==null&&(typeof look!=='string'||!selected.has(look)))throw new Error('The guide pointed at evidence it did not cite.');
  return {status:'answer',...ids,followUpId:value.followUpId,lookId:look};
}

export function guideSchema(packet){
  const ids=(source,max)=>({type:'array',items:{type:'string',enum:source.map(v=>v.id)},maxItems:max});
  const all=[...packet.observations,...packet.events,...packet.mechanisms].map(v=>v.id);
  return {type:'object',additionalProperties:false,properties:{
    status:{type:'string',enum:['answer','clarify','unsupported']},
    message:{type:'string'},
    observationIds:ids(packet.observations,MAX.observationIds),eventIds:ids(packet.events,MAX.eventIds),mechanismIds:ids(packet.mechanisms,MAX.mechanismIds),
    followUpId:{type:'string',enum:Object.keys(FOLLOW_UPS)},
    lookId:{type:'string',enum:['none',...all]},
  },required:['status','message','observationIds','eventIds','mechanismIds','followUpId','lookId']};
}

const TOPICS=[
  {words:/\b(grass|plant|plants|food|rain|rainfall|dry|drought|wet|water|regrow|growth)\b/,observations:['grass','browse'],mechanisms:['rain-growth'],follow:'compare-food'},
  {words:/\b(rabbit|rabbits|bunny|bunnies)\b/,observations:['population.rabbit'],mechanisms:['rabbit-food'],follow:'check-rabbits'},
  {words:/\b(deer|fawn|fawns|buck|doe)\b/,observations:['population.deer'],mechanisms:['deer-food'],follow:'check-rabbits'},
  {words:/\b(fox|foxes|wolf|wolves|hunt|hunts|eat|eaten|predator|predators|prey)\b/,observations:['population.fox','population.wolf'],mechanisms:['predation'],follow:'read-rule'},
  {words:/\b(born|birth|births|baby|babies|die|died|dies|death|deaths|arrive|arrived|happened|moment|record)\b/,observations:[],mechanisms:[],events:true,follow:'find-moment'},
  {words:/\b(why|because|cause|causes|reason)\b/,observations:[],mechanisms:[],follow:'read-rule'},
];
// Free and instant. Plain keyword matching over this run's evidence; it never invents anything.
function topicsFor(question){
  const text=String(question||'').toLowerCase();
  const observations=new Set(),mechanisms=new Set();let events=false,follow=null;
  for(const t of TOPICS){if(!t.words.test(text))continue;t.observations.forEach(id=>observations.add(id));t.mechanisms.forEach(id=>mechanisms.add(id));events||=!!t.events;follow??=t.follow;}
  return {text,observations,mechanisms,events,follow,why:/\b(why|because|cause|causes|reason)\b/.test(text)};
}
export function guideLocal(question,packet){
  const {text,observations,mechanisms,events,follow}=topicsFor(question);
  if(!observations.size&&!events)return validateGuide({status:'clarify',message:'I can look at the food, rabbits, deer, foxes, wolves or a recorded moment. Which would you like to see?'},packet);
  const known=new Set(packet.observations.map(o=>o.id));
  // Recorded moments only when they are about what was asked: the same species, or the kind of moment named.
  const species=[...observations].filter(id=>id.startsWith('population.')).map(id=>id.split('.')[1]);
  const kinds=[/\b(born|birth|births|baby|babies)\b/.test(text)&&/ was born/,/\b(die|died|dies|death|deaths|eaten)\b/.test(text)&&/ (died|was removed)/,/\b(arrive|arrived)\b/.test(text)&&/ arrived/].filter(Boolean);
  const about=e=>(!species.length||species.some(sp=>e.text.includes(`${sp} #`)))&&(!kinds.length||kinds.some(k=>k.test(e.text)));
  const eventIds=(events||species.length?[...packet.events.filter(e=>e.branch==='changed'),...packet.events.filter(e=>e.branch!=='changed')].filter(about):[]).slice(0,3).map(e=>e.id);
  const observationIds=[...observations].filter(id=>known.has(id)).slice(0,MAX.observationIds);
  if(!observationIds.length&&!eventIds.length)return validateGuide({status:'clarify',message:'Nothing has been recorded about that yet. Advance a few weeks and ask again.'},packet);
  return validateGuide({status:'answer',observationIds,eventIds,mechanismIds:[...mechanisms].slice(0,MAX.mechanismIds),followUpId:follow||'compare-food',lookId:null},packet);
}

// Everything the bubble shows, built here. Chips only point at evidence already cited and validated.
export function guideReply(result,packet,source){
  if(result.status!=='answer')return {source,kind:result.status,text:result.message,lines:[],chips:[],followUp:null};
  const onlyEvents=!result.observationIds.length;
  const selection={observationIds:onlyEvents?[packet.observations[0].id]:result.observationIds,eventIds:result.eventIds,mechanismIds:result.mechanismIds,followUp:FOLLOW_UPS[result.followUpId]};
  const lines=explanationLines(packet,selection).filter(l=>['observation','event','mechanism'].includes(l.kind)&&!(onlyEvents&&l.kind==='observation'));
  const chips=lines.filter(l=>l.ref&&l.kind!=='mechanism').map(l=>({kind:l.kind==='event'?'event':'measurement',id:l.ref,label:l.kind==='event'?'Open this record':'See measurement'}));
  for(const id of result.mechanismIds)chips.push({kind:'rule',id,label:'Read the model rule'});
  if(result.lookId){const i=chips.findIndex(c=>c.id===result.lookId);if(i>0)chips.unshift(...chips.splice(i,1));}
  return {source,kind:'answer',text:'',lines:lines.map(l=>({kind:l.kind,text:l.text,ref:l.ref||null})),chips,followUp:FOLLOW_UPS[result.followUpId]};
}

// A child should see a short answer: at most 3 lines (so at most 3 chips). Keep what was asked about, drop the rest.
// Works on any validated answer, whether the local guide or Spark chose it. Never adds evidence that was not cited.
export function narrowGuide(result,packet,question,limit=3){
  if(result.status!=='answer')return result;
  const topic=topicsFor(question);
  const topicObs=result.observationIds.filter(id=>topic.observations.has(id));
  const observations=topic.observations.size&&topicObs.length?topicObs:result.observationIds;
  const species=[...topic.observations].filter(id=>id.startsWith('population.')).map(id=>id.split('.')[1]);
  const relevant=e=>!species.length||species.some(sp=>packet.events.find(v=>v.id===e)?.text.includes(`${sp} #`));
  const events=[...result.eventIds.filter(relevant),...result.eventIds.filter(e=>!relevant(e))];
  const mechanisms=[...result.mechanismIds.filter(id=>topic.mechanisms.has(id)),...result.mechanismIds.filter(id=>!topic.mechanisms.has(id))];
  const items=[];
  const add=(kind,id)=>{if(id!==undefined&&!items.some(i=>i.id===id))items.push({kind,id});};
  const look=result.lookId&&[...observations.map(id=>['o',id]),...events.map(id=>['e',id]),...mechanisms.map(id=>['m',id])].find(([,id])=>id===result.lookId);
  if(look)add(look[0],look[1]);
  if(topic.events){events.slice(0,2).forEach(id=>add('e',id));observations.slice(0,1).forEach(id=>add('o',id));add('m',mechanisms[0]);}
  else{observations.slice(0,2).forEach(id=>add('o',id));if(topic.why){add('m',mechanisms[0]);add('e',events[0]);}else{add('e',events[0]);add('m',mechanisms[0]);}}
  for(const id of observations)add('o',id);for(const id of events)add('e',id);
  const kept=items.slice(0,limit);
  return {...result,observationIds:kept.filter(i=>i.kind==='o').map(i=>i.id),eventIds:kept.filter(i=>i.kind==='e').map(i=>i.id),mechanismIds:kept.filter(i=>i.kind==='m').map(i=>i.id),lookId:kept.some(i=>i.id===result.lookId)?result.lookId:null};
}
