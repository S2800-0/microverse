# Microverse · camera-first prototype

This separate prototype keeps the third Product Design direction selected on 2 November 2026 and now connects the photo review to copies of the existing deterministic ecosystem engine. The original `microverse-hackathon` checkout remains unchanged at `5bda15b`.

Local preview: http://127.0.0.1:8860/ (running). The earlier browser approval blocker is cleared. Fresh desktop/phone visual and interaction review of the current prototype passes after four fixes; see `design-qa.md` and `docs/screenshots/approved-review/`. This does not mean all planned main-game pages are revamped. The original scripted version and its review remain under `docs/versions/v1/`.

## Try the complete activity

1. **Choose a little world → The garden** loads the public-domain photograph and recorded SAM masks. Review water, trees and grass one at a time. You can compare each mask with the original or skip a guess. If no grass or trees are confirmed, the app offers a wider photo or the example instead of creating a forest.
2. **Choose a photo** loads a JPG, PNG or WebP locally, resizes it and removes source metadata through re-encoding. Choose whether it is an outdoor place, a close-up plant, an animal or something else. Unsupported landscapes, objects and unclear views have their own retry/example guidance. The animal route opens the prototype companion journey with the same processed photo, without another upload.
3. Choose **A little**, **Some** or **Lots** of starting plant food. These are explicit model assumptions, not food measured from the photograph. They set grass and shrub food to 0.25, 0.55 or 0.85 on the existing model’s open ground; terrain and ecological rules remain curated.
4. Make a prediction, including **Not sure**. Both model branches start with the same animals, food and random state. One keeps usual rainfall; the other gets half rainfall for 52 model weeks.
5. Follow checkpoints at weeks 0, 1, 4, 13, 26 and 52. The focus view shows one actual model creature; the meadow view shows the wider population. The other animals continue participating in both branches while hidden from the focus view. Animal positions and the painterly food display come from computed state.
6. **Compare with usual rain** switches the same view at the same model week. **Why?** opens the model rules, exact counts and traceable birth/arrival records. A single run does not establish one cause or forecast a real place.
7. Select observed differences to assemble a short sentence. Save a discovery containing the validated model replay and your choices. Use **Open a discovery** on the entrance to reopen it. Photos are excluded from downloads.

## What is working and what remains limited

The ecosystem outcome is now computed rather than scripted. Starting-food choices affect the outcome; rewinding and reopening the same saved state reproduce the result. Observation wording follows actual comparisons, including cases where lower rain produces more rabbits at a checkpoint. The app does not force the claim that every animal population must decline.

The photo remains a source of reviewed context and questions. Its image geometry does not become the map. The only supported environment here is a fixed meadow-and-forest model with curated animals and rules. New photos receive manual review; they do not inherit the example’s SAM masks. Real-time SAM segmentation of a new photo is not connected to this prototype’s interface yet.

Physical camera capture is implemented with a photo-upload fallback, but real camera hardware has not been tested in this session. The sound dialog offers prepared local Kokoro Heart narration, original synthesized music and button sounds as separate opt-ins. There is no microphone input in this prototype. Motion respects reduced-motion preferences and can be paused; canvas animation is cached and throttled. Subjective audio quality and real device frame times remain unverified.

## Optional Spark photo check

The local Vite server includes a server-side scene-check adapter. When enabled and funded, it can suggest greenspace, close-up plant, animal, other landscape, object or unclear. The child sees and confirms the suggested route; it never changes ecological rules or silently starts an experiment. It is routing assistance, not habitat diagnosis.

**The existing Spark switch is off and has been left off.** Manual routes and the model work without AI calls. The optional check was tested using mocked provider responses; no live Meta/Baseten inference was requested for this extension.

The adapter reads the existing ignored configuration on the server only. Keys are never returned to the browser. It uses the existing provider selection, confirmed-credit switch and cap; its separate local cap is bounded to at most one $0.025 reservation. A reservation is an estimate, not a provider billing guarantee. Explicit consent, a same-origin session, bounded input, a fixed provider/model, no automatic retry and cached repeated results guard the optional path. New photos remain in memory by default. The separate ignored ledger records hashes and reservations, not images.

The AI bridge is local development functionality. A future deployment needs an appropriate server function; this task has not published or merged the prototype. The Product Design hosting scaffold remains intact.

## Verification

- `npm run test:experience` tests routing boundaries, uncertainty handling, real food effects, deterministic rewind/reopen through week 52, tampered replay rejection, evidence identity and inference funding/consent/cache/no-retry behaviour.
- `npm run build` bundles the client while preserving the Product Design hosting scaffold.
- Before browser access was blocked, the sample activity was exercised through 52 weeks, comparison kept the same week, the records matched computed values, a saved file reopened through the interface, and an actual downloaded discovery was parsed and replayed locally without image bytes.
- A 390×844 browser check caught and fixed hidden controls and a focused animal obscured by the explanation. The later measurement showed all eight activity controls in the viewport, with document height 844 and scroll position 0.
- Fresh approved review now covers garden, meadow manual review, no-clues recovery, animal-photo handoff, Sunny/Clover movement previews, forest/neighbour/journal routes, phone layouts, sound controls, final screenshot comparison, console inspection and real saved-file reopening. See the current QA report for exact scope and residual gaps.
- No teacher/learner usability trial, real camera hardware trial, ecological calibration or live scene-classifier accuracy evaluation is claimed.

