# Demo reshoot handoff for Codex

Written 4 November 2026. Submission is due 9:00 PM ET today, which is also when the local AI permit expires (5 November 02:00 UTC).

## Read this first

- **The reef photo in the library changed.** The old Huahine photo had no confirmed rights, so it was removed. It is now Borut Furlan's Moorea split-shot (CC BY-SA 4.0, credit required if shown). Reshoot any shot showing the old card.
- **Check the trailer's photos.** `scripts/prepare-opening-art.py` uses unlicensed-looking sources, including an iStock preview (`istockphoto-877356936-612x612.jpg`) and unnamed web images. The owner wants anything without a clear licence replaced with something similar before publishing, and the art made from those files is affected too.

- **Reshoot anything filmed before commit `958b91c`.** It shows the old motion, pond and labels.
- **Any footage of a newly generated world made on `958b91c` itself would be a failed attempt.** Live generation was broken at that commit. It is fixed in the commit after it.
- **Use this local folder, `microverse-camera-prototype`, at its latest commit.** Do not use the `microverse-hackathon` folder, which is an older codebase.
- **Run it locally to film generation or AI Spark:** `http://127.0.0.1:8860/`. Those features only exist on the local dev server. A static deployment has the saved worlds and lessons only.
- **Budget:** the cap and the ledger changed after this was first written, so read the current balance from `/api/world-tools/status`. One full new world reserves $0.30, and the app refuses to start one below $0.30. Do not reset the ledger, and do not spend without the user's approval.
- **Keep the browser window visible while recording.** A hidden pane stalls image loading and world motion.

## What looks different on screen

| Area | Old footage shows | Film now |
|---|---|---|
| Walking and running | Two images flipping | One drawing with legs swinging from the hips, plus tail sway and head bob |
| Eating | Old meal label | Stacked PNG stickers: "nom nom nom" |
| Sleeping | Text z | Three z's that rise, grow and fade |
| Chasing | Nothing | A "!" sticker |
| Owl | Bigger than everything | Smaller than the fox, larger than the mouse |
| Surface water | Flat painting | Moving light, ripples and sparkles, only on painted water |
| Beneath the pond | Stripy background | Painted bed with pebbles and soft weeds. Creatures are drawn 1.45x as a close-up |
| Animal routes | Walk across anything | Land animals keep to walkable ground and route around obstacles |
| New in the world panel | Nothing | A dark "This world's lesson" button |

Fish still swim with a body wave rather than legs. The owl's wings crossfade between frames.

**Not changed:** the rain story ("My first adventure") uses its own older drawing code, so its animals do not get the new motion, stickers or water. Do not cut from it straight to a living world in a way that makes the difference look like a bug.

## The new lesson flow to film

Open a world, then press **This world's lesson**:

1. Read the question.
2. Choose a guess.
3. Press **Try it and watch 40 days**.
4. Wait about 30 seconds at normal speed. **Watch 7 days** speeds it up.
5. The result shows two bars, a sentence comparing them, whether the guess matched, a real-world note, what the simulation does not model, and a source link.

If **Watch 7 days** ends mid-lesson, the world pauses. Press the new **Keep watching** button.

| World | Lesson | How to reach it |
|---|---|---|
| The garden | When the rain thins out | Library |
| The woodland edge | How many can this place feed? | Library |
| The island reef | When the sea warms | Library |
| The pond | When the pond warms | Garden, then the pond door |
| New generated land world | Chosen by the AI. The test meadow chose the rain lesson | Upload a photo |

### Results seen in the app today

| World | With the change | Without it |
|---|---|---|
| Garden | 69% | 78% |
| Woodland | 68% | 82% |
| Reef | 45% | 57% |
| Pond | 59% | 69% |
| Generated meadow | 35% | 44% |

**Do not script these numbers.** They shift with the day you start and the world's seed, so narrate whatever is on screen.

**The result is not always "less food".** Over seeds in simulated runs, the pond showed less food in 18 of 24 runs and hardly any difference in 6. Woodland showed less food in 8 of 10 and hardly any difference in 2. If that appears on camera, it is honest behaviour. Keep it or start the world again.

Also keep the older rain story wording current: at Some food it reads 47 rabbits against 72 at week 52. Any script saying more rabbits is out of date.

## Filming generation

1. Choose **Use my own photo**, then **An outdoor place**.
2. Tick the consent box, which sends a smaller copy of the photo to Meta.
3. Press **Imagine my world**. Planning took about 14 seconds in the test.
4. Press **Bring this world to life**. Painting took a few minutes, so plan a cut.
5. Press **Enter my living world**.

The test used `public/assets/library-meadow.webp` (Jasmine Horn / NPS, CC BY 2.0, credit required if shown). It produced "Alpine Flower Meadow" with Rabbit, Wood mouse, Owl and Meadow lupine, pale connected paths and a 76% walkable map. That world lives only in the open browser tab and is lost on reload.

## Say this, not that

| Safe to say | Do not say |
|---|---|
| Animals follow walkable ground read from the painting's colours | The AI understands the paths |
| The AI asks for pale connected paths when it paints a new world | Paths are guaranteed in every world |
| The planner picks a lesson, and the app ignores a pick the world cannot run | The AI writes or verifies the lessons |
| Each lesson replays the same world from the same start with only that change removed | This predicts a real place |
| Lessons are short cards written in our own words from named sources | Based on an ecology textbook. OpenStax's terms forbid generative AI use without written permission, so it is not used |
| Water is a picture effect | Fluid simulation |
| Leg swing is artistic motion | Realistic gait or universal rigging |

## Avoid on camera

- **Woodland paths are rough.** Ferns and the log block animals, but some bushes and trunks do not.
- **Spark does not discuss lessons yet.** Do not ask it about one on camera.
- **Extra changes during a lesson.** The "with your change" bar then includes those too. Do only the lesson's change.
- **No predator lesson exists.**
- **One goldfish drew about twice its size once.** It could not be reproduced. If it appears, retake the shot.
- **An event label can overlap the Grass to eat card** in the rain story.

## Checks done today

- 113 tests, 4 site tests and the production build pass.
- All four saved-world lessons and the generated world's lesson ran to their result in the app.
- At 375px wide, the woodland result fits and scrolls into view. The page does not scroll sideways.
- Tapping a creature mid-lesson hides the card and the lesson continues when you return.

**Not checked:** a real phone or touch, motion judged by a person at full speed, and the audio. The music has not been listened to by anyone on the project. The user is choosing the track; credits are in `docs/demo-assets/music/README.md`.

## Bugs fixed after `958b91c`

1. Live world generation failed with a 400, because the plan format broke the API's strict mode.
2. The woodland lesson could never finish, because adding animals wiped the lesson. Tapping any animal mid-lesson did the same.
3. After **Watch 7 days** the lesson bar stalled with no prompt.
4. On small windows, the result text sat out of view below the bars.
