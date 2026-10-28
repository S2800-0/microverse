# Meta artwork pass and fox guide

Requested by the owner October 29, 2026 (Cairo), using the existing artwork as references. The new public files are Meta API reference edits and SAM/local derivatives, not claims that all source material originated with Meta. The pre-event/public art and owner-supplied entrance originals remain unchanged.

## Which key does what?

| Feature | Provider and model | Private server-side key |
| --- | --- | --- |
| New art and pet watercolor illustrations | Meta · `muse-image-1.0` | `MODEL_API_KEY` |
| Creature cutouts, place masks, foreground isolation | Meta · `sam-3.1` | `MODEL_API_KEY` |
| Spoken question transcription | Meta · `muse-voice-transcribe-1.0` | `MODEL_API_KEY` |
| Custom experiment proposals and evidence/guide selection | Baseten · `meta-models/muse-spark-open-1026` | `BASETEN_API_KEY` |
| Optional explicitly selected alternative Spark host | Meta · `muse-spark-1.3` | `MODEL_API_KEY` |
| Prepared questions, simulation, replay, movement and sprite playback | Local code | None |
| Optional natural narrator | Local Kokoro Heart | None |

The Baseten grant/key covers its exact hackathon Spark model; it is not the image/SAM funding pool. There is no automatic provider fallback. Baseten remains paused after its numeric interpretation failure; see [investigation.md](investigation.md). Neither key belongs in browser code. The art-review page uses saved PNGs and makes no inference calls. Normal paid-feature flags remain paused; this explicitly requested batch is a separate bounded CLI operation. No AWS calls were made.

## Recorded requests and costs

The art batch made **14 Muse Image edits and 12 SAM image calls**, including two deliberate follow-ups: a standing cat after the first returned seated, and a wide walk sheet after the original importer rejected a 2240×1120 result. No automatic retries occurred. The first walk result was not saved as an image because dimension validation failed before writing; the failed receipt and reservation remain. The corrected importer accepts up to 4096 pixels on an edge while retaining the 4,194,304-pixel total bound.

At [Meta's published prices](https://dev.meta.ai/docs/pricing-rate-limits), checked October 28, Muse Image is $0.01 per returned image and SAM is $0.0025 per segmented image. This batch estimates **$0.17**. Sixteen conservative job reservations total **$0.20**, including full $0.0125 reservations for image-only and SAM-only jobs. Prior image tests retained $0.075, so the shared ledger now retains **$0.275** under a $0.325 ceiling (at most $0.25 added by this request). Reservations are not actual charges or an account-wide billing limit. Promotional debit and current account balance were not verified. The earlier guide-expression pair was one additional image plus one SAM call, estimated $0.0125, and is included in the prior ledger total rather than this batch count.

## Delivered and observed

`/art-review.html` shows 15 candidates: fox, wolf, buck, doe, fawn, rabbit, dog, the first seated cat, its standing correction, ecology map, entrance forest, clean background, eight-pose walk sheet and both foreground masks. It offers original-reference comparisons and a local playback preview of the registered walk. Public hashes, dimensions, source hashes, prompts, processing details and the failed attempt are recorded in `public/meta-art/manifest.json`; private API receipts and masks remain ignored in runtime.

- The standing correction visibly restores the cat's four-legged standing posture. The first seated image remains labelled portrait-only.
- The doe is a separate generated antlerless illustration, so the future art switch need not erase antlers from the buck.
- SAM found eight fox poses. Local connected-alpha cutting, uniform scaling and shared foot/nose anchors produced a 2048×1024 atlas; thresholded foot baselines span two pixels. Pose shape/tail variation remains visible, so this is a review candidate rather than an approved gait.
- The left-foreground request selected both forest edges. It is labelled **Mask needs review** and is not used as an independent left plane. The right cutout is saved separately. The clean-plate edit also changed distant details; exact layer registration is not established.
- The ecology map resembles the source layout, but exact alignment with the fixed creek/tree/rock geometry is not established. The game's existing map stays in use until that check passes.
- New animal illustrations have not been accepted with the game's existing rig settings. They are gallery candidates. Neither a returned mask nor a correct-looking thumbnail establishes animation quality.
- The earlier Meta guide portrait is installed in the entrance's Play now choices, alongside the new Meta fawn/dog as static choice illustrations. Those same static examples appear in the landing's weather/creature sections; no rig acceptance is implied. Its blink/mouth poses use one reusable atlas and bounded local timers. Motion pauses with the global control/reduced-motion preference, stops when hidden/offscreen, and falls back to a simple fox marker if its image fails. Mouth switching is decorative, not phoneme lip sync. This slice does not add paid speech or change the real creature-creation backend.

## Reproduction and limits

`node scripts/generate-meta-art.mjs` lists the fixed plan without sending requests. `node --env-file=.env scripts/generate-meta-art.mjs --run` is an explicitly paid operator action against the fixed Meta destination. Existing attempt receipts cause jobs to skip, including failures; neither receipts nor ledgers should be deleted to force more calls. New/refined art needs a deliberate new plan entry and a cap review. Requests disable search/shell tools, refuse redirects, use one image per generation, retain reservations on errors and have no retry loop.

After authorized requests, `python3 scripts/prepare-meta-art.py` composes saved cropped SAM masks in source coordinates and exports gallery copies without repainting or recoloring. It requires Pillow. `prepare-walk-sheet.py` cuts the saved walk poses. The original unmodified Muse outputs are kept in ignored runtime storage; the source paintings are not overwritten. No private animal photos are used in this batch. The real place-photo example remains a photograph with its existing attribution and recorded masks.

Next adoption gates: owner art preference; manual left-mask/layer registration cleanup; map-versus-terrain overlay; and individual sprite rig/motion review. These are visual/engineering checks, not participant usability or ecological validation.

Validation: 144 offline tests, syntax check and production build pass. Browser checks show the gallery and original comparisons, greeting caption/pose transitions, pause control, eight-pose playback availability, and the entry dialog at 390×844 with no horizontal overflow. Physical devices, OS-level reduced-motion setting and external participant testing remain pending.
