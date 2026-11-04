# Microverse prototype — approved browser review

Date: 2 November 2026. Scope: the existing isolated V3–V5 prototype, not the deployed main game or all 46 planned product surfaces.

final result: passed

## Findings and fixes

- **P1, forest entrance:** the first dynamic Motion import caused an invalid React hook error and development reload. Evidence: browser console at 14:47:14 UTC; the forest returned to the entrance. Fix: prebundle `motion/react` alongside React and deduplicate React/React DOM in Vite. Reopened the real downloaded discovery, entered the forest, opened animal cards, advanced weeks and used its journal without another error. Evidence: screenshots 11–15; no new warning/error after the fix in the final captured console history.
- **P2, desktop tutorial:** floating note obscured the water question. Evidence: 05-water-review-hint.jpg. Fix: compact note, remove redundant close control, avoid question/control rectangles when placing it. Post-fix 06-water-hint-fixed.jpg shows the complete question, controls and photo with the note above the photo.
- **P2, phone tutorial:** a note could not fit beside the photograph and covered the question. Evidence: 22-review-phone-hint.jpg. Fix: flow-based hints on narrow screens, immediately after their target; floating world controls retain anchored notes. Post-fix 23-review-phone-hint-fixed.jpg shows all content in natural scroll order. Got it removes the note and advancing the review works.
- **P2, phone record artwork:** the illustration's grid item grew to 306px inside a 175px slot and crossed the title. Evidence: 13-record-phone.jpg and DOM bounds. Fix: zero-minimum grid track/item with constrained image height. Post-fix 14-record-phone-fixed.jpg keeps the fox inside its slot and the title unobstructed.

No remaining actionable P0/P1/P2 found in the captured states. This is a scoped design/interaction review, not a blanket claim of production readiness.

## Source and comparison evidence

- Source visual truth: `docs/reference/selected-option-3.png`, 1487×1058 pixels.
- Matching desktop implementation: `docs/screenshots/approved-review/03-hero-desktop-stable.jpg`, 1487×1058 pixels, CSS viewport 1487×1058, DPR 1.
- Full-view combined comparison: `docs/screenshots/approved-review/hero-comparison.jpg`. Both source and implementation opened together, equal scale; a 40px label strip was added to the comparison artifact only.
- Focused heading/action comparison: `docs/screenshots/approved-review/hero-controls-comparison.jpg`, equal-coordinate crops of both inputs placed together. Used to inspect serif shape/wrapping, body text, camera action, spacing and secondary controls.
- Other checked sizes: normal browser 886×895 CSS pixels, initially DPR 2; explicit phone 390×844, DPR 1. The final normal-size screenshot is 25-final-entrance.jpg. Final DOM measures document width 886, height 895, viewport 886×895: no entrance overflow.
- Screenshot 02-hero-desktop.jpg is rejected: stale compositor dimensions after resizing. It is not evidence of a layout defect and is excluded from comparison.
- Phone views have no separate selected phone mock. They are assessed as responsive adaptations of the selected desktop direction.

## Required fidelity surfaces

| Surface | Visible assessment |
| --- | --- |
| Fonts and typography | Fraunces medium display serif and Atkinson Hyperlegible body preserve the source's warm editorial/game hierarchy. The two-line desktop headline is readable and unclipped; its exact line break differs from the mock because the layout is fluid. Normal and phone captures retain hierarchy. Long woodland label wraps inside its card. Small attribution/evidence text is secondary rather than a primary task. |
| Spacing and layout | Same fox-left / quiet camera-right composition. Independent foreground fox sits lower than in the flattened mock; this accommodates the requested separate moving layer. Pill primary and quiet secondary actions follow explicit later feedback. No photo baked beneath the primary action. Library phone cards stack with real photos. Dialogs scroll where needed rather than hiding controls. |
| Colors and tokens | Warm paper, dark forest green, muted blue body text, pale sage selected/support surfaces remain consistent with the source. Main actions have high visual emphasis, disabled choices are visibly muted, and supporting controls have readable labels. No formal full WCAG audit claimed. |
| Image quality | Genuine generated watercolor raster scenery and transparent fox, licensed real library photos, reused creature artwork. No replacement CSS/SVG drawings. Hero remains a 1536px source and terrain 2048px: no 4K claim. Fine watercolor detail is softer on very large/retina displays; future native art work may improve it. |
| Copy and content | Camera-to-review-to-explicit-assumptions remains clear. Rain comparison wording follows actual results, including more rabbits in this run. Saved SAM is named only on the garden; meadow review explicitly manual. Companions are imaginary visitors outside the food web. Voice attribution names Kokoro, not Meta. |
| Icons and surfaces | Phosphor icons retain one family. Capsule actions and soft cards follow the user's later shape request. Helping outlines now follow rounded choice containers. |

