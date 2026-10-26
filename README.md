# Microverse

An illustrated ecosystem playground: bring a creature to life, predict what an environmental change will do, and compare repeatable model experiments.

This public repository is being assembled one feature at a time. The living forest now supports complete snapshots, paired experiments and downloadable replay with creature images and learner notes. Meta inference remains upcoming. The intended classroom activity is a short **predict → experiment → inspect → explain** lesson about indirect ecological effects.

## Development

Use Node.js 24 or newer. No runtime dependencies are required for the initial simulation module.

```sh
npm test
npm run check
npm run preview
npm run build
```

Feature branches and pull requests carry their own tests, limitations, and provenance. See [development workflow](docs/development.md), [migration sequence](docs/migration.md), and [classroom design](docs/classroom.md).

The [indirect contributions plan](docs/indirect-contributions.md) specifies how to evaluate reasoning skills and make the engine, replay format and puppet tools useful to other builders.

Run `npm run preview:motion` for the local [motion workbench](docs/motion.md). The [UI boundary guide](docs/ui-boundaries.md) keeps the eventual product layout open to redesign while retaining tested model and animation logic.

The [living forest guide](docs/forest.md) documents the current interaction, browser checks, asset provenance and remaining limits. The UI draft is intentionally changeable.

The [replay guide](docs/replay.md) describes the complete snapshot format, reproducibility checks, local file handling and limits of the ten random-continuation runs. Choose **Less rain** or **Remove wolves** in the forest; reopen saved files from **Field notes → Open a saved experiment**.

## Provenance and event contributions

Pre-event experiments exist in a separate local prototype. Imported work is recorded in [PROVENANCE.md](PROVENANCE.md), with its original path and source hash. An import date does not make old work newly developed. The final submission must identify eligible new event contributions separately and follow organizer clarification on reuse.

Simulation output describes a simplified model. Natural-history facts, tuned model assumptions, generated imagery, and observed real-world measurements must remain distinguishable. This project does not currently provide environmental forecasts or evidence of improved learning outcomes.
