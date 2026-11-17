# Reader and production workflow implementation

Updated October 30, 2026. Software implementation and synthetic-data checks; no physical reader certification and no production deployment.

## October 31: fast section entry and mass input

The header now offers Scan EID or enter tag, with its task preset by the current section. Enter selects a unique match and prepares that section's entry without changing section, species or year. Shift+Enter opens the profile instead. Ambiguous identifiers require an explicit choice; scanning never saves a financial, treatment or birth record by itself. `/` or Alt+A focuses lookup when no form field/dialog is active.

Batch entry collects animals in separate trays for each section/species/year. Scan or type identifiers repeatedly, or paste a tab/newline-separated identifier list. The Enter information button opens a worksheet or shared event entry with those animals selected. Weights supports up to 100 measurements; profile edits up to 50 animals; other selections up to 200. Weight and event forms also accept further scans without closing the form. Weight entry moves from a scan to its measurement cell; Enter after the last measurement returns to scan input. Existing Excel-cell paste and reviewed saving are preserved.

Multiple scanned dams open a mass birth worksheet, one row per offspring, grouped by dam and actual date into litters. Birth dates and parent/exposure selections start blank. Each litter saves atomically through the existing API; the batch reports confirmed and unconfirmed litters and retains operation IDs for retries. An ordinary section launch is consumed once, so navigating back does not reopen the previous form.

Finances now identifies its existing attachment controls as Bills & receipts and Upload bill / receipt. Attach a PDF or supported photo to a saved expense/income entry. One shared bill can be allocated across selected animals; attaching the receipt does not create another expense. Uploads still require a connection.

Additional code: app/section-animal-lookup.tsx, app/scan-animals.tsx, app/batch-lambing.tsx, lib/animal-lookup.ts, lib/section-entry.ts and tests/animal-lookup.test.ts, with integrations in the existing workspaces. Latest automated suite: 112 passing tests. No live farm data or pending saves were changed during these checks.

### Scan-and-next-line weights and Health

The Scan / tag lines worksheet now keeps an editable EID/tag field on each new row. Confirm the identifier, enter the weight or health value, and press Enter: focus moves to the next blank tag line, with completed rows still visible. Unresolved typed identifiers block review until resolved or removed. The full animal worksheet and Excel-cell paste remain available for weights.

Health has a visible Scan entry preset selector, including a dedicated FAMACHA score record type. Each animal has its own whole-number 1–5 score, optional notes, date and optional observer. Body condition is a separate record type and retains fractional BCS support. Treatment rows retain shared protocol settings and support individual dose/state overrides. Scanning/scoring never creates a treatment or marks a dose given automatically.

