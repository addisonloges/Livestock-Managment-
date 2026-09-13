# Program progress and consolidated review

**Controlling workflow correction:** Phase 1 is animal identity/records and is reopened. Ownership history, registration attachments and animal photos are now implemented; integrated user review is pending. Then: Phase 2 breeding; Phase 3 lambing/offspring; Phase 4 weights/growth/performance; Phase 5 operations; Phase 6 finances; Phase 7 offline/recovery. Earlier phase numbering and completion statements below are historical. See Phase-1-completion-and-test-schedule.md. Existing weight tools remain available; their expansion is paused.
This is the current cumulative checkpoint, not a claim that all 37 areas are complete. Phase 1 animal identity and records is in progress; prior completion labeling is withdrawn. See Phase-1-completion-and-test-schedule.md for the 45–60 minute review schedule. Later phases are not being accelerated past unresolved design decisions. The user is remote on a phone and has asked development to continue without individual feature testing.

## All 37 requirement areas

| # | Area | Current position |
|---|---|---|
| 1 | Overall concept | Animal identity first; seven corrected phases |
| 2 | Animal identity | UUIDs, tags/EID, multi-tag records, retirement and correction history |
| 3 | Animal information | Editable details, optional missing data and flags; numeric breed composition pending |
| 4 | Ownership/origin/registry | Origin and registration text; ownership history and registration attachments pending |
| 5 | Status/year behavior | Dated/undated exits, returns, cull reasons and historical presence |
| 6 | Lifetime profile | Details, pedigree, tags, weights and audit history; attachments pending |
| 7 | Pedigree/genetics | Multiple generations/unowned ancestors; broader genetics pending |
| 8 | Breeding | Prospective screening only; saved groups pending |
| 9 | COI/relatedness | Known-pedigree matrix and ewe relationships; configurable projects pending |
| 10 | Cross-year breeding | Pending saved exposure/birth linkage |
| 11 | Flushing | Pending configurable timing |
| 12 | Lambing/kidding | Pending |
| 13 | Stillborn/neonatal | Pending |
| 14 | Rearing/weaning | Pending |
| 15 | Management groups | Pending dated memberships |
| 16 | Weights | Individual/batch entry, corrections, void/restore, ADG; adjusted milestones pending |
| 17 | Female/sire performance | Pending reproductive outcomes |
| 18 | Health | Pending |
| 19 | Health inventory | Pending; dashboard warning placement open |
| 20 | Feed/rations | Pending; allocation design open |
| 21 | Financial system | Pending; includes animal-specific vet expenses |
| 22 | Profit/contribution | Pending |
| 23 | Sales | Sold disposition exists; sales transactions pending |
| 24 | Working sessions | Weighing sessions implemented; other session types pending |
| 25 | XR5000/EID | EID matching in reviewed weight import; device-specific format unverified |
| 26 | Imports/historical data | Animal CSV/XLSX and assisted PDF review; weight CSV/XLSX review |
| 27 | Global search | Animal/current/former identifier search; broader event search pending |
| 28 | Reports/exports | Animal CSV, foundation JSON, session CSV; full reports pending |
| 29 | Dashboard | Working counts/views; operational alerts pending |
| 30 | Calendar | Pending |
| 31 | Phone sidekick | Dedicated workflow pending |
| 32 | Offline/sync | Pending; online required |
| 33 | Backups/restore | Exports available; tested complete restore pending |
| 34 | Data ownership | Portable source/exports; full host migration/recovery unverified |
| 35 | Custom fields | Pending |
| 36 | Settings | Some device flag preferences; broader settings pending |
| 37 | Exclusions | Original exclusions retained |

## Current additions

Retired tag/EID matches in weight imports are suggestions that require explicit animal selection. A reused identifier remains ambiguous. Typo corrections are not treated as tag retirements. Session CSV includes animal ID, name, date, original weight/unit, session and valid/voided status. Animal profile history describes weight changes directly. The Build Plan tab contains a grouped cumulative summary and checklist.

## One combined user review, when convenient

- Animal entry/import: unknown data saves with flags, tags/colors/leading zeros and parents match source, saved records survive refresh.
- Tags: correction differs from retirement, additional tags stay in their assigned ear, selected swaps carry color/EID correctly, former identifiers remain searchable.
- Status/history: exit dates affect appropriate years, unknown sale dates remain unknown, cull reasons stay recorded, delete/restore retains identity and links.
- Pedigree: both family lines, unowned ancestors excluded from flock counts, known-family relationships and incomplete ancestry disclosures.
- Weights: batch entry/review/save, correction, void/restore, ADG/count changes, spreadsheet matching including duplicate/retired identifiers, duplicate date protection and session CSV.
- Navigation/exports: species/year filtering, All Years read-only, JSON retains valid/voided weights and history.

## Technical verification and limits

Recent weight API checks passed for atomic validation, repeat-save idempotency, unit conversion, duplicate rejection, stale versions, individual and session void/restore, and session membership after correction. Import tests cover exact/current/retired/reused identifiers, contradictory identity columns, additional tags, blank measurements, date/unit normalization and CSV safety. Production build/type checks pass. Production records were not used for tests. The cumulative user review remains pending.

Unsaved drafts do not survive refresh/navigation. Batches contain up to 100 measurements on one date. PDF import is assisted. Scale-specific XR5000 samples, adjusted growth formulas, breeding timing, ownership precision, feed allocation, management-watch design and central inventory-warning placement remain unresolved or future work.


Latest profile delivery: ownership history, registration attachments, animal photo history and profile-photo updates are now implemented. Review the latest section of Phase-1-completion-and-test-schedule.md; older outstanding-feature statements above are historical. Full attachment backup is still pending; JSON includes metadata, while files are individually downloadable.

## Latest animal-record review

See Phase-1-completion-and-test-schedule.md for verified fixes and the consolidated checklist. See Deferred-improvements.md for the saved sorting request and the user preference to prioritize the remaining build over optional refinements. No live records were changed during the technical review.

## Breeding groups and navigation package

Section dropdown replaces the growing work-area tab row. Species/year remain independent. The main informational dashboard is deferred to reports; see Deferred-improvements.md.

Implemented saved breeding groups with permanent group IDs, one male/multiple females, start/end dates spanning years, Planned/Exposed/Completed/Cancelled state, notes, change reasons/history, member selection in pages of ten, offspring known-pedigree COI, within-group relationships, overlap warnings and JSON export. A male may serve multiple groups; group edits retain prior membership snapshots. Planned COI above 20% is rejected; actual historical exposures remain recordable, without declaring them recommended. Unknown ancestry is not proof of unrelatedness. No timing or paternity is inferred. Edit cross-year groups from their start year; All Years is read-only.

Local tests passed creation, idempotent retry, same male in multiple groups, exposure update, history, version conflict, cross-year dates, membership/species validation and planned COI cutoff. No live farm records were added by tests.

Combined review later: create a planned group, choose members/ram, inspect COI and relationship review, save/reopen, update to Exposed, inspect history, reuse the ram in a second group, export records and verify cross-year display. Remaining Phase 2: pregnancy checks, Composite 4 saved targets and numeric breed composition, project-based comparisons, configurable schedules. This package is not all of Phase 2.
