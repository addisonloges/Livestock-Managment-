# Connected build checkpoint

Local implementation checkpoint, 2026-09-13. This is not completion of the entire application and is not yet published. Preserve the user's request to build the remaining connected application without requiring individual feature approvals.

## Added or changed

- Breeding projects, editable composition targets, pregnancy checks with correction history, group delete/restore (unpublished work carried forward).
- Corrected cross-year breeding list ownership and prevented partial automatic offspring composition when either parent's percentages are incomplete.
- Planned female selection excludes new selections exceeding 20% COI; existing selections remain removable and server validation prevents saving an invalid plan.
- Lambing/kidding entry starts with offspring identity and then parent/exposure links, supports littermates and stillborn counts, and creates born-alive profiles plus optional birth weights in one atomic transaction. Unknown parentage remains unknown. Birth-type count includes stillborn offspring.
- Dated profile events: notes, rearing, weaning, body condition, expenses, retained valuations, reminders. Edit with history; void/restore with reasons. Expense allocation conserves integer cents and counts each bill once.
- Treatment protocol entry with dated scheduled/given/skipped doses, product/concentration, route, instruction source and withdrawal end. No automatic dosage supplied. Repeat-product and same-date dose review messages. These are not yet product-specific excessive-dose checks or a full inventory module.
- Dashboard source totals, cross-year calendar entries and basic animal growth/expense reports. Existing Section dropdown retained.
- Weights enabled after litter integration; initial selection is the selected birth year's offspring, with all-ages option and search.
- Records-only backup endpoint exports all eight current tables, including history and new events. Photo/registration bytes are explicitly excluded; complete media backup and tested restore remain unfinished.

## Verified so far

Type checking and the latest production build passed. All 43 domain checks passed, including the existing identity/import/tag regressions and new breeding/litter/event tests. Local database integration passed atomic litter/profile/birth-weight saves, repeat-save idempotency, stillborn exclusion from animal profiles, rollback on duplicate animal, pregnancy corrections, project versions, group archive/restore, expense conflicts and event void/restore. Latest treatment protocol save and eight-table records backup checks also passed. All test records are local. Browser interaction/accessibility testing remains pending because the browser automation runtime is unavailable.

## Required next work

1. Litter correction/void/restore with downstream dependency handling; integrated weaning weight and rearing history display, dated management-group membership and per-ewe exposure intervals.
2. Health products/inventory, dose-specific overrides, lab sessions/attachments, product-specific warning rules with verified sources.
3. Feed purchase/ration versions, workbook-equivalent calculations and validation. Do not settle unresolved feed-cost allocation by assumption. Preserve user preference for Ohio State spreadsheet workflow plus SDSU guidance and Iowa State support.
4. Sales/lot proceeds, purchase basis, full financial statements and parent contribution without double counting; no depreciation.
5. Rich reports/filter/chart/export, editable calendar actions, species launcher and dashboard settings, typed custom fields, reference catalogs.
6. Offline session queue/manual sync/conflict review, full media-inclusive backup/restore and scheduled retention.
7. Per-birth-year display numbering migration with searchable old identifiers, imported evaluation histories, and remaining discovery reconciliation. Never renumber live UUID links.
8. Finish reviewing newly added project conversations and original attachments. Current browser automation has a runtime error; project conversation reads remain available.

## Consolidated user testing when released

- Identity/import: existing animals and tags retained; missing data follows agreed flags; current/retired identifiers searchable.
- Breeding: create undated plan, set planned date, record different actual date, reuse a ram, inspect COI, record/correct pregnancy, delete/restore group, check cross-year calendar.
- Births: record twins including stillborn, verify profile counts and birth weights, unknown sire remains unknown, save retry does not duplicate.
- Events/health: batch select, review allocations, correct/void/restore expense, create multidose protocol and change individual dose states; check profile history and calendar.
- Growth: selected-year lambs first, adult option, import/manual session, duplicate review, correct/void/restore measurements and ADG.
- Reports/recovery: totals match source records, expense counted once, retained estimate excluded from actual profit, backup coverage clearly stated. Full restore/offline checks await implementation.

