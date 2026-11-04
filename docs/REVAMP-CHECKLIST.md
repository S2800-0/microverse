# V18 current checklist · 4 November 2026

See `docs/review-plans/living-world-v18-results.md` for the completed route matrix and explicit gaps. 77 automated tests, production build and post-build Sites checks pass. Source comparisons/screenshots: `docs/screenshots/living-world-v18/`.

Implemented here: independent world layers, separate pond scene, useful Spark controllers, unknown-animal design/pose path, local waiting game, exact new hint voice clips and phone lesson repairs. Fresh paid user-photo output, real-device camera/microphone/accessibility/FPS checks, teacher/notebook port, broad retrieved biology/motion data and main-project deployment remain open. These historical checklist rows below do not override that current status.

# V14 scoped completion

Current QA:59 tests/build pass; destination back labels, deselection, hero blur and companion-entry callback verified. Own-photo services enabled under$2total, user chooses images. Eight source-backed knowledge profiles and free local field notes are connected; broad live retrieval/universal rigging are roadmap. See current `design-qa.md` and `AI-SYSTEM-MAP.md`. Main migration remains separate; older status below is history.

# V12 prototype progress · 3 November 2026

Supersedes historical status counts below. Still an isolated prototype, not completion/migration of all 46 main-project surfaces.

Current additions: distinct garden/woodland/reef living maps, three animal types each, compact exploration with recenter/pond view, owl wing poses/tree perches, trunk avoidance, actual patch feeding/regrowth, paw wordmark/transparent header, visible craft/tools cards, Yes-first review, intermediate lesson weeks, audible helping notes/dialogs and live-answer local Heart playback. New-world custom diet/unsupported questions were tested live within $1.70 total cap ($1.65 reserved). 53 tests pass. See current README/design-qa and V12 results for exact checked paths and limitations. Main remains untouched.

# Latest prototype progress — 3 November 2026

The V10 notes here supersede the old status/acceptance wording below; this is not completion of all 46 main-project surfaces. Main remains unchanged.

- Implemented and rendered in the separate prototype: layered living-reef simulation, bounded general photo-world builder, reviewed fish fin/mouth/eye motion, local foliage/water/weather layers, smoother hero, dimmed tutorial target, visible food/time, personal Spark picker and floating chat, actual-state lesson recap and own-adventure handoff, animated making-of, craft/footprint and existing open-tool links.
- Current verification: 48 automated tests and production/Sites build pass; desktop/390×844 visual evidence and full lesson path in ../design-qa.md. The new-world custom reasoning/anatomy-batch contract is mocked; broad live-photo and physical-device validation still pending.
- Main-project spoken-question review/consent, teacher guide, discovery/print page, notebook, custom scenario proposals, privacy page and developer art tools have NOT all been restyled/integrated by this pass. Existing companion flow is reused, not a new general animal rig system.
- Library is garden/woodland/reef; it no longer describes all three as the same meadow. New reef food web is an invented bounded teaching model; garden/woodland still share curated land rules. Arbitrary generated habitat science needs source review.
- Participant trial remains outstanding. Curriculum/book review can assess content alignment, never substitute for an observed teacher/learner trial.
- Next gate: user review of the local prototype, then source-photo rights and focused integration branches/PRs if requested. No publication, merge or new tool repository is authorized by this local pass alone.

---

# Microverse: full experience revamp

Updated 2 November 2026. Owner: Shahesta. This file tracks the whole product, not just the camera prototype.

## V7 status — latest, supersedes earlier labels below

The isolated prototype now has approved Little Field Club branding, three distinct generated place illustrations, a separate reef teaching activity, local photo-to-watercolor service, visible four-level food preview, clearer rain/time wording, first-visit forest arrows, an evidence-scoped question panel and three prepared narrator voices. Music/effects default on after the first interaction. Original switches and main checkout remain unchanged.

