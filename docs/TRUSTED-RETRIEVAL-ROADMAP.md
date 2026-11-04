# Trusted research → a living world → an evidence-backed story

Researched3 November2026. Proposed next layer; the current build has eight checked local profiles, not broad live API search. No dataset/model installation or new paid inference was made for this research.

## What can be connected

| Resource | Verified capability | Appropriate use / boundary |
| --- | --- | --- |
| [GBIF Species API](https://techdocs.gbif.org/en/openapi/v1/species) | Taxonomic name matching, IDs, descriptions, profiles, distributions and references where supplied by source datasets | Resolve names/ambiguity and attach dataset citations. Do not assume it contains a complete diet or that a species occurs in the photographed place. |
| [iNaturalist developer API](https://www.inaturalist.org/pages/developers) and [recommended practices](https://www.inaturalist.org/pages/api%2Brecommended%2Bpractices) | Public taxon/observation data through its supported API | Plausible examples/range context, with uncertainty and attribution. No silent observation upload, child photo/GPS sharing or assumed photo reuse licence. Prefer taxon queries/cached small results; follow rate limits. |
| Existing NPS/NOAA/state wildlife/extension sources | Reviewed fact pages, already linked in the current catalog | Small cited facts about diet, habitat and life stages; not every site supplies a suitable API. Maintain an allowlisted local index/cache instead of sending whole pages on every question. |
| [Animal Kingdom](https://sutdcv.github.io/Animal-Kingdom/) | Research data/tasks for animal action recognition, pose estimation and video grounding | Study/derive movement with a separate validated pipeline and applicable data terms. This is not a download-ready watercolor walk-cycle library. |
| [UniRig official implementation](https://github.com/VAST-AI-Research/UniRig) | Predict skeleton/skinning for3D meshes; supports formats includingOBJ/FBX/GLB/VRM | A possible future Blender/3D branch. It needs a mesh, suitable dependencies and reviewed skeleton/skin results; it does not directly rig a flat pet photograph. A rig also needs an animation. |

A source can supply a name but no diet; an observation is not proof of absence elsewhere. Motion reference, anatomy, rigging, animation and ecological behavior are separate pieces. Keep those missing fields visible rather than letting the model fill them as facts.

## Proposed tool surface

- `lookup_taxon(name)` → candidate IDs, accepted names, ambiguity and source.
- `get_checked_facts(taxon_id, topics)` → compact diet/habitat/life-stage claims with citations/retrieval dates; missing values explicit.
- `find_motion_profile(body_type, action)` → an installed reviewed2D rig/pose set, required landmarks and a fallback; optionally a separately evaluated3D workflow later.
- `get_supported_habitat_rules(habitat)` → actual implemented interactions, parameters and limits, not arbitrary generated code.
- `propose_world(evidence, capabilities)` → one producer, three animal groups, bounded terrain/objects and supported what-ifs.
- `explain_run(replay)` → a story tied to actual counts, bites, encounters and event IDs.

The backend performs constrained retrieval and gives Spark a compact evidence packet. Spark does not need unrestricted browser access. Cache by taxon/source/version, deduplicate requests, bound queries/timeouts and preserve sources. Treat retrieved text as untrusted data. Add adapters one at a time behind contract tests; never execute source-page instructions or downloaded motion code automatically.

## The useful end-to-end behavior

1. A child chooses a woodland photo. Vision suggests a habitat and uncertain possible inhabitants.
2. Resolve candidate names; retrieve checked facts and matching movement capabilities. Ask for clarification if an identity matters but is ambiguous.
3. Distinguish visible clues, retrieved general biology, chosen teaching assumptions and decorative choices. Preserve a pet’s appearance independently from its ecological role.
4. Compile a supported world. Choose the role/food relationships and events from implemented rules. Reject unsupported combinations or provide a labelled imagined mode.
5. Generate art once and animate it locally. Do not search or call a model for every footstep.
6. Run the simulation. The narrator can make the explanation warm and personal, but it may only describe events that happened in the record. General animal facts explain possibilities; they do not prove a cause or predict the real site.

## Next implementation boundary

Start with one read-only taxon adapter plus the existing checked fact cache and motion registry. Then test one unfamiliar animal end to end. Add a larger fact index and motion coverage after that succeeds. Full arbitrary-animal rigging is a separate research/engineering effort, not a pre-submission dependency. Do not advertise this roadmap as live functionality until the adapters and user journeys are actually verified.
