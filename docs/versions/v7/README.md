# Microverse · camera-first prototype

Local preview: http://127.0.0.1:8860/ . This is the isolated review prototype. The original `microverse-hackathon` checkout remains clean at `5bda15b`; this pass has not committed, merged or deployed it.

## Latest expansion — 2 November 2026

- **Little Field Club**, the third approved branding board: fox/world logo, Baloo 2 headings, Atkinson Hyperlegible reading text, paper/forest/moss/clay palette. Exact tokens and use rules: [brand kit](docs/BRAND-KIT.md).
- **Three animated photo Polaroids:** garden, woodland edge and island reef. The two land places have distinct generated watercolor scenery. The reef opens its own coral/heat activity without land animals.
- **Photo → watercolor:** choose a photo, then Make my watercolor world. Choose a place type and explicitly consent before a smaller image goes to Meta. The real local backend test transformed the supplied island photo and prepared a matching pale-coral version. Generation is development-only, capped, cached and never automatically retried.
- **Visible starting assumptions:** None / A little / Some / Lots change the illustrated plant patches before starting. They also change actual starting food in the deterministic land model. They are choices, not measured photo quantities.
- **Clearer learning flow:** a prominent rain question; “Today” and “weeks later”; first-visit forest arrows; “Watch a week. Meet a neighbour.” A week is explained as seven pretend days.
- **Questions:** prepared questions cost nothing; optional custom Meta Spark answers reference validated records from the retained paired rain experiment. The exploring forest labels this scope. Reef questions are prepared coral facts rather than live model reasoning.
- **Motion and sound:** locally cached fox head bend after idle, falling painted leaves, subtle scenery light/drift and existing creature motion. Music and button sounds are enabled after the first interaction; narration remains optional. Heart, Bella and Emma are prepared local Kokoro clips, not Meta voice generation. Changing voices makes no speech API call.

## Try it

1. Choose a little world → garden or woodland. Review water/trees/grass one at a time. The original garden alone has recorded SAM masks; woodland/manual uploads do not inherit those masks. Confirmed plant clues are required to proceed into the land activity.
2. Choose starting plant food. Watch the preview change, make a prediction, then step through the paired rain experiment. Compare usual rain at the same week, inspect records, tap observations and save/reopen a discovery.
3. Enter the exploring forest after the activity. Follow the time → neighbour → journal hints. This forks usual-rain exploration and preserves the earlier experiment.
4. Choose the island reef for a different activity: predict, advance a warm spell, compare usual conditions and try cooling. Its bounded stress rule drives a matching coral-color illustration.
5. For a personal painting, choose a photo → Make my watercolor world. The live test allowance is shared; use saved examples to keep reviewing without inference cost. Companion creation is a separate imaginative journey, outside the ecological food web.

## What the pictures and models mean

A generated landscape gives the model its appearance. Garden and woodland share the existing curated land terrain/food-web rules; a prompt does not create a researched new biome. Their broadly matched map geometry is not a measured reconstruction, and exact painted-tree/collision alignment remains unvalidated. Custom landscape artwork stays in browser memory and is excluded from downloaded discoveries; saved land discoveries retain the habitat identity and validated model replay.

The reef is a separate **simplified teaching activity**, not a calibrated Huahine reef model, fish-population simulation or forecast. NOAA supports the heat/algae/color mechanism; the stress increments, timing and recovery curve are invented teaching rules, disclosed in Why. Color loss does not claim coral death. A new reef painting requires its own matching pale version; the app never overlays an unrelated reef image as its result.

SAM is recorded on the garden example. Live segmentation of arbitrary new landscapes is not connected to this prototype interface. A photograph cannot establish unseen species, food availability or ecosystem health. A real teacher/learner trial has not happened.

## Providers, limits and privacy

| Work | Provider / execution |
| --- | --- |
| New paintings, plant/leaf assets, branding | Meta `muse-image-1.0`, using the existing Meta key on the local server |
| Custom land evidence question | Meta `muse-spark-1.3`, standard mode; validated replay evidence |
| Prepared questions, simulation, motion | Local code, no inference call |
| Narration | Local Kokoro Heart / Bella / Emma, generated once into MP3 |
| Baseten / AWS | No calls in this expansion; original configuration unchanged |

`server/world-tools.mjs` reads the ignored main `.env` server-side. A separate expiring local permit and shared $1 ledger authorize this specific test pass without changing the main provider flags. Host/origin checks, same-origin session token, explicit photo/question consent, bounded inputs, one concurrent job, caching and no automatic retry apply. Public generation is not enabled. A deployed version needs an actual funded backend; the static Sites build alone does not provide these endpoints.

Local bookkeeping reserves **$0.75 of the approved $1** across 15 attempts: 12 returned images, two Spark calls and one failed network attempt. The failed attempt remains reserved. Meta's published $0.01/image rate implies about $0.12 for those images, plus Spark usage; this is not a verified balance/debit or proof of the payment source. [Meta pricing](https://dev.meta.ai/docs/pricing-rate-limits).

Uploads are re-encoded/resized before optional sending; no keys enter the client. New paintings and question cache remain in memory, not a public gallery. The developer test inputs/results are retained locally under `runtime/` for this authorized review. Source-photo redistribution rights must be resolved before publishing the Huahine reference or derivatives.

## Verification and evidence

- **32 automated tests pass**, including zero-food behavior, habitat replay identity, deterministic rewind/reopen, tamper rejection, evidence identity, bounded reef/cooling rules and complete alternate narration manifests.
- **Production/Sites packaging build passes.** Scaffold preserved at `.openai/hosting.json`, `worker/index.js` and `scripts/prepare-sites-build.mjs`.
- Approved in-app browser review covers selected desktop reference size 1487×1058 and phone 390×844: hero, library, food preview, larger question, forest hints, custom question, reef, voice settings and painting consent. The actual backend image/Spark integrations also succeeded. See [design QA](design-qa.md).
- Hardware camera/microphone, subjective listening, frame-rate measurements on real devices, full accessibility, precise new-map collision alignment and participant usability remain separate checks.
- [Asset provenance](docs/assets/habitat-art-v7.json), [whole-product roadmap](docs/REVAMP-CHECKLIST.md), [previous README/review](docs/versions/v6/).

## Sources and rights

- [Meta image API](https://dev.meta.ai/docs/image-generation) and [pricing](https://dev.meta.ai/docs/pricing-rate-limits).
- [NOAA coral bleaching explanation](https://oceanservice.noaa.gov/facts/coral_bleach.html). This source does not validate the teaching curve or our usability.
- [Kokoro voice list](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md). Model/voice terms remain separate from project code.
- Garden: Jon Sullivan, public domain. Woodland: Derek Harper, CC BY-SA 2.0, credited in library. Island reference: user supplied, licence unverified. The prototype is local, not newly published.
- Engine/replay/terrain reuse hashes: `docs/engine-source.json`. Companion provenance: `docs/assets/companion-reuse.json`. Earlier art masters/provenance remain under `docs/assets/`.

For a later development session: `npm run dev -- --host 127.0.0.1 --port 8860 --strictPort`. The current preview is already running.
