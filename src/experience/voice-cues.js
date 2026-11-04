// Automatic cues play once per visit; visible hints/dialogs take precedence over page narration.
export function createVoiceCues({schedule=setTimeout,cancel=clearTimeout}={}){
 let visit=null,pending=null,highest=0;const played=new Set();
 function stop(key){if(pending&&(!key||pending.key===key)){cancel(pending.timer);pending=null}}
 return {begin(key){if(key!==visit){stop();visit=key;highest=0;played.clear()}},stop,
 automatic(key,priority,play){if(!key||priority<highest||played.has(key)||pending?.key===key)return false;stop();highest=priority;pending={key,timer:schedule(()=>{pending=null;played.add(key);play()},priority===1?950:200)};return true},
 manual(play){stop();play()}};
}
