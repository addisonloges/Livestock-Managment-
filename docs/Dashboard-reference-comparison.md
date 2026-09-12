# Dashboard reference comparison and implementation order

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
3. Missing sex and missing both birth date and birth year are allowed and should be flagged, per the user's latest answers. Those flags do not block saving. Invalid supplied values, identity conflicts, and pedigree cycles still require correction. Current flag controls are device preferences; their code defaults are false, so the user's chosen true values are not a guaranteed default on a new device.
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

