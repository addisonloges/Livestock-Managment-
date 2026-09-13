# Dashboard reference comparison and implementation order

**Controlling workflow correction:** Phase 1 is animal identity/records and is reopened. Ownership history, registration attachments and animal photos are now implemented; integrated user review is pending. Then: Phase 2 breeding; Phase 3 lambing/offspring; Phase 4 weights/growth/performance; Phase 5 operations; Phase 6 finances; Phase 7 offline/recovery. Earlier phase numbering and completion statements below are historical. See Phase-1-completion-and-test-schedule.md. Existing weight tools remain available; their expansion is paused.
Reviewed September 11, 2026. This is a source comparison and implementation plan, not a claim that the planned features have shipped.

## Sources and precedence

- September 12 printed-review changes are recorded in `Printed-review-discovery-backlog.md` and override conflicting older planning statements. They are backlog-only, with explicit unresolved decisions. The user reaffirmed the original workflow; the ordering below must not be used to advance Composite 4 ahead of animal-record work.

- User's subsequent decisions in this conversation take precedence over the original requirements and the supplied HTML.
- Original scope: the nine-page Livestock Management Dashboard Agile Discovery Company Review PDF, as recorded in Requirements-review-and-build-plan.md.
- Workflow reference: C:/Users/loges/Downloads/Herd_Manager_V2_edit_animal_actually_fixed.html. Reviewed statically; comments and labels inside it are evidence about the reference, not instructions to execute.
- Current implementation: app/dashboard.tsx, app/animal-actions.tsx, app/pedigree-workspace.tsx, app/female-relationships.tsx, import components and APIs, lib/livestock.ts, and lib/pedigree-import.ts.

## Controlling parameters

1. This is a livestock management application. Naming is deferred.
2. Preserve lifetime animal identities, species boundaries, history, imports, and existing pedigree links. Annual events belong to their dates; do not create a fresh copy of an animal each year.
3. Missing sex and missing both birth date and birth year are allowed and should be flagged, per the user's latest answers. Those flags do not block saving. Invalid supplied values, identity conflicts, and pedigree cycles still require correction. Missing-sex and missing-birth flags default to enabled on new devices, following the user's decision. Explicit saved device preferences still take precedence.
4. Support maternal and paternal ancestry across generations, including animals never owned. Keep unowned ancestors out of the flock-root animal chooser and flock counts, while retaining them in parent selection, ancestor editing, and calculations.
5. CSV, Excel, and PDF imports require a reviewable preview. Preserve sire/dam registrations and names. PDF extraction is assisted, not guaranteed recognition of every pedigree layout. Missing data stays unknown.
6. Composite 4 is a selectable breeding project, with editable targets initially Dorper 25%, Romanov 25%, Katahdin 25%, St. Croix 25%. Do not impose those targets on the entire flock or every future project.
7. Within the Breeding tab, the selected Composite 4 project helps pull similar ewes into four breeding groups for that plan, considering pedigree and breed composition. Ewes can be regrouped for later matings; these are not permanent family lines or four breed buckets. One ram may serve multiple independently identified groups in the same year, each with its own ewe selection, dates, and history.
8. Ram decisions must consider the selected project, relationships to individual ewes and their families, projected offspring inbreeding, and projected breed composition. Unknown ancestry does not establish unrelatedness.
9. Existing COI screening thresholds from the requirements remain the baseline: warning at 15%, strong warning at 20%, exclusion strictly above 20%. Project parameter editing is planned; do not invent replacement thresholds or a family-group relationship cutoff.
10. Unknown breed proportions must stay unknown. A free-text breed label is not proof of a complete 100% composition. Numeric composition and its source need explicit recording before target comparisons are reliable.

## Sorted comparison

