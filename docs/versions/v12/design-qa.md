# Design QA · Microverse V12 · 3 November 2026

Scope: the existing approved camera-first prototype, its compact living maps, companion/tutorial improvements and requested brand amendments. This is not a production-wide46-surface audit or claim of real participant usability.

## Visual truth and comparison

- Selected source: `docs/reference/selected-option-3.png`, **1487×1058**.
- Approved brand source: `docs/brand-options/brand-little-field-club-v7.png`; exact tokens in `docs/BRAND-KIT.md`.
- Current implementation: http://127.0.0.1:8860/ . Current hero capture: `docs/screenshots/release-v11/27-hero-final-source-size.png`, **1487×1058**. Browser DOM verified1487×1058 CSSpx. Both comparison images use1 image pixel per CSSpx; no extra device chrome.
- Full paired input actually opened: `30-source-current-full.jpg` (both images in one2974×1090 canvas,32px labels). Focused paired input actually opened: `31-source-current-actions.jpg` (matching730/220/1487/950 source/current crops). Same route/home state. Initial resize capture was489px wide and rejected/overwritten; the accepted capture matches source dimensions exactly.
- These are not pixel-identical targets: user subsequently approved rounded Baloo/Atkinson branding, a smaller fox, transparent paw-dot wordmark, no underlines, visible craft/tools cards and three-world library. Those explicit amendments supersede the old serif wordmark, large fox, rectangular primary action and underlined secondary links. Compare retained composition/art hierarchy and requested amendments, rather than filing those intentional changes as errors.

Full comparison: retains watercolor forest entrance, fox at left, pale text area right and one dominant camera action. Smaller fox/support links are fully visible. Focused comparison: primary camera action remains strongest, readable type, rounded secondary options and consistent palette. No unintended headline clipping/overlap at matched desktop size. Paw is live text plus an existing Phosphor icon; no fox-globe mark remains in the header.

## Findings, fixes and actual iteration history

| Priority | Earlier finding | Fix | Post-fix evidence |
| --- | --- | --- | --- |
| P1 | New hint header fell into old two-column layout, compressing text | Header spans columns; arrow/text/actions have explicit rows |03-garden-hint-fixed.jpg,33-woodland-spoken-help.png |
| P2 | Hero support links clipped at720px height | Reduced minimum hero height/repositioned support/companion links |07-hero-current.png at1280×800;27 matched source size |
| P2 | Garden/woodland looked alike; new woodland included an unwanted pond | Separate generated/cropped backgrounds, curated inhabitants and usable objects |11-woodland-exploration.png,26-phone-pond-fixed.png,35-compact-woodland-final.png |
| P2 | Letterbox bands/off-map zoom and jerky individual changes | Canvas cover/clamped camera, local600ms interpolation, smooth facing and tracked focus; frame/UI stay fixed |11 and35; phone zoom/arrow/reset exercised |
| P2 | Food/eating relation unclear | Real patch consumption/regrowth; visible bite cue, source/eater ribbon and Show me a meal |08 (earlier geometry),09-live-spark-food.png,26 after water fix,35 |
| P2 | Garden fish could use painted bank | Reviewed safe open-water rectangle; explicit geometry limitation |26-phone-pond-fixed.png; saved-world zone/replay test |
| P1 | Sixth garden assumption failed schema and blanked route | Keep five bounded assumptions; add unexpected-error recovery screen |Fresh phone garden opens, all53 checks pass, no new browser error after clean reload |
| P2 | Yes not obvious; wording made time movement ambiguous | Yes first with explicit nouns; separate No/unsure; named Watch7days; prominent rain question |17-phone-review-yes-first.png,20-phone-rain-question.png,21-phone-clock-hint.png |
| P2 | Narrator/hint felt disconnected from guide | Local clips and live Heart playback drive actual speaking state; closing stops |10-live-answer-speaking.png,33; speaking1→0 observed |
| P2 | Child finishes on homework-like text or hero | Tap evidence, actual-state recap, own-adventure choices |23-phone-recap.png and24-phone-adventure-choices.png |
| P2 | Event’s nested small label still underlined despite button-level override | Removed underline declarations; event cue becomes a small tonal action |35 final recapture; computed textDecorationLine=none |

Old02-garden-hint.jpg is a failed layout,06-woodland-full-stage.jpg is the wrong home state and14-phone-hero.png is a transient390×244 resize capture. They are retained as history and excluded as passing evidence.25 captures the real loading/hint combination, not a completed map. Source/current pairs were recaptured after dimensions settled. Previous V10 report archived in `docs/versions/v10/`.

## Tested interactions and responsive checks

Three scripted runs are detailed in `docs/review-plans/child-journeys-v12-results.md`: desktop garden exploration, reef/woodland evidence questions/interactions, and390×844 upload/recovery/full rain lesson/recap. Phone document width390, matching viewport; zoom/reset/buttons and keyboard pan operate. Support page/making-of and existing repository hrefs checked through actual navigation. Voice off/music off/motion pause and Emma selection operated; live-answer Heart speaking state checked. Human listening, hardware camera/mic and real-device FPS are not validated.

The final clean-load console check after the garden fix returned no new warnings/errors. Old development/HMR warnings remain historical and were not reclassified as current. One approval timeout recovered on the allowed retry; there is no current browser-use block.

Automated: **53 passed**, including all three saved-plan validations, zone/trunk bounds, real perch records, deterministic replay, exact patch food accounting, camera bounds, consent, evidence validation and recap restoration. Production/Sites package builds. Main checkout clean at5bda15b; no commit/merge/deploy. Shared Meta reservations$1.65 of approved$1.70,33 attempts; not verified billing.

## Remaining P3 / scope limits

- On a phone, starting-food preview precedes choices; inspecting both may require scrolling back after the hint. A compact persistent preview is future polish.
- Long world explanations scroll above the fixed toolbar. Tune on a real touch device; the checked controls remain operable.
- The saved garden navigation is a safe rectangle, not every irregular shoreline/stepping stone. AI terrain can require manual review. Not all scenery is physical; water is an animated local image effect, not fluid physics.
- No real teacher/child observation, broad screen-reader/keyboard audit, microphone/camera hardware trial or measuredFPS. No arbitrary-biome correctness claim. Pointer drag exists but this check exercised keyboard pan; touch gestures need device review.
- The46-surface main-project migration, publication, a new final rendered demo and submission are separate remaining work. Island-photo redistribution rights need clearing/replacement before public distribution.

No actionable P0/P1/P2 issue remains within the checked prototype slice after the listed fixes and retests.

final result: passed
