import {useSparkSpeech} from '../spark/SparkSpeech.jsx';
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {WorldJourney} from './WorldJourney.jsx';
import {hasPond,sceneTransition} from './scene-navigation.js';
import {makePondWorld} from './pond-world.js';
export function WorldExplorer({world,backRef,onSceneChange,...props}){
 const speech=useSparkSpeech(),speechRef=useRef(speech);speechRef.current=speech;
 const [scene,setScene]=useState('surface'),[visited,setVisited]=useState(false);
 const pond=useMemo(()=>hasPond(world)?makePondWorld(world):null,[world]);
 useEffect(()=>{setScene('surface');setVisited(false)},[world]);
 useEffect(()=>{if(!['entering','returning'].includes(scene))return;const timer=setTimeout(()=>{if(scene==='entering')setVisited(true);setScene(s=>sceneTransition(s,'READY'))},props.reduced?0:750);return()=>clearTimeout(timer)},[scene,props.reduced]);
 useLayoutEffect(()=>{speechRef.current?.stopVoice?.();speechRef.current?.voiceScope?.(scene);onSceneChange?.(scene!=='surface');if(backRef)backRef.current=()=>setScene(s=>sceneTransition(s,'RETURN'));return()=>{if(backRef)backRef.current=null}},[scene,backRef,onSceneChange]);
 const dive=()=>{if(pond)setScene(s=>sceneTransition(s,'ENTER'))},surface=()=>setScene(s=>sceneTransition(s,'RETURN'));
 return <div className={'world-explorer scene-'+scene}>
  <div className="ecosystem-scene" hidden={scene==='underwater'}><WorldJourney {...props} world={world} suspended={props.suspended||scene!=='surface'} onDive={pond?dive:null}/></div>
  {visited&&pond&&<div className="ecosystem-scene" hidden={scene!=='underwater'}><WorldJourney {...props} world={pond} suspended={props.suspended||scene!=='underwater'} onSurface={surface}/></div>}
  {['entering','returning'].includes(scene)&&<div className={'pond-transition '+scene} role="status"><span>{scene==='entering'?'Follow the bubbles…':'Back into the light…'}</span>{Array.from({length:16},(_,i)=><i key={i} style={{'--bubble':i}}/>)}</div>}
 </div>;
}
