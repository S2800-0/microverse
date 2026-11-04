// Several visible stems represent ONE food patch; they never create extra simulation food.
export function plantPatchVisual(biomass){
 const food=Math.max(0,Math.min(1,Number.isFinite(biomass)?biomass:0));
 return {count:food<.07?0:Math.ceil(food*6),scale:.55+food*.45};
}

// Lead a discovery to an existing, healthy patch near the middle of the map.
// An edge patch can otherwise land behind the phone's bottom controls.
export function discoverablePatch(frame){const patches=frame?.patches||[],healthy=patches.filter(p=>p.biomass>.3);return [...(healthy.length?healthy:patches)].sort((a,b)=>Math.hypot(a.x-.5,a.y-.5)-Math.hypot(b.x-.5,b.y-.5))[0]||null}
