# Clarkson's Flock — requirements review and build plan

Source: Livestock_Management_Dashboard_Agile_Discovery_Company_Review-1.pdf, nine pages, supplied September 11, 2026. This is the source for this implementation. The later formula appendix mentioned in the project conversation is absent from this file. No prior assistant claim about those formulas is treated as verified source material.

## Review conclusion

The document describes a substantial livestock records application, not just a dashboard. Its strongest design decision is the lifetime animal record, with dated events owning their historical year. The central dashboard should summarize those records rather than maintain separate totals. The 37 areas remain in scope; implementation order below reflects dependencies, not priorities inferred from section numbers. The document's statements about company approval describe its drafting process; the user's current request authorizes review, a proposed plan and starting implementation.

This first build is a foundation to evaluate. It must not be described as completion of the full specification or as ready for sole reliance during farm operations.

## Decisions and unresolved rules

1. **Permanent identity versus display ID:** Use an immutable UUID as the relational key. The birth-year/sequence label is a searchable identifier, not a foreign key. Clarify whether the sequence is lifetime-global or resets per birth year; the first build uses one global sequence across both species. Changing a known birth year and preserving former identifiers needs a dedicated audited correction workflow.
2. **Separate species databases:** First build uses explicitly species-partitioned records in one portable SQLite-compatible database. This is a disclosed architectural proposal, not literal completion of the requirement for two databases. Separate physical databases would complicate global numbering, cross-species search and shared suppliers; decide before production migration. Enforce species checks at every parent and event boundary.
3. **Year presence:** Birth year is not proof that a purchased animal was present on the farm. Require an explicit first recorded year; later active presence can carry forward. Do not populate earlier years based on DOB. Historical status events are needed before exit/reactivation workflows ship.
4. **COI:** Calculate prospective offspring inbreeding from the relationship matrix, not a manually typed score. Exactly 20% remains selectable with a strong warning; strictly greater than 20% is excluded. Incomplete ancestry produces only a known-pedigree estimate and must never be presented as proof of an unrelated mating. Founder unrelatedness is an assumption. Initial screening cannot substitute for pedigree verification.
5. **Breeding dates:** The PDF supplies no exact gestation, flushing or crayon-change intervals. Keep these configurable and obtain the intended defaults before automated schedules. Preserve sire exposure intervals separately from group membership; uncertain paternity must not silently select one sire.
6. **Birth versus rearing:** Model a litter event with counts of live/stillborn offspring independently from surviving animal profiles. Biological parentage, foster dam and rearing method need separate fields and timelines.
7. **Identity validation:** Routine creation requires sex and home-raised full DOB. A future import-specific incomplete-record path must not weaken every creation endpoint. Require duplicate EID review including replaced EIDs. Never treat a visual tag as globally unique.
8. **Weights:** Preserve actual input and original unit. ADG uses distinct chronological dates; same-day readings cannot create an ADG denominator. Backdated readings require recalculation. Adjusted milestone formulas are unspecified and need agreement before implementation.
9. **Financial allocation:** One business expense is posted once. Allocations distribute that expense; they are not new expenses. Store monetary amounts in integer cents and give rounding remainders a deterministic allocation. Retained values and parent contribution are analytical, separate from realized profit. Clarify whether sale-lot totals or per-animal prices take precedence when both disagree.
10. **Offline and restore:** Offline writes need UUIDs, idempotency keys and expected record versions. Manual sync only; a failure remains failed until the user retries. Conflict resolution must preserve both versions. Browser-only storage is insufficient as the authoritative flock database. Partial restore, attachment backups and audit reversal require dedicated design and verification.
11. **Ownership:** Validate active ownership totals in one transaction with a defined precision, effective date and overlapping-period rule. Historical ownership must not be overwritten.
12. **Access and portability:** No separate application password is proposed. A privately hosted preview can use the host's account access. All domain calculations remain portable TypeScript and records export in JSON/CSV. Cloudflare D1 is SQLite-compatible, but moving hosts still requires replacing the thin environment/storage adapter and deployment setup.

## Proposed architecture

- Responsive React/TypeScript app with separate working views for animals, weights, breeding and the full-scope build plan.
- Server endpoints own validation and database writes. SQLite-compatible durable storage through a small D1 adapter; no authoritative localStorage records.
- Domain functions calculate COI, ages, ADG and later costs independently of the UI. All Years is enforced read-only at the write boundary, not merely by hiding buttons.
- A future local IndexedDB outbox holds pending offline sessions, with explicit user-controlled synchronization to the server.
- Future object storage holds photos/documents, with relational attachment metadata and portable backup manifests.
- No mock records inserted into the user's flock. Test fixtures live in tests only.

