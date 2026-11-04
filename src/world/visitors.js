export function validateVisitor(raw,plan){
 if(!raw||Object.keys(raw).some(k=>!['id','name','zone','motion','family'].includes(k))||!/^[a-f0-9]{64}$/.test(raw.id||'')||typeof raw.name!=='string'||!/^\p{L}[\p{L} '\-]{0,47}$/u.test(raw.name)||!['land','water','air'].includes(raw.zone)||!['walk','hop','swim','fly'].includes(raw.motion)||!['quadruped','primate','bird','fish','other'].includes(raw.family))throw Error('The new neighbour needs a valid design.');
 if(raw.zone==='water'&&(!plan.water.w||!plan.water.h)||raw.zone==='land'&&plan.water.w*plan.water.h>.98||raw.zone==='water'&&raw.motion!=='swim'&&raw.motion!=='walk'||raw.zone==='air'&&raw.motion!=='fly'||raw.zone==='land'&&['swim','fly'].includes(raw.motion))throw Error('That movement does not fit this habitat.');
 return {...raw};
}
