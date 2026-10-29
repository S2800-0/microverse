// Saved-art review inputs only. Geometry passing is not automatic visual approval.
export const META_SPRITE_CANDIDATES=[
 ['fox','Red fox'],['wolf','Grey wolf'],['deer','Buck'],['doe','Doe'],['fawn','Fawn'],['dog','Dog'],['cat-standing','Cat'],['rabbit','Rabbit'],
].map(([id,label])=>({id,label,image:`/meta-art/game-${id}.png`,profile:id==='cat-standing'?'cat':id==='rabbit'?'rabbit':'dog',motionScale:id==='cat-standing'?{stride:.5,lift:.6,bob:.6}:null}));
