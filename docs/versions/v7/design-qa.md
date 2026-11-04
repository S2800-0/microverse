# Microverse prototype — V7 expansion review

Date: 2 November 2026. Scope: isolated camera-first expansion, with the previously reviewed land/companion flow retained. This is not a review of every main-game page, a learner trial or a claim of scientific calibration.

final result: passed

## Source and rendered comparisons

- Layout source: `docs/reference/selected-option-3.png`, 1487×1058.
- Later approved branding source: `docs/brand-options/brand-little-field-club-v7.png`, third displayed board. Exact implementation colors/type are specified in `docs/BRAND-KIT.md`; generated board hex labels/letterforms are approximate.
- Fresh matching implementation: `docs/screenshots/expansion-v7/18-hero-desktop.jpg`, viewport/screenshot 1487×1058, DPR 1. Opened the combined full comparison `hero-full-comparison.jpg` and equal-coordinate focused comparison `hero-controls-comparison.jpg` to review both inputs together.
- Intentional approved differences from the earlier mock: Baloo 2 instead of display serif, icon/live wordmark, capsule controls, library instead of a single garden link, separate moving fox/background with lower fox placement, optional companion/discovery links and no baked-in photo beneath the action. These follow subsequent user requests rather than an accidental mismatch.
- Phone evidence: 390×844. No selected phone source exists, so these are responsive adaptations. `phone-checks-contact.jpg` opened to inspect hero, sound settings, painting, forest hint and reef at one scale.
- Final normal-size entrance: `22-final-entrance.jpg`, 887×895. DOM viewport/document widths both 887; no horizontal overflow. Temporary viewport override reset; user-facing tab left open and marked deliverable. Separate hidden QA tab closed.

## Visible design assessment

| Surface | Findings |
| --- | --- |
| Type / hierarchy | Rounded Baloo 2 headings and Atkinson body text are bundled locally. Rain question is the primary heading rather than a small eyebrow. Forest time explains seven pretend days. Desktop and phone entrance headings remain unclipped. |
| Layout / attention | Camera action leads, library has three distinct labelled Polaroids. Optional settings/questions use separate panels. First forest hints hide the large intro and defer event prompts, then reveal these once guidance ends. |
| Color / branding | Canonical cream/forest/moss/seed/clay tokens applied; new fox-world icon and live wordmark readable on quiet backing. Accent shades are not default body text. Formal contrast/accessibility certification is not claimed. |
| Artwork / motion | Garden, woodland and reef are visibly different raster scenes. Food choice uses generated plant cutouts. Existing fox mesh, leaf assets and subtle background motion run locally. Hero is still a reused raster source; no 4K or measured device-frame-rate claim. Exact new-art collision alignment remains a technical follow-up. |
| Phone / controls | Rounded controls and panels fit 390px width. Painting screen scrolls naturally to support text, reef keeps coral above its card, forest hint leaves the dock visible. Settings dialog scrolls to repeat/transcript controls. |
| Copy / truthfulness | Paintings provide appearance; curated rules provide behavior. Garden/woodland share land ecology. Reef stress/timing is explicitly invented for teaching. Custom answers are tied to validated rain records; no arbitrary photo is silently treated as a reef. |

## Issues caught, repaired and recaptured

