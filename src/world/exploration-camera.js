export function boundView({zoom=1,x=.5,y=.5}={}){return {zoom:Math.max(1,Math.min(2.75,Number.isFinite(zoom)?zoom:1)),x:Math.max(.03,Math.min(.97,Number.isFinite(x)?x:.5)),y:Math.max(.03,Math.min(.97,Number.isFinite(y)?y:.5))}}
export function panView(view,dx,dy,width,height){if(![dx,dy,width,height].every(Number.isFinite)||width<=0||height<=0)return boundView(view);return boundView({...view,x:view.x-dx/width,y:view.y-dy/height})}
export function pondView(water){return boundView({zoom:2.15,x:water.x+water.w/2,y:water.y+water.h/2})}
// Start where the simulated neighbours are, rather than centering decorative empty terrain.
export function initialWorldView(frame){const agents=frame?.agents||[];if(!agents.length)return boundView();return boundView({zoom:1,x:agents.reduce((n,a)=>n+a.x,0)/agents.length,y:agents.reduce((n,a)=>n+a.y,0)/agents.length})}
