# Public hosting pilot

Public entrance: https://microverse-shahesta.vercel.app/storyboard.html

Direct classroom invitation: https://microverse-shahesta.vercel.app/?entry=lesson

The public entrance uses Vercel because the owner's network cannot reach the Netlify CDN. Vercel's server function relays only the bounded API to the working Netlify backend; the browser uses one Vercel origin. Vercel project `prj_ASmaGiAfwpunXQsANiI14PdwBp1Y` belongs to `grad16` (Hobby). Only a production relay Secret is configured there.

Netlify backend / diagnostic entrance: https://microverse-shahesta.netlify.app/storyboard.html

Netlify project: `b9c8b687-9d97-4af0-a8e7-0cf19404d531`, team `shahesta0028` (Free). This new project's inherited login gate was turned off for the requested public pilot; other projects were not changed. No custom domain, Git auto-deploy, paid plan or automatic merge is configured. The source branch remains reviewable independently of the manually published pilot.

## Backend and keys

Meta handles creature illustration, SAM and optional question transcription. Baseten handles custom reasoning with `meta-models/muse-spark-open-1026`. Prepared questions and ordinary simulation steps remain local. The laptop's Kokoro model is not uploaded; natural narration is unavailable on this hosted pilot and visible captions remain.

Provider keys and the random session/encryption secret use Netlify's **deploy-only secret environment** option. They are masked, restricted to deployed functions and supplied in memory by `scripts/deploy-netlify.mjs`; they are not ordinary project variables or embedded in the static/function files. These overrides must be included on every deployment. The free plan rejected project-level Functions-only scopes, so those broad-scope variables were not created. No plan upgrade is needed for the deployed secret option.

Before redeploying, log in with the official Netlify CLI, link this existing project, build with `netlify build`, and run:

```sh
MICROVERSE_PUBLIC_AI_ENABLED=1 MICROVERSE_PUBLIC_CREDITS_CONFIRMED=1 MICROVERSE_PUBLIC_CAP_MICRO_USD=1000000 MICROVERSE_SPARK_PROVIDER=baseten npm exec --yes --package=netlify-cli@27.16.1 -- node scripts/deploy-netlify.mjs
```

This reads the existing ignored `.env`. Never put literal keys in a command, repository, browser variable or PR. Keep `MICROVERSE_PUBLIC_SESSION_SECRET` stable across redeploys; changing it invalidates sessions and encrypted jobs. To publish with AI paused, omit the enable/confirmation flags. Preserve the existing site identity; do not create another project for an update.

## Vercel entrance and relay

`vercel.json` builds the same static `dist/` and routes API requests through `api/index.mjs`. Only the server-to-server `MICROVERSE_PROXY_SECRET` is installed on Vercel, as a production Secret. Provider keys stay in Netlify's functions-only deploy secrets. The same relay credential is supplied to Netlify by the deployment helper above. Exclude `.env`, runtime files, upload folders and hosting caches with `.vercelignore`.

The relay accepts only the existing API paths, bounds requests, verifies the browser's POST origin and streams the backend response. It passes signed session cookies without a domain attribute so they belong to the Vercel origin. A timestamped server signature authenticates the hosting-provided client IP before Netlify uses it for rate limits; anonymous callers cannot forge the relay's network identity. Job ownership, consent, validation and the shared reservation ledger remain enforced on the backend.

## Reservations and public access

The site-wide Netlify Blobs store `microverse-public-ai` holds one shared reservation ledger, `budget/public-pilot-v1`. Strong reads and conditional ETag writes protect the entire update across instances. It survives restarts and deploys. Missing ETags, malformed ledgers and exhausted allowances fail closed.

The initial ceiling is **1,000,000 microUSD ($1) in reservations** across all public AI. Each request reserves the existing estimated amount before queueing: creature 12,500, place 7,500, Spark 25,000, transcription 1,000. These are conservative application estimates, not a provider-enforced dollar billing cap or evidence of current promotional balance. Failed/ambiguous calls keep their reservations. Do not delete/reset the ledger to make a failed test run again.

There are at most two active jobs and six submissions per signed session or hosting-verified network per day, with a ten-second interval. Network identifiers are keyed hashes, not raw IPs. This is a small anonymous pilot, not authenticated per-person accounting or a complete defence against distributed abuse. The shared reservation ceiling remains the final request bound.

Jobs enter an encrypted temporary blob; only a signed job ID enters the background invocation. An atomic claim permits one provider attempt, including when the platform redelivers an event. Input is overwritten by an encrypted result or removed on failure. Results expire after fifteen minutes; hourly cleanup removes expired jobs. Closing the UI cancels polling, not an already-sent provider job. No application logging of images, recordings or questions is added. See `/privacy.html` for the participant-facing explanation.

## Verification

The public-hosting tests exercise cross-instance reservations, malformed/missing storage safeguards, session/origin checks, job ownership, encryption, single-attempt processing, expiry/cleanup and browser polling cancellation. Existing local bridge tests remain unchanged.

The optional `MICROVERSE_PUBLIC_VERIFY_ONCE=1` deploy hook claims `verification/public-launch-v1` before checking pages, private-file exclusion and one synthetic Spark proposal. It does not retry a paid submission on failure or redeploy. A single access-only retry was allowed after the first check proved it stopped at HTTP 401 before any AI submission. Read the report with `netlify blobs:get microverse-public-ai verification/public-launch-v1`. It contains no learner data or keys. Pending job IDs can be inspected by the owner; job payloads remain encrypted.

The Netlify-side check passed on November 1: website, lesson, compiled model module and privacy page returned 200; `.env` and server source returned 404. A real queued Baseten request completed with a validated `rain=0.65`, `durationWeeks=17` proposal. It consumed one 25,000 microUSD reservation. The image pipeline was subsequently verified through Vercel as described below; public place-analysis and transcription calls have not been verified yet. The author's browser still timed out reaching the Netlify CDN, so that link is not a verified usable entrance on this network.

Vercel verification: the entrance, lesson, discovery/privacy pages, compiled browser modules and rabbit image returned 200; `.env`, server source and runtime ledger returned 404. Meta and Baseten status routes returned enabled through the relay; natural narration correctly returned disabled. The live website entrance and embedded lesson rendered in the browser without a sign-in. A rejected oversized sample input left the ledger unchanged at one reasoning reservation.

One resized existing dog sample then completed through the Vercel relay: Meta Muse Image returned a watercolor illustration and SAM 3.1 returned a validated cutout mask. The large result was received successfully through both streaming functions. The shared ledger reported 37,500 microUSD ($0.0375) reserved across the live reasoning and image tests, leaving 962,500 microUSD of the $1 allowance. This is a reservation total, not a provider billing statement. All 168 project tests, syntax checks and the static build pass. The final artifacts were scanned for embedded provider/session secrets.
