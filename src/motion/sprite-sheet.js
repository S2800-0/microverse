export const FOX_SHEET={columns:4,rows:2,cell:512,frames:8,stride:150};
export function foxSpriteRegion(index){
  if(!Number.isInteger(index)||index<0||index>=FOX_SHEET.frames)throw new Error('Choose a valid fox frame.');
  return {x:(index%FOX_SHEET.columns)*FOX_SHEET.cell,y:Math.floor(index/FOX_SHEET.columns)*FOX_SHEET.cell,width:FOX_SHEET.cell,height:FOX_SHEET.cell};
}
export function foxWalkFrame(distance){
  if(!Number.isFinite(distance))throw new Error('A finite travel distance is required.');
  const cycle=((distance/FOX_SHEET.stride)%1+1)%1;
  return Math.min(7,Math.floor(cycle*FOX_SHEET.frames));
}
