import{PLACE_LABELS,decodePlaceLayers,validatePlaceRecord}from'./contract.js';
import{validatePhotoFile}from'../scene/creature-import.js';
const percentage=n=>Math.floor(n*1000)/10;
export function installPlaceReview({onPause,getState,onApply}){
  const el=id=>document.getElementById(id),dialog=el('place-dialog'),canvas=el('place-preview');
  let photo=null,image=null,sourceHash=null,analysis=null,decoded=null,token=0,request=null,busy=false,service={enabled:false};
  const message=text=>el('place-status').textContent=text;
  function controls(){el('place-analyse').disabled=busy||!photo||!service.enabled||!el('place-consent').checked;el('place-apply').disabled=busy||!sourceHash||!el('place-reviewed').checked;}
  function invalidate(){token++;request?.abort();request=null;busy=false;el('place-reviewed').checked=false;controls();}
  function acceptAnalysis(result){
    if(result.version!==1||result.provider!=='Meta SAM 3.1'||result.sourceHash!==sourceHash||result.width!==photo.width||result.height!==photo.height)throw new Error('The place result does not match this photo.');const measured=decodePlaceLayers(result.width,result.height,result.layers);analysis=result;decoded=measured;
    for(const key of PLACE_LABELS)el(`place-${key}`).value=String(percentage(measured.coverage[key]));
    el('place-measurements').textContent=`${result.recorded?'Recorded SAM example':'SAM'} candidate image shares: grass ${percentage(measured.coverage.grass)}%, trees ${percentage(measured.coverage.tree)}%, water ${percentage(measured.coverage.water)}%. Unclassified ${percentage(measured.unclassified)}%. Overlapping candidates ${percentage(measured.overlapFraction)}%, assigned water → trees → grass. A zero means no candidate pixels, not confirmed absence. Check the coloured overlay, then review or adjust below.`;paint();
  }
  function paint(){
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,canvas.width,canvas.height);if(!photo)return;ctx.drawImage(photo,0,0);
    if(decoded&&el('place-overlay').checked){const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),colors={grass:[55,140,65],tree:[210,140,45],water:[45,130,220]};for(let i=0;i<canvas.width*canvas.height;i++){const key=['water','tree','grass'].find(k=>decoded.bitmaps[k][i]);if(!key)continue;for(let j=0;j<3;j++)pixels.data[i*4+j]=Math.round(.6*pixels.data[i*4+j]+.4*colors[key][j]);}ctx.putImageData(pixels,0,0);}
  }
  async function load(file){
    invalidate();const current=token;photo=null;image=null;sourceHash=null;analysis=null;decoded=null;el('place-attribution').hidden=true;el('place-consent').checked=false;el('place-measurements').textContent='No SAM estimate yet. You can enter your own image-share estimates below.';controls();
    try{validatePhotoFile(file);const url=URL.createObjectURL(file);let img;try{img=new Image();img.src=url;await img.decode();}finally{URL.revokeObjectURL(url);}if(current!==token||!dialog.open)return;if(img.naturalWidth*img.naturalHeight>36e6)throw new Error('Choose an image under 36 megapixels.');
      const scale=Math.min(1,640/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);
      const bytes=c.toDataURL('image/png'),hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(bytes));if(current!==token||!dialog.open)return;image=bytes;sourceHash=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');photo=c;canvas.width=c.width;canvas.height=c.height;paint();for(const key of PLACE_LABELS)el(`place-${key}`).value='0';message('Photo stays on this device until you choose Analyse with Meta. Review estimates before applying model inputs.');controls();
    }catch(error){if(current===token){message(error.message);paint();controls();}}
  }
  for(const id of ['place-file','place-camera'])el(id).onchange=()=>{const file=el(id).files[0];if(file)load(file);};
  el('place-sample').onclick=async()=>{
    invalidate();const current=token;busy=true;photo=null;image=null;sourceHash=null;analysis=null;decoded=null;el('place-consent').checked=false;controls();message('Loading the recorded garden example. No API call.');
    try{const [p,r]=await Promise.all([fetch('/places/garden-pond.png'),fetch('/places/garden-pond-analysis.json')]);if(!p.ok||!r.ok)throw new Error('Recorded example unavailable.');const bytes=new Uint8Array(await p.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));const src='data:image/png;base64,'+btoa(binary),result=await r.json(),img=new Image();img.src=src;await img.decode();const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(src));if(current!==token||!dialog.open)return;
      const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);photo=c;image=src;sourceHash=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');canvas.width=c.width;canvas.height=c.height;acceptAnalysis(result);el('place-attribution').hidden=false;message('Recorded Meta SAM result loaded. No new inference or charge. Review the image shares and choose model food values.');
    }catch(error){if(current===token)message(error.message);}finally{if(current===token){busy=false;controls();}}
  };
  el('place-consent').onchange=controls;el('place-reviewed').onchange=controls;el('place-overlay').onchange=paint;
  for(const id of ['place-grass','place-tree','place-water','place-grass-model','place-browse-model'])el(id).oninput=()=>{el('place-reviewed').checked=false;controls();};
  el('place-copy-grass').onclick=()=>{el('place-grass-model').value=el('place-grass').value;el('place-reviewed').checked=false;controls();};
  el('place-analyse').onclick=async()=>{
    if(!image||busy||!service.enabled||!el('place-consent').checked)return;invalidate();const current=token;busy=true;request=new AbortController();controls();message('Asking SAM for grass, tree and water masks. Three checks, no automatic retry. Closing discards the result, but an already-sent job may finish.');
    try{const response=await fetch('/api/place/run',{method:'POST',signal:request.signal,headers:{'Content-Type':'application/json','X-Microverse-Session':service.session},body:JSON.stringify({image,consent:true})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Place analysis failed.');if(current!==token||!dialog.open)return;
      acceptAnalysis(result);message(result.cached?'Reused the cached masks. No new provider calls.':'SAM estimates ready for your review. Nothing in the forest has changed.');
    }catch(error){if(current===token)message(error.message);}finally{if(current===token){busy=false;request=null;controls();}}
  };
  el('place-apply').onclick=()=>{
    if(!photo||!sourceHash||!el('place-reviewed').checked||busy)return;
    try{const week=getState().week,record=validatePlaceRecord({version:1,method:analysis?'sam-3.1':'manual',sourceHash,width:photo.width,height:photo.height,estimated:decoded?decoded.coverage:null,reviewed:Object.fromEntries(PLACE_LABELS.map(k=>[k,Number(el(`place-${k}`).value)/100])),start:{grass:Number(el('place-grass-model').value)/100,browse:Number(el('place-browse-model').value)/100},atWeek:week},week);onApply(record);dialog.close();}catch(error){message(error.message);}
  };
  el('place-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{invalidate();photo=null;image=null;sourceHash=null;analysis=null;decoded=null;paint();el('place-file').value='';el('place-camera').value='';el('place-consent').checked=false;});
  return {open(){onPause();dialog.showModal();const state=getState();el('place-grass-model').value=String(percentage(state.grass));el('place-browse-model').value=String(percentage(state.browse));el('place-reviewed').checked=false;message('Choose an outdoor photo. Image shares and model food values are separate choices.');controls();fetch('/api/place/status',{cache:'no-store'}).then(async r=>{if(!r.ok)throw new Error();const s=await r.json();if(dialog.open){service=s;el('place-provider').textContent=s.reason;controls();}}).catch(()=>{service={enabled:false};el('place-provider').textContent='Local review mode. Optional Meta masks need the local server and a configured cap.';controls();});}};
}
