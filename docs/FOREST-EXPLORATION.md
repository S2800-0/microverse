# Microverse V5: stay a little curious

2 November 2026. Built in the separate prototype. The main project and published site remain unchanged.

## Design direction

Keep the selected watercolor world as the dominant image. The new exploring view has a small clock, a short invitation, and four controls in a soft dock. The forest is not covered by a permanent inspector or results table. Journal, neighbour choices, individual animal cards and exact records appear only when requested.

- Original palette, Fraunces and Atkinson Hyperlegible preserved.
- Warm rounded paper surfaces; large labelled controls; single opening action for each supporting panel.
- Motion reacts to opening a panel or seeing a new real event. No invented event sequence or automatic carousel.
- Native dialogs retain modal semantics; stable external openers receive focus when closed.
- A four-species chooser provides a keyboard alternative to pointing at creatures on the canvas. The animals are not 37 individual tab stops.
- Mobile control dock becomes two rows; supporting panels fit the viewport and scroll internally.

Fresh rendered QA is blocked. These are implemented design decisions, not verified findings about the appearance or usability of V5.

## Entry and behavior

After an experiment, **Explore this forest** opens an isolated fork of its usual-rain forest. Exploration is earned after the story; it does not replace the guided front door. Returning to the experiment preserves its exact state and result file.

- **Let it grow / Pause weeks:** opt-in time playback, one model week per 1.6 seconds; stops when a dialog opens or the tab is hidden.
- **One week:** advances one actual engine step.
- **Meet a neighbour:** four real model species, with absent species unavailable at that week.
- **Forest journal:** recent births, arrivals, deaths and hunts, with exact records behind an optional disclosure.
- **Recorded moment:** a small invitation appears only from a real journal event with a currently present animal; the record remains distinct from its current close-up.
- **Replay this year:** at the 52-week exploration bound, resets to the exact forked initial state. It is deterministic, not a new random ecology claim.

The journal starts empty because pre-exploration events are excluded. Each entry retains its exact event index and week. An earlier death is not offered as a living animal. Model food-web facts on the neighbour cards are explicitly presented as model rules, not inferred facts about a real animal in the uploaded photograph.

## Motion and performance choices

[Motion’s official React documentation](https://motion.dev/docs/react-animation) and [presence documentation](https://motion.dev/docs/react-animate-presence) were consulted. The official `motion` package is pinned to **14.9.0**. It animates panel changes and genuine recorded-event invitations, respecting reduced motion and manual motion pause.

Motion and the exploration component are loaded as a separate route chunk. This avoids putting their entire animation code into the entrance’s first JavaScript chunk. No new account or animation-service credits are needed.

Existing fox/fawn 24-pose atlases are reused. Adult deer/doe/wolf use copies of the previously reviewed rig settings and the original local fitter. Valid rigs prepare a 24-pose atlas once, yielding between batches. Ordinary animation then draws one cached texture per animal rather than repeatedly deforming all leg meshes. Failed fittings retain the original gentle image movement; no successful anatomical reconstruction is claimed. Rabbit breathing and hopping remain cosmetic.

The underlying animal movement follows real weekly positions and traversability. Rendering, pointer selection and panel transitions do not advance the RNG or ecological clock. Hidden tabs stop rendering; time playback does not catch up silently in the background. No frame-rate benchmark or fully verified animation-quality claim is made.

## Tools considered

Product Design was verified installed. Plugin discovery also found video tools such as Runway/Higgsfield, but they require separate accounts and do not replace responsive, state-linked game animation. They were not installed or billed. Existing Product Design/frontend/rig tooling plus the official Motion library serve this slice directly. Existing Remotion remains available for the separate demo video; it was not mistaken for the game’s interactive animation system.

## Tests and limits

Five new model tests cover exact experiment isolation, a bounded reproducible exploration year, original journal record references, absent-actor close-ups, neighbour availability and actual season boundaries. They run alongside earlier tests. Browser rendering, pointer hit alignment, keyboard focus, voice playback, native camera, visual aesthetics and device performance still need approved browser inspection.

No paid Meta/Baseten calls, provider configuration changes, new biome engine, teacher trial or deployment occurred. See `BROWSER-APPROVAL-DIAGNOSIS.md` for the observed approval failure and the supported manual-review route.