- **P1: empty initial canvas.** Prediction screenshot `10-rain-question.jpg` showed a blank world before scenery decode. Added immediate real-map backdrop plus a truthful loading status; wait for chosen landscape before rendering it. `11-rain-question-ready.jpg` shows selected garden art, focused rabbit and prominent rain question.
- **P2: weak food preview and misplaced caption.** `07-food-none.jpg` / `08-food-lots.jpg` exposed a caption at page bottom and diagonal-looking correlated plant placement. Authored varied patch coordinates and flow-positioned caption. `09-food-lots-fixed.jpg` shows distributed lots-of-food patches and caption directly beneath. None displays zero patches.
- **P2: reef picture hidden on phone.** `05-reef-phone.jpg` showed the card covering the main coral area. Phone layout now reserves a visible coral stage above the card; `06-reef-phone-focused.jpg` confirms the picture and question coexist. `04-reef-warm-settled.jpg` shows the completed pale-coral state, not a capture during the crossfade.
- **P2: forest guidance obscured its controls.** `14-forest-intro-phone-stable.jpg` shows the phone hint colliding with the dock. Position against the whole dock on narrow screens, and remove competing intro/AI/event prompts while tutorial is active. `15-forest-tutorial-fixed.jpg` leaves Let it grow, One week, Meet a neighbour and Forest journal visible. Actual neighbour and journal actions complete guidance.
- **P2: painting default misclassified known garden.** Consent review initially preselected reef for every photo. Known library IDs now preselect their kind; unknown uploads require a choice. Browser reentry confirms Garden; `20-painting-consent-desktop.jpg` and `21-painting-consent-phone.jpg` show it. Generation remains disabled until explicit consent; no extra paid call was made for this UI check.
- **Functional verification: alternate-voice manifest.** A partial regeneration wrote an incomplete credits manifest despite complete files. The preparer now always writes the final complete manifest, including reused clips. Both 21-state voice manifests match the narration script and pass tests.

Screenshot `13-forest-intro-phone.jpg` is excluded: stale compositor size immediately after viewport change, not a product defect. Early immediate reef crossfade screenshot `03-reef-warm.jpg` is not used as final bleaching evidence.

No remaining actionable P0/P1/P2 was identified in the captured V7 states. Earlier approved V3–V5 findings/checks are preserved in `docs/versions/v6/design-qa.md`.

## Interactions and integrations actually checked

- Entrance, new brand and three-place library; garden and island reef routes.
- Garden real recorded-mask review, explicit food selection, full 52-week computed run, same-week comparison and retained forest entry. Fresh food-none/lots and prediction screenshots are saved.
- Forest phone guidance, actual time step, neighbour card/return and journal. Guidance completes and deferred actual-event prompt returns.
- Question panel: prepared answers plus a real custom Meta Spark answer against validated replay evidence. Two guide calls total; one integration report at `runtime/question-smoke-v7.json`. Recent relevance narrowing has unit coverage; no gratuitous repeated paid test.
- Reef prediction, warm checkpoints, usual-condition comparison and cooling path. Paling is a matching second artwork driven by bounded model state, not a static unrelated map or land simulation.
- Real local paint API accepted the smaller supplied island photo, returned HTTP 200, a painting and its matching pale-coral variant. Report `runtime/expansion-art/paint-api-smoke.json`; outputs inspected; `photo-to-watercolor-comparison.jpg` records source/output. UI consent gate and enabled-state behavior tested separately without another generation.
- Sound settings initially music/effects on and narration off. Selected Emma, enabled narration, invoked Read this again, then turned narration back off. No console playback error reported. Browser audio elements are created outside the rendered DOM, so DOM enumeration is not proof of audible output; human listening remains pending.
- Final browser warning/error histories empty in both user-facing and QA tabs. 32 automated tests pass; Vite/Sites production packaging passes.

## Resource use and boundaries

User authorized up to $1 Meta promotional-credit testing. Local shared ledger reserves $0.75 across 15 attempts: 12 returned images, two Spark calls and one failed network attempt. Meta's published image rate implies about $0.12 for the returned images plus Spark usage; billing balance/payment source was not rechecked. Failed attempt stays reserved. No Baseten/AWS calls in this pass. Existing main switches unchanged; local permit expires. No deployment/merge/commit.

## Residual checks and remaining product work

- Real teacher/learner observation, hardware camera/microphone, human voice/music listening, keyboard/screen-reader/zoom audit and real touch-device motion performance remain unverified.
- Photo-to-world client upload/generation/result is not yet exercised end-to-end through a new file-chooser session in this V7 review. Earlier photo upload/reencoding/handoff was browser checked; V7 consent UI and actual backend painting were checked independently.
- Exact terrain/collision alignment for newly generated land artwork is not validated. Reef has no calibrated temperature scale, species-specific food web, mortality or population forecast. A prompt alone does not supply these.
- User-supplied island photo has unresolved redistribution rights. Keep local until cleared/replaced before public release.
- Teacher/notebook/resource-use/tool-library/microphone/scenario-command surfaces and eventual approved main-project integration remain on `docs/REVAMP-CHECKLIST.md`.
