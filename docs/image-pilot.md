# First live photo pilot

Status: a four-photo live pilot completed October 27, 2026. All four illustration/SAM requests returned valid payloads, but the pug's first mask excluded its harness. A deliberate SAM-only retest on the saved illustration, explicitly including the turquoise harness, retained it. The corrected target is covered by a regression and passed through the production adapter. No images were regenerated or automatically retried. Private source/output files remain outside Git and the static build.

## Small staged set

Ask the owner for two animal-only photos they can use: one dog and one cat, full body, side or slight three-quarter angle, visible feet/tail, reasonable light, one animal per image. These are the currently supported companion roles. Keep raw photos, generated outputs and identifying details outside the public repository. Existing generated sample art can exercise mechanics but cannot establish real-photo identity preservation.

After those two pass, add one accessory case (glasses, bandana or collar whose retention matters) and one difficult case (fluffy/dark coat, front view or partial occlusion). Four photos test distinct failure modes; they do not establish general reliability. Penguin/wildlife photos wait until those roles and a suitable rig/review path are implemented.

## Execute one case at a time

1. Confirm selected provider funds and published pricing. Use the existing private image ledger, explicit consent and **$0.10 total local cap** (`MICROVERSE_META_CAP_MICRO_USD=100000`) for this initial photo pilot. This protocol does not enable it by itself. Retain earlier attempts; inspect the ledger before setting a ceiling. Spark/AWS stay independently disabled. Never reset a ledger to gain attempts.
2. In Bring a creature, choose dog/cat explicitly and the source photo. Record a few visible identity details before generation: coat colours/patches, ear shape, tail and any accessory. Preview the processed 640-pixel source.
3. Choose photo-sending consent and Paint with Meta once. One Muse Image edit creates a single watercolor side-profile illustration; SAM masks that generated illustration. SAM in this flow does not identify the animal or establish its habitat. No extra poses or automatic repair/regeneration.
4. Inspect the returned illustration, cropped-mask alignment and composed transparent PNG. The target animal should be complete, without background fragments or missing accessory/body parts. A failed stage stops the case, retains its reservation and records the actual error before any deliberate fix/retest.
5. Review the local rig: stand/walk/run, foot placement, body distortion, accessory retention. Accept articulation only if it looks usable. Explicit whole-image fallback counts as a usable illustration but **not** a passed articulated rig. Rejection is a valid outcome.
6. Add an accepted creature, advance the forest, compare an experiment, save the processed PNG/replay and re-import the asset without new inference. Confirm identity/role/rig state survives. Repeat identical input within the cache lifetime to verify reuse only after the first result; use the saved PNG for cross-session reuse.

At prices checked October 27, 2026, one image ($0.01) plus one SAM image segmentation ($0.0025) is **$0.0125**. Four successful first attempts estimate $0.05; a $0.10 local reservation ceiling permits at most eight complete attempts including failures. This is not an account-wide provider billing control. See [Meta pricing](https://dev.meta.ai/docs/pricing-rate-limits) and the [bridge's accounting limits](meta-creature.md).

## Private result sheet

| Case | Source/view | Identity details retained | Illustration | Mask/PNG | Rig or explicit fallback | Forest/re-import | Calls/error/reservation | Next decision |
|---|---|---|---|---|---|---|---|---|
| Dog, clear | Pending | Pending | Pending | Pending | Pending | Pending | 0 | Await source |
| Cat, clear | Pending | Pending | Pending | Pending | Pending | Pending | 0 | Await source |
| Accessory | After first pair | Pending | Pending | Pending | Pending | Pending | 0 | Await initial findings |
| Difficult view/coat | After first pair | Pending | Pending | Pending | Pending | Pending | 0 | Await initial findings |

The owner can compare identity visually; no automated identity metric or similarity threshold has been validated. Publish only consented examples and anonymized aggregate failure notes. Decide whether to improve prompt, mask parsing/composition, rig geometry or input guidance from the observed failure rather than paying for blind retries.

## Observed pilot results

| Case | Illustration/cutout observation | Geometry and motion review |
|---|---|---|
| Beagle | Tan head, black saddle, white chest/feet and white-tipped tail retained. Generated body looks older/longer than the puppy source. | Four extracted leg pieces without warnings; walk/trot frames inspected. Saved cutout imported locally, rig explicitly accepted and creature added as a dog companion. |
| Orange tabby | Orange stripes, pale chest/muzzle and fluffy tail retained; new standing side pose reconstructs parts absent/hidden in source. | Four leg pieces after bounded local fitter adjustment; motion frames inspected. No universal anatomy/identity claim. |
| Dark pug with harness | First dog-only mask visibly removed the harness strap. The same saved illustration segmented as **dog wearing a turquoise harness** retained strap/buckle. | Corrected cutout produced four leg pieces without warnings; motion frame inspected. Source sitting pose became a generated standing character. |
| Fluffy white cat | White coat, pink ears/nose and fluffy tail retained; face/eye likeness needs owner judgment. | Four leg pieces after local fitter adjustment; motion frame inspected. The image reconstructs a standing pose from a tilted/lying source. |

The private browser QA page used the actual `composeCreatureCutout`, fitter and puppet modules without inference. All four produced valid four-piece geometry, which remains a readiness check, not proof of anatomy or a polished gait. Only the beagle was accepted into the forest during this check. At exploring week 1 it was copied into a half-rain experiment and remained alive in both branches at elapsed week 13. A replay download was requested in the UI, but the downloaded file was not retrieved/round-tripped in this pilot; existing automated replay checks are separate evidence. The other three imports, wider photo diversity, the owner's likeness/motion approval and full photo-specific replay round trips remain pending.

Actual request counts: **4 Muse Image + 5 SAM**, estimated **$0.0525** at checked prices. The durable image ledger retains **$0.0625 reserved** against the $0.10 cap: the SAM-only retest conservatively reserved another complete job. No refund/reset was applied. These are request estimates/reservations, not a provider billing receipt or proof of the payment source.