### Tables and relationships

First foundation: `animals` (immutable ID, global sequence, species, display fields, DOB/year, first recorded year, parents), `weights` (animal, date, measured value, original unit, session label). Add creation timestamps and row versions. Index species/year and animal/date; require unique current EID.

Planned relational model: identifier history and tag/EID records; status/ownership histories; registries and registrations; notes and attachments; genetics observations; breeding groups and exposure intervals; pregnancy checks; birth events and litter outcomes; rearing/weaning events; management groups and dated memberships; sessions and versioned session items; treatments and product lots; feed purchases, ration versions and assignments; expenses and allocation lines; sales and sale items; valuation history; calendar events; custom-field definitions/values; audit entries; sync operations/conflicts; backup manifests.

Every event has a stable ID, effective date, owning year, species and audit link. Avoid duplicating lifetime profiles each year. Link cross-year birth events to original breeding groups. Use transactions for related writes and reversals.

## Dependency-based build plan

1. **Foundation (this first implementation):** animal creation and lifetime identity, species/year filtering, measured weights and ADG, parent links and calculated prospective COI, portable record export. Show limitations in the app.
2. **History and sessions:** tags/EID history, ownership/status changes, audited edit/void/restore, import mapping and unmatched EID review. Exit criteria: duplicate/import conflicts cannot finalize; session reversals restore prior effective values.
3. **Reproduction:** sire-first groups, exposure intervals, configurable dates, pregnancy/birth/stillborn/rearing/weaning workflows and performance. Exit criteria: cross-year births link correctly, unknown sire stays unknown and stillborn counts affect litter metrics without requiring profiles.
4. **Farm operations:** health sessions and reminders, approximate inventory, feed purchases and ration versions, full calendar, lab files, reports and custom fields. Exit criteria: treatment units are explicit; feed estimates never invent body weight; actual scale readings are untouched.
5. **Financial ledger:** single posted expenses, allocation lines, sales, lifetime/current-year net and separate parent contribution. Exit criteria: allocation sums reconcile exactly; no double-counting in animal or flock totals.
6. **Offline and recovery:** PWA cache and outbox, manual sync/conflicts, restore safety copies, scoped restores, scheduled backup retention and phone workflows. Exit criteria: lost responses and replay cannot duplicate sessions; conflicting edits remain reviewable; verified backup restores work on a fresh database.

These are implementation dependency groups, not promised sprint durations. Full-system completion requires all acceptance criteria and actual XR5000 samples, historic data and calculation references.

## Traceability of all 37 capability areas

| PDF section | First-build coverage / remaining scope |
|---|---|
| 1 Overall concept | Species switch and explicit year/All Years views; independent home selectors and physical database separation remain. |
| 2 Animal identity | UUID, sequence, name/right/left/EID; multiple tags, old identifiers and replacement history remain. |
| 3 Animal information | Sex, DOB/birth-year validation and optional breed; exact breed-composition inheritance remains. |
| 4 Ownership/origin/registry | Origin category only; co-owner history, suppliers and multiple registries remain. |
| 5 Status/year behavior | Active animals and first-year filtering; dated exits, carry-forward ledger, reactivation/archive remain. |
| 6 Lifetime profile | Identity, parent and weight detail; photos, documents, notes and complete timeline remain. |
| 7 Pedigree/genetics | Recorded sire/dam links; expanded pedigree presentation and genetics import/history remain. |
| 8 Breeding | Prospective sire/female screening only; saved groups, exposure changes and pregnancy checks remain. |
| 9 COI/relatedness | Relationship-matrix calculation with incomplete-ancestry disclosure and PDF thresholds; configurable thresholds remain. |
| 10 Cross-year breeding | Data-model plan only; operational linkage remains. |
| 11 Flushing | Planned; rates/defaults require source inputs. |
| 12 Lambing/kidding | Planned offspring-first litter workflow. |
| 13 Stillborn/neonatal | Planned separate birth outcomes and live-born status history. |
| 14 Rearing/weaning | Planned independent rearing events and weight linkage. |
| 15 Management groups | Planned annual groups and dated moves. |
| 16 Weights | Manual measurements, original units and ADG; batch import, adjusted milestones and rankings remain. |
| 17 Female/sire performance | Planned outcome aggregation and dated replacement decisions. |
| 18 Health | Planned individual/batch events, tests and reminders. |
| 19 Health inventory | Planned approximate product lots and corrections. |
| 20 Feed/rations | Planned purchases, comparable unit costs, rates and versioned rations. |
| 21 Financial system | Planned ledger and allocation model; no financial totals fabricated. |
| 22 Actual/contribution | Planned separate realized profit and analytical parent contribution. |
| 23 Sales | Planned individual/lot records and reconciliation rules. |
| 24 General sessions | Weight session label only; batch review, audited edits and void/restore remain. |
| 25 XR5000/EID | Planned; obtain representative export files and test duplicates/unmatched records. |
| 26 Imports/history | Manual historical first-year entry; CSV/Excel mapping/review/import sessions remain. |
| 27 Search | Current animal name/tags/EID/ID/breed search; historic identifiers and other record types remain. |
| 28 Reports/export | Animal CSV and full foundation JSON; broader filters, charts, Excel and saved reports remain. |
| 29 Dashboard | Live counts and working animal views; rearrangeable cards, pins and event summaries remain. |
| 30 Calendar | Planned structured and standalone events. |
| 31 Phone sidekick | Responsive foundation; installability, notifications and chute workflows remain. |
| 32 Offline/sync | Planned; first build requires connectivity for durable reads/writes. |
| 33 Backups | JSON export of foundation tables only; scheduled/full/media backups and restore remain. |
| 34 Portability | Source plus CSV/JSON exports; host migration requires storage/deployment adapter work. |
| 35 Custom fields | Planned typed definitions, values and all downstream integration. |
| 36 Settings | U.S. weight default with metric input; full configurable defaults and backup settings remain. |
| 37 Exclusions | Preserved: no pasture mapping, app PIN, depreciation, forced breed %, strict inventory, dry-matter modeling, native app or mandatory Bluetooth. |

