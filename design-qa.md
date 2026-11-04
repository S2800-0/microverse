# V18 scoped visual QA · 4 November 2026

## Scope and source of truth

Selected source: `docs/reference/selected-option-3.png` (1487×1058 pixels). Later approved changes are recorded in AGENTS.md: Little Field Club / Baloo 2 + Atkinson, rounded controls, paw wordmark, a smaller fox and visible craft/open-tools entry points. The original mock's serif type, square button and embedded photo are not the current typography/button requirement.

Game baseline: `docs/screenshots/world-stage-v17/13-final-responsive-stage.png` (834×895). Current implementation: `docs/screenshots/living-world-v18/13-final-responsive-stage.png` (834×895 CSS capture). This is an intentional functional extension of that design, not a pixel clone: land neighbours and independent scenery now occupy the surface, and the pond opens another scene.

Hero implementation: `docs/screenshots/living-world-v18/02-hero.png` (1280×720). Full comparison: `hero-comparison.jpg`. Source and hero have different aspect ratios; both are letterboxed proportionally in the combined comparison. No density-derived pixel typography claims are made from that image. Stage comparison uses equal 834×895 images with no scaling: `stage-comparison.jpg`. Focused control comparison: `controls-comparison.jpg`.

Phone evidence: 390×844, `07-phone-tutorial.png`, `08-phone-plant-focus.png`. Desktop checks also used 1280×720. Temporary viewport overrides were reset before handoff. All comparisons were opened as combined images, not judged from file names or separate remembered views.

## Findings and iteration history

- [Resolved P1] Pond view sampled garden beds, then stretched a narrow water strip into vertical stones. Fixed the reviewed water rectangle and used an aspect-preserving water sample with separate light/bubble layers. Post-fix: `01-pond-day7.png`; browser verified the distinct aquatic scene and day persistence.
- [Resolved P1] Parent pointer capture prevented animal selection in the new canvas. Removed capture, kept drag suppression, set clear hit areas and non-interactive effect layers. Fresh renderer mount verified snail selection, Stop following, Escape and food focus. The neighbour menu remains a semantic-button route to each species.
- [Resolved P2] Pond button overlapped the day display or extended off a phone edge. Actual rendered half-width now clamps it inside the screen, with a minimum top position. Post-fix: `08-phone-plant-focus.png`, `13-final-responsive-stage.png`; phone DOM bounds were inside 390px.
- [Resolved P2] A phone lesson scrolled the day behind the fixed header and Spark covered the next-step button. Made the world/clock stable, the story internally scrollable, moved the guide into the viewing area and placed the next-step action before optional moments. Post-fix: `07-phone-tutorial.png`, 390×844 document/viewport height 844, primary action y532–584 and guide y155–236.
- [Resolved P2] Underwater portraits/hints could reference the wrong atlas cell or the hidden parent map. Applied atlas index mapping and scene-specific targets. Surface/pond hint words now exactly match their new locally prepared voice clips.
- [Resolved P2] Flying animals could render behind canopies. Separate flight layer; grounded/perched animals stay in the depth-sorted habitat layer. Local prepared-pose fixture verified the change: `10-visitor-flight-layer-final.png`. This fixture does not claim a successful new provider generation.

The initial pond/pointer/phone findings were observed in tool captures during the audit. Post-fix images above are the durable evidence. The final combined stage and control comparisons found no further actionable P0/P1/P2 visual differences within the inspected states.

## Required fidelity surfaces

| Surface | Result |
| --- | --- |
| Fonts and typography | Approved Baloo 2 headings and Atkinson UI/body retained. DOM: stage heading Baloo 2, weight600, 30px at 834px; buttons Atkinson. Phone lesson title reduced to a readable hierarchy with visible next action. The serif mock is an intentionally superseded direction. |
| Spacing/layout rhythm | Full-screen world, transparent wordmark, soft floating inspector, pill controls and compact map controls retained. Added pond waypoint fits in bounds; no horizontal overflow at inspected widths. Phone story scrolling does not move the clock under the header. |
| Colours/tokens | Existing forest/cream/moss palette retained. DOM primary button background rgb(31,75,73), text rgb(255,248,233). Source comparison shows consistent foreground/background balance. No unrelated dashboard palette introduced. |
| Image quality/assets | Existing watercolor rasters reused for life/scenery/portraits, with genuine transparency and source crops. Independent added tree pieces preserve the art direction. Flying and aquatic sprites remain separate from terrain. Original saved backgrounds still contain baked scenery; no claim that every source tree is now independently rigged. Small legacy texture variation remains P3 art polish. |
| Copy/content | “Day,” “Watch 7 days,” explicit surface return, supported what-ifs, actual eating records, consent and source/assumption distinctions remain visible. New habitat inspector explains walking around a piece and perching. New animal visitors are explicitly imagined until a diet role exists. |
| Icons/controls | Existing Phosphor family reused; semantic buttons for primary actions, map controls, neighbour selection, chat, back and sound. Selection can be cleared explicitly or with Escape. No new artwork was replaced by an invented icon substitute. |

## Primary interactions checked

Guide/library; three worlds; pond entry/return/revisit; direct animal and menu selection; deselection; drag, zoom, recenter and food discovery; Spark population/food/tree/weather/undo controls; actual meal following; explanations; local uploads and consent/back boundaries; saved/personal creature review; guide change returning to the same world; tutorial→comparison→reflection→recap→own choices; discovery save/import; craft/open-tools navigation; local visitor/wait-game/pause/reduced-motion fixture. Full details and honest coverage gaps are in `docs/review-plans/living-world-v18-results.md`.

Final inspected preview console: no warnings/errors. 77 automated tests, production build and four post-build packaging checks pass. The bundle-size warning remains a performance follow-up; no measured FPS claim is made.

## Follow-up polish and release gaps

- P3: tune density, edge framing and biome-specific art coherence after actual new photo outputs are reviewed.
- Fresh real provider output for terrain/scenery/arbitrary-animal sheets is not established by mocked tests. The live own-photo tests remain pending.
- No physical camera/microphone, screen-reader, representative-device performance, real participant or learning-effectiveness claim.
- Teacher/notebook/microphone ports and publishing the prototype remain separate work. This report passes the scoped inspected UI, not every feature of a universal world generator.

## Implementation checklist

- [x] Open source and implementation together; compare full composition and readable control crops.
- [x] Resolve observed P1/P2 problems and capture the revised states.
- [x] Check type, spacing, tokens, assets, copy and responsive interaction states.
- [x] Record tested routes, simulated-provider checks and remaining real-device/live-output gaps.
- [x] Leave a usable local preview; preserve the main project and spending cap.

final result: passed
