# Procedural motion and reusable rig review

The tested prototype's transparency cuts, textured mesh deformation, gait presets and edge cleanup are migrated into `src/motion/`. The old dialog/HTML is not required by these modules. They make no provider requests and do not change ecological rules.

## API boundaries

- `motion-library.js`: allowlisted artistic profiles, gait parameters, and a reusable sprite prompt. Speeds are presentation tuning, not measured biological traits. Penguin/rabbit presets do not imply a supported articulated rig.
- `rig-analysis.js`: DOM-independent pixel suggestions and geometry checks. Four pieces alone do not prove correct anatomy.
- `rig.js`: browser-canvas connected components, thigh overlap and extracted leg canvases. Input cuts must be finite/in-range; input images must be resized to at most four megapixels. `groundOnly` keeps hanging tails out of imported foot counts.
- `puppet-motion.js`: foot-contact target, two-segment inverse kinematics, continuous limb texture deformation and canvas rendering. No full-body anatomical reconstruction.
- `rig-fitting.js`: bounded cut/split proposals, using the reviewed prototype strategy. It supports dog/cat-style quadrupeds only.
- `rig-review.js`: view-independent state controller, injected fitter and `onChange` listener. States are empty, preparing, review, accepted and fallback. Only explicit acceptance approves an articulated candidate; edits clear approval and stale async completions cannot replace a newer input.

Any future modal, wizard, side panel or mobile layout can use the same review controller. The simulation has no imports from these UI modules. A creature's ecological profile and rendering/rig identity should remain separate when the forest view is introduced.

## Review findings and changes

1. Invalid gait, limb and rig-cut values could propagate NaN or produce misleading geometry. Validation now rejects them and tiny limb lengths use a scale-relative reach tolerance.
2. Geometry review accepted out-of-range pivots or nonpositive limb lengths. These are now warnings that prevent approval.
3. The original dialog combined fitting, controls and approval. Reusable controller/fitter modules now handle state independently and invalidate accepted rigs on changed motion.
4. The original prompt rejected all props. It now asks to retain visible worn accessories such as sunglasses, without inventing new ones. This is a prompt improvement, not a verified Muse Image result.
5. Non-quadruped presets previously cited a quadruped inspiration source. They no longer claim that reference.
6. Browser verification found and fixed the root preview script path and an opaque-input error path that disabled the whole-image fallback.

## Developer example

```sh
npm run preview:motion
# http://127.0.0.1:8895/
```

The workbench is a disposable developer view, not the final product UI. It includes separated/merged legs, opaque-image rejection, gait changes, pause, explicit review and whole-image fallback. The built-in animal is drawn in canvas code, with eyewear retained as torso pixels. Optional `MICROVERSE_TEST_SPRITE` points to an existing local PNG for QA; that image is served only over loopback and is not included in the repository. Use project artwork with permission, never private photos for public screenshots.

Manual browser verification for this branch: separated fixture fitted; merged hind pair auto-split and rendered; acceptance disabled until review; gait edit restored unapproved review; opaque input produced a fallback with an available selection button; penguin profile used a clearly labelled whole-image fallback; existing generated prototype dog fitted and was visually reviewed in the migrated renderer. The synthetic fixtures and one dog do not establish arbitrary-photo rigging quality. Mobile layout and OS reduced-motion settings still need device checks; the preview implements reduced-motion preference handling.

Head and accessories currently stay in the torso image. Independent head/tail animation, a real penguin rig, left-facing normalization UI, arbitrary uploads, the living-forest UI and persistence remain later integration work. Syntax checks are not semantic TypeScript checking.
