import { createForestController } from './controller.ts';
import { validateSceneSnapshot } from './snapshot.ts';
import type { SceneSnapshot } from './snapshot.ts';

export type Scenario='drought'|'remove-wolves';
export interface Replay {
  format:'microverse-experiment'; version:1; initial:SceneSnapshot; scenario:Scenario;
  elapsed:number; prediction:string; reflection:string;
}
const checkScenario=(s:unknown)=>{if(s!=='drought'&&s!=='remove-wolves')throw new Error('Unsupported experiment.');};
export function validateReplay(input:unknown):asserts input is Replay {
  const r=input as Replay;
  if(!r||r.format!=='microverse-experiment'||r.version!==1)throw new Error('Unsupported replay format.');
  checkScenario(r.scenario);validateSceneSnapshot(r.initial);
  if(!Number.isSafeInteger(r.elapsed)||r.elapsed<0||r.elapsed>156||
    typeof r.prediction!=='string'||r.prediction.length>1000||typeof r.reflection!=='string'||r.reflection.length>1000)
    throw new Error('Invalid experiment notes or duration.');
}
export function createExperiment(initial:SceneSnapshot,scenario:Scenario,prediction='') {
  checkScenario(scenario);validateSceneSnapshot(initial);
  if(typeof prediction!=='string'||prediction.length>1000)throw new Error('Keep the prediction under 1000 characters.');
  const start=structuredClone(initial);
  const baseline=createForestController({populated:false}),changed=createForestController({populated:false});
  let elapsed=0;
  function restart(){baseline.restore(start);changed.restore(start);changed.schedule(scenario);elapsed=0;}
  function seek(week:number){
    if(!Number.isSafeInteger(week)||week<0||week>156)throw new Error('Choose an experiment week from 0 to 156.');
    if(week<elapsed)restart();
    const delta=week-elapsed;
    if(delta){baseline.step(delta);changed.step(delta);elapsed=week;}
    return getState();
  }
  function getState(){return {elapsed,scenario,baseline:baseline.getState(),changed:changed.getState()};}
  restart();
  return {getState,seek,
    toReplay(reflection=''):Replay {
      const replay:Replay={format:'microverse-experiment',version:1,initial:structuredClone(start),scenario,elapsed,prediction,reflection};
      validateReplay(replay);return replay;
    },
  };
}
export function experimentFromReplay(input:unknown){
  validateReplay(input);const experiment=createExperiment(input.initial,input.scenario,input.prediction);
  experiment.seek(input.elapsed);return experiment;
}

// Replicates hold the complete observed model state fixed and vary only future
// random draws. They are sensitivity checks, not real-world confidence intervals.
export function runContinuation(initial:SceneSnapshot,scenario:Scenario,randomState:number,elapsed=156){
  if(!Number.isSafeInteger(randomState)||randomState<0||randomState>0xffffffff)throw new Error('Invalid continuation random state.');
  const start=structuredClone(initial);start.world.randomState=randomState;
  const experiment=createExperiment(start,scenario);const s=experiment.seek(elapsed);
  return {randomState,elapsed,baseline:{grass:s.baseline.grass,browse:s.baseline.browse,counts:s.baseline.counts},
    changed:{grass:s.changed.grass,browse:s.changed.browse,counts:s.changed.counts}};
}
