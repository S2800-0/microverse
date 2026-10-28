// Local expression playback; mouth poses are decorative, not phoneme lip sync.
export function createGuidePlayer({render,schedule=setTimeout,cancel=clearTimeout}={}){
  let paused=false,visible=false,destroyed=false,timer=null,talking=0,blink=false,open=false;
  function stop(){if(timer!==null)cancel(timer);timer=null;}
  function pose(){return paused?'attentive':talking&&open?'speaking':blink?'blink':'attentive';}
  function refresh(){
    stop();render(pose());
    if(destroyed||paused||!visible)return;
    timer=schedule(()=>{timer=null;if(talking){talking--;open=!open;blink=false;}else{blink=!blink;open=false;}refresh();},talking?180:blink?140:3200);
  }
  return {
    setPaused(value){if(destroyed)return;paused=!!value;if(paused){talking=0;blink=false;open=false;}refresh();},
    setVisible(value){if(destroyed)return;visible=!!value;if(!visible){talking=0;blink=false;open=false;}refresh();},
    greet(){if(destroyed||paused||!visible)return;talking=16;open=true;blink=false;refresh();},
    destroy(){if(destroyed)return;destroyed=true;stop();},
  };
}
