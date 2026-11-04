# V22 craft pass and per-world lessons · 4 November 2026
- Sizes come from `src/world/creature-scale.js`, storybook proportions by name, not measurements. Beneath the pond everyone is 1.45x as a close-up.
- Eating, sleeping and chasing use PNG stickers in `public/assets/fx/`, made locally from Baloo 2 (OFL). They replace the old meal label and text z in the Pixi stage. The lesson's `WorldCanvas` is unchanged.
- Running no longer swaps two drawings. `poseFor` keeps runA and `deformPoint` swings legs found from the drawing's alpha by `legStations`. This is artistic motion, not a gait. Visitors bend poses[0] the same way. Owl flight crossfades its frames.
- Water is `src/world/water-art.js`: colour-rule mask, moving pigment, light layers, procedural pond bed. A picture effect, not a fluid simulation.
- Paths are `src/world/walk-grid.js`: a colour rule, not AI scene understanding. Saved grids live in `walk-grids.json` (rebuild with `node scripts/make-walk-grids.mjs`). Generated worlds compute theirs on the device. Woodland uses a looser shade rule and is rough: ferns and the log block, some bushes and trunks do not. Records without `plan.ground` still walk straight, so old replays hold.
- Lessons are `src/world/lessons.js` and `LessonCard.jsx`. Comparison replays the same seed with only the lesson's action removed. Cards are our own words. Do not use OpenStax: its terms forbid generative AI ingestion without written permission. No predator lesson: no source was verified and the simulation keeps at least one predator.
- The planner may pick `lesson` from `LESSON_MENU`. This is not live tested; `lessonFor` ignores a choice the world cannot run.

# V21 less-rain story, Spark world control, git · 4 November 2026

This current status supersedes historical notes below.

- Git started here: local only, no remote, no push. Before going public, check docs/screenshots/user-feedback-2026-11-02/ and docs/screenshots/approved-review/24-personal-photo-fallback.jpg for private content.
- The lesson opened on seed 7, an outlier that ended with more rabbits under less rain. It now opens on LESSON_SEED 12. This is a representative run, not a rigged result: RAIN_RUNS reports 20 seeds at week 52 (fewer rabbits: None 11, A little 17, Some 18, Lots 15) and is shown to the child. A test recomputes the table. Grass was lower in every run checked. Surprising results still follow the record; the tests keep seed 7 for that.
- At Some food the lesson now reads 47 rabbits against 72 at week 52. Any older footage or script saying more rabbits is out of date.
- Watch shows real counts and Week N of 52. From week 13 the view opens out to the whole meadow, and Look closer still follows one animal.
- Spark: polite phrasing is stripped before matching. New set-activity command (sleep, rest, run, move, eat, auto) uses the same sim.setActivity as the buttons; a snack stays animation only. How many, how much food and who eats whom are answered free from the frame and role rules. The lesson explains its fair test instead of changing anything. The world keeps running after an applied command. Replies that used Spark are labelled as such.
- Spark's fox frames were off-centre and jumped about 110px of 512 between frames while talking. Re-registered locally to one centre and 90% scale. No new drawing or AI call. Provenance hashes updated.
- Music choices and required credits: docs/demo-assets/music/README.md. Agents have not listened to them. The FreePD files came from a third-party mirror because the site has closed.
- Spark test calls reserved $0.25 (5 attempts). All five returned; world-answer gave nothing useful for who eats whom, which is now free. Ledger $4.25 reserved, $0.75 remains under the $5 cap.
- 100 tests, 4 sites tests and build pass. Still unverified: physical touch, camera, participant comprehension. Known small flaw: an event label can overlap the Grass to eat card.

# V20 drawn behaviour poses · 4 November 2026

This current status supersedes historical notes below.

