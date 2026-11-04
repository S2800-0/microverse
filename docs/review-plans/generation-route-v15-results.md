# V15 upload routing fix · 3 November 2026

- User confirmed choosing “An outdoor place” opened the default meadow. Fixed: new landscape / plant / other-landscape routes now enter WorldPainting with the uploaded image, never the manual meadow review. Library worlds and explicit First adventure stay separate.
- New uploads clear previous generated world state; WorldPainting is keyed to the photo. Added a defensive personal-photo guard before starting the prepared meadow.
- Loading, unavailable service, connection failure and exhausted allowance now have distinct generator messages. No silent default fallback.
- Browser: local photo loaded into separate QA tab only, not sent to Meta. Outdoor route and primary Build my living world both opened original-photo consent; Back retained the image. No console errors/warnings; 1041×895, no horizontal overflow. Evidence: docs/screenshots/generation-route-v15/photo-generator.png.
- 60 tests pass; production build passes. Existing bundle-size warning remains. Main checkout unchanged. No agent-paid generation in this fix. Ledger now $1.80 reserved /36 attempts from ongoing user tests; cap remains $2, reservations are not verified billing. Fresh full generated output was not re-tested in this pass.

