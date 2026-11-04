# V16 scoped design QA

Source visual truth: reviewed Meta front-facing fox/clover sheets in runtime/guide-v16, cropped frames in public/assets/spark-fox-{0..3}.png and spark-clover-{0..3}.png; retain selected Little Field Club typography, colors and existing guide layout.

Implementation: docs/screenshots/animal-identity-v16/07-final-guide-panel.png and 08-final-clover-speaking.png (1280×720 CSS/PNG at 1×). Phone form: 05-animal-details-phone.png (390×844, 1×); final whitespace fix is a one-character text separator after its capture. No geometry changed by it.

Full-view and focused art comparison: docs/screenshots/animal-identity-v16/09-final-art-render-comparison.jpg combines source portrait frames with full rendered guide views. Portrait scale, watercolor detail, transparency and facing direction verified from that combined input.

Findings and iterations:
- P1 before: fox full-body side illustration and sideways cat crop had no speaking expressions. Replaced with matching frontal head sheets; both switched to their own -1.png speaking mouth during actual local narration (DOM wait verified).
- P2 first rendered comparison: after voice-button focus, the tall guide panel scrolled enough to crop the title. Reduced only guide-overlay top padding and intro gap. Final title stays visible (top78 on entry; top11 after focused preview), no horizontal overflow.
- P2 phone form: adjacent words joined where its line break is hidden. Added a literal space before “we’re”. Internal auto sentinel also hidden in the optional field.

Fidelity surfaces: Baloo 2/Atkinson retained; readable hierarchy and palette; existing pill/radii tokens retained; actual Meta bitmap portraits used, no code-drawn substitute; original animal photo remains visible; optional identity wording avoids the forced category menu. New general-fact label separates evidence from companion facts.

Interactions: original photo loaded locally only; blank type continues; back preserves image; fox and cat voice-frame transitions verified; viewport override reset; no errors/warnings in final QA tab. 65 tests/build pass. Live arbitrary animal generation is not claimed from this visual pass; pipeline/provider behaviors tested with simulated responses. New art generated live and reviewed. No broad accessibility/FPS or participant usability claim.

final result: passed
