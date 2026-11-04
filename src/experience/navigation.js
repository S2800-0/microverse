// Navigation names a real destination; selection clearing is a separate action.
export function backNavigation(screen,{review=0,photo=null,elapsed=0,creatureLabel='My companions',route='greenspace',fromAdventure=false}={}){
 if(['library','pet-collection'].includes(screen)&&fromAdventure)return {to:'start-own',label:'What’s next'};
 if(screen==='pet-collection')return {to:'home',label:'Home'};
 if(screen.startsWith('pet-'))return {to:null,label:creatureLabel};
 if(screen==='review')return review>0?{to:'previous-review',label:review===1?'Water check':'Tree check'}:{to:['sample','library'].includes(photo?.kind)?'library':'triage',label:['sample','library'].includes(photo?.kind)?'Choose a world':'Your photo'};
 if(screen==='living-world')return photo?.id?{to:'library',label:'Choose a world'}:{to:'triage',label:'Your photo'};
 if(screen==='predict')return elapsed>0?{to:'watch',label:'Return to world'}:{to:'assumptions',label:'Food choice'};
 // Once time has passed, "Change my guess" is a button in the world; Back leaves the world instead of looping through it.
 if(screen==='watch')return elapsed>0?(photo?{to:'assumptions',label:'Food choice'}:{to:'home',label:'Home'}):{to:'predict',label:'Your guess'};
 if(screen==='route-help'){
  if(route==='no-clues')return {to:'review',label:'Review photo'};
  if(['object','unclear'].includes(route))return {to:'other-kind',label:'What fits best?'};
  return photo?{to:'triage',label:'Your photo'}:{to:'home',label:'Home'};
 }
 const routes={library:['home','Home'],camera:['home','Home'],triage:['home','Home'],craft:['home','Home'],tools:['home','Home'],'world-paint':['triage','Your photo'],'other-kind':['triage','Your photo'],'photo-consent':['triage','Your photo'],'photo-suggestion':['triage','Your photo'],assumptions:[photo?'review':'finish',photo?'Review photo':'My discovery'],explain:['watch','Return to world'],recap:['explain','What I noticed'],'start-own':['recap','Our recap'],finish:['start-own','What’s next'],forest:['finish','My discovery']};
 const [to,label]=routes[screen]||['home','Home'];return {to,label};
}
export function creatureBackLabel(screen,kind){return ({'pet-source':'My companions','pet-details':'Choose a photo','pet-paint':'Photo options','pet-look':kind==='personal'?'Their details':'Choose a creature','pet-preparing':'Photo options','pet-motion':'Photo options','pet-welcome':'Photo options'})[screen]||'My companions'}

// Browser history. Only screens that need nothing in memory survive a refresh; saved worlds restore by place id.
const RESTORABLE=['library','craft','tools','pet-collection'];
export function routeHash(screen,photo=null){
 if(screen==='home')return '';
 return '#/'+screen+(screen==='living-world'&&photo?.id?'/'+photo.id:'');
}
export function parseRoute(hash='',placeIds=[]){
 const [screen,placeId]=String(hash).replace(/^#\/?/,'').split('/');
 if(screen==='living-world'&&placeIds.includes(placeId))return {screen,placeId};
 return {screen:RESTORABLE.includes(screen)?screen:'home'};
}
// Can this screen draw right now? A history entry can outlive the photo or experiment it belonged to.
export function canShow(screen,{photo=null,livingWorld=null,modelState=null,suggestion=null,forestInitial=null,inCompanions=false}={}){
 const personal=photo?.kind==='personal';
 if(['triage','other-kind','photo-consent','world-paint'].includes(screen))return personal;
 if(screen==='photo-suggestion')return personal&&!!suggestion;
 if(['route-help','review'].includes(screen))return !!photo;
 if(screen==='living-world')return !!livingWorld;
 if(['predict','watch','explain','recap','finish','start-own'].includes(screen))return !!modelState;
 if(screen==='forest')return !!forestInitial;
 if(screen.startsWith('pet-')&&!['pet-collection','pet-source'].includes(screen))return inCompanions;
 return true;
}
