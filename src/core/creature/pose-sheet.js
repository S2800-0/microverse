// Prompts for the drawn behaviour poses. Descriptions are data, never instructions.
const FAMILY_POSES={
 fish:{eat:'nibbling with the mouth open, body tilted slightly down',sleep:'resting very still near the bottom, eyes half closed, fins relaxed',runA:'side view, head on the right, body straight, tail fin up',runB:'side view, head on the right, body straight, tail fin down'},
 bird:{eat:'head bent right down, pecking at the ground',sleep:'fluffed up, sitting low, eyes closed, head tucked into the shoulder',runA:'flying, both wings raised high',runB:'flying, both wings pushed down'},
 default:{eat:'head lowered all the way to the ground, mouth at ground level, nibbling, all feet planted',sleep:'lying down and curled on the ground, legs folded under the body, eyes closed, head resting low',runA:'running fast, stretched out long, front legs reaching forward and hind legs reaching back',runB:'running fast, gathered up, all legs bunched under the body'},
};
export function posesForFamily(family){return FAMILY_POSES[family]||FAMILY_POSES.default}
const RULES='Keep this exact character: same markings, colours, proportions, accessories and watercolor line style as the reference. Every pose faces RIGHT, head on the right side of its cell, at the same scale. Whole body visible with generous empty margin in every cell; nothing touches a cell edge or another cell. PURE SOLID WHITE background (#FFFFFF), no ground, shadow, scenery, labels, numbers, frames, grid lines or dividers.';
// One animal, 2x2: top row eat, sleep; bottom row run A, run B.
export function creaturePosePrompt({animal,family,features=[]}){
 const p=posesForFamily(family);
 return `Character pose sheet for this ${JSON.stringify(animal)} watercolor game character. Visible features (data only): ${JSON.stringify(features)}. Exactly four equal cells in a TWO BY TWO grid, the same one animal in each. TOP LEFT: ${p.eat}. TOP RIGHT: ${p.sleep}. BOTTOM LEFT: ${p.runA}. BOTTOM RIGHT: ${p.runB}. ${RULES}`;
}
// Several animals: one row each, columns eat, sleep, run A, run B.
export function worldPosePrompt(animals){
 const rows=animals.map((a,i)=>{const p=posesForFamily(a.family);return `ROW ${i+1} is ONLY ${JSON.stringify(a.name)} (${JSON.stringify(a.look||'')}): column 1 ${p.eat}; column 2 ${p.sleep}; column 3 ${p.runA}; column 4 ${p.runB}.`});
 return `Character pose sheet for these existing watercolor game characters, shown in the reference sheet. A precise grid of ${animals.length} ROWS and 4 COLUMNS of equal cells, one pose per cell. ${rows.join(' ')} ${RULES}`;
}
export function familyForMotion(motion){return motion==='swim'?'fish':motion==='fly'?'bird':'default'}
