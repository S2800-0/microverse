import {publicError} from './public-security.mjs';

// All instances and deploys share this site-wide key. An ETag comparison makes
// the entire reservation/rate update atomic. Missing storage never enables AI.
export function createPublicLedger(store,{capMicroUsd=0,now=Date.now}={}){
  if(!Number.isSafeInteger(capMicroUsd)||capMicroUsd<0||capMicroUsd>1_000_000)throw new Error('Public pilot cap must be between $0 and $1.');
  const key='budget/public-pilot-v1';
  async function update(change){
    for(let attempt=0;attempt<12;attempt++){
      const entry=await store.getWithMetadata(key,{type:'json',consistency:'strong'});
      if(entry&&typeof entry.etag!=='string')throw publicError('Public AI storage cannot guarantee a safe reservation. No request was sent.',503);
      const value=entry?entry.data:{version:1,reservedMicroUsd:0,reservations:[],visitors:{},active:[]};
      if(value?.version!==1||!Number.isSafeInteger(value.reservedMicroUsd)||value.reservedMicroUsd<0||!Array.isArray(value.reservations)||value.reservations.length>1000||!value.visitors||typeof value.visitors!=='object'||!Array.isArray(value.active)||value.reservations.some(r=>!Number.isSafeInteger(r.cost)||r.cost<1||!/^[a-f0-9]{48}$/.test(r.id))||value.reservations.reduce((sum,r)=>sum+r.cost,0)!==value.reservedMicroUsd)throw publicError('Public AI budget needs an operator check. No request was sent.',503);
      if(Object.entries(value.visitors).some(([name,r])=>!/^[a-f0-9]{64}$/.test(name)||!r||!Number.isSafeInteger(r.day)||!Number.isSafeInteger(r.count)||r.count<1||r.count>6||!Number.isSafeInteger(r.last))||value.active.some(r=>!r||!/^[a-f0-9]{48}$/.test(r.id)||!Number.isSafeInteger(r.until)))throw publicError('Public AI limits need an operator check. No request was sent.',503);
      const result=change(value);
      const written=await store.setJSON(key,value,entry?{onlyIfMatch:entry.etag}:{onlyIfNew:true});
      if(written.modified===true)return result;
    }
    throw publicError('The public queue is busy. Please try later.',429);
  }
  return {
    async reserve({id,cost,visitor,network}){
      if(!/^[a-f0-9]{48}$/.test(id)||!Number.isSafeInteger(cost)||cost<1||cost>25000||![visitor,network].every(v=>/^[a-f0-9]{64}$/.test(v)))throw new Error('Invalid reservation.');
      return update(value=>{
        const time=now(),day=Math.floor(time/86400000);
        if(value.reservations.some(r=>r.id===id))throw publicError('This request has already been registered.',409);
        if(value.reservedMicroUsd+cost>capMicroUsd)throw publicError('The public AI test allowance is used up. Prepared stories and local tools still work.',429);
        value.active=value.active.filter(job=>job.until>time);
        if(value.active.length>=2)throw publicError('Two creations are already running. Please try in a few minutes.',429);
        for(const [name,record]of Object.entries(value.visitors))if(record.day!==day)delete value.visitors[name];
        if(Object.keys(value.visitors).length>2000)throw publicError('Public AI is busy today. Please use the prepared examples.',429);
        for(const id of [visitor,network]){
          const record=value.visitors[id];
          if(record&&(record.count>=6||time-record.last<10000))throw publicError('Please give others a turn. AI is limited to six requests per device or network each day.',429);
        }
        value.reservedMicroUsd+=cost;value.reservations.push({id,cost,at:time});value.active.push({id,until:time+300000});
        for(const id of new Set([visitor,network])){const old=value.visitors[id];value.visitors[id]={day,count:(old?.count||0)+1,last:time};}
        return {reservedMicroUsd:value.reservedMicroUsd,capMicroUsd};
      });
    },
    async finish(id){return update(value=>{value.active=value.active.filter(job=>job.id!==id);});},
  };
}
