# Reusable living-world recipe · V12

These templates describe the implemented bounded pipeline and the review needed before adding a saved world. They do not promise arbitrary scientific reconstruction. Runtime prompt sources are `src/world/blueprint.js` and `server/world-generation.mjs`.

## Inputs and substitutions

| Variable | Origin / allowed values | Review |
| --- | --- | --- |
| photo | Explicitly selected, resized/re-encoded PNG, at most 640px | Consent before sending; never insert a private name/location |
| mode | nature / imagined | A toy, pet or object can inspire an explicitly imagined habitat |
| habitat | land / freshwater / marine / snow | Select supported rules; do not claim a new calibrated biome |
| visible | At most the bounded list of visible clues | Separate from guessed inhabitants and food |
| landscape | Terrain description from the accepted plan | Must match the photo’s broad character |
| water | Normalized x/y/w/h rectangle | Review against the final painting, not just the input photo |
| inhabitants | One producer + three animal groups for new plans | Reachable diets, supported motion, no unseen species asserted as measured |
| objects | Up to eight bounded trees/rocks | Check placement, trunk footprints and perch positions |
| event | dry-spell / warm-spell / new-arrival | Validate; name an actually implemented inhabitant |
| look | Visible markings/accessories; illustration direction | Preserve distinctive appearance; do not infer personality |
| motion | rooted / walk / hop / swim / fly | New anatomy is not automatically a usable rig |

## 1. Plan once with Spark

Use the structured schema, not arbitrary executable code:

> Design a small living teaching world from this photo. List what is visible separately from guesses. Propose a recognizable habitat, one producer, three animal groups with reachable food, up to eight usable habitat objects and supported experiments. A pet or object can inspire an imagined world. Do not infer ecosystem health, precise species, carrying capacity or a real forecast. Return the validated Microverse blueprint.

The compiler rejects unsupported keys and bounds text/geometry. It corrects coral-as-producer to algae, aligns the single producer pool with grazers’ zone and prevents a dragonfly from being represented as a snail-eating hunter. These checks catch known errors; they are not a complete ecology expert.

## 2. Generate terrain and inhabitants separately

Terrain template:

> Warm-paper watercolor storybook game art. Gentle elevated view looking down. Terrain only, no baked-in animals, words or interface. Recognizable {landscape}, open movement channels and reviewed {water}. A garden has beds and a pond; a woodland has shade, logs and a glade; a reef has underwater channels. Keep playable features inside the image. The photo is inspiration, not a measured reconstruction.

Sprite template:

> Precisely spaced 2×2 sheet, pure white background. {top_left}, {top_right}, {bottom_left}, {bottom_right}. One complete subject per cell, facing right, 18% empty margin. Same watercolor palette as the terrain. Preserve {markings_and_accessories}. No scenery, grid, frame, text or shadows on white.

Use a single sheet per world, cut locally, cache approved assets. Inspect every cell, remove white locally, verify ears/fins are intact and reject merged or clipped bodies. The saved woodland deliberately crops out the generated extraneous pond. Never label this manual crop as SAM measurement.

## 3. Review geometry and motion

Check the final terrain with animals visible. Fish must stay in water; plants and bites must be reachable; canopy layers must not hide all animals. Garden water is a manually reviewed safe open-water rectangle, not the entire irregular painted pond. Small stepping stones remain scenic, not a recovered navigation mesh.

Use confirmed fin/mouth/eye regions only. Reject doubtful tails. A complete generated bird needs wing poses or a reviewed cutout rig; generic bobbing is not wing flapping. Current owl uses four generated wing poses, while tree trunk/canopy are separate assets. Saved goldfish/parrotfish regions were manually authored from visible artwork; do not claim AI detected them. Generated grass/fern props are available but are not installed as a full physical vegetation system.

## 4. Run local rules and inspect evidence

Food grows per patch; a real bite consumes that patch. Agents seek food, visitors wander and hunters follow prey. Woodland owls can land at tree objects; ground agents avoid trunk footprints. Stored rates are invented teaching parameters. Three animal groups are not a complete food web. Garden, woodland and reef have distinct artwork/inhabitants but share bounded role logic.

For a custom question Spark selects a permitted topic and real event IDs. Local code verifies them and constructs the answer. Prepared questions cost no inference. An unsupported site prediction must return uncertainty. An AI answer never changes code, arbitrary assets or rule values directly.

## 5. Acceptance before adding a library place

- Exactly three animal discovery choices; comfortable initial population (currently 9–10).
- Modest pan/zoom (1–2.25×), Find the animals, keyboard controls, pond close-up when supported.
- Step seven days, see a real bite and changing patch, pause, reset and deterministic replay.
- Test no consent, invalid plan, insufficient credits and unsupported question.
- Desktop/phone review, large readable question, dimmed helping note, voice off/on.
- Save source, prompts, receipts, hashes, crops, manual changes and unresolved rights.

## Research for curated roles

[NPS red fox](https://www.nps.gov/cwdw/learn/nature/red-fox.htm) describes a broad diet including rodents. [NOAA fish and reefs](https://www.fisheries.noaa.gov/science-blog/fish-shapes-reef) discusses herbivory. These motivate simplified roles, not numerical calibration. Parrotfish grazing does not mean every grazing interaction always improves every reef. A future species pack needs cited diets, habitat range and model validation before making stronger claims.
