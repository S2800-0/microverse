# Microverse: softer controls and a living photo library

2 November 2026. This extends the selected watercolor fox direction; it does not introduce a new brand or replace the main project.

## Research and choices

The useful current direction is expressive, tactile UI: recognizable labelled controls with enough shape, contrast and response to show what matters. A search for “2026 trends” also returns many opinion lists. Those lists do not establish child usability. This pass uses primary design research and accessibility guidance to decide which parts fit Microverse.

- [Google Design: Material 3 Expressive research](https://design.google/library/expressive-material-design-google-research): strategic shape/size/color can help people locate key actions. Its research also found that unfamiliar scattered artwork and removing labels harmed usability. This supports one prominent camera button and three explicitly labelled photo cards. It does **not** prove our design works for children, or that all buttons should be round.
- [Material buttons](https://m3.material.io/components/buttons/overview) and [text fields](https://m3.material.io/components/text-fields/overview): primary component references. The documentation pages require JavaScript, so their contents were not independently extracted in this research run. No detailed claims below are attributed to unread text on those pages.
- [W3C target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): 24×24 CSS px or an allowed exception is the AA baseline; larger important targets are encouraged. We choose at least 48px for normal actions and 60–78px for primary actions. These are our product decisions, not a claimed child-specific standard.
- [W3C labels](https://www.w3.org/WAI/tutorials/forms/labels/): every control needs an associated purpose. Future custom-question/creature text fields retain visible labels rather than using disappearing placeholders as the only instruction.
- [W3C animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html): honor reduced motion and allow nonessential movement to be disabled.
- [W3C pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): automatically moving content lasting more than five seconds alongside other content needs a pause/stop/hide mechanism, unless essential. Microverse offers Gentle motion in settings; watch also has Pause. Continuous decorative motion is not required to understand evidence.

## Shape system

| Element | Shape and measurements | Purpose |
| --- | --- | --- |
| Main action | Full capsule, minimum 60px tall; hero 78px on desktop | Clear, soft action with one label and optional icon |
| Secondary action | Capsule hit area, minimum 48px; quiet underline retained | Feels pressable without competing with the main button |
| Food/evidence choice | 22–24px corners; selected fill plus check/pressed state | Selection is identifiable without color alone |
| Story/record panel | 28–32px corners, warm paper fill | A readable moment in the scenery; no glass blur under body text |
| Text field | 18px corners, 52px minimum height, visible label, 14–18px inset | Space for writing and error messages; no pill-shaped multi-line paragraphs |
| Photo Polaroid | 16px paper corners, 9px image corners, generous lower caption edge | Keeps the photograph distinct from the watercolor model |
| Helping arrow | Small rounded paper note; library arrow icons; explicit dismiss/skip | Points to one current element, then gets out of the way |

Preserve existing ink `#203d2b`, paper `#f7f2e6`, leaf green `#24462f`, blue `#38596a`. Keep Fraunces headings and Atkinson Hyperlegible labels/body. Do not apply a trendy glass effect to text over a busy forest. Focus rings stay visible and unclipped.

## Library behavior

Exactly three choices: **garden**, **wildflower meadow**, **woodland edge**. Each is one semantic button with a photo, name, short hint and arrow. They arrive in a short stagger (130ms apart, 750ms each) and settle. Hover/focus lifts the chosen photograph; there is no rotating carousel, mandatory swipe, autoplay selection or never-ending card drift. Reduced motion removes the entrance/lift.

Desktop uses three Polaroids side by side. Phone uses three small Polaroid rows with a photo at left and caption at right so all three can be considered without sideways scrolling. The entire card is clickable and keyboard-operable.

The footer clearly says these are three real-place inspirations for **one meadow experiment**. The garden alone has actual previously recorded SAM masks. Meadow and woodland photos receive manual visible-feature review; no cached masks are fabricated. Neither photo sets food supply automatically. The user still chooses food explicitly.

## Photos and attribution

1. Garden: [Garden pond in park](https://commons.wikimedia.org/wiki/File:Garden_pond_in_park.jpg), Jon Sullivan, public-domain dedication; existing 288×384 derivative and recorded SAM masks.
2. Meadow: [Wildflower Meadow (6997737191)](https://commons.wikimedia.org/wiki/File:Wildflower_Meadow_(6997737191).jpg), Jasmine Horn / Mount Rainier National Park. Commons records both CC BY 2.0 and US-government public-domain status; retain attribution and link to [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) for broad reuse. Resized to 1280×960 WebP, metadata omitted. No ecological calibration of this photographed alpine habitat is claimed.
3. Woodland: [Woodland edge by A382](https://commons.wikimedia.org/wiki/File:Woodland_edge_by_A382_-_geograph.org.uk_-_7945943.jpg), Derek Harper, [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/). Resized to 850×1280 WebP, metadata omitted; derivative image remains under that licence. UI crop uses object-fit. This photo’s licence does not turn the app’s separate code into CC BY-SA.

Credits are available on the library screen, and a machine-readable asset manifest is saved in `assets/library-photos.json`. Photos are served locally; no third-party image host receives a request during ordinary library browsing.

## Motion and image clarity

The old hero was one flattened picture, including fox and photograph, so independent motion was impossible. New genuine background and transparent fox layers preserve the selected art direction. Fox breathing is a whole-body pose effect, not a completed skeletal face/tail rig. No claim of a fully animated character rig is made.

The terrain now uses the recovered **2048×1152 original** of the same map instead of the 1672×941 live export. Close-up backdrop zoom falls from 1.8× to 1.08×; focused animals are enlarged separately. Neither this map nor the newly generated 1536px hero is 4K. A future art pass should commission higher-native-resolution scenery, especially dry-state art, rather than calling interpolation “HD.”

Rabbit idle motion is a bounded breathing/sniff pose. Weekly position changes still follow real engine snapshots and traversability. Idle animation cannot change the RNG, populations, ecological time, event records or saved replay. Renderer caps idle updates near 30fps and caches scenery; hidden tabs stop rendering. These are implementation choices, not a measured performance benchmark.

## Voice, music and prompts

Sound is opt-in. Separate controls enable narration, original soft synthesized music and interface sounds. Narration uses twelve fixed clips generated once on this laptop by the existing Kokoro Heart model. Clips total roughly 600KB; no model weights, photos, names, learner responses or provider key are shipped with them. MP3 playback needs no Meta/Baseten or inference call. Kokoro is a separate model, not Meta speech synthesis. Music uses a quiet original sequence of sine notes; it is not a recorded nature soundtrack or a generated Meta music track.

Voice has a repeat action and transcript. It explains the screen rather than reading potentially stale result numbers. Dynamic exact-result narration remains future work. The current route-help clip says “different experiment”; it should not read an unsupported habitat as successfully simulated. Voice quality still needs listening judgment in the browser.

## Helping arrows

Review, food selection, prediction, watch status, same-week comparison and reflection each receive one contextual hint when that area first appears. Dismiss only that hint, skip the sequence, or replay hints from settings. Hints are notes, not modal dialogs, and do not move keyboard focus away from the current question. Native record/sound dialogs own their normal modal focus behavior. Collision/viewport placement has local geometry checks; final rendered checks remain pending.

## Verification boundary

The six supplied screenshots are evidence for the previous screen problems. They do not prove the revised screens render correctly. Browser approval remains blocked by the earlier automatic-review restriction; no alternative browser or screenshot workaround has been used. `design-qa.md` must remain blocked until current rendered captures can be compared and interactions checked. Unit tests/builds verify code/data contracts, not visual polish or child comprehension.
