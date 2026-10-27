# First live photo pilot

Status: protocol ready; no live image/SAM result has passed yet. The existing synthetic cutout/parser tests are not a photo-quality result.

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
