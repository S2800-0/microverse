// Distances are presentation pixels, never model steps or random draws.
export function createActorTrack({x=180,y=360,speed=85}={}){
  if(![x,y,speed].every(Number.isFinite)||speed<=0)throw new Error('Invalid actor track.');
  let target={x,y},distance=0,direction=1,turn=0,turnFrom=1;
  return {
    goTo(tx,ty){if(![tx,ty].every(Number.isFinite))throw new Error('Invalid destination.');target={x:tx,y:ty};const next=tx<x?-1:tx>x?1:direction;if(next!==direction){turnFrom=direction;direction=next;turn=.24;}},
    stop(){target={x,y};turn=0;},
    turn(){turnFrom=direction;direction*=-1;turn=.24;target={x,y};},
    tick(dt){if(!Number.isFinite(dt)||dt<0)throw new Error('Invalid elapsed time.');
      let moving=false;
      if(turn>0)turn=Math.max(0,turn-dt);
      else{const dx=target.x-x,dy=target.y-y,d=Math.hypot(dx,dy),step=Math.min(d,speed*dt);if(d>.001){x+=dx/d*step;y+=dy/d*step;distance+=step;moving=step>0;}}
      const u=1-turn/.24,scaleX=turn>0?(u<.5?turnFrom*(1-u*1.6):direction*(.2+(u-.5)*1.6)):direction;
      return {x,y,distance,direction,scaleX,moving,turning:turn>0};
    },
  };
}

export function distancePhase(distance,size=384){
  if(!Number.isFinite(distance)||!Number.isFinite(size)||size<=0)throw new Error('Invalid walk distance.');
  // The source preset travels 32/.65 px per cycle inside a 384 px atlas cell.
  return distance/(32/.65*size/384);
}
