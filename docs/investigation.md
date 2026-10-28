# Questions, traceable evidence and funded providers

## Offline first

**Ask “what if?”** offers six prepared investigations: less rain, half rainfall for a year, a wetter year, or disappearance of wolves, foxes or rabbits. Exact aliases resolve locally; the program does not guess from keywords. Other wording either gets a specific local clarification/rejection or offers Spark/manual controls. Selecting a prepared question or setting controls makes no provider call.

Every proposal shows its exact parameters before the learner explicitly runs it. Supported changes are rainfall 0–150% of normal for 1–156 weeks, or removal of all members of one native species (rabbit/deer/fox/wolf), excluding future immigration. No arbitrary code, asset editing, partial removals, simultaneous changes, pollution, temperature or habitat inference is supported. Images and animal names do not establish ecological roles.

For custom proposals, a local check compares numeric weeks and explicit percentages of normal/usual/typical rainfall in the question with the suggested change. A mismatch returns clarification with no runnable change, rather than correcting the model or making a second call. This catches the numeric error observed in the Baseten smoke test; it does not verify every interpretation of natural language. The learner must still review the exact parameters.

Both branches copy the complete current scene. The main forest stays unchanged. Rainfall returns to the earlier schedule after its specified interval. Replay v2 records parameters and optional classroom notes; v1 files still open.

## Evidence before claims

After at least one week and a learner reflection, **Show evidence explanation · no AI** displays rounded, computed differences, event references and possible connections to existing model rules. Inspect buttons open the corresponding table row/event. These are within-model observations, not a proven causal attribution or forecast. Seeking invalidates the previous explanation.

Optional Spark can select observation/event/rule IDs and a follow-up question. The server rebuilds the experiment from a validated model-only replay, recomputes its evidence, and rejects invented IDs. Numbers and event sentences are rendered by code. The provider receives the question, compact evidence and allowed IDs, not creature pictures/names, predictions, learner explanations or facilitator notes. Avoid putting personal information in the question itself. The follow-up question is model-generated and is not an independently validated natural-history statement.

## Meta account versus Baseten account

- **Meta developer:** key stored only in ignored local `.env` as `MODEL_API_KEY`. Spark uses `https://api.meta.ai/v1/chat/completions`, model `muse-spark-1.3`. The separate image/SAM bridge uses this key too, with independent enable flags and budget.
- **Baseten:** alternative Spark host, separate `BASETEN_API_KEY`, endpoint `https://inference.baseten.co/v1/chat/completions`, hackathon model **`meta-models/muse-spark-open-1026`**. The owner's approval email grants $100 of credits for this exact model; its scoped key must not use the generic model shown in public examples. Meta promotional balance is a separate pool. Neither the grant email nor token usage proves which payment source an individual request debited.
- Selection is explicit; no automatic provider fallback. Baseten Muse Spark Open supports tool calling but not structured-output/JSON mode. Meta currently supports only `tool_choice: auto`; the adapter asks for one expected function, uses low reasoning, and rejects plain/truncated/multiple calls. Baseten selects the named function and has no reasoning-effort option.

