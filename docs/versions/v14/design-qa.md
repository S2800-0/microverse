# Design QA · V14 scoped follow-up · 3 November 2026

Scope: user’s hero-tree blur, destination-labelled back buttons, animal deselection, own-photo readiness and the first checked animal-knowledge pack. Retains approved Little Field Club styling and the V12 work. Main production project is not replaced.

## Sources and paired evidence actually opened

- Original selected visual: `docs/reference/selected-option-3.png`. Approved amendments/palette: `docs/BRAND-KIT.md` and V12 QA archived under `docs/versions/v12/design-qa.md`.
- Immediate full-view truth for this scoped change: `docs/screenshots/release-v11/27-hero-final-source-size.png`,1487×1058, home. Current: `docs/screenshots/navigation-v13/14-current-hero-full.png`,1487×1058, home. Both1 image pixel/CSSpx; DOM viewport and decoded images checked before capture.
- Full comparison opened as one input: `navigation-v13/15-source-current-full.jpg` (2974×1085,27px captions). Preserves composition, copy, art, buttons and support cards; the requested duplicate-canopy removal sharpens the upper-left tree. Fox/leaf positions vary with normal motion.
- Focused blur comparison opened: `05-hero-blur-comparison.jpg`, matching440×390 crops from886×895 before/after captures. Shows the double image removed.
- Focused back-control comparison opened: `06-back-comparison.jpg`, matching header crops from886×895 library captures02/04. Back becomes a labelled destination and outlined rounded action. No unrelated page redesign.
- Library full captures02/04 and combined13 occur during different Polaroid entrance frames. **Do not use13 as a settled full-layout comparison.** Header06 remains valid because that region is settled. Full-view QA uses the settled hero pair15.

## Findings and fixes

| Priority | Finding | Fix / post-fix evidence |
| --- | --- | --- |
| P2 | Top-left trees soft/doubled | Removed the scaled moving duplicate background overlay. Retained original art, fox, falling leaves and water. Full15/focused05 confirm requested change. |
| P2 | Generic Back gave no destination; saved worlds led to photo triage | Shared navigation map names Home/Choose a world/Your photo/review step. Saved-world back returns library; uploaded-world back returns its photo. Header06, phone08, actual world→library navigation. |
| P2 | No obvious way to end animal focus | Stop following plus empty-ground tap, repeated selection and Escape. Tutorial button/keyboard, living-world button/keyboard and native empty-ground tap exercised;07/09/11. |
| P2 | Back from lesson silently reset progress | Prediction edits now retain elapsed results; Return to world cancels the edit. Phone10/11 both keep week1 and the83 food scale; unit test also preserves week13 counts. Initial prediction hint/voice is suppressed when editing after time has passed. |
| P1 | Newly wired companion back-label callback was not declared in component inputs | Added the missing callback input. Reproduced then verified collection→Create→photo source→My companions→Home.16-companion-source-fixed.png; no new errors after fix/integration. |
| P2 | Checked fact bubble could scroll its close icon out of reach | Close stays within scrolling bubble; companion toggle uses the same close/stop action. Rect verified fully inside, actual toggle closes.12 final screenshot. |

## Current functionality actually checked

-59 automated checks pass, production/Sites build passes. Logs `runtime/tests-v14.log`, `runtime/build-v14.log`. New tests cover shared creature-stage reservations, contextual back routes/progress, source/alias integrity, incompatible nature habitats, unknown rig fallback and zero-provider-call checked answers.
- Phone390×844: destination header fits, document width390; Stop following, week1→edit prediction→week1, no silent restart. Full year/recap/three scripted journeys remain documented in V12 results; they were not falsely re-run end to end after every copy change.
- Eight reviewed catalog profiles feed the planner/compiler and local field notes. Browser: selected Pond Goldfish→Tell me about this animal gave its USGS-linked fact and explicit game simplification. Typed What do foxes eat? worked without consent/provider call and labelled it a general fact, not an observed fox.12 screenshot.
- Companion collection/source opens after the callback fix. Local status checks returned both services enabled with350000 remaining under2000000 total cap. No new agent photo generation. User opted to choose/upload their own photos; quality of those future results remains unverified.
- Fresh console checks after catalog integration returned no new warnings/errors. Historical development errors are retained, not relabelled. A stale computer-control session was reset using its supported tool; the same browser/tabs were retained. Temporary viewport override reset successfully; both original and verified preview tabs preserved.
- Main clean at5bda15b. Ledger remains1650000 reserved/33 attempts at final check; no new Meta calls for navigation, facts or research. Reservations are not verified billing. Not committed/merged/deployed.

## Limits / P3 follow-ups

The local catalog is eight checked examples/groups, not broad on-demand API retrieval, universal species identification or universal rigging. The retrieval roadmap identifies verified sources but is not advertised as implemented. Game rates are not calibrated. Unknown animals use bounded/basic movement; not every animal has articulated legs/wings. Own-photo output quality, hardware camera/mic, real-device FPS, full accessibility and real participant usability still need checks. Existing source-photo rights need clearing before publishing.

Phone food-preview/choice proximity and long-world-panel scrolling remain P3 refinements from V12. Bundle-size warning remains; no measured performance claim. All46 main-project surfaces, deployment, final demo rendering and submission remain separate release work.

No actionable P0/P1/P2 remains in this checked slice after the listed fixes and retests.

final result: passed
