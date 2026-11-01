# UI/UX feedback backlog

Owner feedback captured 2026-11-01, split by which build each item belongs to.

**Important:** most of this describes a scrolling landing page with a fox hero,
"Play now"/"Explore world" buttons, a "Create my creature" flow and a tutorial.
None of that exists in this repository. `app/` holds two pages: `index.html`
(one non-scrolling screen, `overflow:hidden`) and `teacher.html` (print guide).
Searches for "Play now", "Explore world", "Welcome to your little world",
"Create my creature", "little fox", "tutorial" and "snow" return nothing here.
Those items are therefore recorded, not actionable, until that build is reachable.

---

## A. Actionable in this repository

### A1. Drop the forced review step before a pet enters the forest — HIGH
"Don't let the kids decide if it's right or not from the get-go. Make it an
option afterwards. Why so complicated? It'll make it harder."

Today `app/index.html` step 2 makes every learner judge "Use the moving legs"
vs "Move as one picture" before **Add to the forest** enables
(`src/scene/creature-import.js`, `review.getState().approved`). Proposal: accept
the best automatic result and add the creature immediately; move the rig choice
behind "Not moving right?" for whoever wants it. Keeps `assessRig` as the
automatic gate.

### A2. One path in: library, upload, or camera — MEDIUM
"Go straight to create my creature, and either choose from library or upload or
take a picture."

The Add popover splits wild species (dropdown) from pets (separate dialog), and
the import dialog has no camera input, though `place-dialog` already uses
`capture="environment"`. Proposal: one "Add a creature" surface with three equal
choices, each an icon tile.

### A3. One thing at a time, with icons — MEDIUM
"Create my creature is overload. Make stuff one at a time with icons."

Applies to the import and place dialogs, which still present every field at once
inside their step headings.

### A4. The forest is static until Play — MEDIUM
"When you go back to the forest there's like animals already, static animals."

Animals hold a single frame until Play is pressed. Options: idle motion
(breathing, ear flicks) under `prefers-reduced-motion: no-preference`, or
auto-play on first load with the existing pause control.

### A5. Weather reads as nothing — MEDIUM
"The rain also looks very generic and is weird... maybe add some snow."

A drought currently renders only as `#resource-tint` opacity. Rain and winter
have no visual at all. Needs art, not just CSS.

### A6. No tutorial — MEDIUM
"The tutorial was really bad. There's no tutorial basically. It should be more
dynamic, like a point and click."

Nothing here teaches the predict -> experiment -> inspect -> explain loop in the
app itself; `teacher.html` is a printable sheet. Proposal: a 4-step coach-mark
tour on first visit, dismissible, replayable from Menu.

### A7. Make the repository look open source — MEDIUM
"GitHub repos need to look open source, with tags, how to use, how it works,
with screenshots."

`README.md` is dense prose with no screenshot, no badges, no quick start above
the fold. Proposal: hero screenshot, 3-line what-it-is, install/run block, a
"how it works" diagram, CI and licence badges, topic tags on the repo.

### A8. Text too small and too much of it — MEDIUM
Partly confirmed by the interface review: status line 12px, dialog measure
~77 characters, inputs 13-15px (which also zooms iOS on focus). Tracked in the
review findings table.

### A9. Natural voices not ready — LOW
Known; see `docs/narration.md`.

---

## B. Belongs to the landing-page build (not in this repository)

Recorded verbatim so nothing is lost. Needs that codebase to action.

1. Visuals are loved overall — keep the direction.
2. Hero fox is weird and static; make it run out of frame as the page scrolls.
3. "Play now" and "Explore world" buttons look generic.
4. "Hello little fox" at the end does nothing — give it a job or remove it.
5. The fawn is static and appears to run on a rock.
6. The small question element: make it big or remove it.
7. Scale is inconsistent throughout — things are too small or too big.
8. Too much body copy; move text into the images as designed visuals.
9. Copy is bland and generic.
10. The page is hard to read and boring; no focal point ("where do I look?").
11. Reveal content on scroll, one block at a time, not all at once.
12. The "create your own creature" art and visualisation are good — polish further.
13. "Someone you already love" needs to read clearer, closer to the dog graphic.
14. "Curious is enough" is far too small.
15. "Let's play" is generic; consider making Play part of the scroll.
16. "Welcome to your little world" is too small.
17. The bunny looks generic and does nothing.

---

## C. Decisions needed from the owner

- **C1. Which build is the demo?** If the landing page is what judges see, the
  work in this repository is secondary and section B should lead.
- **C2. Generation provider.** "Use API to generate, or ChatGPT, I don't care."
  This repo wires Meta Muse Image and keeps generation off by default; a change
  of provider affects `server/meta-provider.mjs` and the cost and consent copy.
- **C3. A1 versus the project's stated caution.** `docs/ui-boundaries.md` and the
  consent copy deliberately make a person approve generated art before use.
  Accepting automatically is the right call for kids, but it is a deliberate
  reversal and should be recorded in `PROVENANCE.md`.