## Continued implementation, September 13

- Lambing/Kidding remains an explicit section in the unpublished navigation; absence from the currently deployed site does not mean the module was removed.
- Added event audit viewer and validated action types, retaining compatibility with older save requests.
- Treatment protocols support per-animal dose overrides; invalid or unselected-animal overrides are rejected. Health inventory lots track approximate balances from given doses, including overrides and void reversals. Linked lot date/unit changes and voiding are protected.
- Inventory expiration/low-stock displays and configurable dose/repeat review limits with a required instruction source; no medical thresholds are supplied automatically.
- Separate Health and Finances navigation. Recorded income and cash net, equal lot-income allocation, filtered financial CSV export; retained estimates excluded. This does not complete purchase basis, sale disposition integration or parent contribution.
- Weaning entry can create optional measured weights atomically with the event. Existing measurements are protected by animal/date uniqueness; corrections use the shared weights workflow. Voiding a weaning event preserves actual measurements.
- Corrected All Years weight filtering and strengthened UUID syntax checking.
- Latest production build passed before the weaning addition. Local event regression and health/inventory integration passed. Weaning addition typechecked; its database verification is next. These changes remain unpublished.

## Further connected build progress (still unpublished)

- Weaning measurements and dated management membership passed local integration tests. Added a dedicated Management groups section. Periods can cross years; corrections occur in their owning start year.
- Feed/ration mix records preserve dated versions and editable ingredients. Cost-per-ton calculation is traced to Meat Sheep Balancer v6 Ration!C21. This is cost arithmetic only, not a verified complete nutrient model or automatic feed allocation.
- Added individual ewe exposure periods to breeding groups, including reentry, with period validation. Future planning years are selectable; actual event dates still cannot be future.
- Added batch lab/fecal result records with per-animal values and units, without medical interpretation. Lab attachments remain outstanding.
- Parent reports compare biological offspring cohorts, weaning, measured birth weights and offspring cash contribution. Comparison contributions must not be summed across parents or added to actual farm net.
- Full TAR backup now includes all eight tables and referenced current/removed media plus SHA-256 checksums. Verified with Python's standard TAR reader and checksums on six local media files.
- Recovery preview/add-missing workflow implemented, with existing-record conflict rejection, stale-preview protection, atomic insertion, accessible safety copies and non-overwriting media restore. It does not revert newer records, support selected overwrite/scoped historical rollback, or schedule backups.
- Manual offline working-copy queue and cached loaded data added for supported JSON saves; no automatic sync. Server-confirmed operations leave the queue; failures/conflicts remain. Current limitation: page must remain open; offline reload/service worker and browser testing remain outstanding. Photo uploads/recovery require online access.
- Latest production build and 49 automated tests passed. Local recovery preview, missing-record insert, stale/conflict rejection and safety-copy retrieval passed. The browser tool remains blocked by 'failed to write kernel assets: ... path specified ... (os error 3)'. No real farm records changed.
- Three async decisions are pending: quantity/membership-day feed allocation with overrides; management flags versus favorites; inventory warnings on central dashboard. No reply received yet; do not treat elapsed time as approval.

Still required: complete litter correction/void/restore and downstream reconciliation; typed custom fields/settings; evaluation history/imports; per-birth-year display numbering; full sales/status/purchase-basis integration; source workbook nutrition parity and remaining project review; richer saved reports/calendar actions; offline reload/conflict merge and scoped rollback/scheduled retention; user decisions above; browser QA and final publishing. Do not claim the entire project is complete.


## Latest verified checkpoint, September 13 (unpublished)

