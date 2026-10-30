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

### Living forest view

- `src/scene/terrain.js` adapts pre-event `microverse/app-art/terrain.js`, original SHA-256 `a5174cb3cc8469b2efe73283e44c045dcf34442e25030bcb7c285c04dfa9a9f4`. Added coordinate validation and complete path checks.
- Prepared sprite-cut settings and scene interaction patterns were reviewed from pre-event `species.js`, `game-world.js` and `camera-pipeline.js`. The new view/controller/import modules and HTML/CSS are separately assembled around the migrated APIs; the monolithic renderer/dialog is not copied wholesale.
- Public art comprises `maps/v2/spring.png` and the dog, fox, wolf, deer, fawn, rabbit standing PNGs plus `tabby-character-preview.png` from the pre-event prototype. Copies are unchanged binaries. Original paths and hashes are recorded in `public/art-manifest.json`; the map's destination drops its `v2/` segment. These are existing generated assets, not new hackathon art or live Meta results. Event reuse eligibility must be disclosed/checked separately from access to the files. No raw photo or stock test-photo collection was copied.
- New engineering work: view-independent scene commands, terrain-safe movement/predation, deterministic open-cell spawn recovery, actual-model cards and event projection, local review import, responsive view, browser build/preview support, tests and documentation. The original local prototype remains unchanged.

### Complete snapshots and paired replay

New modules `src/sim/snapshot.ts`, `src/scene/snapshot.ts`, `experiment.ts` and `experiment-view.js` add explicit RNG-state capture, complete world restoration, full-scene forks, local replay files, learner notes and bounded future-randomness replicates. They use the migrated engine, terrain and art described above; no new image generation or Meta inference is represented by this feature. `tests/replay.test.mjs` verifies continuation, independent state, import identity, validation and repeatability. Browser QA used the existing generated dog sample, not a new personal photograph. The original prototype and its paid-image pause remain unchanged.

### Optional Meta creature adapters

New server adapters, cost ledger, local API and browser mask composition were assembled October 27, 2026 against the official Meta API documentation linked in `docs/meta-creature.md`. The design reviews the pre-event Bedrock bridge's reservation-before-attempt approach, but does not migrate its AWS credentials, routes, runtime ledger or provider calls. It reuses the already-recorded sprite prompt, fitter and review modules. `@meta-sam/parser@0.1.0` is a pinned npm dependency under its own SAM License, not original project code. Tests use synthetic provider/PNG fixtures and an official-format sample segmentation wire record. Browser QA uses existing local art; this feature does not claim a successful live Meta generation. No new output images, private photos or provider secrets are committed.

### Investigations and classroom activity

New `src/investigation/`, Spark server adapters, typed intervention/replay-v2 support, question/evidence UI and printable teacher activity were assembled October 27, 2026. They build on the migrated engine/forest/replay, without adding art or copying private prototype chats. Twenty question fixtures and classroom examples are synthetic; no learner/teacher participant data or findings are included. API integration verification comprises a tiny Meta Spark response and one accepted 70%-rain/26-week proposal; failed diagnostic attempts were rejected without model execution. Live image/SAM, Baseten and evidence-selection success are not claimed. Usage details/limitations are documented in `docs/investigation.md`; credentials, billing receipts and local ledgers remain ignored. No teacher sessions or educational efficacy outcomes have been observed.

### Optional narration

New `src/scene/narration.js` and `narration-view.js` were assembled October 27, 2026 around the existing model/evidence APIs. They generate bounded captions from recorded numbers/events and optionally use explicitly local English browser voices. No generated voice asset, paid inference, new image, animal recording or private learner text is added. Speech availability and perceptual quality depend on the target device and are not established by transport fixtures. The accompanying photo-pilot protocol describes pending live tests, not completed generation results.

### Neural narration and Meta dictation

The voice-input/output slice replaces the app's device-voice wiring with an optional local Kokoro Heart adapter and separate Meta Muse Voice Transcribe question entry. The generic caption/controller tests remain. Kokoro/Transformers/phonemizer are upstream dependencies with their own licences, not original project models. A fixed-revision ONNX model is downloaded to ignored local runtime storage; no model weights or generated audio are committed. One local synthetic question was transcribed successfully by Meta; no microphone or learner speech was recorded by the agent. UI defaults to silent captions; sending a clip and using its transcript are separate actions. Account credentials, audio clips and billing receipts remain private.

### Live photo pilot and harness segmentation

