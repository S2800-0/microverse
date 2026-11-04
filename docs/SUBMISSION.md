# Microverse submission package

Due 9:00 PM ET, 4 November 2026. Fields below follow the submission form as captured on 3 November. Check the form for any character limits, since the capture doesn't show them.

## Before submitting

| Item | Status |
|---|---|
| Open source GitHub repository (the organizers call this mandatory) | MIT `LICENSE` added |
| 3-minute video link | With Codex and the owner. Test it signed out |
| Island reef photo | Photographer and licence not identified yet. Add the credit if you find it. See `docs/CREDITS.md` |
| Photos used in the trailer | **Check** that each one may be published |
| Publicity permission on the form | Owner to read and accept. It lets Meta and Cerebral Valley publish the submitted materials |
| Survey questions | Owner's own opinions, so left blank here |
| Video link in `README.md` | Add near the top once the video is up |

## Form answers

**Team name:** Microverse

**Team members:** Shahesta Salama

**Track:** Indie Developer Track

**Problem statement:** Push the Frontier, as on the application

**Most Viral Track X link:** Only if entering that track

**Public GitHub repository:** https://github.com/S2800-0/microverse


**3-minute demo video:** `ADD URL`

### Project Description

```text
Microverse turns a photo of a real place into a small living world that a curious child can experiment with.

Ecology is about connections, and connections are hard to see in a real place. You can't make it rain less over your local park and watch what happens. In Microverse you can try that on a small model inspired by the place.

Muse Spark looks at the photo and designs a world, keeping what it can see separate from what it is guessing. Muse Image paints the ground, creatures and scenery as separate layers. Then the world runs on the device: plants grow and get eaten, and animals walk, eat, sleep and chase, keeping to walkable ground read from the painting.

Every world comes with a lesson that fits its habitat, such as less rain, warming water or more plant-eaters. You guess what will happen, make one change and watch 40 days. Microverse then replays the same world from the same start without your change and shows both results side by side, with a named source for the real-world science. Surprising results are shown as they happen.

Spark, a fox guide, answers questions from what actually happened in the world and turns typed requests into checked changes. You can also turn a photo of a pet into a watercolor companion who visits.

Microverse is a teaching model, not a forecast of any real place. It has not yet been tested with children or teachers, so we make no claim about learning outcomes.
```

### Describe your use of Meta products to build the submitted project

```text
Muse Spark 1.3 plans each world from the photo as strict JSON: title, habitat, what is visible, what is assumed, four inhabitants with roles and movement, habitat objects, and a lesson chosen from a fixed menu. Every reply is validated, and a lesson the world can't run is ignored. Spark also interprets typed requests into validated world commands and answers custom questions using recorded events from the simulation.

Muse Image 1.0 paints the terrain from above, creature sheets, scenery, drawn poses for eating, sleeping and running, and watercolor pet companions. Each animal's drawn poses come from its own art, so it stays the same character.

SAM 3.1 cuts creatures out of their paintings so they can move as separate layers.

All calls go through the Meta Model API from a local server that keeps the key private, with consent before a photo is sent, spending caps and no automatic retries. The AI designs a world once. After that the world runs, replays and compares on the device with no further AI calls.
```

### Why are Meta's models important to your solution?

```text
They are what let the world come from your place instead of a menu. Without them Microverse would be a fixed set of worlds someone else chose.

Muse Spark can look at one photo and produce a structured world our simulation can actually run, while saying which parts it saw and which it guessed. Muse Image gives each new world and animal one consistent watercolor style across ground, creatures and poses, in layers a game can use. SAM 3.1 separates a creature from its painting cleanly enough for it to move through the world.

Together they turn a personal starting point, like your garden or your pet, into something a child cares about. Then the fair test on the device does the teaching, so the science comes from replayable rules rather than from a model's opinion.
```

### Feedback on partner technologies (optional)

Leave blank unless you have used them. This build made no Baseten, Modal or Fireworks calls.

## Facts for follow-up questions

**Technical depth**

- A seeded simulation with complete replay, which makes the same-world comparison possible
- A PixiJS stage with separate water, plant, canopy and flight layers
- Leg positions found from each drawing's shape, then mesh warping, so one drawing can walk
- Route-finding over a walkable grid computed on the device from the painting
- 113 automated tests, plus 4 packaging tests

**Do not claim**

- It predicts a real place
- The AI writes or verifies the lessons. They are short cards in our own words with named sources
- The AI understands paths. Paths come from a colour rule on the painting
- Fluid simulation, or a realistic gait
- Any learning result. Real phones and touch have not been tested either
- Best Agentic Use-Case: the simulated animals are not AI agents

**Other tools used**

Claude Code and Codex as coding assistants. Codex's image tool made the home screen fox and landscape. Kokoro makes the local narration voices. None of these are Meta products.

## Built during the event

The form has no field for this, but the Participant Guide says the demo must identify what was built during the event. The repository's history runs from 26 October. This app was developed in a separate local folder from 2 November and its git history begins on 4 November, so the last row rests on notes rather than commits. The dates come from provenance notes in this repository and in `docs/PROVENANCE-EARLIER-APP.md`.

| Period | Work |
|---|---|
| Before the event (noted 22-23 October) | Early simulation engine, puppet and rig motion modules, terrain and scene ecology logic, some public animal art and the spring map. Hashes for reused files are in `docs/assets/*.json` |
| 26 October to 1 November | Earlier Microverse app: Meta creature pipeline, Spark investigation, experiment replay, narration and the three open tool packages. The guide lists building as 27 October onward, so check work dated 26 October against the rules |
| 2-4 November | This app's journey and design, the photo-to-world pipeline, the layered living world, Spark world commands, drawn poses, per-world lessons, walkable paths, water and the new motion |

Don't present the "before the event" items as new. Earlier notes say the guide asks for new work only, and states permission to extend an existing product for startups. Check the official rules.

## Live product

https://microverseeducate.vercel.app

The form has no live site field, though the guide says the live product should be available for judging. The static site includes the saved worlds, all four lessons, prepared Spark answers and the rain story. It does not include making new worlds, new companions or AI Spark replies, which run on the local server. The video shows those.

## Video description

```text
Microverse turns a photo of a real place into a living little world you can experiment with. Built with Muse Spark, Muse Image and SAM 3.1.

Code: https://github.com/S2800-0/microverse

Music: ADD CREDIT LINE IF THE CHOSEN TRACK NEEDS ONE
Full credits: docs/CREDITS.md in the repository
```

If the video shows the meadow photo, add: "Meadow photo: Jasmine Horn / NPS, CC BY 2.0." If it shows the woodland photo, add: "Woodland photo: Derek Harper, CC BY-SA 2.0."
