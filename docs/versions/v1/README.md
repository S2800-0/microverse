# Microverse · camera-first design prototype

A separate, interactive interpretation of **the third displayed Product Design concept selected on 2 November 2026**. The original `microverse-hackathon` game and earlier wireframes are unchanged.

Local preview: http://127.0.0.1:8860/ (already running during handoff).

## Try it

Start with **Try the garden** for the complete example:

1. Review saved water, tree and grass candidate masks, one at a time. Compare each with the original photo, accept or skip.
2. Choose a starting plant-food assumption. The photograph does not measure food availability.
3. Predict what may change when rainfall decreases; “Not sure” is welcome.
4. Follow an illustrated story: reduced rain, drier meadow, young deer searching. Pause movement if needed.
5. Tap the observed moments to assemble a sentence; no compulsory writing.
6. Replay or save a small discovery JSON. Downloads exclude the photograph.

**Choose a photo** accepts JPG, PNG or WebP (up to 15 MB / 36 MP). It resizes and re-encodes locally, then offers manual review. No recorded SAM overlay is applied to a new photo. **Take a photo** implements browser camera capture with an upload/example fallback; actual camera hardware has not been tested in this session. Camera tracks stop when leaving the capture screen. Nothing is sent to Meta, Baseten or another inference service. Photos and answers live in memory; there is no account or saved collection.

The speaker control enables gentle interface confirmation sounds. It is not AI narration or speech-to-text. Sounds default off. Motion respects the operating system’s reduced-motion preference and has a pause control in the story.

## What this prototype proves—and what it does not

This is a UX prototype with a repeatable **illustrative storyboard**, not the production ecology engine, a calibrated model of a real site, or a completed live SAM/Spark integration. Review choices, food assumption and prediction are recorded in the discovery download; they do not alter the scripted story outcome. The interface labels the story as illustrative. A photograph inspires the fixed map; it does not reconstruct the place.

The next implementation pass should connect this reviewed flow to the existing project’s validated place inputs, deterministic paired experiment state, real event records and replay. Only then should outcome text describe computed changes. Keep the visual causality grounded in those records, and keep photo observations separate from ecological assumptions. Pets remain optional later work.

## Design and assets

- Visual source of truth: `docs/reference/selected-option-3.png`.
- Palette: warm paper `#f7f2e6`, forest ink `#203d2b`, green action `#24462f`, rain blue `#38596a`, rust `#9a531c`.
- Fonts: [Fraunces](https://github.com/undercasetype/Fraunces) and Atkinson Hyperlegible, bundled locally through Fontsource. The wordmark uses Georgia to match the reference.
- Icons: [Phosphor React](https://github.com/phosphor-icons/react), a coherent family of camera/sound/navigation icons. No handcrafted vector illustrations replace the artwork.
- Hero: built-in ImageGen edit of the selected mockup, removing UI while preserving the fox/landscape/photo composition. Raw master and exact prompt/provenance: `docs/assets/hero-stage.png` and `docs/assets/hero-stage.provenance.json`.
- Dry meadow: built-in ImageGen edit of the existing forest. Exact prompt and caveats: `docs/assets/forest-dry-provenance.json`. This is illustrative artwork, not a model-generated ecological forecast.
- Forest and fawn atlas/motion: copies of existing project assets; original source files retained in the main project. The fawn uses the existing saved 24-pose walk, not new inference.
- Garden: Jon Sullivan public-domain photograph, with masks derived from the existing recorded Meta SAM 3.1 example (27 October 2026). Candidate masks can be wrong, and are explicitly reviewable.
- WebP delivery copies preserve the raster layout while reducing the three large illustrations from 9,668,820 bytes to 1,453,498 bytes (about 85%). Raw PNG masters remain under `docs/assets/`. See `asset-optimization.json`.

## Verification

`npm run build` passes. Browser review covered 1487×1058, 1280×800, 768×1024 and 390×844. The complete sample journey, acceptance/skips, mask toggle, food selection, prediction, motion pause, evidence sentence, replay and download were exercised. A local photo was loaded through the manual-review path. The JSON download was checked to exclude image data. Browser console had no warnings/errors in the final check.

The visual comparison and remaining test gaps are in `design-qa.md`; screenshots are in `docs/screenshots/`. There was no teacher/learner usability trial, real camera hardware test, AI call or public deployment.

For a later session, `npm run dev -- --host 127.0.0.1 --port 8860 --strictPort` starts this preview. The bundled Product Design hosting runtime is preserved for a future explicit sharing request.
