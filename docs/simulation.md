# Simulation import

`src/sim/engine.ts` imports the pre-event TypeScript engine and fixes a reproduced map-edge spawn bug. Node 24+ strips its erasable types for tests. Syntax checks are not a TypeScript semantic typecheck; introducing that check and correcting the prototype's broad species typing belong in a later refinement.

One tick represents one model week. Grass and browse regrow seasonally; animals consume resources/energy, move, reproduce, immigrate and die. Scheduled drought and species removal produce structured events. These are hand-tuned model rules, not validated ecological predictions.

The initial regression suite checks deterministic events/state, seed variation, isolation, direct resource response, removal and exclusion, starvation, immature breeding, finite values, life-story filtering, and season boundaries. These checks do not establish the long-term ecological effect sizes reported in the old prototype notes.

## Known limits for subsequent PRs

- No snapshot/restore of RNG state or custom imported creatures yet.
- Shared RNG draws can shift between interventions; paired seed comparisons need further refinement.
- Inputs are trusted internal fixtures; API-facing schema/range validation is not present.
- Use `sceneParams()` for registered companion profiles, with an empty scene by default or `{ populated: true }` for the original forest. These roles are explicit sandbox assumptions with supplied food, not wild penguin/pet ecology.
- `World.addCreature({ species, x, y, sex? })` validates additions before mutation, emits an arrival event and enforces an 80-living-creature import cap. This cap applies to user imports; births/immigration retain the engine rules.
- Scene profiles are deep-cloned so changes do not leak between worlds. The shared RNG still prevents full causal coupling guarantees.
- Terrain constraints and long-term population calibration need dedicated checks before a classroom-ready release.
- No art, browser UI, Meta calls or paid image bridge is included in this PR.
