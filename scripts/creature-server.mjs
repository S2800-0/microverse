import {fileURLToPath} from 'node:url';
import {createPreviewServer} from './preview.mjs';
import {createMetaProvider} from '../server/meta-provider.mjs';
import {createBudget} from '../server/creature-budget.mjs';
import {createCreaturePipeline} from '../server/creature-pipeline.mjs';
import {createCreatureApi} from '../server/creature-api.mjs';

const enabled=process.env.MICROVERSE_META_ENABLED==='1';
const creditsConfirmed=process.env.MICROVERSE_META_CREDITS_CONFIRMED==='1';
const capMicroUsd=Number(process.env.MICROVERSE_META_CAP_MICRO_USD||0);
const apiKey=process.env.MODEL_API_KEY;
const budget=createBudget({path:fileURLToPath(new URL('../runtime/meta-budget.json',import.meta.url)),capMicroUsd});
const provider=apiKey&&capMicroUsd>=12500?createMetaProvider({apiKey}):null;
const pipeline=createCreaturePipeline({enabled,creditsConfirmed,provider,budget});
const server=createPreviewServer({creatureApi:createCreatureApi(pipeline)});
server.listen(Number(process.env.PORT||8895),'127.0.0.1',()=>console.log(`Microverse local bridge: http://127.0.0.1:${server.address().port}/ · ${pipeline.status().enabled?'Meta configured':'Meta paused'}`));
