import {mountFoxGuide} from './fox-guide.js';
import {mountFoxScene} from '../motion/fox-scene.js';
const el=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,walk=null,disposed=false;const guide=mountFoxGuide(el('review-guide'),{paused});
function motion(){el('review-motion').textContent=paused?'Play motion':'Pause motion';el('review-motion').setAttribute('aria-pressed',String(paused));guide.setPaused(paused);walk?.setPaused(paused);}
el('review-motion').onclick=()=>{paused=!paused;motion();};reduced.addEventListener('change',()=>{paused=reduced.matches;motion();});motion();
for(const button of document.querySelectorAll('[data-greeting]'))button.onclick=()=>guide.say(button.dataset.greeting);
mountFoxScene(el('meta-walk'),{paused,sheetSrc:'/meta-art/fox-walk-atlas.png',posterSrc:'/meta-art/fox-poster.png'}).then(player=>{if(disposed){player.destroy();return;}walk=player;walk.setPaused(paused);el('replay-meta-walk').disabled=false;el('walk-status').textContent='Eight saved poses, cut and aligned locally. Tail and body shape still vary; this loop is a review candidate.';}).catch(()=>{el('walk-status').textContent='The saved walk preview could not load. The individual illustrations remain below.';});
el('replay-meta-walk').onclick=()=>walk?.replay();
function node(tag,text,className){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}
try{
 const response=await fetch('/meta-art/manifest.json');if(!response.ok)throw new Error('Art manifest unavailable.');const manifest=await response.json();
 let active=[];try{const adoption=await fetch('/meta-art/adoption.json');if(adoption.ok)active=(await adoption.json()).active||[];}catch{/* Keep source candidates readable. */}
 for(const source of manifest.assets){
  const adopted=active.find(item=>item.id===source.id),art=adopted?{...source,preview:adopted.image,state:adopted.mode==='articulated'?'In game · local rig':adopted.mode==='fixed-terrain'?'In game · fixed terrain':'In game · whole-image',review:adopted.mode==='articulated'?'Geometry and sampled walk/trot frames reviewed. This uses a local artistic gait, not measured animal motion.':adopted.mode==='fixed-terrain'?'Visually reviewed against the curated obstacle overlay. Presentation changes only; terrain rules and replay remain the same.':'Saved illustration with whole-image movement. No articulated gait is claimed.'}:source;
  const card=node('article',null,'art-card'),picture=node('div',null,'art-image'),copy=node('div',null,'art-copy');
  const image=node('img');image.src=art.preview;image.alt=art.label;image.loading='lazy';picture.append(image);
  copy.append(node('span',art.state,'art-badge'),node('h2',art.label),node('p',art.review));
  const open=node('a','Open full image ↗');open.href=art.preview;open.target='_blank';open.rel='noopener';copy.append(open);
  if(art.original){const details=node('details'),summary=node('summary','Compare the original'),original=node('img');original.src=art.original;original.alt=`Original reference for ${art.label}`;original.loading='lazy';details.append(summary,original);copy.append(details);}
  card.append(picture,copy);el('art-grid').append(card);
 }
 el('review-status').textContent=`${manifest.assets.length} art candidates · images are saved assets; opening this page spends no credits.`;
}catch{el('review-status').textContent='The art collection could not load. The forest and game are still available.';}
window.addEventListener('pagehide',()=>{disposed=true;guide.destroy();walk?.destroy();});