- Added typed optional custom fields and settings, profile value history, sale payments with atomic exits, and explicit individual financial allocations.
- Added genetic evaluation CSV preview/import with stable identifiers, duplicate/conflict handling, and event document uploads with retained history.
- Added birth-year sequence migration, preserved former display identifiers for import matching, and an offline shell service worker with a manual pending-save queue. Browser runtime verification remains unavailable.
- Lambing includes safe void/restore and birth-date/parent corrections that update linked profiles and original birth measurements atomically. Later dependent records block this shortcut; outcome replacement uses safe void and a corrected litter. Cross-year correction and comprehensive downstream reconciliation remain outstanding.
- Growth/finishing budget now uses supplied Ohio State days-on-feed and live/dressed break-even arithmetic. Unknown costs remain unknown, dressing yield is explicit, projections never enter actual cash totals, and depreciation is excluded. Full nutrient-balancer parity is not claimed.
- Latest production build, TypeScript check and all 56 automated tests passed. Local birth-correction integration passed: linked dates update together, repeat corrections work, self-parenting and dependent-history changes are rejected without partial changes.
- Local server session 13325 uses local D1/R2 only. No live farm records changed; live site remains v36 until publishing.
- Remaining scope still includes pending feed/flags/warning decisions, source nutrition work, complete historical reconciliation, richer reports/calendar, scoped rollback and scheduled backup retention, browser verification, consolidated user test schedule, and publishing.


## Browser and reporting verification

- Latest source adds monthly cash totals, separate latest retained estimates (same-day conflicts require review), shared report filters and saved filter setups. Ration versions include stage/source and calculated percentages; missing prices remain unknown.
- Latest build and all 60 automated tests passed. Local saved-report persistence/idempotency/conflict and future growth/ration plan tests passed; missing-record recovery regression passed.
- CUA tool remains broken, but bundled Playwright with an isolated headless Edge profile successfully tested localhost. Desktop dashboard has no page errors. Mobile Section menu includes Lambing; litter dialog opens, Reports loads, and service-worker offline reload succeeds. Settled modal is opaque; initial translucent screenshot was an animation frame.
- Screenshots are intermediate files in work/local-dashboard.png, work/mobile-lambing.png, and work/mobile-litter-settled.png. No live data touched. Local server is now session 7614. Footer accuracy edit is newer than last build.
- Manual offline queue synchronization/conflict behavior still needs browser integration tests. No final publishing or full-project completion claim yet.


## Recovery verification continued

Manual backup vault now stores records or full archives in R2 and provides paginated downloads. Manual copies are retained. Full archive streams have a checked content length; local storage/download verification passed with all seven referenced media files and every SHA-256 checksum. Retry uses the same operation ID and does not create another copy. This does not claim unattended weekly/monthly scheduling.

The latest full build and TypeScript check passed. Local browser tests also confirmed manual offline save/sync and conflict retention without overwriting a newer server edit. The local server is session 53242 on port 5173. All changes remain unpublished and uncommitted.

Do not implement full historical overwrite as a simple table replacement: it must preserve identifier non-reuse, optimistic concurrency, status-history semantics, and a recoverable safety copy. Missing-record restore is implemented; full/scoped rollback is still a separate required design and implementation task.


## Latest connected additions

Calendar now includes actual litter dates; Dashboard upcoming work excludes already-recorded cash/notes. Reports include a monthly income/expense chart backed by the same monthly totals table. Added optional sheep adjusted-weight review calculator with verified Virginia Tech equations, explicit factor/source and separate calculated output. Actual measured weights remain unchanged. Formula test passed; latest source typechecks. These last changes need the next full build/browser pass.


Git checkpoint e7d2daf saves the connected implementation through the adjusted-weight calculator. It is committed locally, not pushed or deployed. Latest build before this following addition passed all 61 tests and mobile browser checks.

Newer uncommitted addition: structured dated rearing fields for foster dam and number reared, without changing biological parentage. Validation rejects self-fostering and incorrect species/sex; source history displays foster details. Litter correction/void dependency checks now include later foster-dam references. Farm-event tests pass; this addition needs the next full build/API/browser check.


