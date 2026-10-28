import {createGuidePlayer} from '../motion/guide-player.js';
export function mountFoxGuide(root,{paused=false}={}){
 const image=root.querySelector('[data-guide-image]'),caption=root.querySelector('[data-guide-caption]');
 let inView=false,disposed=false,failed=false,greetingPending=false;
 const poses={attentive:[0,0],blink:[1,0],curious:[0,1],speaking:[1,1]};
 const player=createGuidePlayer({render:pose=>{if(failed)return;const [x,y]=poses[pose];image.style.transform=`translate(${-x*50}%,${-y*50}%)`;image.dataset.expression=pose;}});
 player.setPaused(paused);
 function visibility(){const visible=inView&&!document.hidden;player.setVisible(visible);if(visible&&greetingPending){greetingPending=false;player.greet();}}
 const observer=new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting===true;visibility();});observer.observe(root);
 document.addEventListener('visibilitychange',visibility);
 image.addEventListener('error',()=>{failed=true;player.destroy();image.hidden=true;root.querySelector('[data-guide-fallback]').hidden=false;});
 return {setPaused:value=>player.setPaused(value),say(text){if(disposed)return;caption.textContent=text;greetingPending=true;const box=root.getBoundingClientRect();inView=box.width>0&&box.height>0&&box.bottom>0&&box.top<innerHeight;visibility();},destroy(){disposed=true;observer.disconnect();document.removeEventListener('visibilitychange',visibility);player.destroy();}};
}
