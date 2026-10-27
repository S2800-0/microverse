import {createCreatureLibrary} from './creature-library.js';
import {CREATURE_FACTS,imaginationGreeting} from './creature-facts.js';
export function installCollection({importer,onVisit,onEcosystem,onGuide,onPause}){
  const el=id=>document.getElementById(id);let storage;
  try{storage=localStorage;}catch{storage={getItem(){throw new Error();},setItem(){throw new Error();}};}
  const library=createCreatureLibrary(storage);let selected=null,greeted=false;
  function message(text){el('library-status').textContent=text;}
  function meet(item){selected=item;greeted=false;el('clearing-name').textContent=`Hello, ${item.name}.`;el('clearing-caption').textContent='An illustrated companion, a new little story. Choose Say hello for a playful fictional moment.';el('clearing-creature').src=item.image;el('clearing-creature').alt=`${item.name}, your illustrated ${item.species}`;el('clearing-creature').hidden=false;el('clearing-greet').hidden=false;const fact=CREATURE_FACTS[item.species];el('creature-fact').hidden=false;el('fact-title').textContent=fact.title;el('fact-copy').textContent=fact.text;el('fact-source').textContent=fact.source;el('fact-source').href=fact.url;el('fact-question').textContent=fact.question;}
  function render(){const root=el('creature-library');root.replaceChildren();const items=library.list();if(!items.length){const empty=document.createElement('p');empty.className='library-empty';empty.textContent='No creatures saved yet. Start with a photo or try a prepared dog or cat in the studio.';root.append(empty);return;}
    for(const item of items){const card=document.createElement('article');card.className='creature-tile paper';const img=document.createElement('img');img.src=item.image;img.alt=`Illustration of ${item.name}`;const title=document.createElement('h3');title.textContent=item.name;const note=document.createElement('p');note.textContent=`${item.species==='cat'?'Cat':'Dog'} companion · saved on this browser`;const actions=document.createElement('div');actions.className='tile-actions';
      const action=(label,run)=>{const button=document.createElement('button');button.textContent=label;button.onclick=run;actions.append(button);};
      action('Meet here',()=>meet(item));action('Visit the ecosystem',async()=>{try{await onVisit(item);onEcosystem();}catch(error){message(error.message);}});
      action('Download image',()=>{const a=document.createElement('a');a.href=item.image;a.download=`microverse-${item.species}.png`;a.click();});
      action('Remove from collection',()=>{try{library.remove(item.id);if(selected?.id===item.id){selected=null;el('clearing-creature').hidden=true;el('clearing-greet').hidden=true;el('creature-fact').hidden=true;el('clearing-name').textContent='Room for another little story.';el('clearing-caption').textContent='Choose a creature below or create someone new.';}render();message('Removed from this browser collection. Existing experiment files are unchanged.');}catch(error){message(error.message);}});
      card.append(img,title,note,actions);root.append(card);
    }
  }
  el('create-creature').onclick=()=>importer.open({destination:'library',onComplete:value=>{const entry=library.add({...value,name:value.name?.trim()||'New neighbour'});render();meet(entry);message(`${entry.name} is saved in this browser. Download the image if you want a backup.`);}});
  el('clearing-greet').onclick=()=>{if(!selected)return;greeted=!greeted;el('clearing-caption').textContent=greeted?`Imagined moment: ${imaginationGreeting(selected.name,selected.species)}`:`Imagined moment: ${selected.name} has decided this is a very good place for a tiny adventure.`;const image=el('clearing-creature');image.classList.remove('greeting');void image.offsetWidth;image.classList.add('greeting');};
  el('fact-explore').onclick=()=>{onEcosystem();onGuide();};
  render();message(library.status()||'Your collection is private to this browser. Save only images you are allowed to use.');const first=library.list()[0];if(first)meet(first);
  return {open(){onPause();document.body.dataset.space='creatures';el('creatures-space').hidden=false;el('tab-creatures').setAttribute('aria-current','page');el('tab-ecosystem').removeAttribute('aria-current');el('creatures-heading').focus();}};
}
