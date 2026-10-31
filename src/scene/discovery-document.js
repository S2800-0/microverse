import {experimentFromReplay} from './experiment.ts';
import {buildEvidence,worksheetHtml} from '../investigation/evidence.js';
const el=id=>document.getElementById(id),urls=[];
el('print-discovery').onclick=()=>window.print();
try{
  const fragment=location.hash.slice(1);if(!fragment||fragment.length>1500000)throw new Error('Missing or oversized discovery.');
  const file=JSON.parse(decodeURIComponent(fragment)),experiment=experimentFromReplay(file),packet=buildEvidence(experiment);
  const html=worksheetHtml(file,packet,{before:file.activity?.before||'',after:file.activity?.after||'',teacherNotes:file.activity?.teacherNotes||'',connection:file.activity?.connection||''});
  // worksheetHtml escapes learner text; the document contains no scripts or
  // remote resources. Move only its body, retaining this page's save controls.
  const documentCopy=new DOMParser().parseFromString(html,'text/html');
  el('discovery-document').replaceChildren(...documentCopy.body.childNodes);
  for(const [id,mime,content]of [['download-card','text/html',html],['download-experiment','application/json',JSON.stringify(file)]]){
    const url=URL.createObjectURL(new Blob([content],{type:mime}));urls.push(url);el(id).href=url;el(id).hidden=false;
  }
}catch{
  el('discovery-loading').textContent='This discovery could not be opened. Return to your story and open the card again.';el('print-discovery').disabled=true;
}
addEventListener('pagehide',event=>{if(!event.persisted)for(const url of urls)URL.revokeObjectURL(url);});
