import {readJsonResponse} from '../core/creature/json-response.js';
import {SeedGame} from './SeedGame.jsx';
import './making.css';
import {useEffect,useRef,useState} from 'react';
import {X,PaperPlaneTilt,SlidersHorizontal,SpeakerHigh,ArrowRight} from '@phosphor-icons/react';
import {speciesAnswer,speciesFor} from '../world/species-catalog.js';
import {parseWorldCommand,worldFact} from '../world/world-commands.js';
import {preparedQuestion} from '../spark/prepared-questions.js';
import {guideLocal,guideReply,narrowGuide,validateGuide} from '../core/investigation/guide.js';
import {SparkAvatar} from '../spark/SparkAvatar.jsx';
import {useSparkSpeech} from '../spark/SparkSpeech.jsx';
import {childReply} from '../spark/child-reply.js';
import {SPARK_LIBRARY} from '../spark/companions.js';
// Words that ask for a change rather than an explanation.
const ACTION_WORDS=/\b(add|remove|plant|grow|make|change|rain|weather|show|find|enter|leave|undo|take me|put|place|want|bring|give|wake|feed|follow|get rid|send|stop|kill|go|let)\b/i,IS_QUESTION=/^\s*(why|what|who|whose|how|when|where|which|does|do|did|is|are|was|were)\b/i;
const wantsChange=q=>ACTION_WORDS.test(q)&&!IS_QUESTION.test(q);
const PREPARED=['Why did the grass change?','What happened to the rabbits?','What do foxes eat?'];
export function QuestionPanel({session=null,world=null,onRecords,companion=SPARK_LIBRARY[0],onCustomize,onOpenChange,onCommand,onGenerate,paused=false}){
 const speech=useSparkSpeech(),opener=useRef(null),request=useRef(null);
 const [open,setOpen]=useState(false),[question,setQuestion]=useState(''),[reply,setReply]=useState(null),[busy,setBusy]=useState(false),[status,setStatus]=useState({enabled:false,remainingMicroUsd:0}),[error,setError]=useState(''),[consent,setConsent]=useState(false),[paintConsent,setPaintConsent]=useState(false);
 const context=world?world():null;
 function readStatus(){fetch('/api/world-tools/status',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(setStatus).catch(()=>setStatus({enabled:false,remainingMicroUsd:0}))}
 useEffect(()=>{onOpenChange?.(open);if(open)readStatus()},[open]);
 useEffect(()=>()=>request.current?.abort(),[]);
 const checkedGuide=q=>q.trim().toLowerCase()==='tell me about my guide'?speciesAnswer('Tell me about this animal',companion.identity?.animal):null;
 function commandFor(q){if(!context||!onCommand)return null;try{return parseWorldCommand(q,{plan:context.plan,canDive:context.canDive,underwater:context.underwater,companions:context.companions||[]})}catch(e){return {kind:'invalid',message:e.message}}}
 const prepared=checkedGuide(question)||speciesAnswer(question,context?.selectedName),topic=preparedQuestion(question,{world:!!world}),command=commandFor(question),fact=context&&onCommand?worldFact(question,context):null,lessonChange=!world&&!!session&&wantsChange(question)&&!topic,free=!!(prepared||topic||command||fact||lessonChange);
 const elapsed=session?.getState().elapsed||0;
 const napper=world?context.plan.inhabitants.find(a=>a.role==='predator')||context.plan.inhabitants.find(a=>a.role==='grazer'):null,questions=world?['Plant food','Make the '+napper.name.toLowerCase().split(' ').pop()+' sleep',context.canDive?'Go into the pond':'Add another '+context.plan.inhabitants.find(a=>a.role==='grazer').name]:session?PREPARED:['What can we explore?','Who are you?'];
 function show(value){setPaintConsent(false);setError('');setReply({...value,lines:(value.lines||[]).filter((l,i,all)=>l.text!==value.text&&all.findIndex(o=>o.text===l.text)===i)});}
 async function apply(command,provider=''){if(command.kind==='invalid'){setReply(null);setError(command.message);return}const result=await onCommand(command);show(provider&&!provider.includes('no AI call')?{...result,source:result.applied?provider+' understood your request · the world changed on your device':provider}:result);if(result.navigated)close();else if(result.applied)onOpenChange?.(false)}
 function local(q){setQuestion(q);setError('');const c=commandFor(q);if(c){apply(c).catch(e=>setError(e.message));return}
  if(!world&&session&&wantsChange(q)&&!preparedQuestion(q,{world:false})){show({source:'Your world guide · no AI call',text:'This adventure is a fair test, so only the rain changes. That way we can compare the two worlds.',lines:[{text:'In your own world I can add neighbours, plant food and change the weather. Finish this adventure, then try it.'}]});return}
  const fact=context&&onCommand?worldFact(q,context):null;if(fact){show({source:'From this world · no AI call',text:fact});return}
  const checked=checkedGuide(q)||speciesAnswer(q,context?.selectedName);if(checked){const present=!checkedGuide(q)&&(!context||context.plan.inhabitants.some(a=>speciesFor(a.name)?.id===checked.profileId));show({source:'Checked field note · no AI call',...checked,...(!present?{lines:[{text:'This is a general animal fact, not an observation of this world.'}]}:{})});return}
  if(world){const {plan,frame}=world(),plant=plan.inhabitants.find(a=>a.role==='producer'),canonical=preparedQuestion(q,{world:true})||q;show({source:'From this world · no AI call',text:canonical==='What are they eating?'?plant.name+' is the food in this game. Choose Find plants or ask “show me a meal” to watch a bite.':canonical==='What just happened?'?(frame.events.at(-1)?.text||'We have just arrived. Let the world run to see what happens.'):'Tell me what to change. I can add neighbours, plant food, add habitat pieces, change the weather and show you what happens.'});return}
  if(!session){show({source:'Your little guide',text:q==='Who are you?'?'I’m '+companion.name+', your guide. I can help change a world, follow a neighbour and explain its actual record.':'Choose a place or make a creature. We can explore together.'});return}
  const packet=session.packet();show(childReply(guideReply(narrowGuide(guideLocal(q,packet),packet,q),packet,'Prepared answer · no AI call'),packet,q));
 }
 async function ask(e){e.preventDefault();if(!question.trim()||busy)return;if(free){local(command?question:topic||question);return}if(!consent||!status.enabled||status.remainingMicroUsd<50000||(!world&&!elapsed))return;
  setBusy(true);setError('');const controller=new AbortController();request.current=controller;
  try{const c=world?world():null,action=!!onCommand&&wantsChange(question),path=c?(action?'command':'world-answer'):'ask',payload=c?{question:question.trim(),replay:c.replay,consent:true,...(action?{canDive:!!c.canDive,underwater:!!c.underwater}:{})}:{question:question.trim(),replay:session.export().replay,consent:true};
   const r=await fetch('/api/world-tools/'+path,{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json','X-Microverse-Session':status.session},body:JSON.stringify(payload)}),d=await readJsonResponse(r);if(!r.ok)throw Error(d.error||'That request did not finish.');if(controller.signal.aborted)return;
   if(d.command)await apply(d.command,d.provider);else if(c)show({source:d.provider,text:d.text,lines:d.lines||[],sourceUrl:d.sourceUrl,sourceTitle:d.sourceTitle});else{const packet=session.packet();show(childReply(guideReply(narrowGuide(validateGuide(d.value,packet),packet,question),packet,d.provider),packet,question))}
  }catch(e){if(e.name!=='AbortError')setError(e.message)}finally{setBusy(false);readStatus()}
 }
 async function paint(){if(!onGenerate||!reply?.generation||!paintConsent||busy)return;setBusy(true);setError('');const controller=new AbortController();request.current=controller;try{const result=await onGenerate(reply.generation,{consent:true,signal:controller.signal,session:status.session});if(!controller.signal.aborted)show(result)}catch(e){if(e.name!=='AbortError')setError(e.message)}finally{setBusy(false);readStatus()}}
 function close(){request.current?.abort();speech?.stopVoice();setBusy(false);setOpen(false);opener.current?.focus()}
 return <div className={'spark-guide'+(open?' spark-guide-open':'')} onKeyDown={e=>{if(e.key==='Escape')close()}}>
  {open&&<section className="spark-speech" role="dialog" aria-modal="false" aria-label={'Talk with '+companion.name}>
   <button className="spark-close" aria-label="Close companion chat" onClick={close}><X size={21}/></button><p className="spark-speaker">{companion.name}</p><h2>{busy?'Making room for your idea…':'What shall we try?'}</h2>
   {reply?<div className="spark-answer" aria-live="polite"><p>{reply.text}</p>{reply.lines.map((l,i)=><p key={i}>{l.text}</p>)}<small>{reply.source}</small>{reply.sourceUrl&&<a className="species-source" href={reply.sourceUrl} target="_blank" rel="noopener noreferrer">{reply.sourceTitle}</a>}{speech&&<button className="spark-listen" disabled={speech.voiceBusy} onClick={()=>speech.speakText([reply.text,...reply.lines.map(l=>l.text)].join(' ').slice(0,700))}><SpeakerHigh size={19}/>{speech.voiceBusy?'Preparing the voice…':'Listen'}</button>}
    {reply.generation&&onGenerate&&<div className="spark-generation"><label className="spark-consent"><input type="checkbox" checked={paintConsent} onChange={e=>setPaintConsent(e.target.checked)}/><span>Let Meta design and paint this new animal. Uses the shared test allowance. No photo or personal name is sent.</span></label><button className="primary" disabled={!paintConsent||busy||!status.enabled||status.remainingMicroUsd<100000} onClick={paint}>Paint this {reply.generation}<ArrowRight size={20}/></button>{status.remainingMicroUsd<100000&&<p className="spark-small">The local allowance cannot cover this new artwork. Existing neighbours and free actions still work.</p>}</div>}
    {onRecords&&<button className="text-action" onClick={()=>{close();onRecords()}}>Show me what happened</button>}
   </div>:<p>{world?'Ask me to plant food, add a neighbour, change the weather or send someone to sleep.':'Let’s find a little world to explore.'}</p>}
   {busy&&reply?.generation&&<SeedGame small/>}
   {!reply&&speciesFor(companion.identity?.animal)&&<button className="text-action" onClick={()=>local('Tell me about my guide')}>About my guide’s animal</button>}
   <div className="spark-starters">{questions.map(q=><button key={q} disabled={busy} onClick={()=>local(q)}>{q}</button>)}</div>
   {(session||world)&&<form onSubmit={ask}><label className="sr-only" htmlFor={'spark-question-'+(context?.underwater?'pond':'surface')}>Your question</label><div className="spark-compose"><textarea id={'spark-question-'+(context?.underwater?'pond':'surface')} rows={2} maxLength={500} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Try: make the fox sleep…" onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.currentTarget.form.requestSubmit()}}}/><button aria-label={'Ask '+companion.name} disabled={!question.trim()||busy||(!free&&(!status.enabled||status.remainingMicroUsd<50000||!consent||(!world&&!elapsed)))}><PaperPlaneTilt size={22}/></button></div>{free?<p className="spark-small">This request is ready on your device. No AI call.</p>:<label className="spark-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>Let Meta read my request and world records. My guide’s photo and personal name stay here.</span></label>}{status.remainingMicroUsd<50000&&<p className="spark-small">The local test cap is used. Prepared answers and direct world actions still work.</p>}{error&&<p role="status" className="error">{error}</p>}</form>}
   {onCustomize&&<button className="spark-customize" onClick={()=>{close();onCustomize()}}><SlidersHorizontal size={17}/>Change my guide</button>}
  </section>}
  <button ref={opener} className="spark-pet-button" aria-label={'Talk with '+companion.name} aria-expanded={open} onClick={()=>open?close():setOpen(true)}><SparkAvatar companion={companion} emotion={busy?'thinking':reply?'happy':'curious'} speaking={!!speech?.speaking} paused={paused}/><span>{busy?'Thinking…':companion.name}</span></button>
 </div>;
}
