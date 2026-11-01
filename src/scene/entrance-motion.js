// The fox ambles across the first half of the intro, then walks clear of the
// right edge, so the stage is empty by the time the section scrolls away.
// .intro-stage already sets overflow:clip, so the exit needs no extra clipping.
const AMBLE=17,EXIT=56,TURN=.45,EASE=1.3;
export function foxDrift(progress){return progress<=TURN?progress/TURN*AMBLE:AMBLE+Math.pow((progress-TURN)/(1-TURN),EASE)*EXIT;}
export function entranceFrame(value){const progress=Math.max(0,Math.min(1,Number.isFinite(value)?value:0));return {progress,camera:1.018+progress*.065,foreground:1.018+progress*.13,edgeShift:progress*1.6,foxPercent:45+foxDrift(progress),titleOpacity:1-progress*.55};}
