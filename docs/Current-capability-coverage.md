# Current capability coverage — September 13, 2026

Working implementation; not a declaration of whole-project completion. The connected build is published privately as v38. All 119 pre-update animal records, previous fields, existing weights, histories and breeding data were verified against the private backup. Owner contact links and the visual workspace menu are live as v40. The operations follow-up adds confirmed feed allocation, management flags, dashboard inventory alerts and birth-outcome reports; 80 automated tests and local saved-workflow checks pass. See Connected-build-checkpoint.md for subsequent updates.

| Area | Implemented working capability | Remaining work / boundary |
|---|---|---|
| 1 Overall concept | Species and year workspaces; informational home; section dropdown | Per-browser species and separate year preferences implemented; architecture remains one partitioned database |
| 2 Identity | Permanent UUID, birth-year number, former identifiers, multiple tags per ear, EID links, retirement/correction/swap | Final integrated review and import edge cases |
| 3 Animal information | Optional sex/birth details, composition records and complete-parent inheritance | Broader batch-editor refinements deferred by user |
| 4 Ownership/registry | Dated ownership, origin, registry details and dedicated paperwork | Reusable contact directory and transaction name snapshots now implemented; profile ownership contact linking now retains historical name/share snapshots |
| 5 Status/year | Dated exits, unknown exit dates, correction, reactivation, archived records | Cross-module historical reconciliation remains under review |
| 6 Lifetime profile | Photos/history, documents, tags, pedigree, events, finances, custom values | Timeline presentation refinement |
| 7 Pedigree/genetics | Multiple generations, unowned ancestors, evaluation records/CSV/history/files | Provider-specific import formats and richer trait comparisons |
| 8 Breeding | Saved groups, active candidates, planned/actual dates, individual exposure periods, pregnancy checks | Integrated end-to-end review and complex historical changes |
| 9 COI | Pedigree matrix, thresholds, female relationships and ram comparison | Incomplete pedigree remains an explicit limitation |
| 10 Cross-year breeding | Original breeding-year ownership; later calendar birth windows and litter links | Further date-boundary regression review |
| 11 Flushing | Configurable project timing and calendar dates | Feeding protocol integration depends on unresolved feed design |
| 12 Lambing/kidding | Explicit section, offspring-first entry, atomic profiles/weights, correction/reconciliation and void/restore | Cross-year birth corrections implemented; complex dependent outcome changes remain restricted |
| 13 Birth outcomes | Stillborn in litter without live profile; living offspring use normal status history | Birth-outcome report separates stillbirths, dated early-life deaths, unknown death dates and missing profiles; CSV export included |
| 14 Rearing/weaning | Dated foster/rearing details; biological parents preserved; shared weaning measurements | Contemporary-group use of rearing history |
| 15 Management groups | Dated membership and reentry, overlap checks, cross-year display | Feed allocations use dated membership and preserve source snapshots |
| 16 Weights | Lamb-first sessions, adults, imports, corrections/voids, ADG; separate sourced adjusted calculator | Filtered peer ADG rankings with dated group coverage and CSV; saved adjusted calculation snapshots are implemented; broader normalized comparisons remain |
| 17 Parent performance | Live profiles versus litter outcomes, weaning, retained decisions, birth weights, cash contribution | Breeding-cohort check/outcome reporting implemented; normalized peer comparisons remain |
| 18 Health | Individual/batch protocols, dose events/overrides, lab results, files and reminders | Further health workflow review; no guessed medical defaults |
| 19 Health inventory | Lots, approximate balances, expiration and user-sourced dose/repeat warnings | Important low-stock and expired-stock alerts now also appear on the dashboard |
| 20 Feed/rations | Dated mix versions, stage/source, as-fed percentages and costs, unknown-price handling, growth budgets | Actual feed bill allocation uses dated membership, lb/head/day and individual ration/quantity overrides; full nutritional modeling remains outside this implementation |
| 21 Finances | Income/expenses, equal or explicit animal allocations, annual/lifetime amounts, monthly cash | Recorded animal-purchase basis now uses assigned expenses once, with unknown distinct from zero; broader statements/reconciliation remain |
| 22 Contribution | Actual cash separate from retained estimates and parent contributions | More performance metrics; never sum both parents into farm profit |
| 23 Sales | Individual/lot payment with atomic status exits and buyer/cull details | Payment/exit dates can be corrected separately; advanced lot reconciliation remains |
| 24 Sessions | Weight sessions and batch events with review/history/void/restore | Unified general session management across every module |
| 25 EID imports | Existing weight import matching, retired identifiers and ambiguous-match review | Representative device exports and phone/chute testing |
| 26 Imports | Animal CSV/Excel/PDF workflow and templates; pedigree/evaluation imports | Wider document/provider layouts and full history imports |
| 27 Search | Animal current/former identities and module filters | Cross-record search now implemented; richer direct record navigation remains |
| 28 Reports | Animal CSV, monthly chart/table, parent comparison, saved filters, print | Saved setup update/archive/restore and filtered-animal cash charts implemented; more export formats remain; breeding cohorts retain complete membership |
| 29 Dashboard | Farm totals and upcoming work | Per-species/year browser-saved card visibility/order implemented; reason/category management flags with dated resolution now appear on the dashboard |
| 30 Calendar | Breeding/project dates, births, reminders, protocols and follow-ups | Month/agenda views and source-record links implemented; richer calendar editing remains |
| 31 Phone | Responsive views; mobile browser checks; offline shell | Install manifest/icons implemented and browser-validated; notifications and chute workflow refinements remain |
| 32 Offline | Cached loaded data, durable pending queue, manual selected sync and conflict retention | Current/pending field comparison and deliberate note/reminder merging implemented; other record types use normal editors; files require connection |
| 33 Recovery | Full media/checksummed exports, retained manual vault, missing-record preview/restore and safety copies | Media-only and full/species rollback implemented with complete safety archives, retained recovery history, non-reused numbers and stale-copy guards; unattended 12-week/12-month scheduling still needs supported hosting infrastructure |
| 34 Portability | Git source and standard CSV/JSON/TAR exports | Host migration requires adapter/configuration work |
| 35 Custom fields | Typed definitions, archived fields, profile values and history | Labeled custom-field CSV export implemented; broader batch/import integration is deferred refinement |
| 36 Settings | Custom fields and project timing/targets | Per-species year preferences implemented; remaining defaults and backup configuration |
| 37 Exclusions | No depreciation, forced composition, strict medical inventory, dry-matter modeling, pasture mapping, native app, PIN or mandatory Bluetooth | Preserve these exclusions |

