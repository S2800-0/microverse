# A reviewed place-inspired starting point

Choose **Place photo**. A JPEG/PNG/WebP file or phone capture is resized locally to at most 640 pixels on the long side and re-encoded without source EXIF/GPS. No camera permission is requested automatically. The optional Meta action sends this processed image for three SAM labels: **grass**, **tree**, **water**. The photo stays local until explicit consent and Analyse with Meta. Manual review and the recorded example work without inference.

**Try recorded place example · no API call** loads a public-domain garden photo and its actual saved SAM result, clearly labelled as recorded. Source: [Garden pond in park, Jon Sullivan](https://commons.wikimedia.org/wiki/File:Garden_pond_in_park.jpg), author's public-domain dedication verified October 27, 2026. The 288 × 384 derivative has metadata removed. `public/places/manifest.json` records attribution, processing and file hashes. This is the only new photo committed; personal creature photos/results remain ignored.

## Measurement and review

SAM returns candidate object masks, not ecological facts. Multiple masks for one label are unioned in source-image coordinates, so overlapping instances count once. Cross-label pixels are assigned in explicit priority **water → tree → grass**. The UI reports overlap and unclassified shares. It overlays the candidates and allows manual adjustment; reviewed shares must sum to at most 100%.

The denominator is the processed **image's pixels**, including sky/buildings/rocks/unclassified regions. Perspective, occlusion, reflections, resolution and SAM errors affect the values. They are not ground-area estimates, canopy surveys, biomass, food availability, habitat suitability or proof of absence. A zero result means no candidate pixels. A SAM “tree” candidate can include ambiguous woody vegetation; inspect the overlay rather than trusting the noun.

The live public-domain example returned 2 grass candidates, 3 tree candidates and 1 water candidate: approximately 0.98%, 11.57% and 22.39% of image pixels, with 65.06% unclassified and no cross-label overlap. These are model outputs from one image, not manually verified ground truth or a segmentation accuracy benchmark. Three HTTP 200 responses verified the live payload/parser path.

## Explicit mapping into the model

Image shares and model food are separate controls. Food values initially retain the current forest's levels. **Use reviewed grass share for grass food** is an optional illustrative proxy; the user may choose another index. Shrub food is chosen separately because tree pixels do not establish edible browse. Water/tree image shares are contextual in this slice: they do not move creeks or change hydrology, walkability, animal numbers, species roles or rules.

The review checkbox and **Apply reviewed starting food** are required. Application pauses the forest, sets grass/browse arrays uniformly on its existing open cells and records the chosen inputs at the current model week. It preserves all creatures, appearances, RNG state, events, parameters and fixed map topology. It does not reset the forest or silently insert real-world species. Existing closed terrain cells remain zero-food.

This is a photo-inspired model initialization, not reconstruction of a real ecosystem. Generated map skins, spatially registering a photo to the map, hydrological effects, ecological calibration and site forecasts are not implemented. The starting-point change is recorded as scene metadata rather than an engine event; paired experiments fork the resulting full state.

## Replay and data handling

The optional scene `place` record (version 1) contains processed dimensions/source hash, method, estimated/reviewed shares, chosen starting food and application week. Full replays, model-only reruns and worksheets retain these numeric choices. Comparison/field-note text distinguishes them from measurements of a real forest. Neither the source place photo nor masks are serialized; closing the dialog clears them from that UI. Source hashes and metadata are provenance records, not cryptographic proof of a classification. Old replays without a place record remain readable.

The server temporarily caches up to four successful results by source hash. It does not write source photos or results to disk. Explicit development receipts are ignored runtime files. There is no public upload service, automatic photo persistence, arbitrary provider URL or provider key in the browser/static build.

## Activation and budget

The example configuration defaults off. After confirming Meta funds, set these in ignored `.env` and run `npm run preview:meta`:

```dotenv
MICROVERSE_PLACE_ENABLED=1
MICROVERSE_PLACE_CREDITS_CONFIRMED=1
MICROVERSE_PLACE_CAP_MICRO_USD=15000
```

Each complete attempt reserves **$0.0075** (three SAM still-image calls at $0.0025 each) in `runtime/place-budget.json` before any call. The initial $0.015 ceiling includes the one live example check, leaving one complete further attempt. It is independent of creature, Spark and dictation ledgers. Failed/partial attempts retain reservations; there are no automatic retries/refunds. One distinct job runs at a time. Requests have bounded PNGs, at most 24 objects per label and a three-minute overall signal. Same-origin, loopback Host and per-process session guards protect POSTs. These local reservations are not provider billing controls or proof of credit/card debits.

Official references checked: [SAM requests and one-concept prompts](https://dev.meta.ai/docs/sam/overview), [mask grammar and valid zero matches](https://dev.meta.ai/docs/sam/reading-segmentation), [Meta pricing](https://dev.meta.ai/docs/pricing-rate-limits). The existing single-subject creature adapter remains strict; allowing multiple/zero masks applies only to the place-label path.

## Verification

Tests cover cropped-mask union, overlapping instances/classes, empty candidates, invalid dimensions/labels, funding/consent/cache, failure without retry, atomic review validation, preserved creatures/RNG/rules and exact replay continuation. The recorded sample's hash and mask arithmetic are checked offline. Browser review covers recorded masks, manual adjustment, explicit application and field-note context. A user's own outdoor photos, phone camera hardware and teacher/learner understanding remain untested.
