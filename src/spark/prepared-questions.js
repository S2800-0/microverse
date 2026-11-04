export function preparedQuestion(value,{world=false}={}){
 const q=String(value||'').toLowerCase().replace(/[?!.]/g,'').replace(/\s+/g,' ').trim();
 if(world){
  if(/^(what (are|do) (they|the animals) eat(ing)?|what is the food|where (is|are) (the )?(food|plants))$/.test(q))return 'What are they eating?';
  if(/^(what (just )?happened|what is happening|what changed)$/.test(q))return 'What just happened?';
  if(/^(what can i (change|try|do)|what can you do|what can we do|help|hi|hello|hey|hi spark|hello spark|hey spark|what if it rains less|how do i change (the )?weather)$/.test(q))return 'What can I change?';
 }else{
  if(q==='why did the grass change')return 'Why did the grass change?';
  if(q==='what happened to the rabbits')return 'What happened to the rabbits?';
 }
 return null;
}
