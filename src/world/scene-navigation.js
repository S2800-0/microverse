// A pond is a different scene. Parent and child clocks survive navigation independently.
export const SCENE_STATES=['surface','entering','underwater','returning'];
export function sceneTransition(state,event){if(!SCENE_STATES.includes(state))throw Error('Unknown scene state.');const transitions={surface:{ENTER:'entering'},entering:{READY:'underwater',CANCEL:'surface',RETURN:'surface'},underwater:{RETURN:'returning'},returning:{READY:'surface',CANCEL:'underwater'}};return transitions[state][event]||state}
export function hasPond(world){const w=world?.plan?.water;return !!w&&w.w>.06&&w.h>.06&&w.w*w.h<.8&&world.plan.habitat!=='marine'&&!world.underwater}