Four owner-supplied animal photos were processed October 27, 2026 into new Muse Image illustrations and SAM cutouts. These are distinct from the pre-event public artwork. A dog-only mask omitted a worn harness; one deliberate SAM-only retest included the harness in the subject and corrected the visible omission. The new fixed-phrase target passes existing appearance notes to segmentation; a regression covers it. No source photo, output illustration, private review page or runtime receipt is committed. Public documentation reports aggregate results/limitations only. The [pilot record](docs/image-pilot.md) distinguishes returned payloads, geometry, visual inspection and the remaining owner/hardware/replay checks.

### Reviewed place observations and integration closure

New `src/place/` and place-service modules were assembled October 27, 2026 around the existing SAM parser, explicit scene commands and replay APIs. Photo resize/metadata-removal strategy was reviewed against the pre-event creature camera module; its monolithic UI/providers were not copied. The shared parser now exposes a bounded multi-mask path for place labels while the creature path retains exactly-one-subject validation. Model food initialization and compact place provenance preserve existing rules/topology and consume no random draws.

The new public garden example is a resized, metadata-free derivative of **Garden pond in park** by Jon Sullivan, whose public-domain dedication was verified on [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Garden_pond_in_park.jpg). Source/derivative hashes and attribution are in `public/places/manifest.json`. Its accompanying saved SAM response is explicitly labelled recorded; playback makes no inference call. No personal photos, model keys, billing receipts or private creature outputs were added to public files.

A full actual-beagle replay and browser reopen completed, and one live Spark evidence selection passed without pictures/names/learner notes in the model payload. The place example made three live SAM image calls. These are integration findings, not ecological ground truth, a segmentation benchmark or participant usability outcomes. The [demo evidence record](docs/demo.md) separates observed results and pending work.

## Guided discovery and personal collection · October 27, 2026

New event work: guided dry-spell journey; one-forest comparison UI; plain-language recorded summaries; current-state close-ups and event invitations; post-start event accounting; everyday response and discovery-card presentation; explicit browser-local creature collection, sourced dog/cat fact cards and labelled imagination greetings; honest creation-stage subtitles. These reuse the previously disclosed engine, terrain, art and puppet modules. No new image generation or paid inference was used for this redesign. The species-fact text is a short original paraphrase with source links in `src/scene/creature-facts.js`, not a model-generated diagnosis or prediction about an uploaded pet. Teacher/learner outcomes remain untested.

## Motion storyboard and entrance · October 28, 2026

New event work: a separate motion-led landing study, a reusable presentation-only fox scene, question-led weather illustrations, two explicit entry links to existing reviewed flows, and optional technology/resource disclosures. The page reuses the public fox, fawn, dog and spring map and the migrated mesh/IK/artistic-gait modules described above; no new image, video, model weight, private photo or paid inference is included. The owner's Pinterest links inform motion/composition goals; no reference media was downloaded or copied. The creature reveal, expression sheets and separate head/talking animation are storyboard requirements rather than completed features. Sources and precise boundaries are recorded in `docs/motion-storyboard.md`.

### Owner-supplied entrance artwork · October 28, 2026

The owner placed `Sunlit Watercolor Forest Path.png` (1672×941) and `Watercolor Red Fox Walking Rightward.png` (1536×1024, RGBA) in the separate prototype's `app-art` folder for this redesign. They are copied byte-for-byte to `public/intro/forest.png` and `fox.png`; source filenames, dimensions and hashes are recorded in `public/intro/manifest.json`. Their generation tool and creation date have not been independently verified; they are not represented as live Meta results or automatically classified as newly made hackathon artwork. No personal animal photograph or private output was copied with them.

The revised entrance fills the viewport with this new forest, places the new fox on the path, and uses local scroll choreography for the camera, text and artistic gait. This is a single flattened painting plus a separate character; independent foreground/background parallax still requires registered layers and hidden-region artwork. No segmentation, inpainting, new generation or paid inference was used for this integration. The ecological map and species art retain their prior identities.

### Layered scenery and supplied walk sheet · October 28, 2026

The owner supplied `Sunlit Meadow Path to Distant Lake.png`, `Watercolor Forest Corner Cutout.png`, `Watercolor Forest Corner Overlay.png` and `Watercolor Red Fox Walking Cycle Sheet.png`. The three scenery files are unchanged imports at 1672×941 and supply the reconstructed background plus left/right alpha foregrounds. New local choreography moves those foregrounds independently of the distant scenery.

The 1774×887 walk sheet contains eight separate silhouettes rather than an exact integer grid. `scripts/prepare-walk-sheet.py` uses connected alpha components to cut and uniformly scale the existing pixels into a 2048×1024 atlas, registering nose/foot anchors and preserving antialiased edges. It also exports a small still poster. It does not synthesize poses, infer animal locomotion or call a model. Original files remain unchanged. Source and derivative hashes and processing details are recorded in `public/intro/manifest.json` and `walk-frames.json`. Provider/creation-time provenance remains unverified. Appearance differences between generated poses remain a visual review limitation.