Fresh scoped desktop/phone review is recorded in `../design-qa.md` and `screenshots/expansion-v7/`. 32 tests and production packaging pass. Real Meta painting and evidence-question integrations succeeded within the user-approved $1 test allowance; $0.75 is locally reserved, not a verified charge.

Updated surfaces: 1–2 branding/library; 5–7 painting entry/recovery; 13 four illustrated food levels; 14 prominent rain prompt; 15–17 selected scenery; 24–28 forest arrows and plain time; question panel (prepared/custom answers); sound settings (Heart/Bella/Emma). New surfaces: photo-paint consent/loading/result and reef prediction/checkpoints/comparison/why. The existing photo-classifier switch remains off. New painting uses a separate local permit.

Remaining roadmap: teacher/notebook/technology/open-tool pages, microphone review/consent, scenario-command approval, persistent companion Save/delete browser checks, real learner/teacher observations and eventual authorized integration/deployment. Exact terrain/paint collision alignment and a calibrated second biome remain open. The reef lesson is a modest separate model, not completion of marine food-web research. Earlier “all choices use one meadow”, “audio off”, “26 tests”, “no paid calls” and pending-QA notes describe older passes only.

## Direction

A child enters a watercolor world, makes one meaningful choice at a time, watches a visible response, then connects what happened to something outside the game. Camera → reviewed clues → explicit starting assumptions → question → paired experiment → observation → explanation → repeat remains the core. A personally created companion is an optional route into caring about the world.

The separate prototype contains copies of the existing engine. The deployed main game and its repository have not been changed by this pass. Nothing below means a separate habitat simulation is implemented merely because its photograph can be selected.

**Status language:** “implemented in prototype” means code and assets exist, with local checks; fresh browser evidence is listed in the approved review below; unlisted surfaces remain pending. “Existing main” means functional source exists in the main game and still needs a design pass. “Planned” means it is not implemented. Never present a source review as a learner trial.

## Supplied-screen review

Evidence: six user-supplied screenshots in `screenshots/user-feedback-2026-11-02/`. These are copied originals, not newly captured screens. The browser restriction was later cleared by the user. Fresh scoped review is recorded below.

| Step | Visible problem | Response in this pass | Verification still needed |
| --- | --- | --- | --- |
| 1. Entrance, close crop | Heading runs off the right edge; button covers the photo | Removed nowrap, capped font size, separate fox/background; removed embedded photo from backdrop | 390, 768, 1280, 1720 and 200% zoom; no crop or overlap |
| 2. Entrance, full screen | Static fox; scenery and photo flattened into one raster | Two genuine raster layers, gentle breathing/background motion, pause/reduced motion | Visual crop, fox footing, contrast and performance |
| 3. Photo routing | Generic eyebrow does not help; all routes look like a form | Removed eyebrow; softer labelled route choices; three-photo library | Keyboard order, photo contrast and error recovery |
| 4. Unsupported landscape | Reef rejected without explaining product limits clearly | Says reef/desert need different animals/rules; points to working meadow library | No photo silently converted into another habitat |
| 5. Food choice | Abstract “starting guess/model” wording; repetitive sprout icons | “How much plant food shall we start with?” plus rabbit/deer reason; rounded choices | A child can describe what is being chosen; add illustrated amounts in later art pass |
| 6. Prediction | Tiny motionless rabbit; stretched soft scenery; “model year” jargon | Larger focused creature; cosmetic idle breath/sniff; sharper original; 1.08× vs 1.8× background zoom; plainer wording | Motion visibility/comfort, canvas frame time, all controls fit |

The screenshots cannot establish screen-reader behavior, touch usability, actual frame rate, narration quality or learning effectiveness.

## Pages, screens, panels and dialogs