## Formula contract and verification

- Pounds = kilograms × 2.2046226218. Preserve the original measured value and unit alongside canonical pounds.
- ADG = (later actual pounds − earlier actual pounds) / elapsed calendar days; undefined for zero days or fewer than two dated measurements.
- Additive relationship matrix: A(i,j) = [A(sire(i),j) + A(dam(i),j)] / 2; A(i,i) = 1 + A(sire(i),dam(i))/2. Unknown founders assumed unrelated. Prospective offspring COI = A(sire,dam)/2. Reject cycles, duplicate ancestry IDs and missing referenced records. The estimate is conditional on the available pedigree.
- Test unrelated founders, parent/offspring (25%), full siblings (25%), half siblings (12.5%), first cousins (6.25%), repeated ancestors, incomplete ancestry, and cycle rejection.
- Test required sex/DOB, species mismatch, parent dates, duplicate EIDs, same-day weights, metric conversion, historical first-year filters and read-only All Years writes.
- The OSU nutrition and enterprise-budget formulas are not in the supplied PDF. They must be retrieved and reviewed separately before being represented as implemented.

## Inputs needed for subsequent work

The later requirements/formula PDF; representative XR5000 and animal CSV/Excel exports; desired sequence numbering; breeding timing defaults; unknown-pedigree selection policy; ownership precision and financial allocation choices. These are recorded decisions to resolve as affected features are implemented, not a reason to stop the authorized first build.

## Update: delete, restore and first editing workflow

Animals now have a Delete action with confirmation and a required reason. Deleted records leave active lists but retain identity, weights and pedigree relationships; Deleted animals provides restoration with a reason. Name and breed-description edits retain before/after snapshots. All three operations use record-version conflict checks and retry identifiers. Change history is included in full JSON exports. This advances sections 5, 6 and 24; status transitions, general session reversal and tag/EID editing/history remain unfinished.

## Update: editable parentage

Existing animal records now support Set pedigree. Sire/dam selection uses same-species records with the correct sex, retains unknown parents, checks known birth ordering and rejects ancestry cycles. Changes keep before/after snapshots and a reason. Optimistic checks include the pedigree graph revision to prevent concurrent changes from creating a cycle. The breeding screen recalculates from updated records. Ancestors must first exist as animal records; ancestor-only imports remain planned.

## Update: multi-generation pedigrees and unowned ancestors

The Pedigree view now displays both paternal and maternal lines with three initial ancestor generations and per-branch expansion. Ancestor records can be created directly from a parent slot without ownership or farm-presence requirements. They store optional DOB/year, breed, breeder/farm, registry, registration number and source notes. Existing ancestor records can be reused in multiple branches. Pedigree-only records contribute to COI and parentage but do not count as flock animals or permit weight sessions. The original two migrations are unchanged; migration 0002 adds the record distinction and metadata. Existing animals retain their flock classification.