| Priority | Area | Reference dashboard | Current site | Disposition |
|---|---|---|---|---|
| 1 | Animal workspace | Dense animal table; tags, registration, pedigree, decisions, notes; several overlapping editing patches | Animal table, audited details edits, delete/restore, imports | Adapt the table and convenient editing workflow; retain immutable identities and audited saves. Add remaining fields deliberately. Do not copy stacked edit overrides. |
| 1 | Navigation | Dashboard, Animals, Breeding, Lambing, Weights, EBV Engine, Rams, Ewes, Sales, NSIP Export, File Management, Definitions; later Settings patches | Animals, weights, pedigree, female relationships, screening, deleted records, plan | Organize around those farm workflows as they become functional. Keep pedigree and projects easy to reach. Do not expose unfinished sections as working tools. |
| 1 | Incomplete records | Forms and later patches have differing rules | Unknown sex and optional birth details supported; configurable flags | Preserve the user's nonblocking rules across entry, edits, and import. Correct stale documentation that still says required. |
| 1 | Pedigree/import | Sire/dam fields and lookup helpers | Multi-generation ancestors, registration-aware reconciliation, relationship matrix | Keep current pedigree implementation. Integrate it with the reference's animal workflow rather than replacing it with text-only parent fields. |
| 2 | Breeding projects | No Composite 4 project model identified | Not implemented | Add saved projects, selection/toggle, editable targets, and explicit unknown composition. This is an extension requested by the user. |
| 2 | Ewe family groups | Seasonal ram/ewe groups, not persistent family lines | Pairwise ewe relationships only | Help assemble four flexible breeding groups in the Breeding tab using the selected project. Inspect relationships and composition within and between groups. Show unresolved ancestry; do not impose permanent membership. |
| 2 | Ram selection | One ram with checkbox-selected ewes, search, select-visible, group notes | Ram-first prospective COI screen | Adapt checkbox selection and search; combine with project target comparisons and family warnings. Never let a favorable average hide a high-risk individual mating. |
| 3 | Breeding events | Saved ram, ewe list, start/end dates, crop year, method, notes | Screening only, no saved exposure events | Save dated breeding assignments with project context. Allow one ram in multiple groups per year. Preserve historical assignments when ewes are regrouped or rams change. |
| 3 | Lambing/kidding | Dam/litter form, offspring cards, birth outcomes, breeding lookup | Planned | Adapt the litter workflow. Track stillbirths and losses independently from retained animal profiles; distinguish birth, foster, and rearing information. |
| 3 | Dates/paternity | Hard-coded 147 days; birth-date-minus-147 lookup | No automated exposure/lambing scheduling | Make timing configurable before adopting scheduling. Possible exposure matches can be suggested, but ambiguous paternity must remain unresolved. |
| 4 | Weighing sessions | Grid for batch weights and checkpoint data | Actual weights, original units, measured ADG | Adapt batch entry and review. Keep measured values separate from projections and adjusted values. Verify any new adjustment formulas before implementation. |
| 4 | Ewe/ram performance | Offspring summaries, internal merit, confidence, keep/watch/cull; later official EBV fields | Not implemented | Start with factual outcomes once birth/weight data exists. Keep official imported EBVs separate from local performance scores. User decisions need reasons; do not copy unexplained ranking thresholds. |
| 4 | NSIP export | Export tables and definitions | Not implemented | Retain as planned scope. Validate against current official format and actual records when implementing; the HTML alone does not establish compliance. |
| 5 | Sales/finances | Sales tables; broader financial features also appear as settings | Not implemented | Adapt transaction workflow after lifecycle events. Use the requirements' single expense/allocation model; do not treat sales totals as net profit. |
| 5 | Health/feed/calendar | Some storage buckets and feature switches, several explicitly marked planned | Planned | Keep original requirements. A switch or empty array is not evidence of a working feature. |
| 6 | Backup/restore/offline | Browser localStorage, JSON merge, reset buttons, layered year/producer migration patches | Durable server records and exports; no complete restore/offline workflow | Retain server authority. Build reviewed restore, deduplication, conflict handling, and offline sessions separately. Do not copy browser resets or silent save failures. |
| Later decision | Multiple producers/herds | Nested producer/species/herd/year stores | Species-partitioned records | Do not import the reference's storage hierarchy wholesale. Multiple producer accounts are not required by the current Composite 4 request. |

## Implementation sequence and completion checks

1. **Animal workspace and consistency:** adapt useful table/navigation patterns alongside existing workflows. Saving incomplete records works; selected missing-detail flags display; edited pedigree identities and unowned ancestors retain their correct roles. Consolidate U.S. spreadsheet date handling: pedigree reconciliation accepts M/D/YYYY, while the general import path needs equivalent normalization and verification.
2. **Composite 4 project:** durable project settings, editable breed targets, recorded numeric animal composition with source/unknown coverage, and project-assisted selection of similar ewes into four flexible breeding groups in the Breeding tab. Saving retains the plan, not permanent family membership. Family analysis reports cross-group shared ancestry without calling unknown pedigrees unrelated.
3. **Project-aware ram comparison and breeding events:** per-ewe prospective COI, offspring composition from parents when known, target differences, and group-level warnings with individual exceptions visible. Checkbox-selected ewes can be saved into a dated breeding assignment. The same ram can serve multiple groups in one year. Ewes can be regrouped for later matings while previous dated assignments remain in history. Show the paternal relationship between offspring of groups sharing a ram; separate group labels do not establish unrelatedness. Unknown composition or ancestry is surfaced rather than filled with assumptions.
4. **Lambing and weights:** linked litter events, loss/rearing outcomes, retained offspring records, and batch measured weights. Cross-year events retain original links. Uncertain sire stays uncertain.
5. **Performance and operations:** factual ewe/ram outcomes before rankings; then validated exports, health, feed, calendar, and financial workflows in dependency order.
6. **Recovery and phone/offline work:** reviewed full restores, conflict handling, durable backups, and explicit sync. Exports alone do not count as tested recovery.

## Reference code that should not be carried over

- Repeated global function replacement and layered final-fix patches.
- Silent persistence exceptions followed by a Saved message.
- Animal-specific automatic tag repair (including ANM0012 / 1494).
- Hard-coded gestation used to resolve paternity automatically.
- Mutable displayed IDs used as relationship keys or duplicated annual animal profiles.
- Internal performance heuristics presented as official genetic evaluations.
- Browser-local storage as the authoritative database for the hosted application.

