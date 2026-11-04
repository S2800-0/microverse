import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {fileURLToPath} from 'node:url';
export const APPROVED_TEST_CAP_MICRO_USD=5000000;
export const EXPANSION_LEDGER=fileURLToPath(new URL('../runtime/expansion-art/budget.json',import.meta.url));
export function expansionAccess(){
 let env={},permit={};try{env=parseEnv(readFileSync(new URL('../../microverse-hackathon/.env',import.meta.url),'utf8'));permit=JSON.parse(readFileSync(new URL('../runtime/expansion-permit.json',import.meta.url),'utf8'))}catch{}
 const cap=APPROVED_TEST_CAP_MICRO_USD,enabled=permit.capMicroUsd===cap&&Date.parse(permit.expiresAt)>Date.now()&&!!env.MODEL_API_KEY;
 const remaining=()=>{try{const v=JSON.parse(readFileSync(EXPANSION_LEDGER,'utf8')).reservedMicroUsd;return Number.isSafeInteger(v)&&v>=0?Math.max(0,cap-v):0}catch{return 0}};
 return {env,permit,cap,enabled,remaining};
}
