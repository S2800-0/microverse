# Living-world V18 implementation and route report · 4 November 2026

## Result

77 automated tests pass. The production build and the four post-build Sites packaging checks pass. Final preview console inspection returned no warnings or errors. These are agent-driven implementation checks, not a teacher/learner usability study or proof of learning gains.

The main checkout remains clean at `5bda15b`. Work is in the separate local prototype. It has not been merged or deployed, and no assistant coauthor was added.

## Researched implementation

Product Design and frontend-design were used with the selected option-3 reference and the existing Little Field Club brand. The renderer uses PixiJS 8.22.0, with a scene graph rather than one animated background image. Primary references:

- [PixiJS scene graph](https://pixijs.com/8.x/guides/basics/scene-graph/)
- [PixiJS meshes](https://pixijs.com/8.x/guides/components/scene-objects/mesh)
- [Stately states](https://stately.ai/docs/states)
- [Three.js billboards](https://threejs.org/manual/pages/billboards.html), considered as an alternative; no Three.js dependency added.

Implementation contract: `docs/architecture/LIVING-WORLD-V18.md`.

## What changed

- Independent ground, water, rooted food, trunks, canopies, bushes, rocks, animals, flying animals and air/effect layers. Depth sorting and shadows support the painted perspective. Flight renders above canopies; perching returns a bird to its tree layer. Surface ripples are moving geometry, not just a moving whole-map image. Snow, sand/dust, leaves, rain, light shafts and underwater bubbles are bounded visual effects. This is 2.5D artwork and a teaching simulation, not a fluid solver or a full 3D reconstruction.
- Food stems reflect actual patch biomass. Eating consumes that exact patch, regrowth restores it, and the real event log identifies the eater and patch. Find plants leads to an existing healthy patch near the map centre; it does not create extra food.
- Garden surface now has land neighbours. Its water opens a separate freshwater scene through a bubble transition. Surface and pond clocks persist independently. Adult flying dragonflies do not become underwater animals. Atlas cell remapping is used for both the scene and portraits.
- Spark has validated commands for adding/removing existing animals, planting edible patches, adding habitat objects, changing supported weather, showing food/feeding, focusing animals, pausing, navigation and undo. Changes alter the engine and record. Undo reruns the original starting world to the same day with the last change omitted.
- A new animal request has a separate consent step, design validation and four-pose sheet. Poses are cut and grounded at a common scale locally. Generated visitors can move and meet neighbours; they do not acquire an invented food-web role. Incompatible movement stops before an image request. Actual new generated artwork quality remains a live-test item.
- New photo-world builds request terrain, life and scenery separately, plus bounded visible movement hints. All four build-stage reservations are held before provider work. A completed world plan plus build reserves at most $0.25 under the existing conservative reservation scheme. This is not a measured provider bill.
- An optional local seed-planting game runs while waiting. Its score never pretends to be generation progress. Creature loading retains the illustrated sketch/movement/paint process and honest job status.
- New surface/pond hint scripts have matching prepared Heart/Bella/Emma clips, generated offline. No paid speech call. The phone tutorial keeps the clock visible and the next-step button clear of Spark. Explanations temporarily suspend the world.

## Three exploratory browser journeys

| Journey | Verified outcome |
| --- | --- |
| Garden → pond → surface → pond | Surface paused at day 0 while pond advanced to day 7. Returning preserved both days. Direct animal selection, the accessible neighbour menu, Stop following, Escape, drag, zoom, recenter and food focus worked. |
| Woodland → Sunny commands → change guide to Clover | Add two mice changed population 10→12. Weather and undo worked. Guide customization returned to the same day/population. There was no misleading pond arrow. |
| Reef → water-specific commands → local photo/creature → tutorial | Marine rain reduction was rejected; warming, food planting, animal addition and undo worked. Own-photo entry kept the source image and consent boundary. Full lesson reached evidence, recap and own-world choices. |

These journeys used prepared worlds and local photo previews. They were not three fresh paid AI generations.

## Route matrix

| Surface or path | Evidence / result |
| --- | --- |
| Hero → guide → library | All three guide choices visited; voice preview exercised; three labelled library places reachable. Hero/support comparison saved. |
| Garden, woodland, reef | Each rendered through the new layered canvas. Desktop, phone and 834×895 checks; no horizontal overflow in inspected states. |
| Pond arrow / header return / Spark return | Bubble transitions; independent sessions; Spark navigation closes its chat; repeat visit retained day 7. |
| Surface with no enterable pond | Woodland exposes no pond button. Unsupported navigation is rejected by the command validator. |
| Spark direct actions | Browser: tree, food, add/remove animals, rain, warm, undo, pause, food focus and navigation. Actual feeding follow and real-record explanation inspected. |
| Spark free language variants | “Plant two food patches,” “Add two mice,” “Where are the plants?” now resolve locally. Existing species cannot silently become another animal. |
| Spark custom interpretation | Simulated provider tests: bounded commands only; invented IDs and arbitrary commands rejected. Fresh paid custom-language quality was not rerun. |
| New visitor artwork | Browser local fixture used existing owl pose artwork, explicitly labelled as a fixture. Four-pose rendering, flight layer, pause and reduced-motion control exercised. API consent/cache/budget/failure/cancellation/incompatible-design checks used simulated providers. |
| Waiting mini-game | All five seed buttons exercised in `qa.html`; prepared assets, no provider request. Fixture is not a generated-success demonstration and is not included in the production entry. |
| Landscape upload → outdoor place | User-supplied Huahine image loaded locally and reached its own generator consent; no default meadow. Generation disabled before consent, enabled after checking consent; no request submitted. |
| Plant close-up / different landscape | Both reached the same photo-specific builder; Back kept the source photo and reset consent. |
| Object / unclear | Source-reviewed recovery flow now offers an explicitly imagined world. Direct Build my living world also accepts such photos. These two new recovery buttons were not separately browser-clicked in this pass. |
| Personal creature | User-supplied orange-cat image loaded locally. Animal type optional; details → paint consent → keep photo → review → welcome. Paint button enabled after consent without submitting. No photo was sent to Meta. |
| Saved creature | Clover movement preparation → fitted review → trot/gentler movement → welcome. No collection entry was saved during QA. |
| Creature → world | “Build a living world around this creature” reached WorldPainting with the creature source and fresh consent. |
| Guide customization | Sunny→Clover returned to an unchanged woodland session. Existing front-facing expression artwork reused. |
| First adventure | Water/tree/grass review, food preview, prediction, comparison and editing a prediction at week 1 all worked. Editing did not reset time. Continued through 52 weeks. |
| Reflection → recap → own choices | Evidence choice enabled recap; usual-rain comparison worked; completion opened own-world/creature/library choices, not the hero. |
| Discovery export/import | Saved the completed lesson and imported it through Open a discovery; week 52 and actual comparison were restored. |
| Craft / footprint / open tools | Making-of example/state buttons, both support pages, repository destinations and return navigation inspected. PixiJS attribution added. Existing external repositories were not republished or independently re-audited. |
| Voice | Existing preview and narration paths exercised; new fixed clip files prepared and covered by script/file checks. This is not a human listening-quality study. |
| Phone | 390×844: no horizontal overflow; pond button clamped in bounds; food focus, inspector return and lesson primary button checked. Tutorial viewport stays 844px tall instead of scrolling its clock behind the header. |
| Fallbacks / failures | Unit tests cover invalid plans, commands, replay data, missing consent, failed providers, cache, no retries, cancellation and partial reservation failure. GPU fallback retains a pond entrance. Forced GPU failure was source-reviewed, not browser-injected. |

## Bugs found and fixed during the audit

1. Pond texture sampled garden beds: corrected against the actual terrain. A narrow water strip then stretched stones vertically: replaced with an aspect-preserving sampled water texture, with independent bubbles/light.
2. Pointer capture prevented canvas animal clicks: removed parent capture; verified actual snail selection and deselection after a fresh renderer mount.
3. Pond arrow overlapped the clock or extended beyond the phone: minimum vertical position and actual half-width clamping.
4. Pond portraits used the wrong atlas cells: apply source count/index mapping consistently.
5. Underwater hint could target the hidden parent map: scene-specific tutorial targets and voice scopes.
6. New hint words differed from prepared narration: exact surface/pond scripts generated locally in all three voices.
7. “Mice” and “foxes” could request a new species: irregular plural handling.
8. A new tree or food event could not focus its actual object/patch: route event focus by the real record identifier.
9. Flying birds could pass behind canopies: separate flight layer; grounded versus airborne sprite anchors.
10. Phone lesson scrolling hid the day label and the guide covered the main action: stable world/clock, scrollable story region, next-step ordering, guide in the viewing area.
11. The old local spending window had expired: aligned it with the stated deadline, without changing the approved total cap. Both paid API adapters now check that the window is still open at request time.

## Cost and credentials

No new paid model requests or agent-generated assets in this pass. Canonical ledger remains **$2.10 reserved /42 attempts** under **$5 total**, leaving **$2.90 unreserved**. Reservations are not verified provider billing. Fresh tests remain for the user's own photos; no automatic retries.

The local test window ends **5 November 2026 at 02:00 UTC / 04:00 Cairo**, corresponding to the stated **4 November, 9pm EST** submission deadline. No extra budget or public generation was enabled. Main environment flags were not changed.

Readiness checked: enabled, canPlan and canBuild true. Both Meta and Baseten key values were checked against built client text files; no matches. Keys stay in server-side configuration and were never printed. The separate prototype currently uses Meta Spark for its new world commands/design, Muse Image for art, and SAM for creature cutouts; the older main reasoning-provider configuration was not changed.

## Remaining before a truthful public demo

- Use the user's own fresh landscape and animal photos for one live world and one live creature build. New scenery sheets and arbitrary-animal artwork have not been judged with fresh real provider output in this pass. Inspect the actual results; successful mocked responses do not establish generation quality.
- Saved backgrounds still contain painted scenery. Their added objects are independent, but not every original tree/bush has been decomposed. New builds use the terrain/life/scenery prompt separation; this is not universal rigging or arbitrary biology inference.
- New animal visitors have movement/greetings only; a reviewed diet/role is needed before including them in ecological outcomes. The sourced catalog remains small; live biodiversity/motion-dataset retrieval is still roadmap work.
- Physical camera permission/capture, microphone input, screen-reader use, OS reduced-motion settings, hidden-tab timing and representative-device FPS need real-device checks. The prototype's new question panel has not ported the main site's microphone flow.
- Teacher/notebook surfaces from the main project are not ported into this isolated prototype. No real teacher/learner trial has been claimed.
- Legacy forest/finish and old reef/classifier states remain in source for reuse but are not the primary library routes. No artificial state injection was used to claim browser coverage of them.
- Integration and deployment of this prototype are still separate work. The public main site has not received V18.
