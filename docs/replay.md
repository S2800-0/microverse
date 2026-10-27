# Complete forest replay

Choose **Less rain** or **Remove wolves**, optionally record a prediction, then **Compare two worlds**. Both branches start at the exact current forest week, including imported creatures. The baseline keeps existing interventions; the changed branch adds the selected intervention. The exploring forest remains paused and unchanged. Advance a week/season, play, seek to an elapsed week or restart. The comparison stops at 156 elapsed weeks.

**Inspect the evidence** shows counts, food indices, changed-minus-baseline differences and recent event records. Intervention records stay visible even when they leave the most recent ten events. Names/IDs indicate whether each added creature is still present. After recording a reflection, the local evidence guide renders exact values and referenced events. Optional Spark selects existing evidence IDs; the application renders the facts and labels mechanisms as possible model connections. See [investigations](investigation.md).

## Snapshot and replay contract

`World.toSnapshot()` records version `microverse-1`, original seed, current mulberry32 state, week, next animal ID, current rain, parameters, living/dead retained agents, grass/browse Float32 values, open-ground mask, scheduled interventions, excluded immigration species and complete events. JSON round trips preserve these values; restoration rebuilds caches before the next model tick. Constructing a restore does not consume future randomness: initialization's temporary RNG is replaced by the recorded state.

`World.fromSnapshot()` needs matching walkability/traversal callbacks for constrained terrain. The scene envelope records `meadow-v2-1` and supplies the registered callbacks, checking the open mask and animal positions. Arbitrary external callbacks are not serialized. Engine/terrain/rule changes require a version decision before old files can be presented as equivalent.

The scene also records reset mode, retained selection, custom names, processed PNG bytes and accepted rig-cut configuration. Canvas meshes are browser objects and are rebuilt locally from the source and cuts; they are not serialized. The comparison renders these rigs in a static pose per model tick. Exact numerical model replay is the guarantee; pixel-identical browser animation is not. Missing illustration/rig rendering gets an explicit whole-image or unavailable-image notice.

New exports use replay **version 2**: complete initial scene, typed rainfall/removal change, elapsed duration, prediction, reflection, optional question and optional classroom responses/facilitator notes. Rainfall is 0–150% for 1–156 weeks; removal targets one entire native species and disables immigration. Legacy version-1 `drought` and `remove-wolves` files remain readable. Opening either format recomputes its baseline/changed worlds from that initial snapshot. It does not trust saved output labels or alter the exploring forest. **Field notes → Open a saved experiment** opens a replay without creating a new scenario first.

The printable HTML worksheet contains recorded numbers and learner/facilitator responses. Its embedded download supplies a model-only replay with illustrations, custom names and learner notes removed. The full replay remains a separate export that can retain personal creature images. Worksheets hold back the explanation guide until a reflection has been recorded. Exported HTML escapes user text and loads no remote resources.

## Randomness and interpretation

One paired run starts with matching RNG state. An intervention can change how many random draws the engine takes, so later births, hunts and arrivals can diverge. A count difference in one pair does not establish a real ecological effect size.

**Try 10 random continuations** fixes the starting agents, food and history, then sets the future RNG state to each integer 1–10. Each state is shared by its baseline and changed branch; all advance 156 elapsed weeks. The displayed min/max differences describe these ten model continuations. They are not ten independently initialized forests, confidence intervals, evidence about real populations or measured learning gains. The check can be repeated from the same replay file; no network/model calls are required.

## File handling and limits

Downloads include creature PNGs and learner notes; the interface says so before saving. Nothing uploads or persists automatically. Files are chosen explicitly and read locally, with a 16 MB input limit, version/rule checks, bounded numeric arrays/IDs/events, supported interventions, text limits and own-species checks. The scene accepts only its curated ecological profiles. Creature sources must be bounded inline PNGs (at most 640 × 640), never external URLs, SVG or HTML. Total image payload is limited to 12 MB. PNG header validation bounds decoding; the browser still performs actual image decoding and can report malformed image bytes separately from model validity.

Keep exported files private if they contain private photos or notes. They are not included in Git, CI artifacts or the static build. Large/very long historical forests can exceed this first replay format's limits; the UI reports a validation error rather than silently truncating their state. No automatic format migration or long-term compatibility promise yet.

## Verification

- Exact JSON restore at a mid-run week with drought/removal history, followed by 120 identical weeks and subsequent creature additions.
- Independent copied parameters, arrays and identities; identical start states for both branches; the source forest remains unchanged.
- Restart/seek/export/import reproduce model state; invalid versions, durations, rules, geometry, IDs, arrays, image sources and notes are rejected.
- A fitter configuration containing `gait`, processed PNG bytes and custom identity round-trips without serializing canvas objects.
- Deterministic random-continuation runs without changing the source state.
- Browser: saved dog named Maple → reviewed rig → exploring week 1 → drought comparison → elapsed week 13 → export → reopen → restart/advance with identical counts/resources, image/identity and notes.
- Responsive 390 × 660 CSS-pixel iframe: wolf-removal comparison, synchronized advance, scrollable stacked worlds/evidence and continuation controls. This is layout QA, not phone hardware/performance certification.
- Investigation flow: prepared half-rainfall question, prediction and synthetic before-response → elapsed week 13 → learner-first evidence guide → linked table/event references → synthetic transfer response/facilitator note → downloaded worksheet. Its embedded model-only replay was parsed and restored to identical recorded grass/elapsed values with no pictures or notes. No participant session was implied. Narrow-screen question/comparison controls and lower export controls were inspected.

UI layout remains replaceable. Teacher usability sessions, broader live-provider checks and ecology calibration remain outstanding.