| # | Surface | Existing source / state | Revamp action | Status |
| --- | --- | --- | --- | --- |
| 1 | Marketing/entrance | main `app/storyboard.html`; prototype `home` | One camera action; quieter secondary paths; layered fox; clear headline | Implemented in prototype, visual QA pending |
| 2 | Existing-place library | prototype `library` | Exactly three labelled real-photo Polaroids; staggered entrance; tap/keyboard selection; credits | Implemented in prototype |
| 3 | Camera permission/loading/capture | prototype `camera` | Wide live preview; one shutter; recover to upload/library | Existing prototype; new soft controls; physical device trial pending |
| 4 | Upload loading/invalid/large file | prototype shared file input | Visible errors; clear retry; no lost experiment from stale upload | Existing prototype |
| 5 | Identify photo | prototype `triage` | Four simple labelled choices; no unnecessary heading label | Revised in prototype |
| 6 | Other-photo classification | prototype `other-kind` | Landscape/object/unclear; never imply arbitrary reconstruction | Existing prototype, shared soft choices |
| 7 | Unsupported/unclear/no-clues recovery | prototype `route-help` | Explain limitation; pick photo or library; animal routes to creature studio | Revised in prototype; new biome engines planned |
| 8 | AI photo consent | prototype `photo-consent` | Explicit smaller-photo send, provider named, decline path | Existing prototype, paid switch remains off |
| 9 | AI suggestion confirmation | prototype `photo-suggestion` | Suggestion only; human checks; no automatic ecological claim | Existing prototype; real accuracy evaluation pending |
| 10 | Water review | prototype `review` step 1 | One visible clue; original/mask; yes/uncertain; helping arrow | Implemented; garden recorded mask only |
| 11 | Tree review | prototype `review` step 2 | Same familiar pattern; retain uncertainty | Implemented; new library photos manual |
| 12 | Grass review | prototype `review` step 3 | Same familiar pattern; no plants → recover | Implemented; final visual test pending |
| 13 | Starting food/assumptions | prototype `assumptions` | Plain reason; three amounts; optional explanation | Revised in prototype |
| 14 | Rain prediction | prototype `predict` | Lively close-up; plants/animals/not sure; no typing | Revised in prototype |
| 15 | Watch/checkpoints | prototype `watch` | One creature first; state-derived story; next checkpoint | Implemented, new renderer QA pending |
| 16 | Same-week usual-rain comparison | prototype watch branch | Keep week fixed, name condition; contextual hint | Implemented in prototype |
| 17 | Focus/whole-meadow views | prototype canvas | Explicit focus, enlarge subject without huge backdrop zoom | Revised in prototype; no new event invented |
| 18 | Why/records dialog | prototype native dialog; main comparison records | Plain cause mechanism first; numbers optional; source units clear | Prototype restyled; main unchanged |
| 19 | Reflection | prototype `explain` | Tap actual observations; assemble sentence; uncertainty welcome | Implemented in prototype |
| 20 | Discovery finish | prototype `finish` | What we learned, real-world question, rerun/save | Existing prototype; shared rounding applied |
| 21 | Save/download/reopen | prototype JSON; main discovery cards | Local files, useful labels, preserve exact seed/state | Existing and unit-tested; new browser check pending |
| 22 | Voice/music/motion/help settings | prototype sound dialog | Independent opt-ins, repeat voice, transcript, pause motion, replay hints | Implemented in prototype; listening/hardware trial pending |
| 23 | Full exploring forest | main `app/index.html` | Unlock tools gradually after guided story; remove 37 individual tab stops as default navigation | Implemented in separate V5 prototype after experiment; main unchanged; visual QA pending |
| 24 | Forest clock/camera controls | main clock and camera controls | One play/pause plus next meaningful moment; put speed/zoom under secondary tools | V5 prototype: opt-in bounded playback/one week, pause/hidden-tab stop; visual QA pending |
| 25 | Forest journal | main `#notes` | A few event cards, tap for detail; avoid raw running log first | V5 prototype: actual new-event cards, optional exact records; visual QA pending |
| 26 | Creature detail/fun facts | main `#creature-card` | Face, name, one fact, role/needs; observed event vs species fact clearly separated | V5 prototype: four native model-role cards + actual individual records; biological fact expansion still planned |
| 27 | My creatures collection | main `#creatures-space` | Warm personal shelf with one create action; saved/empty/error states | Implemented in prototype V4; main unchanged; visual QA pending |
| 28 | Creature upload/camera form | main `#import-dialog` | One step at a time; show name/details after photo; persistent field labels | Implemented in prototype V4; physical camera pending |
| 29 | Illustration/cutout loading | main `#creation-progress` | Show actual pipeline stages, playful copy, no invented percentage/countdown | Implemented in prototype V4; saved result/local stages work; live image bridge paused |
| 30 | Rig/movement review | main import source/motion canvases | Large walk/idle preview; accept or simpler movement, then add | Implemented in prototype V4 with original fitter/review/renderer; browser QA pending |
| 31 | Add/save creature confirmation | main importer and collection | Show creature arriving, local-save choice, clear role as companion | Implemented in prototype V4: imaginary clearing, explicit local Save, download, remove confirmation |
| 32 | Ask a question / prepared questions | main `#questions-dialog` | Picture-led common questions; custom question as secondary option | Existing main; planned redesign |
| 33 | Custom Spark proposal / clarification | main question/guide modules | Show proposed supported change before applying; one clarification at a time | Existing main; planned redesign |
| 34 | Speak question: record/review/consent | main speech UI | Clear mic state, timer, discard/send; never silently upload recording | Existing main; planned redesign |
| 35 | Prediction / experiment confirmation | main `#experiment-dialog` | Reuse tap prediction pattern; explicit change; seed/state retained | Existing main; prototype rain slice covers one scenario |
| 36 | Experiment comparison hub | main `#comparison-dialog` | Focused scene first; evidence/details one tap away; controls introduced gradually | Existing main; prototype rain slice only |
| 37 | Close-up / ask-about-animal panels | main `#closeup`, `#animal-card` | Draw attention to an actual event/creature; explain and return | V5 prototype: actual living-neighbour close-ups; custom ask/explanations still planned |
| 38 | Notebook / free text / teacher notes | main `#notebook` | Tap evidence by default; text optional with visible labels and guidance | Existing main; planned redesign |
| 39 | Related questions / another run | main related investigations | One relevant next question; save prior discovery before replacement | Existing main; planned redesign |
| 40 | Guided forest story shell | main `app/forest-story.html`, `#lesson-shell` | Keep strong one-choice structure; align styling/voice/coachmarks | Existing main; planned redesign |
| 41 | Discovery share/preview page | main `app/discovery.html` | Readable discovery card and rerun; private local learner data handling | Existing main; planned redesign |
| 42 | Teacher guide | main `app/teacher.html` | 10-minute activity view, goals/materials/steps; printable detail separately | Existing main; planned redesign; participant trial still needed |
| 43 | Behind the scenes / AI and resources | main `app/behind.html` | Actual call/resource choices; no unsupported greenest-AI claim | Existing main; planned redesign |
| 44 | Build with Microverse / open tools | main `app/build-with.html` | Three reusable tech stories, source/demo links and honest limitations | Existing main; planned redesign |
| 45 | Photos, questions and privacy | main `app/privacy.html` | Styled concise summary, expandable detail; useful back link | Existing main; planned redesign |
| 46 | Art/rig review tools | main `app/art-review.html` and examples | Keep outside child route; maintain developer diagnostics | Existing main; low-priority consistency pass |

