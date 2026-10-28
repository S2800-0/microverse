# Resource use and environmental trade-offs

Microverse is an ecology learning prototype with optional AI features. Its educational purpose does not establish that its benefits outweigh its environmental costs. No project-specific energy, carbon, water or lifecycle assessment has been completed, and no learner/teacher sessions have been recorded. Do not describe it as carbon-neutral, environmentally beneficial overall, or a substitute for field evidence.

## Existing implementation

| Activity | Processing and reuse |
| --- | --- |
| Forest, procedural motion, paired experiments and replay | Ordinary browser code; no inference per animal, frame or model week. Devices still use electricity. |
| Prepared questions, supported manual changes and local evidence guide | No model inference. These complete the core classroom activity without a provider key. |
| Reviewed place photo | Optional explicit SAM request; three image-label checks. Up to 4 successful results cached in server memory; the recorded example and manual review require no fresh inference. |
| Custom Spark proposal or evidence selection | Explicit request; local prepared routing runs first. Up to 20 successful responses are cached in server memory by operation and validated payload. |
| Creature painting and segmentation | Explicit optional request; one image edit plus segmentation per new job. Up to 8 successful jobs are cached within a 16 MB server-memory bound. Procedural motion reuses the resulting image. Local import and saved sample creatures need no fresh inference. |
| Microphone transcription | Explicit review-before-send. Up to 20 successful audio results are cached by audio hash in server memory. Typing remains available. |
| Neural narration | Optional local Kokoro inference; no hosted speech-generation call. Up to 6 captions are cached; one active generation and only the newest waiting caption are retained. Local inference and initial model download still use resources. Captions remain available. |

These caches are bounded and process-local, not permanent guarantees against repeat calls. Restart, eviction, changed inputs or a failed request can lead to another call after an explicit retry. No automatic paid retries are implemented. Separately configured local reservations limit attempted spending, not energy, emissions or provider-side billing. The enabled settings in a private development environment are not the default shipped configuration.

Reusing an image or recorded experiment avoids fresh inference for that use, but does not erase its creation cost. AI used during development also belongs in any eventual project footprint; this table only describes runtime behaviour. Existing photo-derived private assets remain private.

## Decisions for the next usability trial

- Start with prepared questions, existing art and the local evidence guide. Record whether the participant can complete the investigation.
- Evaluate custom questions against an actual learner need before expanding model use. Do not generate narration, images or explanations in the background merely because a view opens.
- Keep voice features available for participation and preference. Efficiency is not a reason to ask a learner to defend an accessibility need.
- Record which optional features were used and why, without collecting identifying learner information. Do not turn this into a per-child environmental score.
- If a feature adds little observed value, simplify or remove it. This is a design decision to test, not a finding already established.

## What reporting can support

We can report actual completed calls, operations, token counts where supplied, reuse behaviour, estimated API costs and failed attempts with their limits. Those are operational measurements, not a carbon/water calculator. Lower prices or fewer tokens do not on their own establish a proportionate environmental saving across models.

A defensible footprint estimate would require a stated boundary (development, inference, model training allocation, device/server hardware, downloads and other operations), workload-specific electricity data, infrastructure location and timing, electricity emissions factors, water accounting and uncertainty. We do not currently have that evidence from the providers. Even a footprint estimate would not establish net benefit without evidence of the educational outcomes and a meaningful comparison.

The [IEA Energy and AI report](https://www.iea.org/reports/energy-and-ai) explains AI's electricity demand and the interaction with energy supply. [Berkeley Lab's 2024 data-centre energy report](https://eta-publications.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report) covers electricity and associated water/emissions accounting. These sources establish the general concern; they do not measure this app. Do not apply a generic “per prompt” figure as a measured Microverse footprint.

The [teacher activity](classroom.md) includes an optional extension: apply the same dependency-and-evidence thinking to a familiar place and to this tool. It is a discussion prompt, not an evaluated behaviour-change intervention or a claim that education offsets computing impacts.
