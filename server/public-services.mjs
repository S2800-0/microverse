import {createCreaturePipeline} from './creature-pipeline.mjs';
import {createMetaProvider} from './meta-provider.mjs';
import {createSparkProvider,SPARK_RESERVATION} from './spark-provider.mjs';
import {createSparkService} from './spark-service.mjs';
import {createSpeechProvider,createSpeechService} from './speech-service.mjs';
import {createPlaceService} from './place-service.mjs';
import {validateCreatureRequest,PIPELINE_MICRO_USD} from '../src/creature/contract.js';
import {validatePlaceInput,PLACE_RESERVATION} from '../src/place/contract.js';
import {validateQuestion,resolveQuestion} from '../src/investigation/changes.js';
import {modelOnlyReplay} from '../src/investigation/evidence.js';
import {validateVoiceWav,VOICE_RESERVATION,VOICE_MAX_BYTES} from '../src/voice/audio.js';
import {publicError} from './public-security.mjs';

export const PUBLIC_COSTS=Object.freeze({creature:PIPELINE_MICRO_USD,spark:SPARK_RESERVATION,speech:VOICE_RESERVATION,place:PLACE_RESERVATION});
export function publicServiceStatus(name,env){
  const provider=name==='spark'?(env.MICROVERSE_SPARK_PROVIDER||'baseten'):'meta';
  const key=provider==='baseten'?env.BASETEN_API_KEY:env.MODEL_API_KEY;
  const enabled=name in PUBLIC_COSTS&&['meta','baseten'].includes(provider)&&env.MICROVERSE_PUBLIC_AI_ENABLED==='1'&&env.MICROVERSE_PUBLIC_CREDITS_CONFIRMED==='1'&&Number(env.MICROVERSE_PUBLIC_CAP_MICRO_USD)>0&&!!key&&env.MICROVERSE_PUBLIC_SESSION_SECRET?.length>=48;
  return {enabled,provider:provider==='baseten'?'Baseten · Muse Spark Open (hackathon)':'Meta',estimateMicroUsd:PUBLIC_COSTS[name],reservationMicroUsd:PUBLIC_COSTS[name],
    reason:name==='narration'?'Natural read-aloud is not hosted in this preview. Captions still work.':enabled?'Optional AI uses a small shared test allowance. Six requests per device or network each day.':'Public AI is paused. Prepared examples, stories and local tools still work.'};
}
export function validatePublicInput(name,input){
  if(name==='creature')return validateCreatureRequest(input);
  if(name==='place'){validatePlaceInput(input);return {image:input.image,consent:true};}
  if(name==='spark'){
    if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['operation','question','replay','consent'].includes(k))||!['propose','explain','guide'].includes(input.operation)||input.consent!==true)throw publicError('Choose one supported question to send.');
    const value={operation:input.operation,question:validateQuestion(input.question),consent:true};
    if(input.operation!=='propose')value.replay=modelOnlyReplay(input.replay);
    return value;
  }
  if(name==='speech'){
    if(!input||Object.keys(input).some(k=>!['audio','consent'].includes(k))||input.consent!==true||typeof input.audio!=='string'||input.audio.length>Math.ceil(VOICE_MAX_BYTES/3)*4||!/^[A-Za-z0-9+/]+={0,2}$/.test(input.audio))throw publicError('Choose a short recording to send.');
    validateVoiceWav(Buffer.from(input.audio,'base64'));return {audio:input.audio,consent:true};
  }
  throw publicError('Unknown AI feature.',404);
}
export function preparedPublicResult(name,input){
  if(name!=='spark'||input.operation!=='propose')return null;
  const value=resolveQuestion(input.question);return value.status==='needs-ai'?null:{value,provider:'Local prepared library',cached:true};
}
export function createPublicService(name,env,reservation){
  const budget={reserve:async()=>reservation},meta=()=>createMetaProvider({apiKey:env.MODEL_API_KEY});
  const common={enabled:true,creditsConfirmed:true,budget};
  if(name==='creature')return createCreaturePipeline({...common,provider:meta()});
  if(name==='place')return createPlaceService({...common,provider:meta()});
  if(name==='speech')return createSpeechService({...common,provider:createSpeechProvider({apiKey:env.MODEL_API_KEY})});
  if(name==='spark'){const provider=env.MICROVERSE_SPARK_PROVIDER||'baseten';return createSparkService({...common,provider:createSparkProvider({provider,apiKey:provider==='baseten'?env.BASETEN_API_KEY:env.MODEL_API_KEY})});}
  throw new Error('Unsupported public service.');
}
