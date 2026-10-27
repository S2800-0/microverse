# Indirect contributions: delivery and evidence plan

The primary goal is a classroom activity a teacher chooses to use. Indirect benefits are hypotheses or reusable outputs. They should follow from the same implementation, rather than expand the hackathon into additional products.

## 1. Transferable reasoning

Target behaviours: change one variable; distinguish an observation from an explanation; trace an indirect effect; recognize that different model runs can vary; explain why a simulated result is not an outdoor measurement.

Deliver during the classroom feature:
- A 15–20 minute teacher activity with one objective, prepared scenario, discussion prompts and model limitations.
- A worksheet/export containing prediction, exact intervention, selected model evidence, learner explanation and a transfer question.
- Two comparable question sets: one before use and a different example afterward, with a simple 0–2 scoring guide for unsupported/direct/indirect reasoning. Do not expose the explanation before collecting the learner response.
- A brief facilitator observation sheet: task completion, time/help needed, points of confusion and whether the teacher would use it again and under what conditions.

Pilot target: two teachers/facilitators and about five learners if available. Recruitment happens through the user; no automated outreach. Obtain appropriate permission for participation/quotes; store anonymized aggregate results and avoid identifiable learner photos/responses in the public repository.

Publish an honest pilot note with actual counts, missing data, example anonymized explanations, changes made, and limitations. Small uncontrolled before/after trials provide usability findings and preliminary learning signals; they do not prove efficacy, long-term transfer or causation. If no participants are available, publish the protocol and state that outcomes are untested.

## 2. Reusable engineering outputs

| Output | Existing feature it depends on | Minimum deliverable and acceptance |
|---|---|---|
| Deterministic ecosystem engine | Engine and replay | Headless example, documented model assumptions, identical-input regression, snapshot round trip once implemented |
| Experiment interchange format | Paired comparison | Versioned JSON schema, two example files, round-trip/replay checks, defined invalid-input errors |
| Species/profile registry | Companion roles | Explicit ecological vs companion profiles, sources/model choices, gait references, unsupported-species rejection |
| Procedural puppet toolkit | Motion/rig PR | Transparent example asset with confirmed rights, documented cut/joint/gait API, geometry tests and a browser demo |
| Ecology question evaluation set | Spark parser | About 20 supported, ambiguous and unsupported prompts with expected typed result or clarification; no child/user data |

Keep modules usable directly from this repo first. Publish no separate package, license grant or benchmark claim without checking rights and completing the actual API. A public GitHub repo alone does not grant a reuse license. Record source/asset rights, choose an appropriate license with the owner, then add examples that run without Meta credentials where possible.

Evidence of utility: a clean-checkout example runs using documented commands; an independent user can replay an exported experiment; an external developer can fit a supported sprite using the example. Stars/download counts are not assumed and are not required to deliver the tools.

## 3. Longer-term applications to investigate

Nature centres and museum workshops could reuse the short guided activity. Game/education developers could reuse the puppet and experiment modules. Citizen-science education could pair actual observations with explicitly hypothetical experiments. These are potential derivatives, not deployed partnerships, conservation outcomes or validated planning tools.

## Milestones and scope budget

- Companion PR: establish this plan and explicit role boundaries.
- Motion PR: document the puppet API and one example alongside its existing tests.
- Replay PR: include the versioned export schema and a clean-checkout reproduction example.
- Spark PR: add the small question set as part of parser verification.
- Classroom PR: ship lesson/worksheet/pilot protocol and incorporate available teacher feedback.
- Before submission: publish one concise evidence report linking only completed outputs and observed findings.

Documentation/examples are part of each feature's definition of done. Package publishing, extra biomes and institutional integrations remain outside the initial build. This keeps the indirect contributions useful without displacing the main demo.

## Delivery status · October 27, 2026

- Delivered in the investigation/classroom slice: 15–20 minute lesson, two constructed reasoning prompts and exploratory rubric, facilitator observation sheet, learner-first explanation, printable response/evidence record, private full replay and stripped model-only rerun.
- Delivered question fixture: [20 synthetic labelled examples](../examples/questions/README.md), exercised for local routing. Intended custom-provider answers are separate labels, not a completed model benchmark. One live Meta parameterized-rainfall proposal was validated.
- Existing engine, motion and replay modules retain their tests and guides. Separate package publishing, a standalone JSON Schema/examples bundle and external developer usability checks are not claimed as completed outputs.
- Participant sessions: **zero**. Teacher adoption, reasoning gains and transferable learning remain untested. No conservation decision, institutional partnership or deployment is claimed. The first real participant observation should determine the next UI revision.