## Build order

1. **This pass:** shared shape/motion/copy system, three-photo library, entrance, food choice, prediction, helping arrows, optional prepared narration/music. Build/model tests before visual approval. No main-project replacement.
2. **Complete visual QA:** inspect the updated local prototype at phone, tablet, normal desktop, large desktop and zoom; focus, dialogs, hints, image edges, sound and motion. Repair those findings before calling this pass complete.
3. **Creature route (implemented in separate prototype, visual QA pending):** collection → upload/camera → real creation progress → movement review → companion arrives. Use the same soft controls, but design this route from its own screenshots instead of blindly recoloring the old form.
4. **Open exploration (implemented V5, visual QA pending):** make the full meadow an earned space with contextual tools. Redesign journal, animal fact/event cards and close-up around actual model records.
5. **Question/investigation route:** prepared questions, custom validated proposals, speech consent, prediction, replay, optional writing and related questions. Keep optional AI server-side and capped.
6. **Adult/support pages:** teacher activity, discovery, resource-use/AI, reusable tools, privacy. The pages need distinct information layouts, not the child game's large story card everywhere.
7. **New ecosystem engine:** select one second habitat, then research species roles/resources/driver relationships, implement deterministic rules, tests, art and its own scenario. A new photo or painted map alone does not complete this item.
8. **Integration after user review:** feature branch, focused commits with user authorship, relevant tests, PR, review and authorized merge/deploy. Do not add assistant coauthors.

