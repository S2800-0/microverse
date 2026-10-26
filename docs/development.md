# Development workflow

1. Keep `main` as the reviewed integration base.
2. Create one `feat/`, `fix/`, or `chore/` branch per reviewable capability.
3. Import only the files needed by that capability and document origin and limitations.
4. Add behavior checks proportional to the feature; run `npm test` and `npm run check`.
5. Open a PR against `main` with actual results and scope. CI runs on the PR.
6. Merge after review, then branch the next dependent feature from the updated main. Do not silently auto-merge or approve your own PR.

Use the owner's configured Git identity for commits. Do not add AI co-author trailers or a separate assistant contributor. Preserve source history through provenance records; do not change origin dates to imply imported work is new.

Do not enable paid inference or publish personal uploads as part of a code migration. Meta integration starts with confirmed credits and an agreed bounded test budget. AWS remains paused in the separate prototype.
