# Microverse live-model extension — QA status

Date: 2026-11-02. This file supersedes the earlier scripted-prototype pass; that review is preserved in `docs/versions/v1/design-qa.md`.

## Result and blocker

**Final visual verification is blocked.** Automatic browser approval stopped the pet-photo upload check after reporting a usage limit. On resume, approval again rejected acquiring the existing local preview because the earlier browser restriction had not been cleared. No alternate browser, raw automation or screenshot workaround was used.

The [Product Design QA rule](/Users/shahy/.codex/plugins/cache/openai-curated-remote/product-design/0.1.56/skills/design-qa/SKILL.md) states: “If either artifact cannot be opened, captured, or compared, write `design-qa.md` with `final result: blocked` and name the blocker.” The prior v1 pass is not being reused as a final pass for this extension.

## Visual target and evidence

- Source visual truth: `docs/reference/selected-option-3.png`, 1487×1058 pixels, selected by the user.
- Existing approved implementation reference: `docs/versions/v1/src/App.jsx`, `docs/versions/v1/src/styles.css`, and the v1 captures under `docs/screenshots/`.
- Current implementation: http://127.0.0.1:8860/ with the new photo-routing and real-model flow.
- Current final implementation screenshot path: **not yet captured**. `docs/screenshots/v2/` is reserved for the resumed QA captures.
- Source density: 1487×1058 at the intended desktop CSS frame. Earlier live browser checks also used 390×844 at DPR 1.
- A normalized, paired full-view comparison and focused typography/action comparison of the current version are still required. Old images such as `comparison-final.jpg` compare v1 only; they are not current-version proof.

## Findings and fixes observed before the approval block

- **[P2, fixed and observed] Focused creature behind explanation.** The camera could clamp against the map edge and put the subject under the paper panel. The focus camera now follows the displayed creature in a reserved part of the view. Selected-creature mode is explicitly labelled; the wider population remains in the model.
- **[P2, fixed and observed] Phone controls below the viewport.** The live scene had a 900px minimum height in an 844px viewport. The final measured phone activity had document height 844, scrollY 0, and all eight controls visible; lower control bounds were 819px. Labels were shortened while retaining accessible names.
- **[P2, fixed and observed] Checkpoint advance retained an awkward scroll/focus position.** Week changes now move focus to the new heading and reset page scroll, preserving the context of the current question.
- **[P2, fixed by model validation/tests] A fixed narrative could contradict the simulation.** Headline and reflection options now derive from real food/population differences. The “Some” food run at week 52 recorded 13 rabbits with usual rain and 24 with less rain; the UI reported more rabbits rather than forcing a decline story.
- **[P2, fixed by runtime integration/tests] Food choice previously had no effect.** A little/Some/Lots now initialise the copied engine’s food arrays. Tests confirm different real outcomes with unchanged ecological rules.

## Required fidelity surfaces

- **Fonts/typography:** intended to retain the selected Fraunces/Atkinson hierarchy, explicit whitespace at hidden desktop breaks, and readable control sizes. Final current-version paired inspection remains pending.
- **Spacing/layout rhythm:** chosen entrance is retained, with a small Open a discovery action. The live scene introduces a labelled single-creature view and matching-week comparison. The 390×844 activity was measured after the layout fixes; unsupported-photo layouts still need browser inspection.
- **Colors/tokens:** existing paper, ink, green, rain-blue and rust tokens are retained. Final contrast/crop review for new route states remains pending.
- **Image quality/fidelity:** existing raster forest/creature artwork is reused. The painterly food tint follows aggregate model grass, not measured ground cover. No new image generation was needed. Final edge/crop and default-rabbit focus inspection remain pending.
- **Copy/content:** actual observations replace the scripted rain story. Photo routing offers alternatives and manual uncertainty; no photo is declared a scientifically validated ecosystem. The optional Spark suggestion requires confirmation. The model remains a fixed meadow, not a reconstruction or a site forecast.

## Functional verification already performed

- Garden mask review, acceptance/skips and no-confirmed-plants fallback.
- Starting-food choice, prediction and model checkpoints through week 52.
- Normal-rain/less-rain switching at the same model week; actual numeric records at week 13.
- Tapping actual observations to assemble an explanation; finishing and downloading a discovery.
- Reopening a generated saved discovery through the browser file chooser at week 13.
- Parsing the actual downloaded week-52 file and replaying it locally; no image bytes were present.
- Local tests cover unsupported routes, incomplete/uncertain review, food-sensitive outcomes, exact rewind/reopen, forged rule/food/scenario/evidence rejection, and mocked inference funding/consent/cache/no-retry behaviour.

## Open checks

1. Request fresh browser approval after the usage restriction is cleared; retain the same intended local preview and normal browser controls.
2. Test pet, plant close-up, other landscape, object and unclear-photo screens. The failed pet upload was not executed and is not counted as tested.
3. Inspect the final default rabbit focus, comparison, records dialog, reflection and replay at 390×844 and desktop sizes.
4. Capture current implementation screenshots; compare the unchanged entrance with the chosen mock at 1487×1058, and compare typography/control regions together.
5. Check the final browser console and keyboard/modal interactions. Restore the normal viewport and keep the local preview open after approval.

No physical camera, learner/teacher participant trial, live scene-classifier accuracy test, publication or merge is claimed.

final result: blocked
