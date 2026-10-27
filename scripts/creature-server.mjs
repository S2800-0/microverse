import {fileURLToPath} from 'node:url';
import {createPreviewServer} from './preview.mjs';
import {createMetaProvider} from '../server/meta-provider.mjs';
import {createBudget} from '../server/creature-budget.mjs';
import {createCreaturePipeline} from '../server/creature-pipeline.mjs';
import {createCreatureApi} from '../server/creature-api.mjs';
import {createSparkProvider,SPARK_RESERVATION} from '../server/spark-provider.mjs';
import {createSparkService} from '../server/spark-service.mjs';
import {createSpeechProvider,createSpeechService} from '../server/speech-service.mjs';
import {createNaturalVoice} from '../server/natural-voice.mjs';
import {VOICE_RESERVATION} from '../src/voice/audio.js';
import {createPlaceService} from '../server/place-service.mjs';
import {PLACE_RESERVATION} from '../src/place/contract.js';

const enabled=process.env.MICROVERSE_META_ENABLED==='1';
const creditsConfirmed=process.env.MICROVERSE_META_CREDITS_CONFIRMED==='1';
const capMicroUsd=Number(process.env.MICROVERSE_META_CAP_MICRO_USD||0);
const apiKey=process.env.MODEL_API_KEY;
const budget=createBudget({path:fileURLToPath(new URL('../runtime/meta-budget.json',import.meta.url)),capMicroUsd});
const provider=apiKey&&capMicroUsd>=12500?createMetaProvider({apiKey}):null;
const pipeline=createCreaturePipeline({enabled,creditsConfirmed,provider,budget});
const sparkChoice=process.env.MICROVERSE_SPARK_PROVIDER||'meta';
if(!['meta','baseten'].includes(sparkChoice))throw new Error('Choose Meta or Baseten explicitly.');
const sparkCap=Number(process.env.MICROVERSE_SPARK_CAP_MICRO_USD||0);
const sparkKey=sparkChoice==='meta'?apiKey:process.env.BASETEN_API_KEY;
const spark=createSparkService({enabled:process.env.MICROVERSE_SPARK_ENABLED==='1',creditsConfirmed:process.env.MICROVERSE_SPARK_CREDITS_CONFIRMED==='1',
  provider:sparkKey&&sparkCap>=SPARK_RESERVATION?createSparkProvider({provider:sparkChoice,apiKey:sparkKey}):null,
  budget:createBudget({path:fileURLToPath(new URL(`../runtime/spark-budget-${sparkChoice}.json`,import.meta.url)),capMicroUsd:sparkCap,reservationMicroUsd:SPARK_RESERVATION})});
const speechCap=Number(process.env.MICROVERSE_VOICE_CAP_MICRO_USD||0);
const speech=createSpeechService({enabled:process.env.MICROVERSE_VOICE_ENABLED==='1',creditsConfirmed:process.env.MICROVERSE_VOICE_CREDITS_CONFIRMED==='1',provider:apiKey&&speechCap>=VOICE_RESERVATION?createSpeechProvider({apiKey}):null,budget:createBudget({path:fileURLToPath(new URL('../runtime/speech-budget.json',import.meta.url)),capMicroUsd:speechCap,reservationMicroUsd:VOICE_RESERVATION})});
const natural=createNaturalVoice({enabled:process.env.MICROVERSE_LOCAL_VOICE_ENABLED==='1'});
const placeCap=Number(process.env.MICROVERSE_PLACE_CAP_MICRO_USD||0);
const place=createPlaceService({enabled:process.env.MICROVERSE_PLACE_ENABLED==='1',creditsConfirmed:process.env.MICROVERSE_PLACE_CREDITS_CONFIRMED==='1',provider:apiKey&&placeCap>=PLACE_RESERVATION?createMetaProvider({apiKey}):null,budget:createBudget({path:fileURLToPath(new URL('../runtime/place-budget.json',import.meta.url)),capMicroUsd:placeCap,reservationMicroUsd:PLACE_RESERVATION})});
const server=createPreviewServer({placeApi:createCreatureApi(place,{prefix:'/api/place',action:'run',maxBytes:2900000,errorMessage:'Place analysis did not finish. No automatic retry was made; its reservation remains. Manual review still works.'}),creatureApi:createCreatureApi(pipeline),sparkApi:createCreatureApi(spark,{prefix:'/api/spark',action:'run',maxBytes:2000000,errorMessage:'Spark could not finish. No automatic retry was made. Check the local ledger before retrying.'}),speechApi:createCreatureApi(speech,{prefix:'/api/speech',action:'run',maxBytes:1000000,errorMessage:'Transcription failed. No automatic retry was made; the reservation remains. You can type your question.'}),narrationApi:createCreatureApi(natural,{prefix:'/api/narration',action:'run',maxBytes:4000,errorMessage:'Natural voice could not play. Captions still work.'})});
server.listen(Number(process.env.PORT||8895),'127.0.0.1',()=>console.log(`Microverse local bridge: http://127.0.0.1:${server.address().port}/ · ${pipeline.status().enabled?'Meta configured':'Meta paused'}`));
