# Microverse — layered worlds and personal guide review

3 November 2026. Scope: separate local prototype at http://127.0.0.1:8860/, not every main-game screen, a participant study or scientific validation.

final result: passed

## Source, state and comparisons

- Selected layout: `docs/reference/selected-option-3.png`, 1487×1058 pixels. Later approved brand: `docs/brand-options/brand-little-field-club-v7.png`, 1920×1280. Exact tokens/fonts are in `docs/BRAND-KIT.md`; generated board lettering/hex labels are approximate.
- Latest matching hero: `docs/screenshots/world-builder-v8/34-final-hero-desktop.jpg`, 1487×1058 CSS viewport and returned pixels. Opened both source and implementation together in `hero-source-comparison.jpg` and equal-coordinate `hero-controls-comparison.jpg` before assessing them.
- The earlier serif mock is the layout source; the subsequently approved Little Field Club board controls typography/branding. Baloo/Atkinson, live logo/wordmark, pill action, separate lower fox layer, library link and optional companion/discovery links are intentional user-approved changes. Removing the baked-in photo was already approved in V7. The composition retains painted foreground at left and quiet action area at right.
- Other tested viewports: 1280×720, 1280×800, 390×844 and the user's natural 738×895 guide dialog. Returned screenshot pixels equal the stated CSS dimensions. The browser reported devicePixelRatio 2 after reset; its capture API returns CSS-sized images. No 2× raster was compared against a 1× source, and no manual density rescaling was needed for the paired hero.
- New recap/guide/reef/support screens have no selected same-state mock. They are explicitly responsive adaptations of the approved system, assessed as new interactions rather than falsely claimed pixel clones.

## Findings and iteration history

All findings below were repaired and recaptured. No actionable P0/P1/P2 remains in the reviewed states.

| Finding | Impact and fix | Evidence |
| --- | --- | --- |
| P1: stale tutorial target after photo-review step | The old target detached; the spotlight dimmed everything and the note disappeared. Remount/rebind the coachmark on review index changes. | 10/12 show the failure; **13-review-spotlight-accepted-phone.jpg** shows bright photo/arrow/note with the rest dimmed. 11 is an unrelated stale hero capture and is excluded. |
| P2: live-world clock slipped behind header after scrolling | Persistent world controls could scroll the time label away. Keep desktop map/clock/controls fixed; keep the phone world sticky and its clock fixed above it. | 14 and 28 are pre-fix evidence; **25-live-fish-closeup.jpg**, **29-phone-clock-fixed.jpg** show readable clock, world and dock. |
| P2: land lesson clipped into its own fixed-height container | Pressing lower actions scrolled the canvas/clock out of its frame. Allow a taller story page while keeping desktop canvas, clock, food and tools visible. | 21 is pre-fix; **35-lesson-clock-event-fixed.jpg**, 1280×800, shows the actual week-13 state with all primary controls. |
| P2: cramped guide choices at medium width | Library buttons wrapped unevenly. Use three equal minmax grid tracks, and explicitly inherit brand color inside the native dialog. | 19 pre-fix; **40-guide-brand-colors-phone.jpg** and **42-user-preview-preserved.jpg**, 738×895, confirm three choices, complete head and readable name/action. |
| P2: technical IDs and verbose prepared answers | Child prompts exposed rabbit IDs and repeated measurement wording. Keep IDs in records; surface baby/arrival wording and actual simple comparisons. A direct diet question now retains the validated diet rule and shows it first. | **35**: “A baby rabbit was born.” **39-phone-diet-answer-final.jpg**: diet first, actual counts second. Regression coverage retains surprising counts/evidence IDs. |
| P2: fixed sprite inset risked clipping ears | A blanket crop could remove tall anatomy. Remove neutral frame lines and connected background instead, then map landmarks through the actual cutout. | Shared cutting regression preserves a tall ear; accepted **20**, **40**, **42** show the complete head. |
| Rejected AI art: wrong ground / invented glasses / uncertain tail | A first reef ground looked like dry rivers; portrait v1 added glasses absent from the source; the fish tail was not reliably visible. Reject those candidates, use the corrected submerged ground and no-eyewear portrait, and leave the uncertain tail unrigged. | Local receipts/provenance in `docs/assets/living-world-and-spark-v10.json`; accepted **25/26**, **20/40**. Rejected assets were not installed. |

`15-craft-making-of.jpg` is an initial near-empty animation frame, not the finished effect. Use 16/17/18 for movement/sketch/painted evidence. 24 and 38 preserve earlier wording; 39 is the final diet-answer proof. No fix is claimed solely from a screenshot filename.

## Required fidelity surfaces

