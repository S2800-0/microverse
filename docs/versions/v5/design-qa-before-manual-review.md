# Microverse prototype V3 — verification status

Date: 2 November 2026.

final result: blocked

## Blocker

Automatic browser approval previously denied access to the local preview after reporting a usage-limit problem. A subsequent attempt to acquire the same tab was explicitly rejected as an attempt to bypass that unresolved prerequisite. No alternate browser, raw automation, native screenshot or other workaround has been used in this pass. This is a browser-checking restriction, not a Meta/Baseten credit limitation.

The [Product Design QA skill](/Users/shahy/.codex/plugins/cache/openai-curated-remote/product-design/0.1.56/skills/design-qa/SKILL.md) requires: “If either artifact cannot be opened, captured, or compared, write `design-qa.md` with `final result: blocked` and name the blocker.” It also says: “Do not let the build skill hand off as done.”

## Sources and comparison state

- Selected art direction: `docs/reference/selected-option-3.png`, 1487×1058.
- Current user feedback: six exact user-supplied screenshots, saved under `docs/screenshots/user-feedback-2026-11-02/` and inspected as attached images in this conversation. These show the previous implementation, not V3.
- Current code: this isolated prototype; preview remains served at http://127.0.0.1:8860/.
- Current V3 browser screenshot path: none; capture is blocked.
- Current implementation pixel size, CSS viewport, density, keyboard state and console: not freshly observed.
- Full-view/focused-region paired comparison: not possible without V3 rendered captures. No previous screenshots/build status are substituted for this evidence.
- Prior V2 verification record retained in `docs/versions/v2/design-qa.md`.

## Changes awaiting rendered verification

| Finding from supplied evidence | Severity | Implementation response | Evidence still required |
| --- | --- | --- | --- |
| Entrance text clips right | P1 | Removed nowrap, fluid capped heading, 12ch maximum, responsive wrapping | Hero at 390, 768, 1280, 1720, 2560 CSS px and 200% zoom |
| Embedded photograph obstructed by CTA | P2 | Generated clean scenery without photo; fox is separate real alpha layer | Full entrance, no overlap/footing/halo issues |
| Static fox, static tiny rabbit | P2 | Independent hero breathing; enlarged rabbit with cosmetic idle pose; explicit pause/reduced motion | Actual movement, comfort, frame timing, no false ecology events |
| Soft stretched landscape | P2 | Recovered same-map 2048 original; reduced focus backdrop zoom from 1.8× to 1.08× | Retina crop and dry-state inspection; no 4K claim |
| Boxy panels and buttons | P2 | Capsule primary actions; 18–32px field/choice/panel corners; visible focus | All rendered states, text inset, selected/disabled/focus states |
| Unclear food/rain wording | P2 | Practical plant-food choice, animal reason, “one year in our little world”; removed redundant eyebrows | Child comprehension and no heading/paragraph collisions |
| Unsupported reef confused with broken ability | P1 | Explicit meadow-only scope; library offers supported photo starting points | Every unsupported route and recovery; no invented biome |
| No place library | P2 | Three real-photo Polaroids, enter/settle motion, credits, functional selection | Phone/desktop, keyboard focus, card hover/selection, navigation back |
| No contextual orientation | P2 | One anchored note per new area; arrows, dismiss, skip and replay | Correct target, viewport placement, keyboard behavior and dialogs |
| No voice/music | P2 | Twelve prepared Kokoro MP3 clips, independent narration/music/chime settings | Listening quality, mute/repeat, autoplay denial, hidden tabs, device audio |

## Required fidelity surfaces

- **Typography:** existing Fraunces and Atkinson preserved; heading wrapping and size revised. Browser type rendering and 200% zoom are pending.
- **Spacing/layout:** new library and enlarged soft panels have CSS layouts; rendered insets, overflow and teacher/phone surfaces remain unverified.
- **Colors/tokens:** existing palette retained. State contrast/focus are implemented but no claim of complete accessibility compliance is made.
- **Image fidelity:** actual source/generated assets inspected locally. Hero native output is 1536×1024, not 4K. Fox is whole-body alpha artwork, not independent skeletal head/tail parts. Terrain original 2048×1152. Dry map remains smaller. Browser halo/crop checks pending.
- **Copy:** unsupported habitats and photo/model distinctions explicit; fixed voice scripts avoid reading stale changing result numbers. Real learner comprehension has not been tested.