## Confirmed decisions — September 13

User approved all three: feed costs use lb/head/day over dated membership with individual quantity/ration overrides; management pins become flags with category/reason and resolution; important inventory warnings also appear on the dashboard. Implemented in the operations follow-up.

Feed allocations assign an existing Feed expense rather than creating duplicate cash expense. Priced ration versions determine relative costs. Actual bill total is conserved to the cent. Preview warns on overlapping allocated bills and excluded inactive/unknown-status days. Changing an allocation requires a new preview; saved membership and ration snapshots retain prior calculations. Full unattended weekly/monthly scheduling still requires hosting infrastructure unavailable through the current Sites interface. Do not claim automatic backups are running.

## Running groups — September 19, 2026

Added a dedicated Groups navigation section with dated rosters, active/recorded counts, membership history, and existing audited correction/void/restore workflows. End the old membership period and add the next roster to preserve moves; editing a period corrects that period. Animals may belong to multiple groups.

Management-group dropdowns now intersect existing eligibility rules in shared animal selection (including health, breeding, lambing, pregnancy checks, financial/event entry, batch edits and year rolls), the Animals register, batch weights, and saved report filters. Selection is deliberate through Select filtered; choosing a group does not save an event or change eligibility. Feed allocation continues using dated membership and saved allocation snapshots. Single-animal workflows remain single-animal workflows.

Validation: 90 automated tests passed; TypeScript and production build passed. Isolated local browser checks covered creating a two-animal group, health selection, breeding eligibility, Animals and Reports filters, batch weights and phone dialog width. No production animal records were changed during QA.
