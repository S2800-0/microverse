# Living worlds · V18 implementation contract

The user wants a watercolor game with independent living pieces, an enterable pond and a useful companion that acts on the world. A larger painted background alone does not meet this requirement.

## Researched decisions

- Use PixiJS 8 scene containers, depth ordering and deformable meshes for the new layered renderer. Keep watercolor raster artwork and stable scene coordinates; independent water, vegetation, trunks, canopies, shadows, animals and air layers. Sources: https://pixijs.com/8.x/guides/basics/scene-graph/ ; https://pixijs.com/8.x/guides/components/scene-objects/mesh ; https://pixijs.com/8.x/guides/components/filters .
- An alternative is Three.js sprites/billboards (https://threejs.org/manual/pages/billboards.html). Full 3D geometry is unnecessary for the selected painted style. The first implementation is 2.5D with separate positions/anchors/occlusion, not an assertion of full 3D reconstruction.
- Model surface, entering, underwater and returning as explicit scene transitions. Parent and child sessions persist separately, and inactive scenes suspend their clocks. This follows hierarchical/history statechart principles: https://stately.ai/docs/states and https://stately.ai/docs/parallel-states . Do not encode scene entry as camera zoom.
- A single validated command controller serves Spark and direct UI actions. The AI proposes JSON; it cannot execute code or edit arbitrary rule parameters. Changes act on real food patches, typed inhabitants, weather and habitat objects; they are logged, replayable and undoable. Unsupported species cannot silently substitute existing animals.
- New generated worlds require terrain-only art plus separate life and scenery sheets. Generation must not bake trees, bushes or animals into the ground. Art generation happens once, animation stays local. Existing art can be reused but must not be represented as a complete decomposition of its old painted ground.
- Wait screens include a small local seed game alongside honest job status; game progress never represents provider progress. Cancellation stops waiting and never automatically retries spending.

## Required route matrix

1. Home → choose guide → library → surface world.
2. Surface → visible pond arrow → bubble transition → freshwater underwater scene → surface return (preserve both sessions).
3. Surface without water → no misleading pond arrow; water-related Spark request explains available actions.
4. Spark free commands: add matching animal, remove matching animal, plant food, add tree/bush/rock, rain/heat/usual weather, focus plants, show feeding, enter/leave water, undo.
5. Custom Spark interpretation: consent → bounded JSON → validation → real controller or explicit clarification. Invalid IDs/unsupported species must not mutate state.
6. Predict/advance/pause, inspector selection/clear, map pan/zoom/recenter, actual event explanation, replay/undo.
7. Personal photo upload → reviewable world plan → terrain/life/scenery → real world; invalid image, declined consent, allowance exhaustion, provider failure and cancellation keep the source photo and never insert a default world.
8. Personal creature → broad identity → illustration/cutout → movement review → save; uncertainty/failed fit/fallback/back routes remain reachable.
9. Guide library/personal photo/voice preview/customization → return to the caller without losing that caller's world.
10. Tutorial → prediction → watching → evidence → recap → own-world choices. Teacher/craft/open tools and back destinations remain reachable.
11. Desktop and phone, reduced motion, hidden-tab/inactive-scene suspension, narration order and no duplicate auto cues.

## Spending and release boundary

Work remains in the isolated prototype. $5 total shared local cap, user-photo tests only, no new agent-paid artwork/retries. Tests may simulate provider responses but must be labelled as such. No main merge, publication, assistant coauthor or demo claim before actual browser verification. Latest results belong in docs/review-plans/living-world-v18-results.md.
