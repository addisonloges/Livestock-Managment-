# Phase 1 foundation — implementation complete

Completed September 13, 2026. User acceptance review remains pending. This closes the agreed Phase 1 foundation from the dependency plan; it does not complete all 37 requirement areas or Phase 2.

## Scope and completion evidence

| Foundation deliverable | Implemented behavior | Verification |
|---|---|---|
| Animal creation/lifetime identity | Sheep/goat records; unknown sex/birth permitted; immutable UUID and stable sequence; edited display labels retain searchable prior labels | Local API creation, identity correction and history checks |
| Species/year filtering | Species views, explicit first-recorded year, historical status/presence, All Years read-only | Domain presence checks; local server read-only and species-boundary rejection |
| Measured weights/ADG | Original lb/kg and normalized pounds, duplicate date protection, chronological growth; historical views exclude later and voided readings | Calculation tests; local API original-unit/duplicate/retry checks |
| Parent links/COI | Same-species parent validation, partial-date consistency, cycle rejection, unowned ancestors, known-pedigree COI with limitations | Relatedness, repeated ancestry, missing/cyclic ancestor and API parent validation checks |
| Portable exports | CSV separates immutable ID/display ID and parent UUID references; JSON retains complete foundation records and history | CSV identity/parent/escaping tests and full export implementation review |
| Visible limitations | Phase status and combined review guide in Build Plan | Source/build verification |

## Final closure fixes

- Historical latest-weight and ADG views now exclude measurements from later years.
- Birth-year corrections retain searchable former display IDs; UUID/sequence remain unchanged.
- Animal CSV exports now include the immutable ID, separate display ID, sire/dam keys and ancestor classification.
- Animal creation consistently validates parent dates when only partial birth information is available.
- Sire screening selection is constrained to the currently visible active male flock.
- Animal/weight date input handling keeps edits when other fields change.
- The year picker includes dated status history and voided weight years.

## Technical results

10 automated foundation/domain tests passed. Local Phase 1 API flow passed: unknown-data creation, same-species/parent-date rules, duplicate EID rejection, persisted parent links, lb/kg conversion, duplicate weight rejection, repeat-save safety, immutable identity after birth-year correction, cycle rejection, ancestor weight restrictions and All Years write rejection. Type checking and production build passed. Test fixtures were created only in the local database, not the hosted farm records.

This is not a claim that every screen has completed user testing. The scheduled review below is the remaining acceptance activity.

## Proposed test schedule — one combined 45–60 minute review

Start whenever desktop access is convenient; no calendar appointment or automation is created.

| Block | Time | Test tasks | Pass condition |
|---|---|---|---|
| 1. Records and year views | 15–20 min | Compare several animals to source records; check missing-detail flags; make a legitimate correction and refresh; switch species/year; inspect All Years | Correct identities and values persist; species/year views are consistent; All Years is read-only |
| 2. Pedigree and screening | 10–15 min | Follow maternal/paternal lines; inspect an unowned ancestor; review known-family relationship/COI and incomplete ancestry text | Parents are correct, ancestor is outside flock totals, estimated relationship is explained |
| 3. Weights and exports | 20–25 min | Use actual measured weights; verify units and chronological growth, including a historical year; correct/review history; export CSV/JSON | No future/voided measurement leaks into historical growth; identities/parents and history are present in exports |

Optional Phase 2 regression during Block 3: spreadsheet batch import, duplicate/retired identifier review and session void/restore. If real weighing data is not available, defer that user scenario; do not invent farm measurements just to test.

Collect issues in one list: animal identifier, selected species/year, steps, expected result and actual result. Mark data loss, wrong identity/parent or incorrect calculation as blocking; keep wording/layout preferences as refinements. One combined review and fix pass follows.

## Scope remaining outside Phase 1

Phase 2 has substantial tags/status/import/session work already delivered, but ownership history and broader session behavior are not all complete. Registration attachments, saved breeding groups/Composite 4, reproduction, health/feed, finances, offline sync and full backup/restore remain later work. The app uses species-partitioned records in one database, global sequence numbering, online saves and exports; full host migration/restore has not been certified.
