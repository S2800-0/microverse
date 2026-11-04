# Microverse camera-first prototype — design QA

Date: 2026-11-02. Scope: faithful implementation of selected opening, plus a focused local example journey. This is design/functional QA, not learner research or ecological validation.

## Artifacts and normalization

- Source visual truth: `docs/reference/selected-option-3.png`, third displayed ImageGen result selected by the user.
- Implementation: http://127.0.0.1:8860/; source files `src/App.jsx`, `src/styles.css`.
- Final implementation capture: `docs/screenshots/entrance-desktop.jpg`.
- Source and implementation are both **1487×1058 pixels**; CSS viewport **1487×1058**, deviceScaleFactor **1**. No density resampling or browser/device chrome is included.
- State: initial entrance, sound off, no photo selected, no focused control in the comparison capture. The reference speaker appears on; off is intentional default behavior.
- Full-view comparison actually opened and inspected: `docs/screenshots/comparison-final.jpg` (source and implementation together).
- Focused comparison actually opened and inspected: `docs/screenshots/comparison-type-and-action.jpg`, equal 730,165–1465,590 crops of each frame, with added labels outside the content. This makes headline glyphs, wrapping, CTA/icon, subtitle and secondary actions readable together.
- Other responsive checks: 1280×800, 768×1024, 390×844. Matching browser captures are in `docs/screenshots/`. Responsive captures were refreshed after viewport changes to avoid reviewing a stale resized browser bitmap. Phone layouts intentionally stack the illustration and action hierarchy rather than shrink the desktop frame.

## Comparison history and resolved findings

### Initial comparison — blocked

Evidence: `entrance-before.jpg` and `comparison-before.jpg`.

- **[P1] Headline overflows the right edge.** First line centered while the reference is left-aligned. The 86.7px title made the second line wider than the available region. Reduced display scale to 5.18vw / 1.02 line height and aligned both lines left.
- **[P2] Main action oversized and too low.** Initial button 467×106px at y467, versus the compact source action around y430. Reduced to 61% of the copy region / 78px height, shortened the gap, and aligned the supporting group 30px left.

### Responsive and journey review — blocked pending fixes

- **[P2] Words concatenate when a forced desktop break is hidden on a phone.** Added explicit whitespace after breaks. The final visible review reads “Does this look like water?”; starting-assumption and reflection headings also wrap with spaces.
- **[P2] Phone review pushes its choices too far down.** Reduced the portrait preview to 230px height. The final phone review has acceptance at y670–728 and skip at y741–785, both inside 844px. Secondary recorded-example copy can continue below the fold.
- **[P2] Navigation loses contrast over the illustrated forest.** Added restrained paper surfaces behind wordmark/back controls on forest states and behind small labels where responsive hero crops place foliage beneath them.
- **[P2] Long story headline crowds the phone scene.** Shortened to “The deer searches.”; moved phone motion pause above the creature, and placed story text below it. Final primary action is fully visible and does not cover the animal.
- **[P2] Pause would remove the walk’s position class.** Keep the class and pause animation playback instead; stop the cached gait when its short travel finishes. This prevents the character jumping back on pause.

### Final comparison — passed

Evidence: the final full-view and focused paired comparisons listed above; `review-mobile.jpg`, `story-mobile.jpg` and final `entrance-tablet.jpg` for responsive checks. Source/implementation were reopened together after fixes. No actionable P0/P1/P2 differences remain within the prototype scope.

## Required fidelity surfaces

- **Fonts / typography:** Fraunces 500 provides the reference’s soft display serif; Atkinson Hyperlegible is bundled for body/control text, Georgia for the wordmark. Two-line headline, scale, line height, tracking and alignment preserve the reference hierarchy. Body remains readable, and phone copy wraps cleanly. Exact generated letterforms cannot be recovered as a font; minor glyph/weight differences remain P3.
- **Spacing / layout rhythm:** preserve large fox at left, quiet right-side sky, a single camera action, two subdued alternatives and a small footer. No repeated navigation/CTA inventory. Final camera control is roughly the source’s size and position. Phone/tablet layouts retain one decision at a time and no horizontal document overflow in checked widths.
- **Colors / tokens:** warm paper #f7f2e6, forest ink #203d2b, action #24462f, rain #38596a and rust #9a531c. Foreground/background balance matches the source. Paper label treatments are deliberate contrast improvements for crops; focus is a visible 3px rust outline.
- **Image quality / fidelity:** actual generated raster illustration retains fox pose, grounded paws, photograph, log, pond and foliage. No CSS/vector stand-ins replace it. Existing forest/fawn artwork is reused; dry meadow is a matched illustrative variant. WebP delivery retains the inspected composition with small texture differences. Original masters/provenance remain under `docs/assets/`.
- **Copy / content:** opening copy matches the selected mock. Supporting flow uses short concrete questions, allows uncertainty and avoids compulsory typing. Saved SAM guesses are identified as recorded and can be compared or skipped. New photos are manually reviewed. The experiment is explicitly an illustrative story, not live simulation or a real-place forecast. App instructions do not expose implementation detail unnecessarily.
- **Icons / states:** coherent Phosphor camera, sound, navigation and confirmation icons. Default-off sound, selected food, selected evidence, disabled continue, original/mask toggle, back and pause states work. Sound is interface feedback, not narration.

## Functional and accessibility evidence

Browser-rendered testing exercised:

- Full garden journey, including accepting a mask, skipping guesses, selecting plant food, choosing “Not sure” and “The plants” predictions, stepping through story events, selecting both evidence moments, finishing and replaying.
- Original/SAM overlay toggle; overlays apply only to the recorded garden.
- Loading a local PNG through the real file chooser; it arrives in **manual review**, with no SAM mask or new AI result claimed.
- Story JSON download. Checked prototype flag, review choices, food guess, prediction and evidence; no image data or photo field is included.
- Pause control and visible play/pause state; cached frame-based artwork and CSS travel respect pause. Reduced-motion handling is implemented but a changed OS preference was not exercised.
- Keyboard Tab reaches the home control; computed focus outline is 3px solid rust. Buttons are semantic, toggles expose pressed state, images have descriptions and screen changes focus the heading. Primary targets are 58–106px high; supporting actions have a 44px minimum.
- Opening has five controls. Other flow states stay within eight core controls including header and assumption disclosure; the full simulation toolbox is absent.
- Final browser console log check returned **no warnings/errors**. Current hero image loaded; document width equals viewport width. Final production build passes.

## Open questions / test gaps

- Physical camera hardware / permission capture was not tested; the browser capture implementation has an upload/example fallback. No camera permission was granted during automated review.
- No teacher or child participant trial, screen-reader session, full browser matrix, offline-service test or production AI integration is claimed.
- Food/review choices are preserved in the discovery artifact but do not change the scripted example. The real deterministic ecology engine, paired evidence and replay must be connected in the next implementation pass.

## Follow-up polish (P3)

- Fine-tune small subtitle/control font weight toward the generated reference if desired.
- The regenerated raster has small foliage/fur texture differences from the concept; composition and visual identity are retained.
- A dedicated portrait illustration could improve the phone entrance crop further; the current adaptation keeps controls and fox visible without squeezing the desktop image into a tiny frame.

## Implementation checklist

- [x] Selected visual target preserved in isolated project.
- [x] Source and implementation inspected together, including focused typography/action crop.
- [x] Initial and responsive P1/P2 issues fixed and rechecked.
- [x] Core example journey, local-photo path, replay and download exercised.
- [x] Browser errors checked; production build passes.
- [x] Current game left unchanged; preview remains local.

final result: passed