## Sources and provenance

- Chosen visual target: `docs/reference/selected-option-3.png`.
- Palette: paper `#f7f2e6`, ink `#203d2b`, action `#24462f`, rain `#38596a`, rust `#9a531c`.
- Locally bundled fonts: Fraunces and Atkinson Hyperlegible, with Georgia for the wordmark. Icons: [Phosphor React](https://github.com/phosphor-icons/react).
- Engine, terrain, replay and evidence modules are copied unchanged from the original project into `src/core/`. File hashes and source commit: `docs/engine-source.json`. The new adapter is `src/experience/model-session.ts`.
- Existing forest, rabbit, deer, wolf and cached fox-walk artwork are reused. The renderer draws those raster assets; it does not generate images while an animal moves. The walk atlas uses the existing 24 poses.
- The garden photograph is Jon Sullivan’s public-domain image. Its masks came from the existing recorded Meta SAM 3.1 example dated 27 October 2026.
- Hero and dry-meadow raster masters and their earlier ImageGen prompts/provenance are in `docs/assets/`. No new artwork generation was needed for this extension. WebP delivery copies reduce the three large illustrations from 9,668,820 bytes to 1,453,498 bytes; the originals remain preserved.
- The old v1 screenshots document the earlier design only. They are not evidence of the final live-model extension.

For a later development session, `npm run dev -- --host 127.0.0.1 --port 8860 --strictPort` starts the preview. The current preview is already running.

## V3: photo library, soft controls and optional audio

The latest prototype adds **Choose a little world** → exactly three real-photo Polaroids: garden, wildflower meadow, woodland edge. All three inspire the same working meadow model. Only the garden has recorded SAM masks; the other two use manual review. Licences and source links appear under Photo credits.

Buttons, choices, text-field styles and panels now have softer corners. The hero uses separate generated scenery/fox layers with local motion; the focused rabbit is larger and has cosmetic breathing/sniffing. The recovered 2048px terrain original and smaller backdrop zoom improve clarity without inventing a different map. No 4K claim is made.

The top-right speaker opens settings for prepared narration, quiet original music, button sounds, motion and contextual helping arrows. Audio starts off. Narration uses Kokoro Heart clips generated once locally from fixed scripts; playback makes no paid inference call. `public/audio/credits.json` records those scripts and source. Dynamic numerical result narration is not implemented.

- `docs/UI-DIRECTION-V3.md`: research, exact shape/motion rules, asset licensing and limits.
- `docs/REVAMP-CHECKLIST.md`: 46 pages, feature surfaces, panels and dialogs, with their actual revamp status.
- `design-qa.md`: remains **blocked** until fresh rendered browser checks can run. Local builds/tests are not visual approval.

The main project and deployed site remain unchanged. This prototype is a reviewable implementation, not a completed or published whole-product redesign.

## V4: personal companions

Choose **My companions** on the entrance, or route an uploaded animal photo into the creature journey. The old importer is now a sequence: photo → optional dog/cat/name → look → movement review → imaginary clearing → explicit Save. Sunny demonstrates the actual previously saved Meta photo-to-watercolor result; Clover is a prepared cutout. Ordinary photos have a clearly labelled whole-picture movement route.

Existing local rig fitting, review and collection logic are reused. Save is explicit, pictures can be downloaded, saved companions reopen, and removal asks for confirmation. Pets in this personal clearing do not alter the classroom ecology model.

The local image bridge retains the existing **disabled, zero-cap** Meta settings. Live painting is paused; no paid generation was performed. The bridge is development-only. See `docs/COMPANION-JOURNEY.md` and the updated whole-product checklist. Rendered browser QA is still blocked.

## V5: open forest exploration

After finishing an experiment, **Explore this forest** opens an isolated copy with usual rain. Let it grow or step one week, meet a native neighbour, and open the forest journal. Entries reference actual new events; exact counts stay under a disclosure. Playback stops on dialog opening or hidden tab, and the exploring year is bounded/repeatable. Your completed experiment stays untouched.

The scene uses the existing watercolor map, improved local walk rendering and the official Motion library for panels. The new route is lazy-loaded. `docs/FOREST-EXPLORATION.md` records the implementation and limits. Visual QA is still blocked; the fresh approval investigation and manual-review recovery path are in `docs/BROWSER-APPROVAL-DIAGNOSIS.md`.
