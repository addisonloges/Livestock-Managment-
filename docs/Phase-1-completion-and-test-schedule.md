# Phase 1 — Animal identity and records (reopened)

The September 13 completion claim is withdrawn following the user's workflow correction. Phase 1 is animal identity and records, not a combined animal/breeding/weights foundation. Existing code and data are retained. This document supersedes the earlier completion and 45–60 minute test schedule.

## Scope

- Permanent animal identity, species, basic details, origin and first recorded year.
- Tags, multiple tags per ear, tag colors, EID association, correction versus retirement/replacement, and former identifiers.
- Animal imports, duplicate review and nonblocking missing-data flags.
- Registration information with papers/photos attached directly to that registration.
- Dated ownership and status history, recorded reasons, archive/restore and audit trail.
- Maternal/paternal pedigree with unowned ancestors, parent validation and recorded sources.
- Notes, animal search, portable identity/parent exports and durable saves.

## Current status

Available: identity/editing, tags/EID/history, imports, missing-detail flags, registration text, status history, pedigree, notes and exports.

Implemented in the latest profile package: dated ownership history and registration attachments, plus animal photo history. Ownership uses 0.01% shares, exact totals, effective dates and latest-entry corrections. See the implementation/verification section below. Outstanding: integrated user acceptance.

Acceptance requires a coherent animal profile workflow across those areas; save/reload, identity integrity, incomplete-data handling, species/year boundaries, imports and export must be verified together. User acceptance remains pending. Do not mark this phase complete because weight tools or a subset of foundation tests pass.

## Corrected sequence

1. Animal identity and records.
2. Breeding: ram decisions, ewe relationships, flexible groups/exposures, pregnancy and optional Composite 4.
3. Lambing/kidding and offspring: litter outcomes, stillbirths, offspring identities, foster/rearing details linked to breeding.
4. Weights, growth and performance: primarily offspring birth/weaning/later growth, with breeding-stock measurements still supported.
5. Farm operations: health, inventory, feed, management flags and calendar.
6. Finances: expenses, allocation, sales and current-year/lifetime outcomes.
7. Offline and recovery: offline entry/sync and full backup/restore.

Data preservation, exports and technical verification run throughout. Existing weight code remains available; pause further weight feature work until breeding and offspring context is ready. No existing animal or measurement is deleted or remapped by this planning correction.

## Grouped test schedule after Phase 1 is ready

| Block | Time | Coverage |
|---|---|---|
| Identity and imports | 15–20 min | Animal details, tags/EID/colors, missing flags, duplicate review, saved corrections |
| Ownership/registration/history | 15–20 min | Dated ownership, registration attachments, status/exit reasons, audit and restore |
| Pedigree/search/export | 10–15 min | Both family lines, unowned ancestors, current/former identifiers, permanent IDs and parent references |

Total: 40–55 minutes in one combined review when desktop access is convenient. No calendar event is scheduled. Record one consolidated issue list with animal ID, action, expected and observed results. Weight growth, session review and mating decisions are not Phase 1 acceptance tests.


## Weight section visibility

User requested hiding weights until its phase. The Weights tab, overview metric, animal-list weight column and profile weight controls are hidden until Phase 4. Saved measurements, history and full JSON export remain intact. Earlier references to weight tools staying visible are superseded by this instruction.

Phase 4 weight-entry design correction: user rejects a mass-scrolling animal list. Replace that entry pattern before re-enabling weights. Start with explicit animal/group selection and a compact focused entry or bounded-page workflow; final interaction design remains to be reviewed. Do not treat the existing all-animal scrolling form as accepted.


Navigation correction: remove the standalone ewe/doe relationship tab. Integrate those calculations into future breeding decisions rather than bringing back that separate tab. Hide the premature breeding screen until Phase 2. Phase 1 navigation remains Animals, Pedigree, Deleted animals and Build plan. Pedigree data and relationship calculation code are retained.


## Profile implementation update

Implemented: named ownership shares with 0.01% precision and exact 100% totals, effective dates, explicitly unknown ownership, conflict checks, and audited latest-entry correction. No ownership is inferred for existing animals.

Implemented: photos on each profile, a selected current profile photo, retained past photos with optional date/caption, four-photo history pages, and restorable removal. New primary photos do not delete prior photos. Registration PDF/image uploads appear directly in the registration area and retain the registration text at attachment time. Files use object storage, with metadata and change history in the database. Limits: 10 MB/file; JPEG, PNG, WebP, plus PDF for registration; HEIC conversion is not implemented. JSON export includes file metadata/history, not the binary files; full attachment backup belongs to Phase 7. Individual files can be downloaded.

Local API acceptance passed for ownership totals/dates/corrections/conflicts, file save and repeat-save, retrieving original bytes, replacing primary photos without losing old photos, format/read-only validation, registration separation, caption/date edits, removal/restoration and history. Add these tests to the combined profile review; user workflow acceptance remains pending. Ewe relationships are no longer a standalone tab; breeding and weights stay hidden until their phases.

## Latest delivery preference

User acceptance remains pending but does not block starting the next section once technical checks pass. The user requested prioritizing the whole build and deferring optional refinements. See Deferred-improvements.md for the saved Animals-tab sorting request.

## Consolidated technical review — September 13, 2026

Checked the reference animal table against implemented identity, tags, parents, notes and focused editing. Fixed origin correction with audited before/after values; preserved photo/ownership metadata during detail edits. CSV now includes origin, registry, registration number, membership ID, flock name/ID, breeder/farm and notes. Profile status follows the selected year. Status search includes Reference counts when unowned ancestors match. Active remains the default list filter.

Verification: 30 domain/import/tag/status/profile checks passed, plus a new CSV regression. Local API suites passed for identity/parent boundaries and profile file/ownership workflows, including the new origin correction, conflict and metadata-preservation checks. Typecheck and production build passed. Tests used local fixtures, not live farm mutations.

### One combined user checklist (40–55 minutes, whenever convenient)

- [ ] Identity/import (15–20 min): compare known animal identifiers to a source spreadsheet; confirm leading zeros, tag colors and parent mappings in preview. Verify missing details remain warnings. Check typo correction separately from tag retirement, extra tags and explicit swaps.
- [ ] Profile/history (15–20 min): correct origin/details; refresh and check history. Upload two photos and choose an older photo as primary. Attach/download registration papers. Check ownership shares/dates and an existing exit record. Use a clearly marked disposable test record for delete/restore.
- [ ] Pedigree/export (10–15 min): follow both family lines, confirm unowned ancestors do not count in flock totals, search a former tag, compare CSV registration/notes to the profile, and confirm All Years is read-only.

Record issues together: animal ID, action, expected result, actual result. User testing is pending and does not block the next section under the latest delivery preference.

### Explicit limits retained for later implementation/design

One current registry/registration text set is supported, with historical attachment context. Multiple simultaneous registry entries and a supplier/contact directory are not yet implemented. Numeric breed composition belongs with breeding project work. Physical species database separation remains an architectural decision; existing records are species-partitioned. Full attachment backup/restore and offline operation remain Phase 7. Sorting is deferred in Deferred-improvements.md. Do not describe this checkpoint as completion of all 37 requirement areas.