## Local checks

- 10 experience tests pass: original deterministic replay/validation/budget cases plus bounded hint geometry, exactly three valid local photo choices and all fixed narration clips.
- 4 Sites packaging/runtime tests pass.
- Production build passes; shipping client contains no stored Meta/Baseten key.
- 12 narration files generated offline from the already installed Kokoro model, 87.1 seconds total, 598824 bytes; files probed for duration and existence. This is not a listening assessment.
- Main game remains clean at commit `5bda15b`; no main-project edits, merge or deployment.
- No paid Meta/Baseten API calls; existing Spark enable/budget settings remain unchanged.

## Remaining acceptance work

1. Resolve browser approval, then use the normal approved in-app browser to inspect the current prototype.
2. Exercise home → library → each of three photo reviews → food → predict → checkpoints → compare/Why → reflection → save/reopen, plus custom photo/error/unsupported routes.
3. Test native dialogs, hint dismiss/skip/replay, sound opt-ins/mute/repeat, hidden-tab pause and OS reduced motion.
4. Capture matched desktop and phone states. Compare full view and focused text/action/image regions, repair P0–P2 findings and capture again.
5. Observe a teacher/learner trial if possible. Do not report textbook alignment as a participant test.

See `docs/REVAMP-CHECKLIST.md` for the 46 tracked product surfaces. Most original main-game pages still need a dedicated redesign; this slice must not be reported as a complete whole-product revamp.

## V4 companion extension — 2 November 2026

This extension also remains **blocked for rendered QA**. No new browser capture or alternative automation was attempted. The earlier selected art direction and saved collection/importer captures were inspected, but no V4 screenshot exists.

Implemented surfaces: companion collection/empty state, source picker/camera chooser, dog/cat/name step, saved-pair reveal, optional painting consent, real preparation states, original rig/whole-picture movement review, imaginary clearing, explicit browser Save, revisit/download and removal confirmation. The entrance and animal-photo recovery now link into this route. Existing pause preference survives model prediction/reruns.

Local evidence: six added companion tests plus ten experience and four packaging tests (20 total), and the production build. Tests cover bounded files, actual source transparency, explicit movement approval, stale rig work, local save/reopen/removal and data preservation on storage failure. None is a rendered click-through or a listening test.

Remaining checks: empty/saved collection layouts; source-photo transfer; camera hardware; Sunny exact-pair/source identity and Clover preview; opaque photo-card framing; fitted feet and walk/trot/rest; 24-character name wrapping; disabled/consent painting states; cancel/back during preparation; saving/return/removal focus; 390px/desktop and zoom; narration/hints/motion pause. The bridge remains disabled with original image switches/cap at zero. Main game is unchanged.

## V5 forest extension and fresh browser diagnosis

Current final result remains **blocked**. On the user’s explicit troubleshooting request, the account tool reported ordinary work allowed and no active rate-limit-reached type. A normal same-origin binding returned Tab not found. Read-only in-app tab inventory then received a fresh automatic-review rejection: it characterized rebinding as bypassing the earlier restriction. There were no later browser or alternate capture attempts. See `docs/BROWSER-APPROVAL-DIAGNOSIS.md`.

Implemented: quieter forest dock/clock, opt-in bounded playback, real journal, four-species neighbour chooser, model-rule cards and actual-record detail, native dialogs, canvas hit regions with keyboard alternatives, Motion transitions and reusable walk poses. New screenshots do not exist. Font wrapping, composition, image clarity, focus, hit alignment, modal transitions, mobile controls, reduced motion, voice quality and frame performance are still pending.

Five new forest tests establish deterministic isolation/replay and truthful journal references. They do not establish rendered fidelity or child comprehension. No main-game rewrite or deployment is claimed.
