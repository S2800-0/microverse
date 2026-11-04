export function placeCoachmark(target,viewport,box,avoid=[]){
  const pad=16,gap=18,w=Math.min(300,viewport.width-pad*2),h=Math.min(box.height,viewport.height-pad*2);
  const options=[
    {side:'right',x:target.right+gap,y:target.top+(target.height-h)/2},
    {side:'left',x:target.left-w-gap,y:target.top+(target.height-h)/2},
    {side:'bottom',x:target.left+(target.width-w)/2,y:target.bottom+gap},
    {side:'top',x:target.left+(target.width-w)/2,y:target.top-h-gap},
  ];
  const fits=p=>p.x>=pad&&p.x+w<=viewport.width-pad&&p.y>=pad&&p.y+h<=viewport.height-pad;
  const overlap=(p,r)=>Math.max(0,Math.min(p.x+w,r.right)-Math.max(p.x,r.left))*Math.max(0,Math.min(p.y+h,r.bottom)-Math.max(p.y,r.top));
  const candidates=options.filter(fits);
  const chosen=candidates.find(p=>avoid.every(r=>!overlap(p,r)))||candidates.sort((a,b)=>avoid.reduce((s,r)=>s+overlap(a,r)-overlap(b,r),0))[0]||options[3];
  const x=Math.max(pad,Math.min(viewport.width-w-pad,chosen.x));
  const y=Math.max(pad,Math.min(viewport.height-h-pad,chosen.y));
  return {x,y,width:w,side:chosen.side};
}
export const COACHMARKS={
  forest:{target:'.forest-controls',text:'Let the weeks grow, meet a neighbour, or open the journal. Your experiment is kept safe while you explore.'},
  'pet-source':{target:'.pet-samples',text:'Try a saved creature to see how the photo, painting and movement connect. Your own photo is welcome too.'},
  'pet-motion':{target:'.pet-motion-stage',text:'Watch their feet and markings. Choose the movement that looks right to you.'},
  'pet-welcome':{target:'.pet-welcome-copy .primary',text:'Keep your companion here if you want. Saving is your choice, and stays in this browser.'},
  review:{target:'.review-photo',text:'Look at this part of your photo. You decide whether it looks right.'},
  assumptions:{target:'.food-choices',text:'Choose how much plant food to start with. We can try another amount later.'},
  predict:{target:'.prediction-choices',text:'Make a guess before we try less rain. “Not sure” is a good place to start.'},
  watch:{target:'.world-condition',text:'This badge shows the weather and time. Press the large Watch 7 days button to move time forward. Tapping the map does not move time.'},
  compare:{target:'.compare-action',text:'Switch to usual rain to compare the same week. Only the rainfall changes.'},
  explain:{target:'.evidence-choices',text:'Tap what you noticed. Your choices build a discovery—no typing needed.'},
};

for(const [key,step] of Object.entries(COACHMARKS))step.voiceKey="hint_"+key.replaceAll("-","_");
