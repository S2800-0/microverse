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
