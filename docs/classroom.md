# Make it useful in a classroom

Design target: a teacher can run one 15–20 minute ecosystem investigation from a browser or projector without student accounts or setup work. These are proposed usability requirements to validate with teachers.

- One prepared lesson with a learning objective, suggested prediction question, supported intervention, discussion prompts, and model limitations.
- Quick experiments, pause/reset, readable population/resource views and a stable shared starting scenario.
- Ask for a prediction, run the experiment, inspect events, then ask the learner to explain before revealing the full generated explanation.
- Export a concise experiment sheet with the learner's prediction, change, model results, explanation and rerun data.
- A low-bandwidth mode can replay saved art and experiments while clearly labelling unavailable live generation.

Potential indirect benefits to evaluate: reasoning about controlled variables and indirect effects; interpreting variability; recognizing the limits of AI and simulation. Further reusable outputs could include a deterministic experiment engine, explicit species-profile schema, procedural puppet tools, and a labelled corpus of supported/ambiguous ecology questions. These would be derivative tools or potential benefits, not proven impact or validated environmental research.

Relevant existing classroom practice: [Harvard ecoXPT](https://ecolearn.gse.harvard.edu/projects/ecoxpt) includes lesson plans, teacher guidance and rubrics. [NGSS MS-LS2](https://www.nextgenscience.org/dci-arrangement/ms-ls2-ecosystems-interactions-energy-and-dynamics) connects ecosystem changes, resource availability, evidence and explanation. Alignment to a learning target does not establish educational effectiveness.

## Implemented activity and pilot status

Open `/teacher.html` in the local preview (or the static build) for the printable lesson, observation sheet, 0–2 exploratory rubric and boundaries. The forest's **Ask “what if?”** dialog collects a prediction and optional before-use response. The comparison collects an explanation before revealing the evidence guide. **Finish the classroom activity** collects the transfer response and facilitator notes; **Save printable worksheet** exports these plus exact results and a model-only rerun link. The complete activity works without an API key. The UI remains a draft to revise after observation.

The before question assumes algae → insect larvae → fish; the transfer question assumes grass → grasshoppers → small birds. Both ask for an indirect effect after reduced producer growth. These are constructed, roughly comparable prompts, not a validated assessment instrument. Keep scoring consistent; distinguish missing responses from score zero. Do not teach the chain before collecting the first response or claim causation from a small uncontrolled trial.

**Actual sessions: zero.** A general science/biology teacher, workshop facilitator or learner can test the workflow; a specialist ecology teacher is not necessary for the first usability session. The owner arranges recruitment and appropriate permission. No outreach is sent automatically. First record where a participant needs help and whether a teacher would use the activity. If no participant is available, submit the implemented activity and protocol with outcomes labelled untested.

These deliver the lesson/export/protocol parts of the [indirect contributions plan](indirect-contributions.md). Learning transfer, classroom adoption and conservation benefits remain hypotheses. The [investigation guide](investigation.md) records live-provider verification separately from offline tests and educational evidence.

## Optional everyday-life and resource reflection

After collecting the existing transfer response, allow an additional 3–5 minutes for the extension in `/teacher.html#resource-reflection`. The comparison dialog also shows the two short discussion prompts under **Finish the classroom activity**. These are optional oral discussions; no new response field or replay data is collected. A facilitator may record observations in the existing optional notes field with participant permission.

Ask what a familiar plant or animal depends on and what outdoor observations would be needed before helping it. Then examine the learning tool itself: which features helped, which could use saved results or ordinary controls, and what evidence would be needed to assess its environmental trade-offs? Collect the transfer response first to avoid coaching that assessment. Do not score these discussions using the food-chain rubric, require an environmental pledge, or ask learners to justify accessibility needs.

The extension is not evidence that attitudes or behaviour changed. The [resource-use guide](resource-use.md) distinguishes implemented safeguards from unmeasured environmental outcomes.