FAMACHA range reference: [UF/IFAS VM271](https://edis.ifas.ufl.edu/publication/VM271/pdf), page 2. The interface records observed numbers; it does not reproduce the FAMACHA card or infer treatment from a score.

Current verification: 115 passing automated tests, successful TypeScript/production checks, and a local API test for per-animal score/notes/observer persistence, retry safety, invalid-score rejection and unchanged animal/weight/treatment records. Browser checks confirmed weight Enter → next blank tag line, next tag → next weight field, FAMACHA Enter → next blank tag line, and separate scores in batch review. Checks used fictional local records only. Core code is app/scan-entry-rows.tsx, lib/farm-events.ts, app/event-workspace.tsx and app/weighing-sessions.tsx; tests are tests/health-scores.test.ts and tests/health-scores.local.mjs. No database migration is required.

## Working screens

- Animals: workbook gridlines, frozen identity column and headers, sortable identity columns, resizeable shared table headings, keyboard movement between shared table cells, and explicit name/breed cell saves. Existing tag, pedigree and status controls retain their reviewed forms and history. Existing animal-entry and weighing sheets retain their paste/review workflows.
- Lambing: filterable, date-sortable litter worksheet with born/alive/stillborn and birth-weight coverage. Detailed histories and reviewed litter corrections remain available.
- Sessions → EID & inventory: keyboard/manual/paste input, strict text EIDs, historical tag notices, unresolved/conflicted identifiers, frozen expected inventory, repeated observations, missing/unexpected animals, saved audit and explicit observation reconciliation.
- Reports → Ewe productivity & families: independent birth cohort, exposure cohort, production-year weaning output and lifetime bases; an explicit observation cutoff; biological and rearing credit; annual/accelerated/unspecified system filters; measured pounds and coverage; confirmed zero versus unresolved cycles; individual litter output and linked breeding-weight efficiency; actual intervals and low-history flags.
- Candidate maternal-family view: candidate, dam and maternal granddam, production completeness and actual measured weights, with a candidate growth curve and dated gain/plateau observations. Unknown ancestry stays unknown.
- Breeding groups support Accelerated and Non-accelerated labels, with no mandatory interval. Existing actual and individual exposure dates remain authoritative.
- Events support sourced visual inspections and shedding observations, including observer, result, scheme/version, birth season, clipping status and displayed age where birth date is known. Visual inspection is separate from genetic evaluations.
- Growth comparisons disclose the cohort and withhold displayed/exported ranks and ratios unless breed, sex, birth month, measurement dates and common management are established. These remain descriptive comparisons, not genetic evaluations or parity-adjusted breeding values.

## Reader operation

1. Open EID & inventory, select Lookup or Inventory and start a named, dated session. Inventory optionally uses a recorded management group; its expected animal IDs are captured on the server once.
2. Focus EID scan. Supply exactly 15 digits as text; surrounding whitespace is supported. Enter or Add scan confirms a complete scan; no inactivity timeout submits input.
3. Review device drafts. Save pending scans explicitly. An unavailable lookup is not proof that a tag is unknown, and a device draft is not a confirmed server save.
4. Review unknown/conflicting observations in the saved audit. Explicit reconciliation links only the observation and retains prior history; it does not assign an animal's EID or change status.
5. Finish or resume the session. Each session supports up to 2,000 observations; each save/import selection supports up to 200.

Generic CSV/XLSX imports have a header and mapped EID, optional source timestamp, source group and source event columns. EIDs must be string cells. Numeric/scientific identifiers are rejected rather than reconstructed. XLSX files containing formulas or external links are rejected; use a verified plain-text export. Timestamps require ISO date/time with an explicit offset, or remain unknown. Source groups never change farm management memberships.

Review selected rows and overlaps before accepting them into the device draft. Source filename, worksheet, row, raw cells, identifiers and timestamps are retained. Identical file/sheet/row imports are protected against repeats across sessions, including concurrent requests. Similar observations from different files require human overlap review; EID alone is never a universal event identity. A batch with an invalid row saves no observations; selected valid staged rows can be submitted separately. Save results distinguish saved rows from already-saved rows skipped.

## Storage and preservation

Primary code locations: app/reader-workspace.tsx, app/api/flock/reader/route.ts and lib/reader.ts for handling/imports; app/production-workspace.tsx and lib/production.ts for production/families; app/animal-cell.tsx, app/lambing-workspace.tsx, app/weight-curve.tsx, app/globals.css and components/ui/table.tsx for worksheets and curves. Integration updates are in dashboard/sidebar, offline-sync, breeding/events API and workspace files, lib/breeding.ts, lib/farm-events.ts, parent-performance/farm-overview, peer-growth and recovery-plan. The XLSX archive check adds fflate as a direct dependency. Tests are tests/reader-production.test.ts and tests/reader.local.mjs.

No schema migration or separate animal database. Handling sessions and import source reservations use the existing farm_records table; changes use farm_history. Animal UUIDs, EID/tag history, ownership, status, pedigree and weight records are reused. New APIs use existing password protection, same-origin enforcement, write-epoch checks and change auditing. Recovery validation checks handling-session animal references. Backups include the added records.

Pending scans use the existing IndexedDB cache with a user/species key. Server lookup recalculates resolutions when saving. Existing offline transport retains failed requests for manual sync. Retried requests and source rows are idempotent, and stale session versions are rejected. The preview uses a separate local database under work/reader-preview/state, containing only fictional fixtures.

## Verification and limits

- TypeScript check and production build passed; 106 automated tests passed.
- Local API tests exercise protected access, inventory snapshots, historical/unknown matching, stale-version rejection, safe retries, all-or-nothing invalid batches, file-row deduplication, manual reconciliation and concurrent import protection. They also verify unchanged animal/weight records.
- Browser checks use the full local dashboard with fictional fixtures, not a component mock. Cross-year output, breeding-weight efficiency and scan draft behavior were checked.
- No authentic vendor export has been supplied. No AgriLink/TGM-specific adapter, reader database upload, task synchronization, direct iPhone accessory protocol or scale connection is certified or implemented here.
- The existing Virginia Tech 60/120-day method is preserved. Adjusted 90-day output remains unavailable without a verified method, coefficients, eligibility rules and compatible sourced inputs. The handoff's arithmetic is tested separately and is not presented as an observed annual production total or a reconstructed APR definition.
- Seasonal age-band reporting describes actual age at exposure; it is not a breed-specific maturity standard. Mean complete-litter output excludes incomplete litters and states its sample. Partial measured output is explicitly labeled.
- Existing pending pedigree/generation changes and the two pre-existing reference-review documents were preserved. No live farm records or hosting audience/password were changed.

## Physical AWR300 bench test

Record actual reader model/firmware, device OS/browser, Bluetooth profile, output format and terminator. Consult the [manufacturer guide](https://www.allflex.global/wp-content/uploads/2021/06/Allflex-AWR300-User-Guide-_Final_September2020.pdf), printed page 38, for HID/HID Smart; this describes one-way keyboard entry, not command synchronization.

Pair using the appropriate supported keyboard profile. Scan into a plain text field first and verify all 15 digits, leading zeros and whether Enter is appended. Then use fictional/test animal records to check a known EID, repeated scans, a retired EID and an unknown EID. Verify unique-animal counts, historical notices, focus changes, ordinary typing, disconnect/reconnect and the phone onscreen keyboard. Confirm that incomplete chunks do not submit. Export a real reader session through the installed utility, then check mapping, source times, import and reimport. No reader records should be deleted during this procedure.


## Combined handling verification — October 31, 2026

Sessions → Combined handling uses one scanned animal row for measured weight, FAMACHA, explicit treatment selection, individual dose/state and animal notes. Shared treatment settings remain preset. Tab moves across tasks; Enter validates the row and moves to the next animal. Blank measurements are omitted and a score never selects treatment. Review lists the records before saving. Each save step is independently confirmed; retry keeps stable operation IDs and skips confirmed steps.

`tests/combined-handling.local.mjs` passed against the isolated fictional preview: two animals, different weights/scores/notes, treatment for only one animal, an individual dose/state, and replay of every save without duplicates. Animal records remained unchanged. The complete unit suite passed 119 tests and the production build and TypeScript check passed. Interactive browser verification remains unavailable because the browser connector cannot bind the current tab. No live farm records were used.
