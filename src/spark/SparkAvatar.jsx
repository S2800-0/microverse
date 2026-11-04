import {useEffect,useState} from 'react';
export function SparkAvatar({companion,emotion='curious',speaking=false,small=false,paused=false}){
 const [open,setOpen]=useState(false),[decoded,setDecoded]=useState(()=>new Set()),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 useEffect(()=>{setOpen(false);if(!speaking||paused||reduced)return;const id=setInterval(()=>setOpen(v=>!v),220);return()=>clearInterval(id)},[speaking,paused,reduced,companion?.id]);
 const frames=companion?.expressions||[companion?.source||'/assets/spark-fox-0.png'];
 const active=frames.length===1?0:speaking?(open?1:0):emotion==='thinking'?3:emotion==='happy'?2:0;
 return <span className={'spark-avatar'+(small?' spark-avatar-small':'')+(speaking?' spark-speaking':'')+(paused?' spark-paused':'')} data-emotion={emotion}>{frames.map((src,i)=><img key={src} src={src} alt="" draggable={false} className={'spark-expression'+((i===(decoded.has(frames[active])?active:0))?' spark-expression-visible':'')} aria-hidden={i!==(decoded.has(frames[active])?active:0)} onLoad={()=>setDecoded(old=>new Set([...old,src]))}/>)}<span className="spark-glow" aria-hidden="true"/></span>;
}
