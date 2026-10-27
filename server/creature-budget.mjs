import {mkdir,open,readFile,rename,unlink} from 'node:fs/promises';
import {dirname} from 'node:path';
import {PIPELINE_MICRO_USD} from '../src/creature/contract.js';
function stop(message){const error=new Error(message);error.publicMessage=message;return error;}

export function createBudget({path,capMicroUsd,reservationMicroUsd=PIPELINE_MICRO_USD}){
  if(!Number.isSafeInteger(capMicroUsd)||capMicroUsd<0||capMicroUsd>7_000_000)throw new Error('Choose an explicit local cap from $0 to $7.');
  if(!Number.isSafeInteger(reservationMicroUsd)||reservationMicroUsd<1||reservationMicroUsd>50000)throw new Error('Invalid request reservation.');
  return {async reserve(fingerprint){
    await mkdir(dirname(path),{recursive:true,mode:0o700});
    let lock;
    try{lock=await open(`${path}.lock`,'wx',0o600);}catch{throw stop('The generation ledger is busy or locked. No request was sent.');}
    try{
      let ledger;try{ledger=JSON.parse(await readFile(path,'utf8'));}catch(error){if(error.code!=='ENOENT')throw stop('The generation ledger cannot be read. No request was sent.');ledger={version:1,reservedMicroUsd:0,attempts:[]};}
      if(ledger?.version!==1||!Number.isSafeInteger(ledger.reservedMicroUsd)||ledger.reservedMicroUsd<0||!Array.isArray(ledger.attempts)||ledger.attempts.length>10000||ledger.attempts.some(a=>!a||a.reservedMicroUsd!==reservationMicroUsd||!/^[a-f0-9]{64}$/.test(a.fingerprint)||typeof a.at!=='string')||ledger.attempts.reduce((n,a)=>n+a.reservedMicroUsd,0)!==ledger.reservedMicroUsd)throw stop('Invalid generation ledger. No request was sent.');
      if(ledger.reservedMicroUsd+reservationMicroUsd>capMicroUsd)throw stop('The local generation budget is exhausted. No request was sent.');
      ledger.reservedMicroUsd+=reservationMicroUsd;
      ledger.attempts.push({fingerprint,reservedMicroUsd:reservationMicroUsd,at:new Date().toISOString()});
      const temp=`${path}.tmp`;const f=await open(temp,'w',0o600);
      try{await f.writeFile(JSON.stringify(ledger));await f.sync();}finally{await f.close();}
      await rename(temp,path);
      return {reservedMicroUsd:ledger.reservedMicroUsd,capMicroUsd};
    }finally{await lock.close();await unlink(`${path}.lock`);}
  }};
}
