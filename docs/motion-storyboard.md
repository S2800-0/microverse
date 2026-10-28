# Microverse: motion and entrance storyboard

Direction accepted October 28, 2026, then revised following the owner's request to match the references more closely. The current study is a full-viewport forest journey using the owner's new woodland and fox files. It replaces the earlier two-column landing composition. Preview `/storyboard.html`; `/` remains the game. No model calls, personal photos or new runtime dependencies are required by this study.

## Promise and audience

**Small world, big consequences.** A curious player enters a living watercolor world, chooses an ecological story or brings a familiar creature, and follows a question through visible changes. Families and classrooms can explore too. We have no teacher/learner trials or measured learning outcomes.

The question-led invitation is **“Ever wondered how your choices affect the world around you?”** Microverse explores consequences in a simplified model; it does not calculate a player's real environmental footprint.

## The first thirty seconds

| Beat | Player sees or does | Meaning and implementation status |
| --- | --- | --- |
| Arrival, about 0–4 seconds | A small red fox takes a few steps on a woodland path. The landscape fills the viewport; the headline sits in the sky. | Working local mesh/IK puppet and new owner-supplied art. Play now is immediately available in the scene and header. |
| Curiosity, player-controlled | Native scrolling moves the camera toward the path, brings in a dry-spell question, then introduces the player's adventure. | Three reversible local beats. A flattened-painting camera move, not independent foreground parallax or an ecosystem result. |
| Play now | Choose My first adventure or Create my creature over the forest. | Working full-viewport native dialog linking to the existing reviewed flows. Escape closes it. A short camera move accompanies entry without delaying the choices. |
| First adventure | Predict what changes first during a dry spell. | Existing live model/lesson opens. Its current interface is retained for the next design pass. |
| Create my creature | Choose a photo or prepared creature, then review appearance and movement. | Existing creator opens; sending a photo for AI processing remains a separate explicit action. |
| Optional reflection | Open Behind the world. | Working technology, reusable-building-block and resource disclosures, with source links. |

## Motion language

- Watercolor pigment, quiet paper, deep green type, and fox-orange emphasis. The red fox is the proposed brand character; the fawn can remain the lesson protagonist.
- Walking communicates entering the world; native scroll supplies a bounded camera move and short question/invitation beats. No scroll hijacking, forced countdown, sound autoplay, or generated video dependency. Below the introduction, optional weather illustrations and the creature invitation remain available.
- A persistent Pause motion control stops the canvas and decorative rain and retains the current camera/fox position. Reduced-motion preference starts the canvas paused, shortens the introduction to one viewport, and disables CSS transitions/rain. Mobile uses a central portrait crop of the full-bleed forest and the same two choices.
- Canvas work stops when offscreen or when the document is hidden; its frame rate is capped at roughly 30 FPS. Movement reuses `rig.js`, `puppet-motion.js`, and the existing artistic canine gait, rather than calling a model per step. This is not measured fox locomotion or animal-behaviour research.
- Still art remains if articulated preparation or canvas setup fails. A visible footer status describes the fallback. The image fallback does not claim to be a working articulated rig.

## Creature reveal: next dependent slice

These are storyboard requirements, **not implemented by the landing-page study**:

1. Choose a photo; review the image before deliberate provider submission.
2. Wait with a humorous, honest painting/cutout animation. The current backend returns the painting and cutout together, so intermediate model progress must not be fabricated.
3. Reveal the actual returned watercolor image, then prepare the local rig.
4. Watch the actual movement preview. Review **the look** and **the movement** separately; keep a simple-motion fallback and an explicit bounded retry.
5. Save the accepted creature to the local collection. Creation is optional; the lesson is always available first.

A portrait, expressions, simple mouth poses, and head options are a separate experiment. Existing rigs keep the head within the torso. One expression sheet could be generated and cut locally, but pose consistency, identity, and talking quality need a small test before promising them. No automatic image generation, paid retries, per-line image calls, or private photo publication are authorized by opening this preview.

## Art direction review

