# Living forest: first playable view

Run `npm run preview`, then open `http://127.0.0.1:8895/`. `npm run preview:motion` retains the standalone rig workbench. `npm run build` writes a static `dist/` tree, erasing TypeScript and rewriting module paths without adding a framework dependency. This is syntax erasure, not semantic type checking.

## What works

- One visible button/canvas per living simulation animal, actual model positions, seasonal calendar, energy/age, event records, births/deaths and explicit arrivals.
- Play/pause, single-week stepping, speed control, deterministic seed-7 reset and empty clearing.
- Existing generated watercolor map and six species images, with reviewed prepared rigs where geometry permits. Non-rigged art remains whole-image movement; art is illustrative and does not accurately encode every individual's sex/age.
- Local dog/cat import with file restrictions, resize/re-encoding, review before rig acceptance, explicit fallback, name reuse and the same model addition API as the collection. Saved dog/tabby samples exercise the complete path without a new generation request. Photo bytes stay in the page; close clears pending/source file state; reset clears imported actor data. Physical device camera is not implemented in this feature.
- Two named interventions compared against a baseline copied from the complete current forest: 40% rainfall for 156 weeks and wolf removal with immigration exclusion. Prediction, synchronized controls, event evidence, reflection and local replay are described in [the replay guide](replay.md). The exploring forest stays paused and unchanged. No free-text model call is enabled.
- Keyboard creature buttons, focus-driven camera visibility, native modal dialogs, keyboard/drag/wheel camera controls, reduced-motion handling and a narrow-screen layout. No claims of complete accessibility or device testing yet.

## Architecture

`src/scene/controller.ts` owns the world, selected ID, appearance references and supported commands. It has no DOM. `terrain.js` adapts the existing traced map masks. `view.js` projects state into a changeable layout; `creature-import.js` connects local image preparation to the previous rig-review controller. CSS/HTML live in `app/` and can be replaced without moving ecological rules into UI components.

Animation interpolates between actual successive model positions. It does not invent hunts, births or movement targets. Reduced motion removes smooth travel/limb cycling while the model clock can continue. Appearance identity and rig references are separate from ecological profiles.

## Fixes found during migration

The old engine checked destination walkability only, so an animal could cross water or hunt across an obstacle. A traversal callback now samples the whole path; shortened moves and predation respect it. Blocked initialization/birth positions receive a deterministic open-cell fallback. A fully blocked map fails explicitly. The original unrestricted model tests still pass, but terrain-constrained population effects require fresh calibration; old prototype effect-size results do not validate this new scene.

Browser QA also found overlapping notes/card panels, mobile camera controls overlapping a wrapped footer, and a crop-only Fit map control. Panels now exclude one another, camera controls use the footer's actual height and Fit map uses the contain scale. The old all-in-one DOM renderer was reviewed as reference rather than copied wholesale.

## Verification

- Tests cover scene/reset determinism, custom identity and memory reset, 104 weeks of open-ground placement, companion preservation under an intervention, invalid terrain/step inputs, blocked-channel movement/predation, file validation, asset hashes and preview-route restrictions.
- Desktop browser: field card/step, named saved dog → review → acceptance → model arrival, live clock advancement and event updates.
- 390 × 660 CSS-pixel iframe: initial layout, scrollable import dialog, saved tabby → review → model arrival. This tests responsive CSS, not phone hardware, camera permissions, touchscreen gestures or measured device performance.
- Static build checked independently. The subsequent replay feature adds complete snapshot/RNG restoration and paired-world experiments, with its own tests and browser checks.

## Limits and next steps

UI/UX remains open to redesign. The model uses illustrative assumptions, manually traced terrain and artistic gaits. The background is the imported spring painting; calendar changes are model data and resource tinting is an index, not freshly generated seasonal imagery. No Meta inference, automatic identification, SAM segmentation or generative map step is enabled here. Initial PNGs retain their source resolution; a first-load performance/art optimization pass is still needed.

The [optional Meta creature bridge](meta-creature.md) now supplies local adapters and explicit image sending, paused by default. Next: funded live validation and custom experiment translation. Headline claims about ecological effect size or classroom learning require separate evidence.
