# Focused classroom flow · October 31, 2026

The first forest story is now part of the game entry. Open `/?entry=lesson`, choose **My first adventure** on the website, or choose **Start a forest story** / **Forest story** in the game. The standalone `/forest-story.html` and design studies remain useful review surfaces.

## One focus at a time

Meet a real model rabbit, predict, watch the first 13 model weeks, compare the same patch under usual/rain-change conditions, and record an observation. The connection appears after the learner responds. An optional saved birth moment shows an actual state containing that exact animal, with its event ID and logged week available in the record. It does not reenact a birth or attribute it to the rain change.

Then choose a familiar place and optionally say what you would observe outdoors. The completed discovery offers a card preview, another prepared question or a return to the exploring forest. The exact food scale, population counts and event record live in an optional dialog. A second prepared story uses 150% rainfall; the original uses 50%, both for 52 weeks with the first 13 observed. Both reuse the same complete starting forest and original model rules.

## Keeping the exploring forest and notes

The focused lesson runs in an owned same-origin frame. The exploring controller remains paused in memory; opening the story does not serialize, reset or replace it. Closing/reopening the story retains its scene, prediction and responses for the lifetime of that page. Messages carry only readiness, close and visibility controls. They are restricted to the expected window/origin; no pictures, model state or learner text are sent to the parent.

No automatic durable save is added. Reloading the main page starts a new session. Use the discovery/export controls to keep work. On direct story entry, the old full-forest rig preparation is deferred until the player returns to that forest, avoiding that background work during the first lesson.

## Card preview and exports

**Open my discovery** opens `/discovery.html` in a separate tab. Its URL fragment carries the local replay; fragments are not sent to the static server. The preview validates/restores the replay, generates the existing escaped worksheet, and offers print/save-PDF, a self-contained HTML card and a JSON experiment with notes. Keep the preview URL private if it contains learner responses; there is no server-side sharing service or public upload.

The card's embedded model-only rerun strips names, pictures and learner/activity notes. The full experiment download retains the learner responses. The preview does not load remote images or scripts from the worksheet. Initial-state/model data remain bounded by the existing replay validation and the preview's fragment-size bound. Blob file downloads occur from the top-level card, which also avoids the embedded-Blob limitation observed in the preview browser.

## Optional natural read-aloud

Story options can read only the current guide caption through the existing local Kokoro adapter. The adapter initializes on explicit opt-in; it has no robotic device-voice fallback and does not read learner notes. Pausing, hiding or leaving stops playback. If the local voice server is unavailable, the visible guide captions remain usable. This pass verified opt-in/cancellation with fixtures and the unavailable-preview state; it does not claim a new live speech-quality assessment or hosted voice generation.

## Verification

- 158 project tests pass, plus syntax and static build checks. New tests cover the wetter preset, exact replay restoration, recorded-moment identity, escaped notes/model-only rerun, owned-frame message checks, voice opt-in cancellation and hidden-viewport recovery.
- Browser walkthrough: main entry → greeting/prediction → playback → same-patch comparison → own reflection → connection → recorded moment/optional evidence → outdoor response → discovery preview. The related wetter question starts from the same initial forest.
- Return-path check: the exploring forest remained at week 2 with all 55 actor IDs, labels and positions unchanged, including a newly added model dog. A selected prediction and a completed discovery were both retained across closing/reopening the story.
- Fixed a real hidden-frame defect: a zero-size resize had poisoned camera coordinates and stopped drawing. The renderer now keeps the last positive viewport; its regression exercises hide/reopen geometry.
- At 390 × 844, the outdoor choice/input/continue controls fit (last action bottom about 811 px) with no horizontal overflow. Keyboard activation completed the reflection flow. This is a narrow-layout check, not mobile hardware testing.
- The preview browser opened the generated discovery page. A top-level HTML download was saved and read back: the synthetic observation and school connection were present; its stripped rerun restored at week 13 without activity notes. No personal learner data was used.

No new artwork, photo upload, hosted inference, model download or paid API call was made. Teacher/learner sessions remain zero. The wider free-exploration controls, creature-creation redesign and deer gait still need their own work; this feature does not claim that the whole game UI has been rebuilt or that learning outcomes improved.
