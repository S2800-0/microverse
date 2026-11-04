# V17 scoped world-stage QA

Source intent: retained Little Field Club bitmap terrain/animals, typography and palette; user requests full-screen exploration with visible actual plants/feeding, stable guide faces and readable voice timing. Previous framed implementation: docs/screenshots/release-v11/08-garden-pond.png. New screenshots: docs/screenshots/world-stage-v17. Full source/current comparison: 10-stage-comparison.jpg.

Comparison normalization: screenshot dimensions are labelled in the comparison; intentionally changed map coverage is not treated as drift. Source viewport differs from current1280x720; full images scaled uniformly for side-by-side review. Actual current map bounds are x0/y0/1280x720 with radius0; phone390x844, no horizontal overflow, override reset. Text/assets remain native bitmap/code typography, no fake raster UI.

Findings/iterations:
- P1 small framed map and large inspector: full-viewport map and compact inspector. Actual simulation untouched by presentation change; no claim of infinite generated terrain.
- P1 food hard to find: actual biomass clusters and Find plants. Renderer uses real patch data; meal/growth still from simulation. Browser observed9agents,4eating and food falling from7to4marks.
- P2 paper edge revealed during close-up: camera clips5percent source edge, preserving coordinate projection.
- P2 phone controls cover food/Spark: inspector at upper right, exploration controls after its maximum-height area, guide above bottom actions. Current final phone screenshot09-phone-final.png includes the last positioning fix.
- P1 chat leaves world frozen: temporary chat suspension preserves run/pause choice and resumes. Verified63to64 on close. Finite day180 now explains/restarts visibly.
- P1 speaking portrait glitches: mounted decoded layers and no whole-image talk scaling; exactly one visible layer with transform none during narration.
- P1 duplicate/early narration: one unlock latch, scheduled/prioritized automatic cue per visit; pure scheduler tests pass. No claim of measured listening quality/FPS.

Fidelity: Baloo2/Atkinson, cream/forest tokens and round controls retained; generated art remains separate terrain/sprites; actual producers visible; raw user wording absent from product. World controls and inspector remain scrollable; the whole scene itself has no frame. Free typed question verified without paid request. Console clean in final tab;69 tests/build pass. No paid generation or participant usability test in this QA.

final result: passed
