# V18 additions · current map

- `src/world/world-commands.js`: allowed command kinds, local language patterns, strict command validation and custom Spark output schema. `server/world-command.mjs` interprets only supported commands; the client controller applies them to real simulation state.
- `src/world/simulation.js`: local ecological rules, actual food/predation/perches, bounded habitat/population changes, visitor greetings, replay v3 and undo support. No model writes executable game code.
- `src/world/visitors.js`, `server/new-neighbour.mjs`: checked design/locomotion, explicit two-stage reservations, four-pose artwork, no automatic diet assignment. `pose-atlas.js` aligns cut frames locally.
- `server/world-generation.mjs`, `blueprint.js`: photo-informed plan; terrain/life/scenery prompts; visible artistic movement regions; validation and source-versus-assumption separation. Four build holds before generation; one planning hold separately.
- `scene-navigation.js`, `pond-world.js`, `WorldExplorer.jsx`: guarded surface/transition/underwater/return states, separate sessions and prepared freshwater template, not underwater identification from a surface photo.
- `pixi-stage.js`, `scene-manifest.js`: painted scene graph, actual patch/agent positions, depth/flight ordering, bounded movement and weather effects. Rendering does not secretly add biomass or scientific facts.
- `server/expansion-access.mjs`: $5 total local-only test cap and expiring permit; both paid adapters recheck the window. Reservations remain separate from provider bills.
- Current test/evidence scope and remaining live/retrieval/rigging limitations: `docs/review-plans/living-world-v18-results.md`.

# V16 animal identity and matching guide portraits · 3 November 2026

