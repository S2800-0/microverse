import {useEffect,useRef,useState} from 'react';
import {Plus,Minus,Crosshair,Plant,ArrowDown} from '@phosphor-icons/react';
import {LegacyWorldCanvas} from './LegacyWorldCanvas.jsx';
import {discoverablePatch} from './plant-visuals.js';
import {MakingScene} from '../components/MakingScene.jsx';
export function LivingWorldCanvas({world,frame,paused,reduced=false,suspended=false,focus,onPick,onDive=null,visitorArt={}}){
 const host=useRef(null),portal=useRef(null),api=useRef(null),latest=useRef(null),[ready,setReady]=useState(false),[fallback,setFallback]=useState(false);latest.current={frame,paused,reduced,suspended,focus,visitorArt};
 useEffect(()=>{let cancelled=false;setReady(false);setFallback(false);
  import('./pixi-stage.js').then(m=>m.createWatercolorStage(host.current,world,latest.current,{onPick:id=>onPick(id),onReady:()=>{if(!cancelled)setReady(true)},onPortalPosition:p=>{if(portal.current){const rect=host.current.getBoundingClientRect(),half=portal.current.offsetWidth/2+12;portal.current.style.left=Math.max(half,Math.min(rect.width-half,p.x))+'px';portal.current.style.top=Math.max(190,Math.min(rect.height-180,p.y))+'px'}}})).then(stage=>{if(cancelled)stage?.destroy();else{api.current=stage;stage?.setState(latest.current)}}).catch(()=>{if(!cancelled)setFallback(true)});
  return()=>{cancelled=true;api.current?.destroy();api.current=null};
 },[world]);
 useEffect(()=>api.current?.setState(latest.current),[frame,paused,reduced,suspended,focus,visitorArt]);
 if(fallback)return <><LegacyWorldCanvas world={world} frame={frame} paused={paused||suspended} reduced={reduced} focus={focus} onPick={onPick}/>{onDive&&<button className="pond-door fallback-pond-door" onClick={onDive}><ArrowDown size={28}/><span>Go into the pond</span></button>}</>;
 return <><div ref={host} className="living-canvas layered-stage" role="img" tabIndex={0} aria-label={`${world.plan.title}. Day ${frame.tick}. ${frame.agents.length} neighbours. ${frame.agents.filter(a=>a.bite).length} eating. Layered watercolor world.`} onKeyDown={e=>{if(e.key==='+'||e.key==='=')api.current?.zoom(.25);else if(e.key==='-')api.current?.zoom(-.25);else if(e.key==='Escape')api.current?.reset();else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();api.current?.pan(e.key==='ArrowLeft'?60:e.key==='ArrowRight'?-60:0,e.key==='ArrowUp'?60:e.key==='ArrowDown'?-60:0)}}}/>
  {onDive&&ready&&<button ref={portal} className="pond-door" onClick={onDive}><ArrowDown size={28}/><span>Go into the pond</span><i aria-hidden="true"/></button>}
  <div className="map-explore-controls" aria-label="Explore the map"><button disabled={!ready} aria-label="Zoom in" onClick={()=>api.current?.zoom(.25)}><Plus size={21}/></button><button disabled={!ready} aria-label="Zoom out" onClick={()=>api.current?.zoom(-.25)}><Minus size={21}/></button><button disabled={!ready} aria-label="Find the animals" onClick={()=>api.current?.reset()}><Crosshair size={21}/></button><button disabled={!ready} onClick={()=>{const patch=discoverablePatch(frame);if(patch)onPick('plant:'+patch.id)}}><Plant size={20}/>Find plants</button></div>
  {!ready&&<div className="making-world-overlay"><MakingScene source={world.background} kind="world" label="Preparing the ground, water and separate living pieces…" small/></div>}
 </>;
}
