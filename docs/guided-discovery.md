# Guided discovery and personal creatures

## Experience

The Ecosystem opens with a guided-investigation invitation and a separate My creatures space. The welcome state hides advanced forest controls. Leaving it reveals a small tools menu, a replayable guide and free questions. The underlying ecosystem rules are unchanged by this redesign.

The dry-spell guide uses a fresh seed-7 forest, half usual rainfall for 52 model weeks, and five stages: predict/start; inspect first-week food; inspect a current model location and the rainfall rule; inspect week 13 and write an explanation; connect to a familiar place and choose another question. It preserves the exploring forest and saved creatures. It can be skipped or restarted. This is a guided example, not an independently scored learner trial.

Investigations show one forest by default. An explicitly labelled reference simulation still runs from the same snapshot. Users can switch the displayed forest or compare both (side by side on wider screens, stacked on narrow screens). Food meters share the same 0–1 model scale and plain direction labels. They are not ground-area measurements or calibrated biomass. Exact measurements remain available in a disclosure.

The optional food layer colours existing model cells by their simulated grass value. A food close-up selects a real open cell with a difference and enlarges the current rendered view. Event invitations use actual post-start birth, death or arrival records; they do not move the camera automatically. The event close-up shows a current location when retained, otherwise the current wider forest with an explicit explanation. It is not an animation of the historical event. Removal is described separately from natural death.

The why panel describes curated rules. The rabbit story accounts for births, deaths and arrivals in both branches. Neither establishes a unique cause of a population difference. Narration uses the same recorded direction and counts in short language, with no raw resource percentage-point recital. Speech remains opt-in and local; no private names or learner text are added to generated captions.

Related questions are supported single interventions starting from the same original snapshot. A new prediction and explicit Start replace the open investigation, with a reminder to save notes first. Discovery cards add a plain observation and optional everyday connection to the existing printable evidence record. Full replays retain this optional connection; provider/model-only reruns strip it along with other learner notes. Older files without the field remain readable.

## Personal space

My creatures explicitly saves up to 12 reviewed dog/cat images, names, rig settings and bounded source metadata in this browser's local storage, subject to a two-million-character collection limit. No original file, live rig object or model credential is saved. A reviewed image may still include a background if simpler movement was chosen. Quota/storage failures preserve the prior collection and keep the studio available for downloading an image. Corrupt storage fails closed instead of silently overwriting it. Browser storage is not a permanent backup and is not encrypted or synced by this app.

The imagination clearing has a labelled fictional greeting with reduced-motion support. It does not infer real temperament or predict a pet's response to environmental changes. Real species-fact cards cite [RSPCA Education](https://education.rspca.org.uk/library/-/content/let-dogs-sniff) for dog scent exploration and [Cats Protection](https://learnonline.cats.org.uk/content/ufo/11.html) for cat scent communication. A fact is general to the selected species, not a photo diagnosis or an individual-care recommendation.

A saved creature can deliberately visit the exploring forest with the existing cared-for companion role; movement reuses its approved configuration locally. The browser collection survives forest reset. Classroom tutorial starts remain separate. AR placement in a physical room, arbitrary species, complex fantasy interactions and personal behavioural prediction are not implemented.

The studio offers photo selection and a phone-camera file input. It never opens a camera on page load. Meta painting remains explicit and budget-gated. Humorous subtitles accompany actual local preparation, combined painting/cutout waiting and movement review. The API returns painting and cutout together, so the UI does not fabricate an intermediate success, percentage or countdown. Local sample/image preparation labels the painting step as optional.

## Verification and limits

Automated checks cover factual summaries, post-start event boundaries, population accounting, removal wording, supported related changes, connection-field round trips/escaping/redaction, local collection persistence and transaction failure. Existing engine/replay/privacy/budget tests continue to apply.

Browser developer QA checks the guide, close-up, learner-first explanation, reference/split controls, related-question handover, prepared sample review/save, collection reload/reset, visit and sourced fact display. A 390 × 660 iframe checks CSS layout and scrollability; this does not test phone hardware, microphone permission or touchscreen performance. No paid inference is needed for this slice.

These are developer checks. Teacher/learner sessions and educational outcomes remain untested. See the [initial curriculum correspondence check](curriculum-review.md) for narrow supported goals and omissions.

## Inviting a saved creature

The guide intro can invite a saved dog or cat into the shared starting forest, so both branches contain the same companion. This is optional and off by default. Observed in developer QA (seed 7, one saved dog, week 13): the forests differed more than in the no-visitor run (rabbits 10 fewer, foxes 2 more, wolves 6 fewer, versus rabbits 3 fewer and nothing else). Adding an animal changes the model's random draws, so paired forests can diverge for reasons beyond the rainfall change. This is one run, not a measurement. The no-visitor run stays the recommended first comparison.

## Ask the guide (built with mocked Spark; no live Meta call made for this feature)

The investigation has an **Ask the guide** thread: the child's question appears as a bubble and the guide answers in a bubble.

- **Free local guide** (default): keyword matching over this run's recorded evidence (observations, events, model rules). It answers at once and never invents anything. Unclear questions get a clarifying prompt.
- **Ask Spark** (explicit, only when the local server has Spark enabled and a spend cap): sends the question and the recomputed evidence packet to Meta Muse Spark. Spark may only **choose** existing observation, event and model-rule IDs, one follow-up from a reviewed list, and one of its own chosen IDs to look at first. All sentences, numbers and buttons are written by code from the run, so Spark's wording never reaches the page except a short clarification. Creature names, photos and notes are not sent; the typed question is sent as written, so the interface asks learners not to type personal information.
- **Failures** (disabled, over budget, offline, malformed output, unsupported IDs) fall back to the local guide with a note. There is no automatic retry. A reply that arrives after the forest moved on is discarded. Chips in older bubbles switch off when the week changes, since they point at that earlier moment.
- Chips open the measurement row, the model rule, or a recorded birth/arrival/death close-up. The close-up shows a current or last recorded location, not a replay.
- Cost: one Spark request reserves $0.025 against the local ledger. Tested with mocked transports only: provider request shape, size bound at weeks 1/13/52/156, privacy of the payload, strict validation, bad output, stale replies. **Live Meta behaviour for this operation is unverified**, including whether Meta accepts the tool schema.
- The guide explains how the *model* produced a record. It does not claim to explain real ecosystems.

## Game-first investigation layout

The investigation is now a full-screen forest, not a paper dialog over the game. The same elements and IDs were re-parented, so the logic and tests are unchanged.

- **Stage:** one forest (or two for the comparison) fills the screen. Canvases keep their 836 x 471 bitmap and are sized in script (cover on wide panes, whole forest on portrait panes), so tap-to-ask still maps correctly through the canvas's bounding box.
- **Top bar:** title and prediction, playback, view controls, and Results / Notebook toggles. On phones the secondary view controls sit behind "More".
- **Floating over the forest:** a Results card (food bars, counts, "why"), creature and close-up cards, the guide's instruction, the speech-bubble thread and the question pill.
- **Notebook drawer:** the learner's explanation, evidence, reflection, teacher notes, limits, related questions and saving. The guided steps that used to scroll the page now open the notebook and focus the right box.
- **Escape** closes the notebook first, then an open close-up or creature card, and only then the investigation.
- **Known limits:** on a portrait phone the whole forest is small; the canvas is 836 px wide so it looks soft at full-screen size; the guide has no avatar yet; the camera does not yet zoom to a mentioned target. No browser regression test covers tap coordinates, focus or phone overlap; these were checked by hand at desktop and 375 px widths.
