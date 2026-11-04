# Companion journey: prototype V4

2 November 2026. Kept entirely inside the separate camera prototype. No main-game source, keys, provider flags, branches, published site or PR was changed.

## Source and direction

The existing collection and importer were inspected using the saved design-kit captures `c07-my-creatures.jpg` and `c08-creature-studio.jpg`, alongside the actual main-game code. Those captures show the old design, not the new implementation. The selected watercolor fox direction and V3 soft controls remain the visual grounding. The existing importer stacked name, species, upload, camera, samples, consent, two canvases and several acceptance actions inside one modal. This slice exposes those choices in sequence.

## Screens

| State | What the player does | Real behavior |
| --- | --- | --- |
| `pet-collection` | Create a creature or choose a saved one | Reads the existing validated browser collection; empty state has a real watercolor dog |
| `pet-source` | Pick photo, take photo, meet Sunny or Clover | Uses file/camera chooser; local files validated and re-encoded; camera permission/hardware still untested |
| `pet-details` | Choose dog/cat and optional name | No inference of pet identity or biological behavior; typing optional |
| `pet-look` | Keep the photo/cutout or reveal saved illustration | Sunny uses the actual licensed source photo and its earlier Meta illustration; no fake transformation |
| `pet-paint` | Optional appearance notes and explicit send consent | Existing image provider is paused; original image remains usable locally; no new calls made |
| `pet-preparing` | See actual work state, or stop waiting | Saved-asset decode, local fitting, or real combined painting/cutout stage; no guessed countdown/progress percentage |
| `pet-motion` | Inspect face/markings/feet; try walk/trot/rest if fitted; approve or choose simpler motion | Original transparent-image fitter and procedural renderer; opaque photos use whole-picture movement |
| `pet-welcome` | Meet companion in imaginary clearing; choose whether to keep it | No ecological rule change; save only on explicit Keep my companion |
| `pet-profile` | Revisit, download picture, return to collection or remove | Saved cutout/rig settings reopened; remove requires native confirmation dialog |
| Remove dialog | Keep or remove selected saved companion | Preserves others; failures retain collection data |

From the entrance, use **My companions**. A photo routed as an animal offers **Bring this creature to life**, carrying the already processed photo into the local journey. Returning to ecology resumes the current model if present, otherwise opens the three-place library.

## Reused work

Ten source modules copied unchanged from main commit `5bda15b`: creature client/job reader, collection, rig/analysis/fitting/review/edge cleanup/motion presets/puppet renderer. Source SHA-256 values are in `docs/assets/companion-reuse.json`. The existing PNG/rig validators and model contracts remain in `src/core/`.

- **Sunny:** original golden retriever photo by Mtlchung, CC0, and actual previous Muse Image + SAM watercolor result. Photo/illustration crop provenance retained from the main entrance manifest. See [original source](https://commons.wikimedia.org/wiki/File:Golden_Retriever_88.JPG).
- **Clover:** existing prepared Meta watercolor tabby cutout from main art, not a newly processed user pet.
- **Movement:** artistic dog/cat presets, not motion reconstructed from a single photo. Fitting can fail; whole-picture motion is explicit and never claimed as leg rigging.

Source transparency is checked before letterboxing. This prevents the empty border around an ordinary photo from being mistaken for a transparent animal cutout. All imports re-encode to bounded 640×640 PNGs before saving; no source filename, EXIF/GPS or original file is persisted. The processed image itself is personal data and is saved only on request.

## Image bridge and costs

`server/companion-bridge.mjs` is a local Vite development adapter around the existing main server's Meta provider, pipeline and loopback API checks. It does not send keys to the browser. It reads the existing configuration and clamps a separate ignored prototype ledger to at most one original pipeline reservation. The existing estimate is a guard value, not a freshly checked billing quote.

The actual existing settings remain:

- Meta image enable: 0
- Image credit confirmation: 0
- Image cap: 0
- Spark enable: unchanged, off

Therefore **live painting is disabled**. The consent screen says so, and the original photo and recorded examples are available. No switches were flipped, no promotional balance claim was invented and no paid test was sent. Production hosting would require its own funded server adapter; this local Vite route is not a deployed API.

## Voice and helping arrows

Eight new generic narration clips were generated once using the installed local Kokoro model. Existing clips are reused when their script matches. No names, photos, appearance details or learner text are narrated via a provider. Screen narration remains optional, with captions/repeat in settings. Actual listening review is pending.

Context hints appear on the source choices, movement stage and optional Save action. They inherit the prior dismiss/skip/replay behavior. No new tutorial overlay bypasses a native confirmation dialog.

## Verification and remaining work

Six new local tests cover bounded uploads, source transparency and empty images, mandatory movement approval, stale asynchronous fitting, explicit collection writes/round-trip/removal, and corrupted/unavailable storage preservation. The earlier engine and hosting tests still apply.

The preview has been restarted at the same local port. Fresh browser captures, keyboard interaction, camera hardware, animation quality, sound playback and complete click-through remain **unverified** because automatic browser approval remains blocked. No alternate automation or screenshot route has been used. See `design-qa.md`.

Next product slice after visual review: open exploration with a simpler clock, journal and actual creature/event close-ups. This companion clearing does not replace that ecology interface.
