# Provenance

The initial repository foundation (README, workflow, planning documents, package scripts) was assembled on October 26, 2026. Eligibility of work from that date depends on organizer clarification: the supplied guide lists an October 26 kickoff and an October 27–November 4 building period.

Each subsequent import must record its source, hash, origin, and modifications. Imported pre-event code must not be presented as a newly implemented hackathon feature. No raw personal photos, credentials, billing records, private chat exports, stock test photos, or unreviewed image assets are included in the foundation.

## Imported features

### Simulation engine

- Destination: `src/sim/engine.ts`.
- Source: `microverse/spikes/sim/engine.ts` in the separate local prototype.
- Origin: pre-event feasibility work, recorded in prototype notes on October 22–23, 2026.
- Original source SHA-256: `9643d7cff58876ef1a60ccafed0631910f2d2ec387f10b35e6dea1b79a273cae`.
- Imported October 26, 2026. Initial import was byte-identical; the migration's multi-seed invariant test then reproduced an out-of-bounds newborn (seed 7, tick 22). The new branch clamps spawn coordinates to map bounds. The original local prototype is unchanged.
- New migration support: `tests/simulation.test.mjs` and `docs/simulation.md`, assembled with the feature branch. Eligibility of dates remains subject to organizer rules.

### Companion roles and creature addition

- Sources: pre-event `microverse/app-art/scene-ecology.js` (companion assumptions) and `microverse/app-art/scene-actions.js` (explicit arrivals).
- Destinations: adapted `src/sim/scene-ecology.ts` and the new public `World.addCreature` method in `src/sim/engine.ts`.
- Retained behavior: fed dog/cat companions, a cared-for penguin visitor, no companion breeding, nonlethal disturbance, explicit arrival events.
- New refinements: deep-cloned scene profiles, supported-own-property checks, bounds/terrain/sex validation before mutation, and an 80-living-creature import cap enforced at the model API.
- New verification: `tests/companions.test.mjs`. Original prototype files remain unchanged. No creature art, photographs or provider bridge was imported.

### Procedural motion and rig review

Pre-event sources are under `microverse/app-art/`; destinations are `src/motion/`.

| Source | Original SHA-256 |
|---|---|
| puppet-motion.js | e7846c197958cb7810755d386ed01b60d6d854edba6c0920d82077c140de8daa |
| rig.js | 44979a950a0dd876009917d0e75279d57cd038e97ea858447d734d034d053f5a |
| rig-analysis.js | a5c6c8fc6b01eeb06aae4c35d788e7ecc5c8dfe94c51bda98b70a003faf2968b |
| motion-library.js | 15429c3ebab406632c178abe70475ff4c18d72f52311979640a0250718e81e82 |
| sprite-edges.js | bf7718948dfc4b18cecad38b3ddf092debe404f4e6e94b14c525ef2a8347bc1b |

Retained: mesh/IK approach, leg extraction, artistic movement parameters and edge cleanup. New refinements: input validation, scale-relative IK tolerance, stricter tool arguments, accessory-preserving prompt, and review/fitter modules decoupled from the original dialog. The fitter adapts the bounded proposal strategy from pre-event `import-rig.js`. New tests, synthetic canvas fixtures, a local-only developer server and UI-boundary documentation accompany the migration. No image assets were copied; the existing generated dog was used locally for browser QA only.