Further uncommitted work: retention/marketing decision events are separate from status and cash; retained valuation reports now correctly treat the entered amount as per animal (matching the existing form contract). Parent reports distinguish live profiles, litter-born-alive/stillborn counts and retain decisions. Added tests for these distinctions. Litter correction now permits reconciling to already-matching profile/birth-weight details without rewriting downstream profiles; mismatches are surfaced in Lambing. Latest typecheck passes; next step is local integration and build validation for these changes.


Latest uncommitted additions: install manifest/phone metadata and icons, install prompt when supported, breeding-cohort outcomes with cross-year births and explicit unresolved checks, reusable contact directory in Settings and payee/payer snapshots on expenses/income. Contact edits preserve prior transaction names. Full build and API tests are next for this batch. Current server session remains 67877 and serves the preceding build.


Latest treatment/recovery additions (uncommitted): individual per-dose Given/Scheduled/Skipped overrides, inventory and calendar use effective per-animal states, next-day scheduling clears prior state overrides, and repeat-interval checks include doses within a protocol. Added contradictory withdrawal-end warning. Media-only recovery skips older database records and verifies/restores only referenced missing files. This batch typechecks; next build/API/browser checks are pending.


Current server session 25665 serves the build through contacts/PWA metadata. That build, 65 automated tests, contacts API integration, and browser manifest/icon/contact navigation checks passed. Newer individual treatment states and media-only recovery need a new build.

Next larger recovery work: full/scoped historical rollback cannot simply replace tables. A safe design needs a persistent identity-number reservation ledger (not rolled back), a write epoch to invalidate stale/offline writes across restore, transactional guards on every database write, preserved safety snapshots/media, and previewed scope/diff/dependency checks. This design is not implemented. Do not ship a naive DELETE/INSERT restore that reuses IDs or lets an old queued write silently apply to restored state. Scheduling also still requires an actual hosting scheduler, not an on-open approximation.


Search records now searches animal current/historical details, events, litters, breeding groups/projects and contacts across species/years, with profile opening or navigation to the owning module/year. Ancestor-only/deleted records stay in their dedicated views. Added explicit partial-source errors and a bounded result list. Phone header and light-palette consistency adjusted for the added search control. This batch is newer than the running build.


Latest validation: full build and all 66 automated tests pass. Local browser verified media-only recovery using an older archive while preserving a newer event edit, global cross-record search, and phone layout under a dark device preference. Screenshot work/mobile-record-search.png was inspected. Current local server session 50909 serves this build. Changes since e7d2daf are still uncommitted and all work is still unpublished.


## Calendar, saved preferences and reporting checkpoint

Added month/agenda calendar with event-type filtering and links to source records; cross-year entries open the original record year. Local browser checks passed, including Lambing navigation. Recovery preview now displays current/backup field differences and counts newer current-only records that will be preserved; read-only API verification passed.

Species and per-species years are remembered in this browser. Saved report filters support update, archive and restore; browser create/update/archive/restore checks passed. The stale phase-one-only in-app testing guide is replaced by a seven-phase checklist with persistent browser checkmarks and explicit remaining items.

Recorded Animal purchase expenses feed lifetime purchase basis using existing allocations, without adding another expense or depreciation. Reports offer whole-species cash or only amounts assigned to filtered animals; general costs stay outside the latter. Tests cover rounding, general-cost exclusion and unknown versus zero purchase cost. Adjusted growth reviews save source/input/version snapshots as dated animal notes. Local browser verified duplicate retry, unchanged actual weights and purchase/filtered cash rendering. Latest full suite at this point passed 69 tests.

Newer additions needing next build/browser pass: peer growth comparison with birth/sex/breed/date/age filters, full-interval management membership, tied ranks and CSV; dashboard card selection/order saved by species/year in this browser. Peer tests passed and typecheck passed. Local server session 93565 serves the preceding build. No new live deployment or GitHub push. GitHub export approval remains pending following two automatic approval-review rejections; do not retry without the user's answer.


