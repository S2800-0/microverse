import {useEffect,useState} from 'react';
import {ArrowRight,BookOpen,X} from '@phosphor-icons/react';
import {WATCH_DAYS,compareWithoutChange,guessLine,lessonCommand,resultLine} from './lessons.js';
// Question, guess, one change, watch, then this world compared with itself from the same beginning.
export function LessonCard({lesson,sim,frame,act,reduced,fastForward,onRestart}){
 const [open,setOpen]=useState(false),[guess,setGuess]=useState(null),[watch,setWatch]=useState(null),[result,setResult]=useState(null),[error,setError]=useState('');
 useEffect(()=>{setGuess(null);setWatch(null);setResult(null);setError('')},[sim]);
 const days=watch?Math.max(0,frame.tick-watch.startTick):0,roomLeft=frame.tick+WATCH_DAYS<180;
 useEffect(()=>{if(!watch||result||days<WATCH_DAYS)return;try{setResult(compareWithoutChange(sim,watch.actionIndex))}catch(e){setError(e.message)}},[watch,days,result,sim]);
 async function start(){setError('');try{const actionIndex=sim.toReplay().actions.length;await act(lessonCommand(lesson,sim.plan));setWatch({actionIndex,startTick:sim.snapshot().tick});if(reduced)fastForward(WATCH_DAYS)}catch(e){setError(e.message)}}
 if(!open)return <button className="lesson-invite" onClick={()=>setOpen(true)}><BookOpen size={20}/><span><small>This world’s lesson</small>{lesson.title}</span><ArrowRight size={19}/></button>;
 return <div className="lesson-card">
  <div className="lesson-head"><h2>{lesson.title}</h2><button aria-label="Close this lesson" onClick={()=>setOpen(false)}><X size={18}/></button></div>
  {!watch&&<><p>{lesson.hook}</p><p className="lesson-question">{lesson.question}</p>
   {!guess?<div className="lesson-guesses" role="group" aria-label="Make your guess">{lesson.guesses.map(([id,label])=><button key={id} onClick={()=>setGuess(id)}>{label}</button>)}</div>
   :roomLeft?<button className="lesson-go" onClick={start}>Try it and watch {WATCH_DAYS} days<ArrowRight size={18}/></button>
   :<><p>This world is too near its last day to watch {WATCH_DAYS} more.</p><button className="lesson-go" onClick={onRestart}>Start this world again</button></>}</>}
  {watch&&!result&&<><p>{lesson.doing}</p><div className="lesson-progress" role="progressbar" aria-label="Days watched" aria-valuemin={0} aria-valuemax={WATCH_DAYS} aria-valuenow={Math.min(days,WATCH_DAYS)}><i style={{width:Math.min(100,days/WATCH_DAYS*100)+'%'}}/></div><p className="lesson-small">Day {Math.min(days,WATCH_DAYS)} of {WATCH_DAYS}</p></>}
  {result&&<><div className="lesson-bars"><div><span>With your change</span><b><i style={{width:Math.round(result.changed.food*100)+'%'}}/></b><strong>{Math.round(result.changed.food*100)}%</strong></div><div><span>Without it</span><b><i className="lesson-plain" style={{width:Math.round(result.unchanged.food*100)+'%'}}/></b><strong>{Math.round(result.unchanged.food*100)}%</strong></div></div>
   <p className="lesson-question">{resultLine(result)}</p><p>{guessLine(guess,result)}</p><p>{lesson.real}</p><p className="lesson-small">{lesson.rule}</p><a className="lesson-source" href={lesson.source.url} target="_blank" rel="noreferrer">Source: {lesson.source.label}</a></>}
  {error&&<p className="lesson-small" role="alert">{error}</p>}
 </div>;
}
