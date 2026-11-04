# Development log

Working notes in the order they were written, newest first. Older entries describe earlier states of the project and may mention files that no longer exist. Current notes also live in `AGENTS.md`.

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

# V14 update · checked animal knowledge

The first source-backed animal catalog is connected: eight reviewed groups/examples, explicit sources/review dates, known habitat/movement checks in the world compiler, compact planner notes, and free local Spark field notes/diet answers. Dog/cat rig capabilities are explicit; unknown animals do not inherit unrelated facts or rigs. Broad external API retrieval and universal rigging are future work, not claimed implemented. See `docs/AI-SYSTEM-MAP.md` and `docs/TRUSTED-RETRIEVAL-ROADMAP.md`.

Latest59 tests and production/Sites build pass (`runtime/tests-v14.log`, `runtime/build-v14.log`). Your own new photos remain for you to upload; no agent fixture generation was made under the new$2cap. The V13 notes below still describe the active navigation/own-photo behavior.

# V13 update · your own photos and clearer navigation

User will choose/upload their own photos; no new agent fixture generation. Both prototype upload services are enabled under the explicitly approved **$2 TOTAL cap**. At enablement $1.65 was reserved, leaving $0.35. Creature paint + SAM pre-reserve $0.10; a world needs room for up to $0.20. All share one ledger; no automatic retry. Original main flags/source unchanged. Local permit still expires Nov3 23:59:59 UTC. These are reservations, not billing proof.

Hero tree double-image removed. Navigation labels name destinations (Home, Your photo, Choose a world). Stop following, Escape and empty-ground taps clear selection; changing a prediction preserves elapsed results. [AI system map and your-photo steps](docs/AI-SYSTEM-MAP.md) lists schemas, prompts, enforced rules, rigging limits and the missing broader species knowledge pack. Latest automated check count **56**; logs `runtime/tests-v13.log`, `runtime/build-v13.log`.

The V12 handoff below is history where its cap/test numbers conflict with this section.

# Microverse · Little Field Club · V12

Local review: http://127.0.0.1:8860/ . This is the isolated camera-first prototype. `microverse-hackathon` remains unchanged at `5bda15b`; this pass is not committed, merged or published.

## Current build · 3 November 2026

- **Compact maps with discovery room.** Pan by dragging or arrow keys, zoom 1–2.25×, and use Find the animals to return. Only the painted map moves; interface and frame stay still. The garden’s Pond control closes in on the same simulation, not a separate invented underwater world.
- **Three animal types in every saved world.** Garden: pond snail, dragonfly visitor, goldfish. Woodland: mouse, owl, fox. Reef: yellow fish, shrimp visitor, parrotfish. Initial populations are 9–10 individuals. These are curated teaching roles, not an exhaustive or calibrated food web.
- **Distinct generated places.** Real Meta photo-plan/layer tests produced a garden pond/beds and a shady woodland/logs. Both are now separate saved living worlds; the original deterministic meadow is reserved for My first adventure. Woodland crop, safe garden water region, species choices and motion hints received manual review.
- **Visible interactions.** Grazers seek actual food patches, bites consume biomass and patches grow back. The food ribbon names the source and current eater. Owls use four wing poses and can perch on tree objects; ground animals avoid trunk footprints. Separate trunk/canopy layers, water, light, leaves and rooted plant sway add local motion. Not every painted tree or stepping stone is a physical object.
- **Paw wordmark and clearer entrance.** Transparent header identity replaces the retired fox/globe mark. Smaller fox; visible craft/footprint and open-tools cards with icons; capsule actions, no underlined text. Little Field Club keeps Baloo 2 / Atkinson and the selected watercolor palette.
- **Clear photo review and time.** Yes is first and explicitly labelled. No and Not sure are separate. Starting food has a visible None/Little/Some/Lots preview. Rain is a prominent question; the lesson moves through every intermediate week. A lost rabbit clears focus instead of jumping to another individual.
- **Companion speech.** Hints/dialogs use the chosen guide and actual audio playback drives its talking state. Music/effects/narration default on after the first gesture, with off controls. Prepared Heart/Bella/Emma clips are local Kokoro; answer narration is local Heart. No paid speech calls.
- **Evidence-first Spark.** Common questions run locally. Custom questions send consented question + replay to Meta; Spark selects a supported topic and actual record IDs, then local code validates/builds the answer. It cannot directly edit arbitrary assets/rules. The live diet question succeeded; an unsupported real-world wildfire prediction returned uncertainty.

