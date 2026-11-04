// Picture sizes in world units (the map is 1000 wide). Storybook proportions, not measurements.
const NAMED=[[/mouse|mice|shrew|vole/i,34],[/snail/i,30],[/shrimp|prawn/i,32],[/dragonfly|butterfly|\bbee\b/i,30],[/frog|toad|newt/i,34],[/hedgehog|squirrel/i,40],[/rabbit|hare/i,46],[/goldfish|reef fish/i,44],[/parrotfish/i,62],[/owl/i,48],[/parrot|duck/i,46],[/\bbird|robin|sparrow|finch/i,34],[/\bcat\b|kitten/i,56],[/dog|puppy|beagle|retriever/i,70],[/fox/i,78],[/alpaca|deer|fawn/i,98],[/wolf/i,90]];
const BY_ROLE={predator:72,grazer:48,companion:58};
export function creatureWidth(type){const name=String(type?.name||'');for(const [pattern,width] of NAMED)if(pattern.test(name))return width;return BY_ROLE[type?.role]||56}
// Spread wings take more room than a perched body, but only a little more.
export function flightWidth(type){return creatureWidth(type)*1.3}