## Meta artwork review and guide expressions · October 29, 2026 (Cairo)

The owner requested Meta versions of the active art set. New `public/meta-art/` contains actual Muse Image reference edits, SAM cutouts, and local exports. These use previously disclosed public/owner-supplied art as references; their source hashes and full prompts are recorded in the public manifest. The original public art and prototype source files are unchanged. Four guide expressions came from the preceding one-image/one-SAM test; the broader batch made 14 image edits and 12 SAM calls, including two explicit follow-ups. One walk image failed import-size validation before it was saved; its receipt/reservation remains and the manifest records the failure.

New engineering comprises an art-review gallery with original comparisons, reusable local guide-expression playback, a registered Meta walk preview, fixed/bounded paid batch tooling, local mask assembly, and provenance/behavior tests. The guide and static Meta fawn/dog illustrations are used in the entrance choices and landing examples. Other new artwork remains explicitly labelled as candidates until terrain/rig/layer checks pass. The first cat was seated and its follow-up stands; the left SAM mask selected both sides; the walk varies in body/tail shape. These findings and costs are recorded in `docs/meta-art.md`. No API credentials, raw personal photos, private mask packets or billing receipts are published. This work does not claim every current screen has already switched to Meta artwork or that Meta created the references from scratch.

## Saved Meta art adoption · October 29, 2026

No additional generation or segmentation calls. `scripts/prepare-meta-adoption.py` locally normalizes eight Meta cutouts, exports the map to the existing dimensions, isolates/limits the forest masks, and preserves the Meta master exactly on rest recomposition. Source/output hashes and manual edge-tree outlines are recorded in `public/meta-art/adoption.json`. Saved-art source files and their earlier attempt records remain unchanged.

New work includes actual-browser fitter/renderer phase checks, fixed reviewed cuts for six articulated built-in sprites, explicit whole-image cat/rabbit rendering, a separate doe image/rig/portrait instead of the buck-erasure placeholder, shared map selection for forest/experiments, updated prepared imports, and a rig option for the entrance fox. The Meta map was visually compared with the existing obstacle overlay; terrain/model logic is unchanged and pixel-exact collision alignment is not claimed. Cat geometry passed four-piece checks but sampled motion still exposed an ankle discontinuity, so its articulation was not adopted. The generated walk sheet remains a review artifact; the entrance uses the accepted single-body rig. These are engineering/developer observations, not ecological/participant validation.

## Entrance refinement and reusable source · October 29, 2026

New event work: shortened direct-scroll entrance, locally cached 24-pose fox/fawn atlases, WebP presentation exports, locally traced mountain headline overlap, a separate canvas-weather illustration, phone-to-watercolor demonstration, and dedicated craft/open-tools pages. Existing Meta artwork and reviewed rigs are the disclosed sources; caching and scenery preparation make no inference calls. Source/output hashes are in `public/entrance/manifest.json`.

The new public photo example derives from **Golden Retriever 88.JPG** by Mtlchung, [CC0 on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Golden_Retriever_88.JPG). It made one new Muse Image reference edit and one SAM call. Its source crop and actual illustration are public; the raw mask/receipt and credentials remain ignored. This is a single developer-reviewed example, not a likeness or segmentation benchmark.

The owner explicitly approved MIT licensing for original code. Three separate source repositories extract existing disclosed engine/replay, puppet/review and question/command modules with new standalone build scripts, examples, notices and CI. Source manifests preserve upstream file hashes and the parent commit. No art, private outputs, model weights or keys are included. Fresh GitHub copies pass 30 ecosystem, 16 puppet and 3 command tests plus their examples. External adoption and classroom efficacy remain untested.

## Focused forest story and actor study · October 30, 2026

New event work: a four-scene lesson study with a selective single-rabbit close-up, prediction/observation choices, local playback between saved model states, same-time food-patch branch switch, optional reflection, connection reveal and standard replay export. New presentation utilities use the existing deterministic controller/experiment format and saved public Meta map/rabbit/guide art. All model populations remain in the experiment despite the focused depiction. Decorative foreground framing does not redefine terrain.

A separate fox motion study reuses the previously disclosed 24-pose local atlas with visible-foot alignment, distance-based phase, pivot/stop/pause controls and local timing diagnostics. The rabbit's hop is whole-image acting; deer articulation is not represented as fixed. No new image generation, segmentation, speech inference, photo upload or other paid call was made. No new artwork, private photographs, model weights or credentials were added. The existing main forest remains unchanged. Detailed scope and verification are recorded in docs/forest-story-prototype.md.
