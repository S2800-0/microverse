import {createHash} from 'node:crypto';
import {PROMPT_VERSION,PIPELINE_MICRO_USD,validateCreatureRequest,pngDimensions,validateMask} from '../src/core/creature/contract.js';

export function createCreaturePipeline({enabled=false,creditsConfirmed=false,provider,budget}){
  let active=null;const cache=new Map();let cacheBytes=0;
  const ready=enabled===true&&creditsConfirmed===true&&!!provider&&!!budget;
  return {
    status(){return {enabled:ready,estimateMicroUsd:PIPELINE_MICRO_USD,provider:'Meta · Muse Image + SAM 3.1',
      reason:ready?'One visual animal description, one illustration and one cutout, followed by local review.':'Generation is paused until promotional credits and a local budget are configured.'};},
    async run(value){
      let input;try{input=validateCreatureRequest(value);}catch(error){error.publicMessage=error.message;throw error;}
      if(!ready)throw new Error('Meta generation is paused. No request was sent.');
      const fingerprint=createHash('sha256').update(JSON.stringify([PROMPT_VERSION,input.profile,input.appearance,input.image])).digest('hex');
      if(cache.has(fingerprint))return {...structuredClone(cache.get(fingerprint)),cached:true};
      if(active){if(active.fingerprint===fingerprint)return structuredClone(await active.promise);throw new Error('Another creature is being prepared. Wait for it to finish.');}
      const promise=(async()=>{
        // Reserve both stages before the first request. Errors/timeouts are never
        // refunded automatically: the provider may already have processed them.
        const reservation=await budget.reserve(fingerprint);
        const signal=AbortSignal.timeout(240000);
        const identity=await provider.identify(input,signal);
        if(identity.certainty!=='clear'||identity.family==='unknown')throw Error('Spark could not confidently tell which animal this is. Try a clearer single-animal photo; it has not been changed into a different animal.');
        const designed={...input,profile:identity.animal,identity};
        const image=await provider.paint(designed,signal),{width,height}=pngDimensions(image);
        const mask=await provider.segment(image,identity.animal,signal,input.appearance);validateMask(mask,width,height);
        const result={image,mask,identity,provider:'Meta · Muse Image + SAM 3.1',promptVersion:PROMPT_VERSION,reservation,cached:false};
        const bytes=JSON.stringify(result).length;
        if(bytes<=16_000_000){while(cacheBytes+bytes>16_000_000||cache.size>=8){const key=cache.keys().next().value;cacheBytes-=JSON.stringify(cache.get(key)).length;cache.delete(key);}cache.set(fingerprint,structuredClone(result));cacheBytes+=bytes;}
        return result;
      })();
      active={fingerprint,promise};try{return structuredClone(await promise);}catch(e){e.publicMessage=e.message;throw e;}finally{active=null;}
    },
  };
}
