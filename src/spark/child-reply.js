// Presentation only: keep the guide's validated evidence IDs and use their actual comparisons.
const RULES={
 'rain-growth':'In this model, less rain slows plant growth and dries the grass.',
 'rabbit-food':'Rabbits eat grass. Food helps them live and have babies.',
 'deer-food':'Deer eat leaves. Food helps them live and have babies.',
 predation:'Foxes hunt rabbits. Wolves hunt deer and rabbits. Whether they meet also involves chance.',
};
export function childReply(reply,packet,question=''){
 return {...reply,lines:[...reply.lines].sort((a,b)=>/\b(eat|eats|eating)\b/i.test(question)?Number(b.kind==='mechanism')-Number(a.kind==='mechanism'):0).map(line=>{
  const o=line.kind==='observation'&&packet.observations.find(o=>o.id===line.ref);
  if(o){const food=o.id==='grass'?'grass':o.id==='browse'?'leaves':null;
   if(food)return {...line,text:'The less-rain world has '+(o.difference<0?(food==='leaves'?'fewer ':'less '):o.difference>0?'more ':(food==='leaves'?'the same number of ':'the same amount of '))+food+'.'};
   if(o.id.startsWith('population.')){const species=o.id.split('.')[1],plural=species==='deer'?'deer':species==='fox'?'foxes':species==='wolf'?'wolves':species+'s';return {...line,text:'We counted '+o.changed+' '+plural+' with less rain, and '+o.baseline+' with usual rain.'};}
  }
  if(line.kind==='mechanism'){
   const rule=Object.entries(RULES).find(([id])=>line.ref===id||packet.mechanisms.find(m=>m.id===id)?.text===line.text);
   if(rule)return {...line,text:rule[1]};
   return {...line,text:line.text.replace(/^Possible connection to investigate: /,'A possible connection: ')};
  }
  if(line.kind==='event')return {...line,text:line.text.replace(/(rabbit|deer|fox|wolf) #\d+ was born; parent #\d+\./g,'A baby $1 was born.').replace(/(rabbit|deer|fox|wolf) #\d+ arrived\./g,'A $1 joined the world.')};
  return line;
 })};
}
