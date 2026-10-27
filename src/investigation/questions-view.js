import {PRESET_QUESTIONS,resolveQuestion,normalizeChange,describeChange,changeLabel} from './changes.js';
import {readSparkService,askSpark} from './client.js';
import {installSpeechInput} from '../voice/speech-input.js';

export function installQuestions({onPause,onRun,onRecord=()=>{}}){
  const el=id=>document.getElementById(id),dialog=el('questions-dialog');
  let proposal=null,service={enabled:false,reason:'Checking the local reasoning bridge…'},token=0,request=null;
  const status=text=>{el('question-status').textContent=text;};
  const speech=installSpeechInput({dialog,onBeforeRecord:onRecord,onUse:text=>{el('ecology-question').value=text;el('ecology-question').dispatchEvent(new Event('input'));status('Transcript filled in. Review the words, then preview the question locally.');}});
  function invalidate(){token++;request?.abort();request=null;proposal=null;el('run-question').disabled=true;el('question-proposal').textContent='';}
  function show(value,source){
    proposal=value.status==='proposal'?normalizeChange(value.change):null;
    el('run-question').disabled=!proposal;
    el('question-proposal').textContent=proposal?`${source}. Exact change: ${describeChange(proposal)}`:value.message;
    el('question-spark').disabled=!service.enabled||value.status!=='needs-ai';
    status(value.message);
  }
  const presets=el('prepared-questions');
  for(const p of PRESET_QUESTIONS){const button=document.createElement('button');button.textContent=p.question;button.onclick=()=>{invalidate();el('ecology-question').value=p.question;show(resolveQuestion(p.question),'Prepared question · no AI');};presets.append(button);}
  el('ecology-question').oninput=()=>{invalidate();el('question-spark').disabled=true;status('Preview this wording, or specify a change with the controls.');};
  el('preview-question').onclick=()=>{invalidate();try{show(resolveQuestion(el('ecology-question').value),'Prepared question · no AI');}catch(error){status(error.message);}};
  el('question-spark').onclick=async()=>{
    const current=++token;request=new AbortController();el('question-spark').disabled=true;status('Asking the selected Spark provider for one proposal…');
    try{const result=await askSpark(service,{operation:'propose',question:el('ecology-question').value},request.signal);
      if(current!==token||!dialog.open)return;show(result.value,result.provider);status(`${result.provider}: ${result.value.message} Review the exact change before running.`);
    }catch(error){if(current===token)status(error.message);}finally{if(current===token)request=null;}
  };
  el('manual-kind').onchange=()=>{el('manual-rain-fields').hidden=el('manual-kind').value!=='rain';el('manual-species-fields').hidden=el('manual-kind').value!=='remove';invalidate();};
  for(const id of ['manual-rain','manual-weeks','manual-species'])el(id).oninput=invalidate;
  el('preview-manual').onclick=()=>{invalidate();try{
    const change=normalizeChange(el('manual-kind').value==='rain'?{kind:'rain',rain:Number(el('manual-rain').value)/100,durationWeeks:Number(el('manual-weeks').value)}:{kind:'remove',species:el('manual-species').value});
    if(!el('ecology-question').value.trim())el('ecology-question').value=changeLabel(change);
    show({status:'proposal',change,message:'You specified this change directly. No AI call.'},'Manual controls');
  }catch(error){status(error.message);}};
  el('run-question').onclick=()=>{
    if(!proposal)return;
    try{onRun(proposal,el('question-prediction').value,el('ecology-question').value,{before:el('before-response').value});dialog.close();}catch(error){status(error.message);}
  };
  el('questions-close').onclick=()=>dialog.close();dialog.addEventListener('close',invalidate);
  return {open(){onPause();invalidate();dialog.showModal();status('Prepared questions work locally. Choose one or preview your own wording.');
    speech.open();
    readSparkService().then(s=>{if(dialog.open){service=s;el('question-provider').textContent=`${s.provider}. ${s.reason} Ask Spark sends this question only; no creature photos or notes.`;}});
  }};
}
