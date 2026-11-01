# UI/UX feedback backlog

Owner feedback captured 2026-11-01, verified against the running pages.

## Correction to the first version of this file

The first version said the landing page was not in this repository. That was
wrong. It is here, on feature branches that had not been fetched:
`app/storyboard.html`, `storyboard.css`, `src/scene/storyboard.js`, plus
`discovery.html`, `forest-story.html`, `behind.html`, `build-with.html`,
`art-review.html` and `privacy.html`. The newest copy is on
`feat/public-netlify-pilot` (2026-11-01, 30 commits ahead of `main`) and is what
`https://microverse-shahesta.vercel.app/storyboard.html` serves.

Every item below was checked against that branch, served locally and
screenshotted at 1440x900. The page is 3893px tall, about 4.3 screens.

## The branch problem — decide this first

Two lines of work have diverged from a common ancestor dated 2026-10-27:

| | `claude/great-fermi-ol5fi9` (this one) | `feat/public-netlify-pilot` (deployed) |
| --- | --- | --- |
| Commits ahead of `main` | 12 | 30 |
| `app/index.html` | rewritten | rewritten, differently |
| `app/forest.css` | rewritten | +159 lines of its own |
| `src/scene/view.js` | rewritten | +58 lines of its own |
| Menu / Add popovers | yes | absent |
| Landing page | absent | yes |

Both branches rewrote the same three files independently, so merging them will
conflict. The feedback below is almost entirely about the landing page, which
exists only on the deployed branch. Continuing on this branch means the work
does not reach the demo.

## A. Landing page (`app/storyboard.html`, deployed branch)

Each item confirmed on screen.

| # | Item | What is there now |
| --- | --- | --- |
| A1 | Hero fox is static; make it run out of frame on scroll | Fox stands on the path, fixed, while the hero scrolls past it |
| A2 | "Hello, little fox" does nothing | Bottom-right label with an arrow glyph, no target |
| A3 | "Play now" and "Explore the world" look generic | Dark green pill plus outlined pill, no art relationship to the scene |
| A4 | "Let's play" is generic and weird | Same pill again, third instance of the same shape |
| A5 | "CURIOUS IS ENOUGH" far too small | ~11px letterspaced eyebrow above a ~56px headline |
| A6 | "ONE SMALL QUESTION" too small; make it big or remove | Same eyebrow treatment, same problem |
| A7 | Fawn is static and stands on a rock | Right of the rain section, fixed, hooves on stone |
| A8 | Rain looks generic | Three text tabs, Usual / More / Less rain; no weather visual |
| A9 | Too much text, all at once | Six sections, each a headline plus prose, all visible on load |
| A10 | Reveal content on scroll, one block at a time | No scroll-triggered reveals |
| A11 | Scale inconsistent; "where do I look?" | Eyebrows ~11px against ~56px headlines, nothing between |
| A12 | Pet section is good — polish it | Phone plus watercolor dog, "Someone you already love" |
| A13 | "Someone you already love" should read clearer, nearer the dog | Eyebrow sits top-right, far from the illustration |
| A14 | Bunny looks generic, does nothing | Not seen in the four captures; needs locating |

## B. Flow and product

| # | Item | Where it bites |
| --- | --- | --- |
| B1 | Do not make kids approve the generated art up front; offer it afterwards | Both branches. In this one, `creature-import.js` blocks **Add to the forest** until a rig is accepted |
| B2 | Go straight to create a creature: library, upload, or camera | Import dialog has no camera; `place-dialog` already uses `capture="environment"` |
| B3 | One thing at a time, with icons | Import and place dialogs still show every field at once |
| B4 | There is no real tutorial; make it point-and-click | Neither branch has an in-app tutorial |
| B5 | Forest animals are static until Play | Both branches |
| B6 | Rain static; consider snow | No weather art in either |
| B7 | Kid-friendly, education-friendly throughout | Cross-cutting |

## C. Repository presentation

| # | Item |
| --- | --- |
| C1 | `README.md` needs an open-source shape: hero screenshot, quick start, how it works, badges, topic tags |

## D. Known

| # | Item |
| --- | --- |
| D1 | Natural voices not ready (`docs/narration.md`) |

## E. Open questions

- **E1.** Which branch continues? Recommendation: branch from
  `feat/public-netlify-pilot`, since it is deployed and holds the pages the
  feedback is about.
- **E2.** Does the forest work on `claude/great-fermi-ol5fi9` get ported, dropped,
  or left for later? B1 applies to both and is worth porting whatever is decided.
- **E3.** Generation provider: the owner said any API is fine. Changing it touches
  `server/meta-provider.mjs` and all cost and consent copy.
- **E4.** B1 reverses the deliberate review-before-use stance in
  `docs/ui-boundaries.md`; record the reversal in `PROVENANCE.md`.