## Try it without spending

1. Choose a little world → pick Sunny/Clover/Spark → choose a Polaroid. Dismiss the spoken helping note. Show me a meal, Meet a neighbour, zoom/pan/reset, or open the garden Pond.
2. Try a what-if → less rain, warmer weather or an actual added grazer. Watch 7 days; inspect a real event and Why did that happen. Prepared companion questions make no AI call.
3. My first adventure → review three recorded garden SAM clues → choose food → predict → watch 1/4/13/26/52-week checkpoints → compare → tap evidence → companion recap → choose your own adventure.
4. Choose a photo → Animal → Bring this creature to life → dog/cat → local moving-photo fallback → review → arrival. Save is explicit; personal companions do not silently enter classroom ecology.
5. How it’s made includes animated sketch/layer previews and resource-use disclosures. Explore open-source tools restores existing ecosystem, puppets and command repositories. The new world builder has not been published as its own repo.

## Pipeline and limits

Meta Spark proposes visible clues, explicit guesses, a bounded habitat, roles, object positions and supported events. Muse Image paints a ground and 2×2 sprite sheet. Local code cuts sprites, animates approved parts and runs deterministic rules. New schema requests one producer and three animal groups; legacy 2–4-group plans remain readable. [Reusable templates and review checklist](docs/WORLD-BUILDER-TEMPLATES.md) explain substitutions and checks.

This is **a bounded teaching engine**, not Genie, site reconstruction or a forecast. The single food-pool model and invented rates are not species calibrated. Curated tree/water geometry is reviewed, not measured from every photo; baked-in scenery is not all physical. Live SAM for arbitrary world uploads is not connected: the first lesson uses recorded garden masks and new world planning uses Spark vision. Generated art can violate geometry and requires review. A photo cannot establish unseen species, ecosystem health, food capacity or future hazards.

Source-photo redistribution rights for the supplied Huahine image are unresolved: keep that example local until cleared/replaced. MIT intent for original code does not license external photos, artwork, model weights or fonts.

## Providers and allowance

| Work | Provider |
| --- | --- |
| Photo plans, custom evidence/topic selection, optional anatomy proposals | Meta `muse-spark-1.3`, server key |
| Ground, sprite sheets, wing/plant layers and guide expressions | Meta `muse-image-1.0` |
| Cutting, rules, motion, prepared questions | Local code |
| Prepared voices / on-demand answer voice | Local Kokoro Heart/Bella/Emma / Heart |
| AWS, Baseten, Blender | Not used in this expansion |

Approved TOTAL test cap: **$1.70**. Shared ledger reserves **$1.65 across 33 provider attempts**, leaving $0.05. This is conservative accounting, **not verified billing, credit balance or payment-source proof**. No more paid tests in this pass; successful results are saved/cached. Two real photo pipelines, owl wing poses, tree layers, extra fish artwork and two live world questions were added after V10. Earlier failed/rejected reservations remain counted.

Original main API flags/budgets remain unchanged. The prototype uses an expiring localhost-only permit through November 3 at 23:59:59 UTC, strict origin/session checks, consent, bounded inputs, caching and no automatic retries. Remaining allowance cannot cover another complete world. Saved worlds/prepared questions continue working. Static hosting alone does not provide local API/TTS endpoints; public live generation remains off.

## Verification and handoff

**53 automated checks pass; production/Sites packaging passes.** Tests cover deterministic movement/replay v2, bounds, food mass balance, actual bites, tree/perch interactions, three animal types per saved map, camera limits, consent/input validation, evidence rejection, recap restoration and sprite cutting. See `runtime/tests-v12.log` and `runtime/build-v12.log`.

See [scripted playthrough results](docs/review-plans/child-journeys-v12-results.md), [current design QA](design-qa.md), [demo runbook](docs/DEMO-RUNBOOK-V12.md), and [prompt/geometry review](docs/WORLD-BUILDER-TEMPLATES.md). Scripted agent runs are not real child/teacher usability findings. Hardware camera/mic, subjective listening, broad accessibility, real-device FPS and unseen habitats remain unverified.

Main-project 46-surface migration is still separate work; do not claim this isolated prototype has replaced production.