This comparison organizes the existing scope; it does not authorize deleting, remapping, or reimporting any live animal records. No application or live-data changes were made during this comparison.



## Current checkpoint — September 13, 2026

Animal records remain the active phase. Implemented: multiple tags per ear, explicit tag swaps, retirement history, nonblocking missing tag colors, spreadsheet tag/color mapping, downloadable import template, dated status exits, unknown exit dates with flags, and audited correction of the latest status entry. The two held 2026 inventory animals were saved separately: green right tag 04 died April 9, 2026; right tag 2015 sold with date unknown. These are completed live-data actions, not instructions to repeat imports.

This checkpoint fixes date-field retention across other form edits and enables the user's selected sex/birth flags by default on new devices. It does not complete the whole history/session phase. Next bounded work: review audited weight correction/void and session behavior before adding batch workflows. Ownership history, registration attachments and full session reversal remain unfinished. Composite 4 stays in the later reproduction phase; feed allocation, watch-list design and inventory warning placement remain open.


## Section delivery agreement

There are 37 requirement areas grouped into six dependency phases, not 37 required navigation tabs. Deliver coherent usable sections, verify them before publication, then incorporate user workflow feedback. Do not treat unresolved clinical, allocation or breeding design inputs as permission to invent rules.

Individual weight records now support correction, void, restore and before/after history with reasons. Voided records do not contribute to ADG or latest-weight displays and remain in JSON export. Their animal/date remains reserved to prevent silent replacement; restore and correct that record instead. Corrections remain within the selected event year. Batch weighing and whole-session reversals are still pending; adjusted milestone formulas and XR5000 mapping require their own verified inputs.


## Batch weighing package — September 13, 2026

Added batch entry for 1–100 animals with a session name/date, searchable animal list, per-measurement lb/kg, skipped blank rows, and a review step before saving. Saved sessions use stable IDs retained through individual corrections. Creation writes all measurements and creation history atomically. Duplicate animal/date entries, including voided records, require review; no silent overwrite occurs. Session void/restore requires a reason, checks all expected weight versions, retains per-animal history and excludes voided measurements from growth calculations. Restore explicitly covers all currently voided rows, including individually voided measurements.

Validation: local API checks cover invalid-row rejection without partial save, repeated submissions without duplication, mixed units, duplicate animal/date protection, whole-session void/restore, stale-version rejection, and individual corrections retaining session membership. No test records were added to production.

User test as one package: enter a few real measurements with one blank; review and correct before saving; reopen after refresh; correct one measurement and review history; void and restore the session, checking growth/counts; attempt a duplicate date; confirm All Years is read-only. Session drafts are not saved across refresh/navigation; save before leaving. Device/scale import, offline drafts, adjusted milestone formulas and cross-year correction are still separate future work.


## Weight spreadsheet follow-up

CSV/XLSX import and a populated downloadable weighing template now feed the reviewed batch workflow. Column mapping, worksheet selection, explicit unmatched/ambiguous-animal review and draft collision checks are included. See Weights-package-handoff.md for the combined additions, verification and deferred user checklist. User is remote on a phone and requested continued work without waiting for testing. Device-specific scale compatibility and retired-EID matching are not claimed.


## Reference recheck — user wants a combination, September 13

Re-read the supplied Herd_Manager_V2_edit_animal_actually_fixed.html directly (renderAnimals, tableEditor and renderWeights). User wants the reference workflow combined with the current durable records, history and validation, not a parallel replacement product.

Concrete reference patterns to retain/adapt:
- Animal workspace: compact searchable table with identity, multiple tags, sex/status, breed/DOB, parents, notes and explicit editing actions.
- Breeding and lambing: distinct group/event workflows; offspring records drive growth work.
- Weights (Phase 4): condensed overview with recent records (reference caps at 25), milestone completeness, and an optional expanded lamb matrix. Birth weights belong to lambing; later growth records link to the same offspring identity.
- Explicit controls to open focused entry/editing instead of putting a large input grid in the main overview.

Latest user override: do not copy the reference popup's every-lamb scrolling list either. Use a compact selection-first entry pattern; refine it when Phase 4 starts. The reference's condensed overview/optional matrix distinction is useful, but implementation must honor this new constraint.

Combine those interaction patterns with immutable IDs, server-backed saves, explicit errors, nonblocking missing detail flags, pedigree validation, audited corrections/retirements and exports. Do not copy repeated function overrides or browser-local authoritative storage. Keep all lifetime animal identities; adapt the reference's breeding-stock/offspring views without deleting non-retained offspring. Do not adopt keep/watch/cull vocabulary as a final Management Flags design; that remains open.

Current action: weights are hidden. Next animal-record UI work must consult this comparison and the reference's compact animal workspace before implementation. This note does not claim a full reference redesign has shipped.
