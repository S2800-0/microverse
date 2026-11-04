import {ArrowRight,Camera,BookOpen} from '@phosphor-icons/react';
import {PLACE_LIBRARY} from '../experience/library.js';
export function PlaceLibrary({onChoose,onUpload,onLesson,heading,travellingCompanion=null}){
  return <section className="library-screen flow-screen" aria-labelledby="library-heading">
    <div className="library-intro"><h1 id="library-heading" ref={heading} tabIndex={-1}>Where shall we explore?</h1><p>{travellingCompanion?travellingCompanion.name+' is coming with you. Choose a world for them.':'Pick a place to bring to life.'}</p><button className="lesson-entry" onClick={onLesson}><BookOpen size={24}/><span>My first adventure<small>Let Spark show you how it works</small></span><ArrowRight size={21}/></button></div>
    <div className="polaroid-library">{PLACE_LIBRARY.map((place,i)=><button className="polaroid" key={place.id} style={{'--card-angle':[-5,3,-3][i]+'deg','--arrival-delay':i*100+'ms'}} onClick={()=>onChoose(place)} aria-label={'Explore '+place.name.toLowerCase()}>
      <img src={place.src} width={place.width} height={place.height} alt={place.name==='The meadow'?'Open grassy meadow and surrounding plants':place.id==='reef'?'An island above a colorful underwater coral reef':place.id==='garden'?'A garden pond with rocks, trees and plants':'Sunlight through trees at a woodland edge'} style={{objectPosition:place.position}}/>
      <span className="polaroid-label">{place.name}<ArrowRight size={24}/></span><span className="polaroid-hint">{place.hint}</span>
    </button>)}</div>
    <div className="library-footer"><p>A garden. A woodland. An island reef.<br/>Different places, different connections.</p><button className="text-action" onClick={onUpload}><Camera size={22}/>Use my own photo</button><details className="library-credits"><summary>Photo credits</summary>{PLACE_LIBRARY.map(p=><p key={p.id}>{p.source?<a href={p.source} target="_blank" rel="noreferrer">{p.name} · {p.credit}</a>:<span>{p.name} · {p.credit}</span>}{p.license&&p.id!=='garden'&&<> · resized to WebP; <a href={p.license} target="_blank" rel="noreferrer">image licence</a></>}</p>)}</details></div>
  </section>;
}