- User said creatures had lost eat/sleep/run character. Confirmed: one drawing per animal. Now Muse Image draws eat, sleep and two run poses from the creature's own art. Saved sheets: public/assets/*-poses-v19.png (woodland, pond, reef, Sunny, Clover), receipts in runtime/expansion-art/poses-*.json, script scripts/make-pose-sheets.mjs. New creature pipeline adds one pose call after the cutout; failure is soft. New worlds and new visitors also get poses.
- src/world/creature-motion.js decides the behaviour and bends the painting when no drawing exists (continuous field, tested for tearing). Used by both the Pixi stage and CompanionCanvas. Walk stays the fitted puppet or mesh. Live fish keep drawn nibble/sleep but dart with a body wave, because one live sheet curled and turned around. Do not claim universal rigs: fitted legs remain quadruped/primate only.
- Poses are cut by connected shape (sprites.js cutPoseGrid) because tails cross cells; falls back to plain cells.
- Replay v4: automatic naps and quicker chases when prey is near. v2/v3 restore with behaviours off and keep their outcomes. Snack is animation only: no bite, no food change.
- Prompts: every family faces right; loose leads and ropes are left out. PROMPT_VERSION watercolor-identity-3; identity-2 art still accepted.
- Live tests, all Wikimedia CC0/public domain, credits in docs/demo-assets/CREDITS.md: beagle, alpaca, hedgehog, goldfish, parrot on the old prompt; goldfish and parrot again on the new pipeline. Parrot taken through save and into the woodland. All identified correctly, no failed calls.
- Ledger $4.00 reserved /80 attempts, $1.00 remains under the $5 cap. This pass reserved $1.40: creatures $1.15 including live poses, saved sheets $0.25. Reservations are not billing. A hidden Browser pane stalls image.decode(); show the pane before browser checks.
- 98 tests, 4 sites tests and build pass. Still unverified: physical touch, camera, a new paid world build with its pose stage (tested with a fake provider only), a new paid visitor sheet.

# V19 routing and polish fixes · 4 November 2026

This current status supersedes historical notes below.

- Back no longer loops: after time passes, watch goes to Food choice (or Home for an opened discovery), and Change my guess is a button in the world. The lesson reaches the forest again: start-own has Explore this forest and My discovery; finish returns to start-own.
- Browser Back/Forward follow screens through hash URLs. Only library, craft, tools, My companions and saved worlds survive refresh or deep link; lesson progress and uploads still return Home. canShow guards entries whose photo or model is gone. Browser Back from the pond leaves the world rather than surfacing.
- Plan and painted result are kept through Back for the current photo (no repeat generation), and refresh warns while one exists. A generated world's simulation restarts on return; the assets are kept.
- Applied better-ui: touch-guarded hover, .96 press, 100ms/300ms card arrival, icon cross-fades, overscroll containment, photo outlines. Spark x now cancels, same as Escape.
- 80 tests and build pass. Browser journeys checked with page-local faked world-tool responses and no paid calls. Real paint/enter round trip, physical touch and camera remain unverified. Backup before this pass was kept outside the project for the session only.

# V18 layered worlds and route audit · 4 November 2026

This current status supersedes historical notes below.

