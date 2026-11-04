# Microverse brand kit — Little Field Club

Selected by Shahesta: option 3, 2 November 2026. Source: brand-options/brand-little-field-club-v7.png. The independently generated concept contains approximate type and imperfect hex labels; the exact implementation tokens below are canonical.

## Identity

Current identity (V12 user revision): a live-text wordmark with a clay paw replacing the dot over the first “i”. The fox/globe mark was retired after the user found it too close to Firefox. Tagline: **Small world, big consequences.** Keep the tone inviting and concrete, never babyish. A character and one thing to do should lead each screen.

## Color

| Role | Exact value | Use |
| --- | --- | --- |
| Deep forest | #1F4B49 | Display text, actions, logo wordmark |
| Misty moss | #79A8A0 | Quiet accents and supporting illustration |
| Sunlit seed | #E8BD68 | Highlights, never long body text on paper |
| Fox clay | #D88763 | Warm illustration accent |
| Paper cream | #FFF8E9 | Base surface |
| Reading blue | #315E65 | Body/support text |

Moss, seed and clay are accent colors, not default body-text colors. Preserve dark text on pale surfaces and visible selected/focus states.

## Typography

- Baloo 2 600/700: friendly rounded display and short headings, wordmark. Do not use the generated board's serif-looking lettering as a font specification.
- Atkinson Hyperlegible 400/700: body, controls, settings, evidence. Both fonts are bundled locally; preserve their font licenses from @fontsource packages.
- Heading line-height 1.04–1.1; body 1.45–1.6. Headlines are short questions, not all-caps category labels. Body text normally 17–21px for the child-facing experience; exact records can be smaller secondary content.

## Current wordmark

`src/components/Wordmark.jsx` uses locally bundled Baloo 2, a dotless i and the existing Phosphor PawPrint icon. The header backing stays transparent; a light text shadow preserves contrast over leaves. `public/assets/microverse-paw.svg` is the exact Phosphor icon rendered from the library, retaining its MIT terms, not a generated or handcrafted fox. Leave one paw-width of clear space and retain the full readable name. Never stretch the wordmark.

## Legacy logo files (retained, no longer the live identity)

- public/assets/microverse-logo-v7.png: 512px raster master with alpha.
- public/assets/microverse-logo-128.png: header icon.
- public/assets/microverse-logo-64.png: favicon.
- Exact original generation: runtime/expansion-art/brand-selected-logo-v7.png and matching prompt/usage receipt.

Historical usage for the retired icon: use the icon with a separate live-text wordmark. Minimum icon 36px in navigation; small internal details naturally simplify below that. Leave one ear-width of clear space. Do not stretch, recolor the fox or put it on a busy photograph without paper behind it. A simplified vector small-size mark remains future refinement; the current asset is honestly raster.

## Shape, motion and sound

Capsule actions; softer 20–32px panels with breathing room. Rounded shapes should signal action or focus, not enclose every paragraph. Main learning activity stays visible behind optional details.

Fox head motion is a small locally cached bend of the original artwork after idle. Five generated oak leaves fall slowly. Do not animate every interface element continuously. Respect motion pause and system reduced motion. Music starts on the first interaction, with narration enabled by default after that gesture and independent off/voice controls. Prepared Heart, Bella and Emma clips are local; on-demand answer narration is explicitly labelled Heart.

## Voice and writing

Name the thing before its number: “Two weeks later”, “Watch the coral”, “Less grass food”. Explain a week as seven pretend days. Give a short next action; use actual records for answers; say what the model assumes. Avoid suggesting a photo measures ecosystem health or predicts a real place.

## Art provenance and licensing

New art in this pass is Meta Muse Image, generated from the supplied/reference artwork. Receipts record prompts, source paths and hashes. User-supplied Huahine photo has no verified redistribution licence: keep local until rights are confirmed or replace it with a cleared source before public release. Code MIT intent does not automatically license references, model weights, fonts or artwork.
