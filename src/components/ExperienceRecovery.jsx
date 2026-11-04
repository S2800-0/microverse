import {Component} from 'react';
import {ArrowClockwise} from '@phosphor-icons/react';
export class ExperienceRecovery extends Component {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?<main className="experience-recovery"><h1>Let’s find our way back.</h1><p>This little world could not open. Your saved companions are still here.</p><button className="primary" onClick={()=>this.setState({failed:false})}><ArrowClockwise size={22}/>Return to the entrance</button></main>:this.props.children}
}
