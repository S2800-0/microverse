// Deliberately simple teaching rule, not calibrated reef ecology or a site forecast.
// NOAA supports the heat -> symbiont loss -> paler coral mechanism, not these rates.
export const REEF_STEPS=[0,2,6,12];
export function reefState(weeks,{warm=true,coolAfter=null}={}){
 if(!Number.isSafeInteger(weeks)||weeks<0||weeks>12||typeof warm!=='boolean'||(coolAfter!==null&&coolAfter!==6))throw Error('Choose a supported reef lesson.');
 let stress=0;const events=[];
 for(let week=1;week<=weeks;week++){
  const hot=warm&&(coolAfter===null||week<=coolAfter),before=stress;
  stress=Math.max(0,Math.min(1,stress+(hot?.085:-.07)));
  if(before<.25&&stress>=.25)events.push({week,kind:'paling',text:'The coral began to look paler in this teaching model.'});
  if(before>=.25&&stress<.25)events.push({week,kind:'recovering',text:'The coral regained its color in this teaching model.'});
 }
 return {week:weeks,stress,paleness:Math.max(0,Math.min(1,(stress-.2)/.8)),events};
}
