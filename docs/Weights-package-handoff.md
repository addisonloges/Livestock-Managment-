# Weights package — consolidated handoff

## Additions and changes

- Individual measurements: correct, void, restore, and inspect before/after history with reasons.
- Batch entry: searchable animals, 1–100 measurements, mixed lb/kg, blank rows skipped, full review before atomic save.
- Saved sessions: stable membership survives individual corrections; session void/restore retains history and recalculates current growth/counts.
- Spreadsheet entry: CSV and Excel XLSX, worksheet selection, column mapping, and explicit animal matching. Ambiguous tags and conflicting identifiers never select an animal silently.
- Downloadable CSV template: populated with flock animal IDs, names/tags/EID and blank weights. IDs and tag strings retain leading zeros in the CSV; keep spreadsheet identifier columns as text.
- Imported draft collisions require review; imported rows do not overwrite already-entered draft weights.
- JSON exports retain valid and voided measurements and history.

## Completed technical verification

Local API tests passed for batch saving, invalid-row rejection without partial save, retry idempotency, mixed units, duplicate animal/date protection, stale-version rejection, individual correction retaining session membership, and whole-session void/restore. Import tests passed for ambiguous visual tags, exact EIDs, additional tags, conflicting identifiers, blank-row skipping, US date/unit normalization and formula-safe CSV output. Type checking and production build passed. No production test records were created.

## One user review when desktop access is available

1. Open Weights; start a batch, enter several actual readings with one blank, search for another animal, and confirm earlier entries remain.
2. Review the batch, return to change a value, and save. Refresh and reopen the saved session.
3. Correct one reading; inspect its history and session membership.
4. Void and restore the session with reasons. Confirm valid counts and growth follow the changes.
5. Download the weighing template, fill a few actual weights, save as CSV or XLSX and upload it. Confirm the correct worksheet, column mapping and animals.
6. Verify a duplicate tag needs explicit selection and a duplicate animal/date cannot overwrite a record. Confirm imported rows cannot silently replace existing draft entries.
7. Check All Years is read-only and JSON export retains historical entries.

## Remaining limits

Drafts are not persisted across refresh/navigation. A batch has one session date; file dates, if supplied, must agree. Older XLS must be saved as XLSX. Device-specific XR5000 parsing requires a representative export; this package does not claim that compatibility. Retired EID matching, offline drafts, adjusted milestone formulas and cross-year weight corrections remain future work. No user testing is needed before continuing development; this checklist is retained for a later combined review.