- Separate PixiJS scene graph, water/plant/canopy/flight layers, food-linked visual growth/consumption and geometry ripples. New builds request terrain, life and scenery separately. Saved maps still retain baked scenery; do not claim universal decomposition, full 3D, fluid simulation or universal rigs.
- Garden surface has land neighbours; pond arrow opens a separate freshwater teaching scene with persistent parent/child clocks, bubble transition and return. Aquatic atlas remapping applies to portraits too.
- Spark validated commands now change real food patches, populations, habitat objects and weather. Replay v3 records changes/visitors and supports undo at the same day; v2 accepted. New visitors require consent/design/art, then have local movement/greetings, without an invented ecological role.
- Waiting seed mini-game, matching local surface/pond voices in Heart/Bella/Emma, stable phone tutorial, clearer event/object focus and explicit back destinations. Existing brand preserved with Product Design/frontend skills and primary PixiJS/statechart research.
- 77 tests pass; build and post-build Sites checks pass. Main browser journeys, phone/desktop, source comparisons, export/import and local visitor fixture checked. Full evidence and honest test gaps: docs/review-plans/living-world-v18-results.md; scoped visual QA: design-qa.md.
- No paid calls in this pass. Ledger $2.10 reserved /42 attempts; $2.90 remains under the unchanged $5 total user-own-photo test cap. Local window aligned to submission deadline: Nov5 02:00 UTC /04:00 Cairo. Check expiry per request; no automatic retries or agent artwork. Reservations are not billing. Main env flags unchanged.
- Fresh live user photo output quality remains unverified in V18. Physical camera/microphone/device/FPS/participant testing and main-project teacher/notebook port remain pending. Do not claim every feature/path or all animal facts/motions are implemented.
- Main checkout stays clean at 5bda15b. No merge, deployment or assistant coauthor. The local fixture qa.html uses existing art, no provider calls, and is not a generated-result demo.

# V17 living stage, question access and voice timing · 3 November 2026

- User approved $5 TOTAL for their own creature/ecosystem/Spark tests, no retries or further agent art generation. Canonical ledger $2.10 reserved /42 attempts, leaving $2.90 at verification. Local readiness HTTP200/enabled; this is not a Meta billing balance. Existing permit expiration unchanged. No paid requests made in this pass.
- World canvas fills viewport (desktop1280x720, phone390x844), rounded map frame removed. Source paper margin remains outside the camera window, including edge pans. Modest extra zoom up to2.75; opening view centers actual agents instead of decorative empty terrain. Compact inspector restores most of the scene. This is a larger presentation/exploration view, not new generated biome chunks.
- Each actual food patch draws a bounded cluster of stems based on its biomass, shrinking after real consumption and returning with regrowth. Find plants and direct patch selection focus that patch; no extra food is invented by visual duplicates. Existing local interactions, tree objects, perches, weather and feeding records retained.
- Chat temporarily suspends world updates and now resumes on close instead of permanently setting running false. Verified day63 paused to64 after close. End-of-run restart is visible even in compact inspector, explaining why a finite run stops.
- All four Spark expression frames stay mounted/decoded; only opacity switches. Neutral/talking frames alternate while speaking; no whole-head squash or source reload per syllable. Browser confirmed exactly one visible frame with transform none. Intro voice can be replayed explicitly.
- Automatic narration cues are scheduled after paint, once per visit. Visible hints/dialogs have priority over delayed page narration. Pointer and keyboard unlock are one shared latch; hidden/dismissed pending cues can be canceled. Explicit replay remains allowed. Scheduler tests cover duplicate suppression, priority, cancellation and new visits. Not a human listening study.
- Typed common questions map to the same free prepared answers as buttons. Verified Sunny answered “Where are the plants?” locally with no consent/API call, and the ledger stayed unchanged. Custom creative questions still need consent and remaining allowance.
-69 tests pass; build passes. Desktop stage/feeding/plant selection/inspector return, chat resume, phone bounds and end-of-run control checked. Final console clean. Phone inspection controls stay below the inspector and above the feeding area. Main checkout remains unchanged.

# V16 animal identity and matching guide portraits · 3 November 2026