Latest validated checkpoint: 71 automated tests, full build and typecheck pass. Phone browser checks passed dashboard card persistence, peer comparison filters and CSV. Offline browser checked current/pending field comparison, selected note-field merging, preserved previous device copy, manual-only synchronization and protection of a newer server title. Five report CSV downloads passed. Cross-year litter correction now updates eligible birth-year numbers, first recorded years, profiles and birth weights atomically; permanent IDs and prior identifiers remain in history. Local integration covered two offspring, repeated corrections, stale versions, dependent-history rejection and already-matching reconciliation.

Current server session 70243 serves this build. All local-only QA records remain separate from the live database. No deployment or GitHub push has occurred. Remaining recovery work includes unattended scheduling and full/scoped historical rollback with a write epoch and permanent identifier reservations; do not implement naive table replacement. Pending design choices remain feed allocation, management flags and dashboard inventory warnings. GitHub export approval is still pending.


## Recovery safety and rollback implementation

Uncommitted work adds recovery_control, identity_counters and recovery_runs (migrations 0007–0009). Every flock API read carries a recovery revision; writes validate it and database batches/runs guard it transactionally. Older forms/legacy requests are rejected after rollback; fresh reload permits current writes. Pending copies keep their original revision, and reviewed note/reminder merges use the freshly compared record revision. All API routes are wrapped; internal full-backup calls pass the request explicitly.

Birth-year number high-water marks survive record replacement and include historical identifiers. Triggers reserve only actual number/year changes. D1 counts trigger writes in meta.changes, so successful animal edits now check for at least one changed row rather than exactly one. Local tests caught and verified that fix. Backups include number reservations and recovery-history metadata; operational recovery state is never rolled backward.

Rollback supports all records or Sheep/Goats lifetime scope. Species recovery preserves the other species and shared records. Preview validates record fields, references, pedigree cycles, duplicate identifiers/measurements and available media; changed fields and removed current-only records are shown. Apply requires typed RESTORE, a current preview and an operation ID. It creates a full safety TAR before atomically replacing the target records, advancing the recovery revision and retaining an independent recovery journal. Media bytes are not deleted/replaced. Missing referenced media must be recovered first. Year-only rollback is not offered because animal lifetimes span years.

Local integration passed species/full rollback, retained other-species edits, safety archive download, newer-record removal, number non-reuse, stale working-copy rejection/reload and cross-year/profile regression. Phone preview/confirmation/history checks passed. A direct birth-year correction test verifies success responses and higher numbers when returning to an earlier year. Current server session 12796 serves the build before the latest duplicate-validation and custom CSV refinements; local recovery epoch is now 2, so standalone local API tests need an X-Flock-Epoch header (work/run-local-check.mjs provides it).

A private pre-update live-record backup attempt was rejected by automatic approval review: it requires explicit user authorization to download that payload to local files. No live records were downloaded by that attempt. An async approval question is pending. The earlier GitHub export approval is also still pending; do not retry either action without a reply. The existing Site was verified owner-only, live v36. No new deployment or Sites source push has occurred.

Unresolved design choices remain feed allocation, watch flags versus favorites, and dashboard inventory warning placement. Unattended weekly/monthly backups need a supported background scheduler; none is exposed by the current Sites tools/configuration. Do not label manual backups or on-open checks as an unattended schedule.


Final local validation for this checkpoint: full build and all 74 automated tests pass. Final phone tests confirmed Lambing is in the Section menu, the litter form opens, Reports loads and offline reload works. Rollback preview/scope/confirmation/history passed without browser mutation. Final API tests passed full/species rollback and birth-year correction with number reservation. Local server session 47329 serves the current build; local recovery epoch is now 4. The latest source is still unpublished. Both explicit export approval requests remain pending; neither rejected action has been retried.