- **Fonts/typography:** locally bundled Baloo 2 headings and Atkinson body. Large, unclipped entrance/rain question; readable dialog labels and multiline phone choices. Guide dialog's former black UA color corrected to forest. Exact old serif matching is intentionally superseded by the brand selection. User-facing natural medium viewport has all three guide choices and CTA visible.
- **Spacing/layout:** quiet hero action region, single leading camera action; three Polaroid choices; soft panels/pills. The reef preserves artwork aspect instead of stretching. Phone map remains in sight while the story scrolls; fixed controls have a separate safe area. Phone chat intentionally overlays the scene when opened, with its own scrolling and close control. Guide customization is a modal and returns to the existing world.
- **Colors/tokens:** cream/forest/moss/seed/clay match the approved kit; selected guide/food states use forest outline and pale moss. Body text uses dark reading color. No green-provider/environmental-score indicator. Formal contrast/zoom/screen-reader certification is not claimed.
- **Image quality/assets:** real watercolor terrain, sprite sheets, cutouts and supplied photos; Phosphor controls. Corrected reef is fully submerged, with separate fish/algae/shrimp. Sunny's four expressions retain source appearance without glasses. Cached pose deformation and terrain refraction reuse raster pixels. No 4K, measured anatomy, exact map reconstruction or real-device FPS claim.
- **Copy/content:** visible photo clues versus guessed inhabitants/rules are distinct. “Today,” “Day 7,” seven days and actual grass comparisons lead. Recap follows 18 vs 15 rabbits rather than an expected decline. Support pages distinguish avoided repeat calls from unmeasured total environmental benefit. Open-tool links restore the existing repositories; they do not claim this new builder is published or externally adopted.

## Interactions actually exercised

1. Guide library at first entry; Sunny selection into library; later guide overlay opens/closes without resetting the live world. Final user tab retains the user's Clover selection, unchanged by the QA tab.
2. Garden: three saved SAM clue reviews → Lots → prediction → intermediate time steps 1/4/13/26/52 → same-week comparison → tap observation → full recap. Repeated after the clock/event fix. Recap actually seeks weeks 0/4/52, toggles usual rain and reports the real final 18/15 rabbit counts.
3. Recap → **My own world / My creature / A world to explore**, not hero. Full desktop flow and phone recap/completion checked: 22/23 and 36/37.
4. Floating Sunny chat: prepared rain answers, direct diet answer, actual live-world arrival answer. Photo/name exclusion and forged-evidence rejection are automated checks. Custom new-world reasoning has mocked contract validation, not a new live request at exhausted cap.
5. Saved living reef: separate sprites, selected fish close-up, day 0→7, actual food 70→78, another neighbour 9→10, actual arrival notification and matching prepared answer. Earlier warm run reached bounded day180; reset behavior checked. Fine fin/mouth motion is implemented and rendered; no measured frame-rate or biological-rig claim.
6. Craft: creature/world making-of replay and sketch/movement/painted states; pause/reduced behavior in implementation. Footprint disclosure expands, open-tools navigation works and existing repository hrefs are present. Phone evidence 31/32/33. External repository availability was not independently confirmed by the attempted web cache lookup; links are restored from the original site.
7. Audio: selected Bella and enabled recap narration; no browser playback error. Restored QA narration off and Heart afterwards. All new recap clips exist in all three voice manifests. Human listening is still pending.
8. Phone widths for guide/chat/open-tools: viewport and document both390px. Final browser warning/error histories empty. Temporary viewport reset and separate QA tab closed; user-facing preview marked deliverable and left on the preserved Clover choice.

## Technical verification and limits

48 automated tests pass and production/Sites packaging passes. Source state/provenance is recorded in README and `docs/assets/living-world-and-spark-v10.json`. The main checkout is clean at 5bda15b. No merge, commit, deployment or new reusable-tool repository was made.

Total authorized test cap $1.10 is fully reserved across 22 attempts. No more paid tests. Reservations are conservative bookkeeping, not verified billed charges or credit balance. The encoded-path fish ledger was reconciled and the accidental folder archived inside prototype runtime. Original main flags unchanged; generation remains local with an expiring permit.

Residual scope: one actual island-plan/layer generation and the public Sunny photo tested live; not all possible uploads/habitats. The optional new-world anatomy batch and world-answer integration have mocked/fallback coverage; the separate fish-landmark request succeeded live. The world uses bounded invented teaching rules, not scientifically calibrated ecology or a general pretrained world model. SAM live segmentation of arbitrary scenes is not connected. Physical camera/mic, real learner/teacher trial, subjective listening, full keyboard/screen-reader/zoom audit and real-device performance remain unverified. Source-photo redistribution rights need resolving before publication.

P3 follow-ups: tune subtle motion and transitions on a real touch device; consider allowing the floating guide to be repositioned around long choice cards. Neither blocks the checked core flow.

## Implementation checklist

- [x] Compare source and current hero together, full view and controls.
- [x] Repair/review spotlight, clocks, guide layout, crop and child-facing wording.
- [x] Complete actual lesson → recap → own-adventure on desktop and phone.
- [x] Verify saved living world and evidence-based floating guide without further spending.
- [x] Restore craft/footprint/tools, preserve user selection, reset viewport and leave preview open.
- [ ] Wider real-photo/habitat evaluation, participant observation and device/accessibility checks before production claims.
