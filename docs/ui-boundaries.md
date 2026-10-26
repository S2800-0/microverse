# UI/UX can evolve during the build

The user has not approved a final interface. Preserve the naturalist/watercolor direction as an existing reference while allowing layout, navigation, controls and new features to change after testing.

Keep simulation state in `src/sim`, image/puppet logic in `src/motion`, and user-input/review state in controllers with explicit methods. Views subscribe to state and render it; they do not own the rules or call a provider every time a component rerenders. Approved art, review state and pending provider jobs need stable identities across UI changes.

The current motion workbench exercises APIs; its fieldsets and paired canvases are developer scaffolding. Future product designs can put rig review in a modal, a stepper, a side sheet or a full-screen phone flow. Replacing those views should retain the same geometry tests, approval behavior, fallback and model boundaries.

Before committing to the forest layout, compare two small screen/flow prototypes using actual tasks: add a creature; see what changed; run an experiment; recover from a failed import; reset/replay. Choose based on task clarity, phone/projector readability and accessibility. UI additions should preserve the same seed/snapshot and avoid accidental inference or loss of a prepared creature. The user can revise the design after the first playable slice.
