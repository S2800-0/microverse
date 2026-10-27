# Meta creature bridge

The default server is paused, with a $0 local image budget. A bounded four-photo live pilot verified image/SAM payloads and exposed a harness-mask failure that was corrected with an explicit inclusive subject phrase. Quality and rig limitations are recorded in the [pilot results](image-pilot.md). Baseten funding remains separate from Meta Model API's image/SAM allocation. AWS is not used as a fallback and its prototype pause/cap are unchanged.

## Pipeline

1. The browser resizes/re-encodes a chosen dog/cat image to a 640-pixel PNG, keeping its processed bytes locally. The name is not sent to the provider.
2. On explicit image-sending consent and **Paint with Meta**, the local server reserves both request estimates before contacting Meta. It sends one `muse-image-1.0` edit with the versioned side-profile watercolor prompt, optional appearance notes and `n: 1`. Web/image search and shell tools are disabled. The prompt asks to preserve actual accessories, colors and markings; this is an instruction, not a reliability guarantee.
3. Muse Image currently returns opaque output. One `sam-3.1` request segments the generated dog/cat. Harness appearance notes use a fixed noun phrase such as `dog wearing a turquoise harness` so the worn item is included in the subject. No preliminary source-photo segmentation is needed for this first creature flow. SAM uses `store: false`, non-streaming Responses output and one-bit masks.
4. The official pinned `@meta-sam/parser` decodes the response. A non-streaming output-text lane is adapted to the parser's structural events. Zero matches, multiple animals, incomplete output, parser diagnostics and invalid masks fail without choosing a different subject automatically.
5. The browser places the cropped mask raster into its **half-open source bounding box**, scales to a 640-square transparent canvas and fits the existing local rig. Source and motion are compared visually; acceptance or explicit whole-image fallback remains necessary. Color/identity preservation and accessory retention still need varied-photo tests.
6. Accepted bytes/cuts and provider/model/prompt-version metadata enter the same forest/replay APIs. **Save processed PNG** downloads a reusable local asset. Re-importing that cutout needs no generation. Replay files preserve the image and provenance metadata; metadata is a record, not a cryptographic attestation.

No species identification or habitat research is performed in this slice. Manual dog/cat roles remain distinct from appearance and use the existing cared-for companion assumptions. Arbitrary animals, penguin articulation and place-photo measurement remain separate work.

## Local setup and activation

```sh
npm ci --ignore-scripts
npm run preview:meta
```

Without configuration, the server runs locally with generation paused; ordinary import/review works. The plain `npm run preview` and a static `dist/` deployment also keep local import and replay, but contain no generation backend.

After the account actually has eligible promotional credits, configure the ignored `.env` using `.env.example`. Keep `MODEL_API_KEY` server-side. Set `MICROVERSE_META_ENABLED=1`, `MICROVERSE_META_CREDITS_CONFIRMED=1` and an explicitly agreed `MICROVERSE_META_CAP_MICRO_USD` for the first live test. An integer of 100000 means a $0.10 **local** cap; this is a unit example, not an activation performed by this feature. The bridge accepts caps from $0 to $7 and needs enough for one complete job. Never infer funded status from the presence of a key, a submitted application or these configuration flags alone.

The current integration is loopback-only (`127.0.0.1`). Its API checks Host, same Origin, JSON content type and a per-process session header. There is no CORS access, public upload route, browser API-key field or arbitrary provider URL. It is a local prototype service, not a deployable public backend with accounts and tenant budgets.

## Budget, duplicates and storage

Published on the [Meta pricing page](https://dev.meta.ai/docs/pricing-rate-limits), checked October 27, 2026: Muse Image costs $0.01/image and SAM $0.0025/image, so a two-stage attempt reserves **$0.0125**, represented as 12500 integer millionths of a dollar. Recheck pricing before enabling live calls.

`runtime/meta-budget.json` stores only hashes, times and reservations. An exclusive lock, atomic rename and file sync protect reservations. A bad, unreadable, busy or exhausted ledger fails closed. After a crash, a leftover `.lock` requires an operator to confirm no process is using it before removing that lock; do not reset the ledger to recover budget. Failures/timeouts remain reserved because processing or charges may already have happened. This is conservative local accounting, not an AWS/Meta billing report or an account-wide spending limit. It cannot prove credits were applied, prevent charges from other clients, or override provider billing.

At most one distinct job runs at a time. Identical concurrent requests share it; successful matching input/profile/appearance/prompt-version requests reuse an in-memory cache (eight entries / 16 MB maximum). The cache ends on server restart or eviction. A repeated request after that can incur new calls. Use the downloaded processed PNG or replay to retain an approved asset across sessions.

There are no automatic provider retries or automatic refunds. Closing/changing input discards stale browser results and aborts the browser fetch; an already-sent server job may still complete both reserved stages and cache its result. Requests have a four-minute provider timeout. Original photo bytes and appearance notes are not written to the ledger or public files. Processed source/output exist in memory; explicit downloads/replays can contain private imagery. Provider processing is external and occurs only after the user chooses the sending control. No account-level retention or billing guarantee is implied by our local storage behavior.

## Evidence and remaining live checks

- Offline tests use injected transports/providers. They cover exact endpoint/model/payload selection, one-image constraints, fixed destinations, no redirects/retries, SAM parsing with an official-format cropped mask, alpha application, consent/input limits, credit-off behavior, durable/concurrent budget enforcement, cache isolation, failure reservations and local HTTP guards.
- Browser checks: paused generation cannot be enabled by ticking photo consent; swapping the source clears consent; local dog/tabby fitting and explicit whole-image fallback still work; an added tabby retains its model identity. These use existing generated samples, not live Meta output.
- Static browser pixel check at `/examples/creature/cutout.html`: seven checks pass for actual PNG decode/re-encode, offset cropped-mask placement, transparent background, 640-square centering, source colors and a synthetic blue accessory. This fixture makes no provider calls. Review also corrected the fallback preview to display the processed image while retaining the original in the source panel.
- The browser/static bundle excludes `server/`, `.env`, ledgers, keys and the server-only SAM parser dependency. CI installs the pinned package through `npm ci` before running tests.
- Live pilot: four image/SAM pairs returned valid payloads; one mask failed accessory retention and a deliberate SAM-only inclusive-harness retest corrected it. Browser composition and four-piece geometry were checked for all four. One generated beagle was imported and retained in paired experiments. See the full result/remaining-work table in [the pilot record](image-pilot.md); payload/geometry success is not a general likeness, motion or ecological validation. UI/UX remains open to redesign.

Primary API references checked for this implementation: [image generation](https://dev.meta.ai/docs/image-generation), [image edits](https://dev.meta.ai/docs/api-reference/images/edit-image), [SAM overview](https://dev.meta.ai/docs/sam/overview), [mask grammar](https://dev.meta.ai/docs/sam/reading-segmentation), [client library](https://dev.meta.ai/docs/sam/client-libraries). The parser has its own SAM License in the installed package; no model weights are bundled.

The [photo pilot](image-pilot.md) keeps the staged protocol and actual findings separate. Photos and runtime results stay private until the owner chooses examples to share.
