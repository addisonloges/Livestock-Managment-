# Program progress and consolidated review

This is the current cumulative checkpoint, not a claim that all 37 areas are complete. Foundation and history/session work are active. Later phases are not being accelerated past unresolved design decisions. The user is remote on a phone and has asked development to continue without individual feature testing.

## All 37 requirement areas

| # | Area | Current position |
|---|---|---|
| 1 | Overall concept | Working foundation; six phases retained |
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
