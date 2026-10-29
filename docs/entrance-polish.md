# Entrance polish and open tools · October 29, 2026

The entrance is a separate review surface at `/storyboard.html`; the classroom/game remains at `/`. `/behind.html` explains creation and resource use. `/build-with.html` links actual independent repositories.

## Presentation changes

- Shorter sticky introduction, direct scroll transforms and independently moving foreground trees. No CSS transition chases the scroll position.
- One cached sprite blit per new pose replaces runtime mesh deformation for the entrance fox and fawn. Each atlas has 24 poses locally rendered from its existing reviewed rig. This is an artistic walk, not measured locomotion. The main game keeps its procedural renderer.
- Equal-width hero buttons; the red dot, curiosity line and audience pill are removed. A traced mountain ridge overlaps the lower edge of “world.”
- A separate full-width weather scene follows the entrance. Fine, irregular canvas rain replaces the repeating stripe overlay. Its preview does not calculate ecological results; the lesson link opens the actual model.
- A phone contains a real licensed photo alongside the actual Muse Image edit of that photo, rather than an unrelated generic dog.
- Pause, reduced-motion defaults, offscreen/document-hidden suspension, still-image fallbacks and keyboard entry choices remain available.

Scenery is locally exported to WebP. The background and two edge planes total about 0.80 MB; the fox atlas is about 0.35 MB. This reduces image transfer and per-frame work; it is not a device-independent frame-rate or environmental benchmark.

The full project passes 148 tests, syntax checking and static build. Browser review covers 1280 px pages and 390 px embedded layouts (not hardware/device emulation), weather selection, pause, entry links and puppet fit/accept/fallback. These checks do not establish a frame-rate benchmark or participant usability.

## Public photo example

Source: [Golden Retriever 88.JPG](https://commons.wikimedia.org/wiki/File:Golden_Retriever_88.JPG), Mtlchung, CC0 1.0. The source is cropped and stripped of metadata. One Muse Image reference edit and one SAM call created its watercolor cutout. The collar/tag are retained; the requested loose trailing leash is omitted. Developer visual review is not an owner likeness assessment.

This pair reserves 12,500 microUSD ($0.0125) against the existing private image ledger; aggregate reservation is 287,500 of its 325,000 microUSD ceiling. Reservation/price estimates are not a verified billing debit. No other paid calls are needed for this presentation change. Source/derivative hashes and processing details are in `public/entrance/manifest.json`; private keys, mask packets and receipts are excluded.

## Reusable code

The owner approved MIT licensing for original project code. The main repository's LICENSE excludes upstream materials through THIRD_PARTY.md. Each extracted repository contains MIT original code, source provenance, limitations, CI, tests and examples; no model weights, art, private photographs or credentials are copied.

| Repository | Clean GitHub checkout verification |
| --- | --- |
| [microverse-ecosystem](https://github.com/S2800-0/microverse-ecosystem) | 30 tests; headless rainfall experiment and exact JSON replay continuation |
| [microverse-puppets](https://github.com/S2800-0/microverse-puppets) | 16 tests; numerical example and local browser demo |
| [microverse-commands](https://github.com/S2800-0/microverse-commands) | 3 tests including 20 synthetic routing fixtures; bounded proposal example |

These are source prototypes, not npm registry releases. External developer use, teacher adoption and learning gains have not been measured. Publishing runnable building blocks is a delivered engineering output; downstream impact remains a hypothesis.