- User reported forced dog/cat selection changed a monkey into a cat. Removed that menu. Any short animal type can be entered, or left blank for Spark. Prototype creature pipeline now describes the broad type and visible features with Spark, paints a NEW suitable watercolor pose with Muse Image, then SAM cuts out that animal. Uncertain identification stops before painting. Owner hint is descriptive data, not a forced class. A review still decides whether the result is correct.
- Isolated local pipeline/provider copies extend the main tested pipeline; production checkout remains unchanged. New version watercolor-identity-2, old saved v1 art still accepted. Three 50k reservations are held before calls; no retries. Custom Spark now describes the animal before making its four frontal head expressions; two 50k holds before calls. Names stay local.
- Local experimental four-limb side-pose fitting added for primate/generic quadruped designs, with distinct artistic movement tuning and mandatory review/fallback. Not universal anatomy detection, climbing/swinging, mocap download or a measured behavior model. Birds/fish/other new imports still use simpler movement if no supported puppet is available.
- Checked monkey-group note added from San Diego Zoo Wildlife Alliance (https://animals.sandiegozoo.org/animals/monkey). Catalog is now nine groups/examples. Personal companion field notes use the broad type and are explicitly general facts, not events. Broad live biodiversity/fact/motion retrieval remains roadmap work.
- User approved $2.10 TOTAL, $0.10 extra for front-facing saved fox/cat expression sheets. Both generated once, reviewed, cut locally and connected to actual voice-playback mouth state. Hear my voice added to guide selection. Portrait script initially used URL.pathname and placed its two reservations in a separate percent-escaped directory; caught and reconciled both into the canonical ledger without new provider calls. Script now uses fileURLToPath. Canonical ledger $1.90 reserved /38 attempts; $0.20 remains. Reservations are not billing. No fresh user monkey image was transmitted by the agent.
- 65 tests pass; build passes. Browser verified fox and cat speaking-frame image during real local playback, optional blank animal type, local photo entry, back navigation, desktop and 390px form overflow. No console errors/warnings. Main checkout unchanged. New arbitrary creature/guide live end-to-end tests remain for user’s own photo. Existing own-photo allowance expiration is unchanged.

# V15 upload routing fix · 3 November 2026

- User confirmed choosing “An outdoor place” opened the default meadow. Fixed: new landscape / plant / other-landscape routes now enter WorldPainting with the uploaded image, never the manual meadow review. Library worlds and explicit First adventure stay separate.
- New uploads clear previous generated world state; WorldPainting is keyed to the photo. Added a defensive personal-photo guard before starting the prepared meadow.
- Loading, unavailable service, connection failure and exhausted allowance now have distinct generator messages. No silent default fallback.
- Browser: local photo loaded into separate QA tab only, not sent to Meta. Outdoor route and primary Build my living world both opened original-photo consent; Back retained the image. No console errors/warnings; 1041×895, no horizontal overflow. Evidence: docs/screenshots/generation-route-v15/photo-generator.png.
- 60 tests pass; production build passes. Existing bundle-size warning remains. Main checkout unchanged. No agent-paid generation in this fix. Ledger now $1.80 reserved /36 attempts from ongoing user tests; cap remains $2, reservations are not verified billing. Fresh full generated output was not re-tested in this pass.

# V14 checked knowledge · 3 November 2026

- First source-backed species catalog now connected, eight groups/examples. Exact aliases, primary-source URLs/review dates, game compatibility and a separate dog/cat import-rig capability registry. Do not imply universal identification or complete biological knowledge.
- Planner gets compact reviewed examples; compiler validates known nature-mode habitats/motions/roles. Imagined mode remains labelled and flexible. Existing saved worlds/replay outputs unchanged.
- Spark prepared animal facts and exact diet queries can run entirely locally, without Meta call or consent. Sources and game simplifications are explicit; absent animals are labelled general facts, never observed events. Unknown/custom queries remain bounded evidence calls.
- User’s latest question concerns on-demand retrieval from trusted APIs and motion datasets. Official GBIF/iNaturalist APIs, Animal Kingdom and UniRig researched; not installed/connected or misrepresented as ready-made2D animations. Roadmap in docs/TRUSTED-RETRIEVAL-ROADMAP.md.
-59 tests pass. Still$1.65reserved of$2authorized/33attempts at last check. No new agent-paid fixture calls; user will try their own photos.

# Current V13 steering · 3 November 2026

- User approved $2 TOTAL shared cap, then explicitly chose to test with their OWN photos. Do not spend on prepared orange-cat/meadow fixtures; they were only resized locally, not transmitted. Both local upload APIs are enabled; $1.65 reserved at enablement, $0.35 remaining. Latest hard cap is centralized in server/expansion-access.mjs and matching ignored permit. Main env/flags unchanged.
- Prototype companion adapter now shares expansion ledger and reserves both 50k stages before paint/SAM. Main provider/pipeline reused unchanged. World capacity check reserves room for complete pipeline; no automatic retries, localhost only.
- User reported hero upper-left trees blurred: removed duplicate scaled animated background overlay. Retain real leaves/water/fox, no new generation spend.
- User asks intuitive back buttons/deselection via Product Design. Header names real destination, especially saved world→library vs generated upload→photo. Stop following, empty ground and Escape clear focus. Tutorial prediction edits preserve elapsed states rather than silently restarting. Add actual rendered checks before handing off.
- Schemas/rules/prompts index docs/AI-SYSTEM-MAP.md. Do not imply a broad cited species dataset/universal rigging AI exists: dog/cat fitter, fish regions and owl pose frames are separate bounded techniques. New live photo quality findings await user runs, not claimed complete by mocked tests.

# Current V12 status · 3 November 2026

Supersedes historical status and budget notes below.

- Work only in this separate prototype; main clean at 5bda15b. No merge/publish/coauthor.
- User clarified modest map expansion, animals easy to find, 3–5 animal types. Implemented three types each, 9–10 starting agents; pan/zoom 1–2.25, Find the animals, same-world garden Pond close-up.
- Saved garden/woodland/reef now use the new living engine and distinct art/inhabitants; My first adventure intentionally uses the original tested meadow. New plans request four slots (producer + three animal groups), optional bounded tree/rock objects; do not overclaim calibrated food webs.
- Paw dot on live-text wordmark replaces Firefox-like fox/globe; transparent backing. User wants no underlines, clearer Yes-first photo checks, visible craft/tools with icons, smaller hero fox, audible Spark hints/dialogs and actual visible feeding.
- Meta TOTAL authorized $1.70. Ledger reserves $1.65 / 33 attempts, $0.05 left. No more paid tests in this pass, no AWS/Baseten. Reservations are not bills. Original main flags untouched; local permit expires Nov3 23:59:59Z.
- Live garden/woodland photo pipelines succeeded; owl poses, separate trunk/canopy and extra fish sheet succeeded. Manual crops, safe pond rectangle and fish regions are reviewed human-authored adjustments, not SAM/AI measurement. Generated grass/fern props exist but a full physical vegetation/fluid system is not implemented.
- Food biomass is consumed at the actual patch and regrows. Replay v2 encodes changed rules, rejecting old v1. Owls perch on actual tree IDs, ground agents avoid trunk footprints. Cosmetic motion/pause does not change rules.
- Prepared Heart/Bella/Emma voice clips and on-demand Heart are local Kokoro, not Meta voice models. Talking state follows actual playback. Audio starts on first gesture, defaults on with off controls.
- Live reef diet and unsupported woodland hazard question passed; custom reasoning selects validated topic/event IDs, not free-form scientific claims. Save results; never repeat successful paid tests unnecessarily.
- 53 automated tests pass. Current evidence, scoped QA and scripted journeys are documented in V12 handoff. Do not equate agent runs to real participant usability or measured FPS.

# Current V10 status — 3 November 2026

This section supersedes older status, budget and route notes below; retain those notes as history.

- Main checkout stays clean at 5bda15b. Work only in this separate prototype; no merge/publish/assistant coauthors.
- User wants new photos to inspire separate layered living worlds, not only a painted backdrop. Use the validated Spark plan → Muse Image ground/sprite sheet → local cut/motion/simulation flow. Nature vs imagined, visible vs guessed, and actual records must remain distinct. It is a bounded teaching engine, not Genie or a calibrated ecosystem.
- Exactly three library photos: garden, woodland, island reef. Garden alone has recorded SAM. Garden/woodland keep curated land rules; reef now opens the saved new living-world engine with algae/fish/shrimp. Do not restore the old static coral lesson as the leading reef route.
- User selected brand option 3, Little Field Club. Keep Baloo 2 / Atkinson, cream/forest/moss/seed/clay, soft panels, pill controls, separate raster layers, Phosphor icons. Every new feature must use the established Product Design/frontend skills and rendered design QA.
- Add life locally: fish fin/mouth/blink only within reviewed bounded landmarks, rooted vegetation, water/light/air/weather. Do not invent invisible anatomy; rejected AI tail stays unrigged. Pause/reduced motion never changes ecology records. Blender is installed but has not been used.
- Tutorial spotlight dims everything except the live target and note; rebind when DOM target changes. Food previews and time changes should be visible, words child-readable, raw IDs secondary. Keep clock visible during scroll and world visible while phone controls are used.
- Personal Spark is a floating companion/bubble; customize at first entry from library or explicit pet-photo consent. Sunny has accepted four-expression art; fox/Clover reuse existing art. Names stay local, and no companion photos enter evidence reasoning.
- Lesson finishes with actual-state companion recap, then own-world/creature/library choices. Do not send the child back to the hero. Recap preserves/restores the experiment and follows surprising actual outcomes.
- Music/effects default on after first gesture; narration optional, local Heart/Bella/Emma clips. No paid TTS. Making-of is an animated illustration plus real job status, never a fake completion/progress/rig claim.
- Craft/resource-use and existing open-tool links are restored. Do not claim measured environmental benefit, a greener provider, adoption or new world-builder repo publication.
- User explicitly raised TOTAL Meta test authorization to $1.10. Shared runtime/expansion-art/budget.json now reserves all $1.10 across 22 attempts. NO MORE PAID TESTS without a further explicit increase. Do not reset failed/rejected reservations. Original main flags untouched; localhost-only permit expires Nov 3. Reservations are not verified billing.
- The fish helper's encoded-path ledger was reconciled and its accidental Desktop folder moved into runtime/archived-url-path-ledger. Use fileURLToPath for filesystem URL conversion. Provenance: docs/assets/living-world-and-spark-v10.json.
- Latest: 48 tests/build pass. Current QA/screenshots and README supersede V7; prior review archived docs/versions/v7. Full participant, hardware, listening, accessibility and real-device performance checks remain unverified.

# Prototype Instructions

## Microverse direction selected 2026-11-02

- User chose the third displayed Product Design mockup: `docs/reference/selected-option-3.png` (large watercolor fox at left; quiet sky and camera action at right).
- Keep this prototype separate from `microverse-hackathon`. Do not publish or merge it without a further request.
- Original camera → reviewed visible features → explicit model assumptions → what-if → evidence → rerun idea leads. Pets are an optional separate companion journey in the prototype; the camera ecology experiment still leads.
- One decision at a time; no crowded toolbar, repeated competing green buttons, sliders, or compulsory typing.
- Reuse the existing palette, artwork and saved motion. Keep new uploaded photos in browser memory by default. Any optional photo check requires explicit on-screen consent and a funded server; the existing switch is currently off.
- The garden has recorded SAM masks. Other photos receive explicit scene routing and manual review. The upgraded experiment uses copies of the existing deterministic engine and replay modules; the food guess affects real computed outcomes. It remains a fixed meadow model, not a reconstructed habitat or site forecast.
- Optional Spark scene checks stay server-side and respect the existing disabled/funding switch. Do not enable them or change API settings automatically. The separate local check cap is at most one existing Spark reservation.
- Show one actual creature first, with a labelled focus view and optional whole-meadow view. Comparisons keep the same model week; evidence wording must follow actual counts and records, including surprising outcomes.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Additional user feedback, 2026-11-02

- Keep rounded, tactile buttons (pill primary actions), softly rounded choice/text panels and clearly labelled fields. Previous 3–5px boxes were explicitly rejected. Preserve watercolor palette, rather than adopting an unrelated generic dashboard style.
- Existing-photo library should have exactly three visible choices as animated Polaroids. Current choices are garden, meadow, woodland edge; they are photo inspirations for the SAME functioning meadow engine, not separate implemented biomes. Do not present reefs/deserts as working simulations without implementing and validating their rules.
- Give the hero independent fox/background motion. The generated fox is a whole-body transparent layer; independent face/ear/tail rigging is still future work. Respect reduced motion and explicit pause.
- Enlarge the focus rabbit and give it visible idle motion; cosmetic motion must not change ecology state. Reuse the sharper 2048 terrain original; do not claim 4K or a complete HD asset pipeline.
- Add one contextual helping-arrow popup when a new area appears, with dismiss/skip and replay via settings. Avoid a page full of simultaneous arrows.
- Optional voice/music are wanted. Prepared Kokoro Heart clips are generated once using the existing local model; playback is static MP3, with zero paid speech calls. Music is original quiet synthesis. No autoplay on arrival; user turns each on separately.
- Track every main page, feature surface, panel and dialog in docs/REVAMP-CHECKLIST.md. Prototype implementation does not mean the corresponding main-project screen has been replaced.


## Companion journey, 2026-11-02

- The separate `pet-*` screens extend the approved soft watercolor design. Entrance exposes My companions; an animal photo can enter locally from the photo-routing screen without another upload.
- Reuse the original creature library, image/SAM client, rig fitting, rig review and puppet renderer modules copied under `src/core/`. `docs/assets/companion-reuse.json` records source hashes. Do not silently rewrite their validation rules.
- Dog/cat movement is supported; other animal profiles are not offered as working rigs. Whole-picture movement remains a deliberate fallback and is always reviewed before saving.
- The saved Sunny photo/illustration pair is an actual earlier Meta Muse Image + SAM result from a licensed golden-retriever photo. It is labelled saved/recorded. Clover is a prepared illustration. Never imply these newly transform an unrelated uploaded photo.
- Original photos/cutouts stay in RAM until the user explicitly saves the processed companion to this browser. No automatic collection write. Preserve unreadable saved data; do not clear it as error recovery.
- Personal clearing is imaginative companionship, separate from the classroom food web and deterministic ecological replay. Do not insert a pet into a validated replay behind the user’s back.
- The optional development creature bridge reuses original server modules, reads the existing Meta flags and caps itself to one pipeline reservation. Current image enable, credit-confirmation and cap settings are all zero; preserve them. Live painting is paused. No paid call was made during this pass.
- Rendered visual, microphone/camera and listening checks remain pending because of the unresolved earlier browser approval block. No alternate browser/screenshot bypass.


## Forest exploration and approval investigation, 2026-11-02

- Keep the forest visually dominant, child-friendly and broadly appealing: warm watercolor, clear large controls, soft shapes, purposeful animation. The user explicitly renewed this aesthetic direction and authorized useful tooling installs.
- Motion 14.9.0 is now installed for panel/event transitions. The exploration route is lazy-loaded. Do not add remote animation providers merely because they exist; current discovery found account-dependent video tools that are unnecessary for interactive game motion.
- V5 exploration forks the current experiment’s usual-rain scene and keeps the experiment intact. It is bounded to 52 further weeks, with actual events only. Pets remain separate from this food web.
- Reuse existing fox/fawn walk atlases and approved deer/doe/wolf rig settings. New local pose caches are rendering work, not paid generation or inferred biology. Motion quality/performance are still unverified on screen.
- Current browser investigation: live usage allows ordinary work. A fresh same-origin binding returned Tab not found; tab inventory then received a new automatic-review rejection citing bypass of the earlier restriction. No further browser calls or alternate access were attempted. See docs/BROWSER-APPROVAL-DIAGNOSIS.md. This is not evidence of an active Meta/Baseten or current Codex quota block.
- Normal manual approval is the documented recovery route to request from the user. Do not edit approval/security settings, claim access is cleared, bypass the decision or label visual QA passed without actual approved rendered evidence.

## Browser review completed, 2026-11-02

- The user changed to normal manual approval; the in-app browser now works. The earlier rejection is historical, not a current block. Fresh 1487×1058, 390×844 and normal 886×895 captures live in docs/screenshots/approved-review/. No security settings were changed by the agent.
- Design QA for the existing V3–V5 slice passes after fixing desktop/phone tutorial collisions, phone journal image overflow and development Motion/React dependency reloading. The 46-surface roadmap is not complete.
- On phones, helping notes for normal flow content sit directly below their target and push later content down. Do not float them over questions/buttons. World controls use floating notes because they do not participate in normal page flow.
- Keep motion/react prebundled and React deduplicated in Vite to avoid first-use dynamic-import reloads.
- Camera hardware, subjective audio quality, participant usability, live paid-provider accuracy, full accessibility and device-performance audits remain unverified. Do not turn scoped visual QA into claims about those areas.

## Expansion feedback, 2 November 2026

- User wants visibly distinct generated places, including Huahine island/reef from the supplied photo. Exactly three library choices now garden, woodland and reef. Preserve distinction: painted context vs implemented ecological rules. Garden/woodland share the tested land food web with distinct art; reef is a separate explicitly simplified coral-heat lesson, not a reef-population forecast.
- User approved up to $1 Meta promotional credit tests in this conversation. A separate local permit expires; all new image and question calls share runtime/expansion-art/budget.json with a $1 cap and conservative $0.05 reservations. Original provider switches/budgets remain unchanged. No public generation enabled. Reservations are not billing proof.
- User now requests music and button sounds on by default, with off controls. Audio starts on the first user gesture to comply with browser autoplay; narration remains optional. Heart, Bella and Emma are prepared local Kokoro voices.
- Make the rain question prominent. Explain a week as seven pretend days; remove Stay a little curious. Forest introduces time, neighbour and journal controls one at a time. Restore the AI question panel with free prepared questions and a separate consent-based evidence-grounded Spark route.
- Starting food now includes None; show visible food patches before starting, with a label that they are the chosen assumption. Plant positions in the preview are illustrative, not photo measurements.
- Hero uses the original fox raster with a locally cached mesh bend for small head motion after idle. Real generated oak-leaf cutouts fall slowly; respect pause/reduced motion. New logo/font/palette directions are being presented for selection, not silently installed.

## V7 completion and handoff, 2 November 2026

- Current status supersedes historical off/pending-QA notes: approved Little Field Club branding is installed. Main checkout remains clean at 5bda15b. Isolated prototype is not committed, merged or published.
- Real local image endpoint produced a painting and matching pale-coral version from the supplied island photo. Two Meta Spark guide calls succeeded against validated rain replay evidence. No Baseten or AWS calls. Shared ledger reserves $0.75 of the approved $1; do not repeat paid smoke tests unnecessarily or reset the failed attempt.
- 32 tests and production/Sites packaging pass. Current evidence is docs/screenshots/expansion-v7/ and design-qa.md; V3–V5 review archived under docs/versions/v6/.
- Garden/woodland have different paintings but share curated land rules. Reef has separate bounded invented teaching stress rules, not a forecast or food-web model. Precise new painting/collision alignment is not verified.
- Food choices visibly show 0/4/9/17 raster plant patches. Keep unknown uploaded-photo kind unselected; never default an arbitrary photo to reef. Known library IDs may preselect their matching painting kind.
- First-visit forest hints must avoid the whole phone control dock. Hide the large intro and queued event prompt during these hints. AI forest answers explicitly describe the retained rain experiment.
- Additional Kokoro manifests must be written after the whole loop, even when existing files are reused. Heart/Bella/Emma are local prepared voices, not Meta TTS. Subjective listening still needs the user.