## Second-ecosystem decision

A pond edge is a plausible next vertical slice because the camera route already reviews visible water and the rain question can lead to water availability. This is a product hypothesis, not a scientific validation. Before promising a pond model, source a simple appropriate food web and define what water depth/nutrients/oxygen mean. A reef is a larger scope: marine ecology, temperature/bleaching, species-specific relationships, and different evidence. Do not reuse wolves/deer and simply tint the meadow blue.

## Acceptance checks

- [ ] Child can enter, choose a photo and reach one question without guidance from an adult.
- [ ] Library has exactly three visible photo choices; mobile has no sideways swipe requirement.
- [ ] All three choices explain that they inspire one meadow model; only garden claims recorded SAM masks.
- [ ] Headlines wrap, never clip; no image/CTA overlap at 390–2560 CSS px and 200% zoom.
- [ ] Context hints point to current elements, fit the viewport and do not trap focus; dismiss/skip/replay work.
- [ ] Voice/music start only by choice; mute/repeat/hidden-tab behavior work; captions remain.
- [ ] Reduced motion and manual pause stop idle/background motion; checkpoint evidence still updates correctly.
- [ ] Motion is visibly alive without implying new ecological events or moving across untraversable terrain.
- [ ] Same seed, week and starting conditions survive compare, rewind and file reopen.
- [ ] No private photos, API keys, free-form names or learner responses enter static narration assets.
- [ ] Real teacher/learner playthrough observed. Curriculum/textbook review may supplement, never replace or be reported as a participant trial.

## Approved browser review — latest status, 2 November 2026

This section supersedes earlier visual-QA-pending labels for the specific states below. All other roadmap items remain as listed; the deployed main game is unchanged.

- Entrance/library: captured desktop, natural medium viewport and phone; selected direction compared full-size and at heading/control crops.
- Photo review/food/prediction/checkpoints/explanation: exercised complete garden activity through week 52; explicit assumptions, same-week comparison, evidence dialog and assembled observation verified. Phone meadow manual review and no-clues recovery checked.
- Tutorial: compact collision-aware desktop placement and inline phone placement fixed and recaptured. Dismiss, skip and settings re-enable exercised.
- Discovery: actual downloaded replay reopened via the interface at week 52 with observation selection intact.
- Forest: repaired dynamic animation loading; neighbour fox card, one week/running weeks, actual-event journal/detail, return-to-experiment and phone layout exercised. The original experiment stays at week 52.
- Companion previews: empty collection, Sunny/Clover local fitting, movement controls, approval/reveal and original-photo fallback checked. Animal upload carries into the same-photo creation flow. No implicit save; persistent Save/delete UI remains a separate check with unit coverage already passing.
- Sound settings: independent toggles/repeat/transcript checked, no reported playback failure. Human listening, camera/microphone, full accessibility and real device performance are still pending.
- Evidence/fix history: ../design-qa.md and screenshots/approved-review/. 26 automated tests and production packaging pass. No new paid calls.

Next design slice: prepared/custom ecology questions, then spoken-question review/consent; retain the one-decision-at-a-time pattern rather than exposing the old toolbar.
