import {createHash} from 'node:crypto';
import {resolveQuestion,validateQuestion,validateProposal} from '../src/investigation/changes.js';
import {buildEvidence,validateEvidenceSelection,modelOnlyReplay} from '../src/investigation/evidence.js';
import {experimentFromReplay} from '../src/scene/experiment.ts';
import {validateGuide} from '../src/investigation/guide.js';
import {SPARK_RESERVATION} from './spark-provider.mjs';

export function createSparkService({enabled=false,creditsConfirmed=false,provider,budget}){
  const ready=enabled===true&&creditsConfirmed===true&&!!provider&&!!budget;
  const cache=new Map();let active=false;
  return {status:()=>({enabled:ready,provider:provider?.label||'Spark (not configured)',reservationMicroUsd:SPARK_RESERVATION,
    reason:ready?'Custom requests use the selected funded provider. Prepared questions and local evidence remain free.':'Spark calls are paused. Prepared questions, manual changes and local evidence still work.'}),
    async run(input){
      if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['operation','question','replay','consent'].includes(k))||!['propose','explain','guide'].includes(input.operation))throw new Error('Invalid reasoning request.');
      const question=validateQuestion(input.question);
      if(input.operation==='propose'){
        const local=resolveQuestion(question);if(local.status!=='needs-ai')return {value:local,provider:'Local prepared library',cached:true};
      }
      if(!ready||input.consent!==true)throw new Error('Spark is paused or sending was not selected.');
      let payload={question};
      if(input.operation==='explain'||input.operation==='guide'){
        // Recompute from the actual registered model, not client-provided claims.
        const experiment=experimentFromReplay(modelOnlyReplay(input.replay));
        if(!experiment.getState().elapsed)throw new Error('Advance the experiment before explaining results.');
        payload.evidence=buildEvidence(experiment);
      }
      const hash=createHash('sha256').update(JSON.stringify([input.operation,payload])).digest('hex');
      if(cache.has(hash))return {...structuredClone(cache.get(hash)),cached:true};
      if(active)throw new Error('A Spark request is already running.');active=true;
      try{
        await budget.reserve(hash);
        const result=await provider.request(input.operation,payload);
        const value=input.operation==='propose'?validateProposal(result.value,question):input.operation==='guide'?validateGuide(result.value,payload.evidence):validateEvidenceSelection(result.value,payload.evidence);
        const response={value,provider:result.provider||provider.label,usage:result.usage,cached:false};
        if(cache.size>=20)cache.delete(cache.keys().next().value);cache.set(hash,structuredClone(response));return response;
      }finally{active=false;}
    },
  };
}