- User reported forced dog/cat selection changed a monkey into a cat. Removed that menu. Any short animal type can be entered, or left blank for Spark. Prototype creature pipeline now describes the broad type and visible features with Spark, paints a NEW suitable watercolor pose with Muse Image, then SAM cuts out that animal. Uncertain identification stops before painting. Owner hint is descriptive data, not a forced class. A review still decides whether the result is correct.
- Isolated local pipeline/provider copies extend the main tested pipeline; production checkout remains unchanged. New version watercolor-identity-2, old saved v1 art still accepted. Three 50k reservations are held before calls; no retries. Custom Spark now describes the animal before making its four frontal head expressions; two 50k holds before calls. Names stay local.
- Local experimental four-limb side-pose fitting added for primate/generic quadruped designs, with distinct artistic movement tuning and mandatory review/fallback. Not universal anatomy detection, climbing/swinging, mocap download or a measured behavior model. Birds/fish/other new imports still use simpler movement if no supported puppet is available.
- Checked monkey-group note added from San Diego Zoo Wildlife Alliance (https://animals.sandiegozoo.org/animals/monkey). Catalog is now nine groups/examples. Personal companion field notes use the broad type and are explicitly general facts, not events. Broad live biodiversity/fact/motion retrieval remains roadmap work.
- User approved $2.10 TOTAL, $0.10 extra for front-facing saved fox/cat expression sheets. Both generated once, reviewed, cut locally and connected to actual voice-playback mouth state. Hear my voice added to guide selection. Portrait script initially used URL.pathname and placed its two reservations in a separate percent-escaped directory; caught and reconciled both into the canonical ledger without new provider calls. Script now uses fileURLToPath. Canonical ledger $1.90 reserved /38 attempts; $0.20 remains. Reservations are not billing. No fresh user monkey image was transmitted by the agent.
- 65 tests pass; build passes. Browser verified fox and cat speaking-frame image during real local playback, optional blank animal type, local photo entry, back navigation, desktop and 390px form overflow. No console errors/warnings. Main checkout unchanged. New arbitrary creature/guide live end-to-end tests remain for user’s own photo. Existing own-photo allowance expiration is unchanged.

# Focused catalog now connected · V14

The first version is implemented in `src/world/species-catalog.js`: eight reviewed groups/examples (fox, wood mouse, owl, pond snail, goldfish, adult dragonfly, algae-grazing parrotfish and rabbit), each with a source, review date, diet note and supported game habitat/movement/role. Exact aliases prevent an unknown animal from silently borrowing another species’ facts. Dog/cat import-rig capabilities are a separate registry used by the movement reviewer.

The planner now receives compact reviewed examples. Known nature-plan mismatches are rejected before artwork is requested. Spark can give a checked field note or recognize an exact common diet question locally, with a source and explicit game simplification. An animal absent from the current plan gets a general-fact label, not an observation claim. These answers require no Meta call or consent checkbox. Unknown/custom questions still use the bounded evidence route.

This is a small curated knowledge pack—not broad live web retrieval or universal rigging. [External-source retrieval roadmap](TRUSTED-RETRIEVAL-ROADMAP.md) describes verified APIs and the separation between biological facts, motion data and simulation results. Latest tests/build:59 pass; no paid request made for adding this pack.

# What governs Microverse’s AI, animals and movement?

Current local prototype, V13 · 3 November 2026. This is the implementation map, not a claim that a universal ecology/rigging dataset is installed.

## The short answer

**Yes: schemas, validation policies, prompts, reviewed presets and deterministic rules already exist. No: there is not yet a comprehensive species database, broad live source search or universal animal rigging model.** Spark proposes within a contract; code validates and runs the result. A pleasing painting is not proof of valid geometry or biology.

| Area | What exists now | Canonical files |
| --- | --- | --- |
| Creature photo input | Dog/cat, bounded PNG, explicit consent, short appearance notes; no extra fields/names sent | `src/core/creature/contract.js` |
| Creature illustration prompt | Appearance from photo; one right-facing whole animal, separated legs, preserved visible markings/accessories, blank backdrop | `src/core/motion/motion-library.js` → `buildSpritePrompt`; the Meta adapter reuses the main project’s same prompt |
| SAM cutout | Exactly one usable mask; dimensions, bounds and raster bytes validated; harness-aware segmentation noun phrase | same contract; main `server/meta-provider.mjs` → `parseSamResponse` |
| Dog/cat rig | Local silhouette analysis, bounded knee/split search, leg-piece checks and user movement approval; fallback when unreliable | `src/core/motion/rig-analysis.js`, `rig-fitting.js`, `rig-review.js`, `puppet-motion.js` |
| Motion presets | Artistic canine/feline/hop/waddle settings and allowlisted motion tools; not measured species locomotion | `src/core/motion/motion-library.js` |
| Fish motion | Bounded visible tail/fin/mouth/eye regions; missing/unconfirmed anatomy stays still | `src/world/motion-points.js`, `fish-motion-reviewed.json`, `saved-places.js` |
| Bird/environment art | Four owl wing poses, separate tree trunk/canopy, local sprite/environment rendering; manually reviewed object placement | `src/world/habitat-layers.js`, `LivingWorldCanvas.jsx`, `environment-motion.js` |
| World plan schema | Bounded title, visible clues vs guesses, habitat/water, one producer + three animal groups for new plans, supported motion/roles/events and up to eight objects | `src/world/blueprint.js` → `WORLD_SCHEMA`, `PLAN_INSTRUCTIONS`, `validateBlueprint`, `compileBlueprint` |
| World art prompts | Terrain-only elevated painting, separate 2×2 inhabitants, optional visible anatomy hint request | `server/world-generation.mjs`; reusable recipe in `docs/WORLD-BUILDER-TEMPLATES.md` |
| Ecological rules | Local patch growth/actual bite consumption, energy, movement, reachable zones, trunk avoidance, perches, hunts and arrivals | `src/world/simulation.js`; original land lesson under `src/core/scene/` and `src/core/sim/` |
| World what-ifs/events | Only dry-spell, warm-spell and new-arrival; marine excludes dry-spell; titles name an implemented grazer | world blueprint/compiler + simulation |
| Prepared Spark questions | Free local responses from the active world or original experiment, with child-readable wording | `src/components/QuestionPanel.jsx`, `src/core/investigation/guide.js`, `src/spark/child-reply.js` |
| Custom world questions | Spark selects food/weather/neighbours/unknown and actual event IDs; local validation constructs the answer | `server/world-answer.mjs` |
| Original experiment evidence | Replayed states/counts/events, allowlisted evidence IDs; no arbitrary text presented as proof | `src/core/investigation/evidence.js`, `guide.js`, `src/experience/model-session.ts` |
| Companion head/recap | Bounded portrait request, expression sheet, actual playback state, recap derived from observed comparisons | `server/avatar.mjs`, `src/spark/SparkStudio.jsx`, `SparkAvatar.jsx`, `recap.js` |
| Consent/spending policy | Localhost/origin/session checks; credits permit, shared ledger, bounded inputs, cache and no automatic retry | `server/expansion-access.mjs`, `credit-budget.mjs`, `world-tools.mjs`, `companion-bridge.mjs` |

The original main project’s provider/pipeline modules are reused server-side; its source, `.env` switches and budgets are not changed. These references describe real code, not future API endpoints. Motion tools are an allowlisted interface in the library; the current Spark chat does not independently orchestrate every rigging tool.

## What SAM does—and does not do

SAM supplies a **subject mask**, not a skeleton, species biography or biome rules. The local fitter proposes limb pieces from a suitable silhouette. Its checks can fail even if the cutout is good; the user must inspect movement. A newly uploaded photo is never silently presented as the saved Sunny illustration. The moving-photo fallback is explicitly labelled.

The creature importer currently fits dog/cat quadrupeds. Other animals may inspire world artwork but do not gain a working species-specific puppet automatically. Fish use reviewed local pixel regions; the owl uses pose artwork. Those are different techniques, not a universal inferred rig.

## What the model knows about an animal

The model can propose likely inhabitants from its learned knowledge, but those guesses are not an installed, cited fact database. The eight-profile pack and saved plans are small curated configurations. They specify appearance, role, movement and zone; they do not contain full diets, seasonal behavior, habitat ranges or calibrated birth/death rates. Examples are teaching simplifications.

The compiler handles known mistakes (coral is not a producer; fish need water; plant food must be reachable; invented event species are not silently added). This is useful validation, not a complete ecological expert. Every unseen photo can still reveal a new failure case.

## A sensible next species knowledge pack

After the demo, add reviewed records rather than asking the model to improvise every fact. Suggested fields:

- Stable species/group ID, common name and supported habitat tags.
- Diet/feeding relationships, needs and interactions, each with primary-source URL and review date.
- Photo-observed / model-suggested / curated distinction and uncertainty.
- Rendering profile: orientation, size class, required visible parts, rig/pose-set ID, supported gaits and fallback.
- Allowed experiment/event templates plus prerequisites.
- Keep artistic animation settings separate from biological facts and calibrated numerical parameters.

This is a proposed data contract, **not a dataset already connected to the app**. Do not claim research-grade outcomes until the rules and parameters are reviewed and validated. Do not train a new model merely to store these few reviewed records.

## Your own-photo acceptance checklist

Use the prototype directly; no need to send photos in chat.

1. **Creature:** My companions → create/upload → dog/cat → Paint as a watercolor → optional appearance details → consent → Paint with Meta → inspect the real illustration/cutout → review movement or choose simpler movement → save only if wanted.
2. **Ecosystem:** Choose a photo → Build my living world → consent → Imagine my world → inspect inhabitants/guesses → Bring this world to life → Enter my living world → meal, seven days, what-if, question and reset.
3. In either path, loading reports actual stage. A failed request is not retried automatically; an uncertain rig has a simpler fallback. Generation needs the local backend; this does not activate the old public deployment.
4. Current user authorization is **$2 total**. At enablement $1.65 was conservatively reserved, leaving $0.35. Creature paint+SAM holds $0.10 before either call. A new world requires room for up to $0.20 (plan, two artwork calls, optional motion check). These are local conservative reservations, not verified provider charges. Other custom calls use the same allowance.
5. User chose to use their own photos. The prepared orange-cat/meadow fixtures were **not transmitted or generated by the agent** for this test. Actual new-photo quality findings await the user’s results.