The owner supplied `Sunlit Watercolor Forest Path.png` (1672×941) and `Watercolor Red Fox Walking Rightward.png` (1536×1024, RGBA). These are imported unchanged; hashes and source details are in `public/intro/manifest.json`. The generation tool and creation date are not independently verified. The main ecological game retains its separate map/species art. Existing fawn/dog examples are reused farther down the page and in entry choices.

The forest is one flattened illustration. The camera can move through it, but true foreground occlusion/parallax requires registered scenery layers and paint behind the foreground objects. The fox is a separate transparent image with the current local rig, not an eight-frame walk cycle. Native aspect ratio and the alpha ground line determine rendering placement, avoiding the old square-sprite assumption.

Pinterest references supplied by the owner are inspiration only; their media and layouts are not copied. The original PORTFOLIO KAM page was inspected directly: its walking character stays near a fixed screen position while scenery moves behind it. The first two clips remain obscured by Pinterest's login overlay, so exact motion/timing matching requires unobstructed clips.

Next asset set: registered sky, hills, far forest, clearing, left foreground and right foreground layers derived from this approved master, ideally delivered as one layered source file. Retain the original canvas positions and fill regions revealed by camera movement. Then test one coherent eight-frame fox walk cycle or layered puppet before expanding to other poses. A short expression-sheet test follows separately. Generated video is optional promotional media, not the simulation renderer.

## Behind the world: claims and evidence

The optional final website section explains AI illustration/segmentation/question interpretation, deterministic ecosystem and motion code, reusable puppets and replay/evidence commands, and resource trade-offs. Reuse is an engineering property, not proof of a measured environmental saving or external adoption.

Confirmed October 28:

- The owner's read-only Meta API catalogue returned HTTP 200 and lists Muse Image, SAM, Spark, Wonder and transcription; no video-generation model was listed. No paid inference was performed by that check.
- [Meta's September 2026 announcement](https://about.fb.com/news/2026/09/introducing-meta-one-subscription-service-more-features-ai/) describes consumer video generation powered by Muse models and higher usage through Meta One. Exact account/region access and model identity were not verified. This does not establish an API entitlement or that promotional API credits cover consumer subscriptions.
- [Meta's August 2026 cooling account](https://about.fb.com/news/2026/08/closed-loop-cooling-explained-the-plumbing-behind-metas-ai/) describes closed-loop cooling and a simulator-based control pilot reporting 20% lower air-supply-fan energy and 4% lower water use. The pilot is not a fleet-wide or per-Muse-request measurement and does not validate Microverse's model.
- [Meta's 2025 sustainability report](https://sustainability.atmeta.com/2025-sustainability-report/) describes clean-energy matching, restoration and 2030 goals. Goals and energy matching do not establish zero water/carbon use for this app.
- [IEA's 2026 analysis](https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary) describes efficiency improvements alongside growing electricity demand and more compute-intensive tasks. No comparable evidence was established that Muse is more sustainable than competing providers for this workload.

See [resource-use.md](resource-use.md) for implemented cache/processing behaviour and the missing project footprint evidence. No greenest-provider, carbon-neutral, net-benefit, per-child-footprint, or measured-learning claim is made.

## Acceptance and review record

- Desktop hero, working weather choices, Play now dialog, and both destination flows inspected in the browser.
- Node suite: 137 passing tests; syntax and static build passed. New coverage verifies owner-supplied image hashes and bounded reversible choreography. Server coverage checks the new routes alongside existing private-file protections.
- Full-screen revision: desktop composition and question beat inspected; 390×844 and 320×740 document widths match the viewport; phone intro fills the screen and a one-page scroll reaches the middle question; full-screen entry dialog and Escape checked; camera scale and fox position remain unchanged while scrolling with motion paused. The working first-lesson destination was reopened. OS-level reduced-motion and physical-device testing remain pending; these developer checks are not participant evidence.
- Next review: does the forest entrance feel inviting; is the fox's motion acceptable; can a new player choose a path without reading a paragraph? No usability finding is claimed until someone outside development tries it.
