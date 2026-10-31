const CHILD_MESSAGES=new Set(['microverse.story.ready','microverse.story.close']);
export function acceptsStoryMessage(event,{origin,source}){
  return !!(source&&event.origin===origin&&event.source===source&&event.data&&
    typeof event.data==='object'&&!Array.isArray(event.data)&&CHILD_MESSAGES.has(event.data.type)&&
    Object.keys(event.data).length===1);
}

// The exploring forest stays in its own document and memory. No pictures,
// model snapshots or learner responses cross the frame boundary.
export function installStoryHost({dialog,frame,onPause=()=>{},onClose=()=>{},returnFocus=()=>null,host=window}){
  let initialized=false,opener=null;
  const notify=visible=>frame.contentWindow?.postMessage({type:'microverse.story.visibility',visible},host.location.origin);
  function open(){opener=host.document.activeElement;onPause();if(!initialized){frame.src='/forest-story.html?embedded=1';initialized=true;}if(!dialog.open)dialog.showModal();notify(true);}
  function close(){if(dialog.open)dialog.close();}
  function closed(){notify(false);onClose();const focusable=opener?.matches?.('button,a[href],input,select,textarea,[tabindex]');const target=focusable&&opener.isConnected&&opener.getClientRects().length?opener:returnFocus();target?.focus();}
  function receive(event){if(!acceptsStoryMessage(event,{origin:host.location.origin,source:frame.contentWindow}))return;
    if(event.data.type==='microverse.story.close')close();else notify(dialog.open);
  }
  dialog.addEventListener('close',closed);host.addEventListener('message',receive);
  return {open,close,destroy(){host.removeEventListener('message',receive);dialog.removeEventListener('close',closed);frame.removeAttribute('src');}};
}