## Primary interactions actually exercised

- Entrance → three-place library, desktop and phone; garden and meadow selection.
- Garden water/tree/grass acceptance, original/mask toggle; explicit food choice required before starting.
- Some food → prediction → weeks 0, 1, 4, 13, 26, 52. Same-week usual-rain comparison and exact evidence dialog.
- Tap an observation → assembled explanation → finish. Actual discovery download reopened through the real file chooser at week 52 with its selected evidence retained. Download is structured experiment data without photo bytes.
- Forest entrance after the fix; neighbour picker → fox role/connection card → return; manual week; optional running weeks; journal opens and pauses the run; actual hunt record detail and phone view. Returning to the experiment retains the original 52-week result.
- Phone sound dialog: narration, original synthesized music, button sounds independently enabled; repeat narration available with transcript; returned all three to off. Playback handlers reported no failure. Subjective voice/music quality and actual speaker output still need human listening.
- Companions empty collection; Clover locally fitted movement, trot/walk choice, approval → welcome. Leaving without Keep leaves collection empty. Sunny saved exact-photo watercolor → fitted movement review.
- Local public dog-photo upload through the file chooser → animal route → same-photo companion handoff → dog/name → optional painting screen, disabled live provider → whole-photo movement fallback. No provider call.
- Meadow review with no confirmed plants recovers to a wider-view/library choice instead of inventing an ecosystem.
- Tutorial Got it, Skip hints, settings re-enable, desktop and inline phone placement.

## Comparison history

1. Earlier V3–V5 reports were blocked because browser automatic approval rejected access. Preserved at `docs/versions/v5/design-qa-before-manual-review.md`; no alternate browser was used.
2. User changed to normal manual approval. The in-app browser opened and fresh captures became possible.
3. Desktop review found the tutorial overlap; fixed and recaptured (05 → 06).
4. Forest transition exposed the Motion/React development error; fixed configuration, reloaded and exercised the actual forest (11–15).
5. Phone detail found image overflow; fixed and recaptured (13 → 14).
6. Phone hint found a collision; inline treatment fixed and recaptured (22 → 23), then dismissal and next review verified.
7. Final entrance captured at the restored natural viewport (25). Tests/build succeed; main checkout remains clean.

## Residual test gaps / follow-up polish

- Physical camera/microphone, speaker/listening quality, real touch-device frame rate, full screen-reader/keyboard audit, 200% zoom and ultra-wide views remain separate checks. No teacher/learner trial occurred.
- No live Meta/Baseten image/vision accuracy or billing evaluation was made; switches remain off. The three photos still use one validated meadow model, not separate habitat engines.
- Explicit collection Save/delete UI persistence was not exercised with user data; bounded writes/reloads/removal and unreadable-data preservation have unit coverage. Personal photos remained unsaved RAM previews during this review.
- P3: creature joint/gait refinement and native higher-resolution terrain remain worthwhile art polish. Current fitted/cached movement is illustrative.
- The custom-question, microphone, teacher, notebook, technology and reusable-tool pages in the main game still await their prototype design passes; see `docs/REVAMP-CHECKLIST.md`.

## Implementation checklist

- [x] Fresh permitted browser captures and combined reference comparisons.
- [x] Fix and recapture observed P1/P2 issues.
- [x] Main experiment, forest and creature routes checked through the interface.
- [x] Console reviewed; old error retained as history, no new errors after repair.
- [x] 26 tests and production/Sites packaging build pass.
- [x] Temporary viewport reset; local preview left open.
