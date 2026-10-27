# Narration and spoken questions

**Narration: Off/On** controls captions in the forest and paired experiments. It starts off; turning it on starts **captions only**. Read aloud is a separate opt-in. The app uses **local Kokoro Heart neural speech**, with no fallback to the former device voice. Static hosting or an unconfigured local server keeps captions available and labels natural speech unavailable.

Captions report actual resource/population changes and event counts, not an invented causal story. Forest captions name their model-week interval. Automatic playback samples captions at most once every eight seconds and skips intermediate speech while a reading is pending/playing. Manual seeking replaces the context. The local server permits one active generation and only the newest waiting caption, with six cached results; stale browser audio never plays. Pause, close, page hiding and switching off cancel browser playback. A generation already running on the CPU can finish locally. Errors retain captions; Read caption again is an explicit retry.

## Natural local voice

Use Node 24+, `npm ci --ignore-scripts`, then `npm run setup:voice`. The setup command downloads approximately 92 MB of q8 model weights plus tokenizer/config files from a fixed Hugging Face revision into ignored `runtime/kokoro-model/`. Enable `MICROVERSE_LOCAL_VOICE_ENABLED=1` and run `npm run preview:meta`. The pinned Node runtime runs on CPU; inference disables remote model fetching. No narration text goes to Meta or another hosted voice provider. Cold loading/generation can take several seconds; the UI indicates preparation/playback. Voice quality and device performance need the owner's listening judgment.

The [Kokoro JavaScript library](https://github.com/hexgrad/kokoro/blob/main/kokoro.js/README.md), [Kokoro model](https://huggingface.co/hexgrad/Kokoro-82M) and [ONNX conversion](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) are separate from Meta. Model/code licences remain upstream: Kokoro is Apache-2.0, and transitive libraries have their own notices (including the phonemizer). No model weights are bundled in Git or the static build. Dependencies are pinned through the lockfile; sharp is overridden to patched 0.35.5, with npm audit reporting zero advisories when checked for this change.

The server generates sentence-sized chunks to avoid silent tokenizer truncation. Captions are bounded to 700 characters and 350 per sentence, generated audio to 90 seconds/4 MB. A per-process local session and same-origin loopback checks protect the route. Personal names, photos, free-form questions and learner responses are excluded from narration text.

## Meta dictation

Meta's [Muse Voice Transcribe](https://dev.meta.ai/docs/models) accepts audio and returns text; it does not synthesize narration. It powers **Ask “what if?” → Speak a question**. Browser recording requires the user's microphone permission and explicit Record question click. Recording stops at 15 seconds. It stays local until **Send recording to Meta**; a local audio preview and Discard clip are available first. The clip is converted to metadata-free mono 24 kHz/16-bit PCM WAV. Server validation derives its duration from actual bytes and rejects silent, malformed or oversized input before reserving funds.

The returned transcript is editable. **Use transcript** fills the question and invalidates the old proposal; it does not call Spark, approve an intervention or run an experiment. The user then previews the wording or chooses Spark as before. Closing/hiding the page stops tracks, clears the clip and discards late results. An already-sent Meta request may still complete and retain its reservation. Typing/prepared questions remain available.

Settings in ignored `.env` (example defaults remain off):

```dotenv
MICROVERSE_LOCAL_VOICE_ENABLED=1
MICROVERSE_VOICE_ENABLED=1
MICROVERSE_VOICE_CREDITS_CONFIRMED=1
MICROVERSE_VOICE_CAP_MICRO_USD=10000
```

The Meta key stays server-side as `MODEL_API_KEY`. Dictation uses the fixed `POST https://api.meta.ai/v1/asr/transcribe` endpoint with multipart WAV/settings, PUSH_TO_TALK, no automatic retries, no diarization or speaker identification. English is the current recognition hint; accent, other-language and noisy-room quality have not been evaluated. At [published pricing](https://dev.meta.ai/docs/pricing-rate-limits), $0.18/hour is $0.00005/second. Each at-most-15-second attempt conservatively reserves $0.001 in `runtime/speech-budget.json`; a $0.01 local ceiling permits ten attempts including failures. This is local accounting, not an account-wide billing control. Original recordings/transcripts are not logged to disk by the service; a 20-entry success cache stores only hashes and transcripts in memory.

## Verification and limits · October 27, 2026

- A local Kokoro sample generated successfully on CPU; runtime/recording consent, cancellation and no-fallback paths have fixtures. Actual model voice inference is separate from fixture tests.
- One synthetic Kokoro question was converted to PCM and sent to Meta. It returned exactly **What if rainfall is halved for a year?** with reported `audioDurationMs=2640`. Published whole-second metering estimates $0.0001; API output does not identify promotional/card debits. A $0.001 reservation remains. This was not a person's recording.
- Browser: captions default silent; Kokoro Heart availability and read-aloud controls displayed; speech panel showed Record question available and Send recording disabled before capture. The agent did not request microphone permission or record ambient audio. A real microphone/accent/noise trial remains for the owner.
- Tests cover PCM bounds/silence, provider payloads/errors, funding/consent/cache, delayed permission cleanup, cancellation during transcription, review-only transcript state, bounded local generation and protected routes. No educational or voice-quality outcome is inferred from a transport test.