Primary references: [Meta tool calling](https://dev.meta.ai/docs/tool-calling), [Meta pricing](https://dev.meta.ai/docs/pricing-rate-limits), [Baseten model support](https://docs.baseten.co/inference/model-apis/overview), [Baseten function calling](https://docs.baseten.co/inference/function-calling), [Baseten reasoning](https://docs.baseten.co/inference/model-apis/reasoning), [Baseten model/pricing](https://www.baseten.co/library/muse-spark-open/). Provider interfaces/prices can change; recheck before increasing caps.

## Local configuration and caps

Copy `.env.example` only when first creating a private `.env`; never overwrite a saved key. Defaults keep every paid feature off. To run Spark, set the following in that ignored file after confirming the selected provider's funds, or supply them to one explicitly scoped server process:

```dotenv
MICROVERSE_SPARK_PROVIDER=meta
MICROVERSE_SPARK_ENABLED=1
MICROVERSE_SPARK_CREDITS_CONFIRMED=1
MICROVERSE_SPARK_CAP_MICRO_USD=100000
```

`100000` is a **$0.10 local ceiling**, four conservative $0.025 reservations. Run `npm run preview:meta`. Spark and image budgets/flags are independent. Status/click consent, same-origin checks, loopback Host validation and a per-process session protect the local POST route. Static hosting serves the offline features; it has no secret-bearing provider backend.

For the approved Baseten hackathon grant, choose `MICROVERSE_SPARK_PROVIDER=baseten` instead. The adapter fixes the `-1026` model; model names and base URLs cannot be supplied by a browser request. The key stays in the ignored server-side `.env`. Keep example defaults paused, preserve the provider-specific ledger, and start with one bounded test before enabling further requests. There is no automatic fallback to Meta or another Baseten model.

Each reasoning attempt reserves $0.025 durably in `runtime/spark-budget-PROVIDER.json` before sending. Requests are bounded to 11,000 JSON bytes, 2,048 total output tokens, a 60-second timeout and one concurrent job. Failed attempts retain reservations. Repeated successful identical requests use a 20-entry in-memory cache. There are no automatic retries or fallback calls. Restarting clears cache, not the ledger. Never delete/reset ledgers to bypass a ceiling; inspect retained records before intentionally increasing it.

Reservations are conservative local estimates, not provider billing controls or proof that a card cannot be billed. Other clients/services may use the same account. The operator checks the billing dashboard. API usage responses show tokens, not which payment source was debited. Shipped example flags remain off. Earlier Meta checks used their own ledger and a $0.10 local cap. The Baseten smoke test has a separate $0.025 ceiling, now fully reserved; further local Baseten calls remain paused after its numeric mismatch. AWS remains paused.

## Recorded live checks · October 27, 2026

- Free model catalog returned HTTP 200. Key was never exposed to the browser or committed.
- Small Spark READY check succeeded: 17 input / 26 output tokens, estimated $0.00013175 at $1.25/M input and $4.25/M output.
- A proposal using the wrong Meta named-tool setting returned HTTP 400. A subsequent 512-output-token attempt did not yield one accepted complete function; it was rejected without a change. Its exact failure mode/usage was not captured; do not infer a charge or cause.
- Corrected low-reasoning proposal succeeded: “What would happen if rainfall were 70 percent of normal for 26 weeks?” → `{kind:"rain",rain:0.7,durationWeeks:26}`. 806 input / 500 output tokens (including 356 reasoning), estimated **$0.0031325**. No world execution occurred in this test. The diagnostic script allowed one request and reserved $0.01; previous failed records were retained separately.
- The owner confirmed promotional coverage in Billing before inference. Account balances and billing records are kept private; API responses do not independently identify individual credit debits.

A live evidence-selection check subsequently passed on a stripped beagle replay: 1,588 input and 1,040 output tokens, estimated $0.006405, with only validated IDs and a follow-up question returned. The application rendered actual values/events. Photo image/SAM checks are recorded in `image-pilot.md`; place checks and exact replay continuation are in `demo.md`. Broader reliability is not established by one successful request. Receipts/ledgers remain ignored local runtime files.

## Baseten smoke test · October 28, 2026

One text-only request to `meta-models/muse-spark-open-1026` returned HTTP 200 with 956 input / 91 output tokens (1,047 total). Authentication and the function-call transport worked, but the response changed **65% of normal rainfall for 18 weeks** into **60% for 19 weeks**. The old shape/range validator accepted these valid-but-wrong numbers; the test did not execute a simulation. This is a failed interpretation check, not a successful end-to-end result.

The numeric consistency safeguard added afterward returns clarification for this regression, with no repair call. Its mocked regression tests pass; it has not been retested with another live Baseten request. The original $0.025 reservation is retained, and further calls are paused. Token usage does not establish the actual charge or promotional credit debit. Revisit interpretation accuracy with a small labelled evaluation before increasing the cap or using Baseten in the demo.

## Reusable evaluation and remaining work

The [20-question fixture](../examples/questions/README.md) verifies prepared/clarification/unsupported routing without spending. Intended custom-model answers are labelled separately from measured outcomes. Broader provider evaluation and ecological calibration remain future work. The [classroom guide](classroom.md) and `/teacher.html` supply the lesson, worksheet and pilot protocol; no participant findings exist yet.
