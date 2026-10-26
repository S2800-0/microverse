# Simulation import

`src/sim/engine.ts` imports the pre-event TypeScript engine and fixes a reproduced map-edge spawn bug. Node 24+ strips its erasable types for tests. Syntax checks are not a TypeScript semantic typecheck; introducing that check and correcting the prototype's broad species typing belong in a later refinement.

One tick represents one model week. Grass and browse regrow seasonally; animals consume resources/energy, move, reproduce, immigrate and die. Scheduled drought and species removal produce structured events. These are hand-tuned model rules, not validated ecological predictions.

The initial regression suite checks deterministic events/state, seed variation, isolation, direct resource response, removal and exclusion, starvation, immature breeding, finite values, life-story filtering, and season boundaries. These checks do not establish the long-term ecological effect sizes reported in the old prototype notes.

## Known limits for subsequent PRs

- No snapshot/restore of RNG state or custom imported creatures yet.
- Shared RNG draws can shift between interventions; paired seed comparisons need further refinement.
- Inputs are trusted internal fixtures; API-facing schema/range validation is not present.
- Companion species are named in the type union but do not yet have registered runtime profiles. Do not instantiate them until their feature is imported.
- The prototype marks spawning private in TypeScript even though a later companion adapter called it from JavaScript. That boundary needs an explicit public API in the companion PR.
- Terrain constraints and long-term population calibration need dedicated checks before a classroom-ready release.
- No art, browser UI, Meta calls or paid image bridge is included in this PR.
