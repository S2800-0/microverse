// Prototype-only adapter: shares the explicit expansion allowance. Main flags,
// credential file and production creature service remain unchanged.
import {createHash} from 'node:crypto';
import {createCreaturePipeline} from './creature-pipeline.mjs';
import {createCreatureApi} from '../../microverse-hackathon/server/creature-api.mjs';
import {createMetaProvider} from './creature-provider.mjs';
import {createBudget} from './credit-budget.mjs';
import {expansionAccess,EXPANSION_LEDGER} from './expansion-access.mjs';
export const CREATURE_TEST_RESERVATION=150000;
export function reserveCreatureStages(budget,remaining){return {async reserve(fingerprint){
 if(remaining()<CREATURE_TEST_RESERVATION)throw Error('The shared allowance cannot cover animal description, painting and cutout. Keep your photo or choose a saved creature.');
 // Hold both stages before sending either provider request. Preserve failed
 // reservations: a timeout does not prove the provider did no work.
 for(const stage of ['identity','painting','cutout'])await budget.reserve(createHash('sha256').update(fingerprint+':'+stage).digest('hex'));
 return {reservedForPipelineMicroUsd:CREATURE_TEST_RESERVATION};
}}}
export function companionBridgePlugin(){
 const access=expansionAccess(),{env,enabled,cap,remaining}=access;
 const budget=createBudget({path:EXPANSION_LEDGER,capMicroUsd:enabled?cap:0,reservationMicroUsd:50000});
 const service=createCreaturePipeline({enabled,creditsConfirmed:enabled,provider:enabled?createMetaProvider({apiKey:env.MODEL_API_KEY}):null,budget:reserveCreatureStages(budget,remaining)});
 const guarded={run:input=>{if(!expansionAccess().enabled)throw Error('The local AI test window is paused. Saved creatures and your photo still work.');return service.run(input)},status(){const state=service.status(),windowOpen=expansionAccess().enabled,canPaint=windowOpen&&state.enabled&&remaining()>=CREATURE_TEST_RESERVATION;return {...state,enabled:canPaint,estimateMicroUsd:CREATURE_TEST_RESERVATION,remainingMicroUsd:remaining(),reason:!windowOpen?'The local AI test window is paused. Saved creatures and your photo still work.':canPaint?'Spark describes the animal; Muse Image paints it; SAM cuts it out; then you review movement.':'The shared test allowance cannot cover a new animal description, painting and cutout. Your photo and saved creatures still work.'}}};
 const api=createCreatureApi(guarded);
 return {name:'microverse-local-companion-bridge',configureServer(server){server.middlewares.use((req,res,next)=>{const path=new URL(req.url,'http://127.0.0.1').pathname;if(!path.startsWith('/api/creature/'))return next();return api(req,res,path)})}};
}
