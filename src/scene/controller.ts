import { World, seasonOf } from '../sim/engine.ts';
import type { SpeciesId } from '../sim/engine.ts';
import { sceneParams } from '../sim/scene-ecology.ts';
import { buildTerrain, MEADOW_V2_TERRAIN } from './terrain.js';

export function createForestController({ seed = 7, populated = true } = {}) {
  const terrain = buildTerrain(MEADOW_V2_TERRAIN);
  let world: World;
  let selectedId: number | null = null;
  const appearances = new Map<number, { name: string; image?: string; rig?: unknown }>();
  function reset(fill = populated) {
    populated = fill; appearances.clear(); selectedId = null;
    const p = sceneParams({ populated });
    world = new World(p, seed, [], (x,y)=>terrain.walkable(x,y/p.height*100),
      (x0,y0,x1,y1)=>terrain.clear(x0,y0/p.height*100,x1,y1/p.height*100));
    return getState();
  }
  function getState() {
    return { world, terrain, appearances, selectedId, week: world.week, season: seasonOf(world.week),
      counts: world.counts(), grass: world.grassCover(), browse: world.browseCover(),
      animals: world.animals.filter(a=>a.alive) };
  }
  function add({ species, name = '', image, rig }: { species: SpeciesId; name?: string; image?: string; rig?: unknown }) {
    if (!Object.hasOwn(world.params.species,species)) throw new Error('Unsupported ecological role.');
    const n = world.animals.length;
    let position: {x:number;y:number} | null = null;
    // Deterministic placement is independent of frame rate and UI animation.
    for (let i=0;i<500;i++) {
      const angle=(n+i)*2.399963, radius=2+i*.07;
      const x=52+Math.cos(angle)*radius, y=30+Math.sin(angle)*radius*.6;
      if (terrain.walkable(x,y/world.params.height*100)) { position={x,y};break; }
    }
    if (!position) throw new Error('No open ground available for this creature.');
    const animal=world.addCreature({species,...position});
    const cleanName=String(name).trim().slice(0,24)||`${species[0].toUpperCase()+species.slice(1)} ${animal.id}`;
    appearances.set(animal.id,{name:cleanName,image,rig});selectedId=animal.id;
    return animal;
  }
  function schedule(kind: 'drought' | 'remove-wolves') {
    if (kind === 'drought') world.interventions.push({kind:'drought',rain:.4,atWeek:world.week,untilWeek:world.week+156});
    else if (kind === 'remove-wolves') world.interventions.push({kind:'remove',species:'wolf',atWeek:world.week});
    else throw new Error('Unsupported experiment.');
  }
  reset();
  return { getState, reset, add, schedule,
    select(id: number | null) { selectedId=id;return getState(); },
    step(weeks=1) {
      if (!Number.isSafeInteger(weeks)||weeks<1||weeks>520) throw new Error('Choose between 1 and 520 weeks.');
      world.run(weeks);return getState();
    },
  };
}
