# Clarkson project review and controlling decisions

Reviewed 2026-09-13. User requests review of the entire ChatGPT project “Please be this one- Clarkson’s breed”, including SDSU and Iowa State material, with a preference for the Ohio State spreadsheet workflow and SDSU management information. This document supplements the build plan; latest direct user instructions override historical discussions. Review findings are not implementation completion claims.

## Coverage and evidence

Read all available pages of Dashboard Requirements Questions (34 pages, newest to oldest), plus Update Ohio State Thread, Ohio State Conversation Summary, Calculate COI, Animal CSV Export, Codex Setup Guidance, and Choosing Any Option. These are the seven project conversations returned by the app inventory. The inventory has a 50-task limit and does not expose project file listings, so this is not proof that every project attachment or older conversation is accessible.

Historical retrieval saved in work/clarksons-project-review-sources.json. Additional SDSU Conversation Summary was read; Sheep Ration Advice review is partial and contains original-source references worth retrieving. Generated-document placeholders and past assistant assertions do not establish that their underlying files or formulas have been verified.

After the user signed in, the project home was successfully inspected. It lists nine conversations: the seven above, SDSU Conversation Summary, and New chat (a short transcript with no additional requirements, now read). SDSU is confirmed inside this project. Other standalone chats are excluded from the controlling review per the user's scope correction. The project has a Sources tab, but its contents have not yet been inspected: the browser automation runtime failed during reconnection with “failed to write kernel assets: The system cannot find the path specified.” Sign-in is successful; the remaining source inventory is blocked by the automation runtime, not user credentials.

Located local references: SheepEnterpriseBudget2025.xlsx; Meat Sheep Balancer v6.xlsx; sheepdietsandmineral.zip containing feeder lambs.pdf, market lamb mineral.pdf, black face ewes.pdf, small ewes.pdf, lactation mineral.pdf, winter mineral.pdf, replacement lambs.pdf. The ZIP contents are inventoried, not yet fully reviewed. The updated 13-page formula appendix/package mentioned in Update Ohio State Thread is not yet located.

## Decisions recovered and application impact

| Area | Controlling requirement and build action |
|---|---|
| Foundation | Lifetime animal record is the anchor. Events/sessions update it; annual views do not duplicate animals. |
| Display IDs | Sequence resets within birth year and is shared across sheep/goats. Unknown-year IDs use ?-sequence. Learning birth year assigns next available number in that year and keeps former ID searchable. Existing UUID links remain unchanged. Current global lifetime sequence needs an audited migration design. |
| Presence | Never infer farm presence in earlier years from birth date. Active animals carry forward from recorded presence. Exits appear in their owning year; historical years remain editable; All Years is read-only. |
| Identity | Name/right tag/left tag/EID remain distinct. Multiple tags per ear, primary selection, correction versus retirement, history and old-identifier search. Latest thread permits blank sex/birth with flags and no missing-tag/color flags. |
| Profiles | Dated editable notes; dated photo gallery/current photo; multiple registries with paperwork; ownership percentages/history; optional dated genetics evaluations with source and review before updates. |
| Breeding year | A cross-year group stays in its originating breeding year. Expected births appear in the later calendar/dashboard and lambing links back. Current spanning-year group list must be corrected. |
| COI | Pedigree-based projected offspring COI, relationship and completeness disclosure. Latest requirements discussion excludes females above 20% when a ram is selected; exactly 20% is a strong warning. Older warning-only discussion is superseded. Check both picker and server rules. |
| Breed composition | Optional descriptive breed for commercial animals. Do not nag for percentages. Calculate offspring composition only with complete known parental composition; earlier explicit rejection of partial automatic composition means current partial projection needs correction. Composite 4 defaults to 25% each Dorper, Romanov, Katahdin, St. Croix, with user-editable targets. |
| Breeding groups | Flexible ewe membership, one ram serving multiple groups, individual dated exposure history, planned date separate from actual exposure. Group save requires no reason. Optional pregnancy checks, harness/crayon and flushing with ewe overrides. |
| Paternity | Multiple plausible sires means Unknown until confirmed. Do not silently assign the group's latest ram. |
| Lambing | Start with lamb identity, dam second; reuse dam/date for additional littermates. Litter count determines birth type, including stillborn. Stillborn events do not require full animal profiles; born-alive lambs dying later retain profiles. Assistance/presentation optional. |
| Rearing/weaning | Rearing has separate dated history; biological dam keeps performance attribution. Weaning is an event with optional weight linked to the same weight record. Birth weight can be entered at lambing or later without duplication. |
| Lamb groups | Yearly lamb-crop management groups, dated membership, quick batch moves. Keep separate from breeding groups. Later feed/paddock requirements may support broader feeding groups. |
| Weights | Lamb-focused sessions, adult weights supported. Manual and XR5000 imports use the same layout. Preserve actual measurements; adjusted milestones are separately labeled and require verified formulas. ADG and rankings use meaningful peer groups, with whole-crop comparison available. |
| Sessions | Create → select/scan → enter → review → save. Reopen/correct with audit; void/restore reverses/reapplies linked records and allocations, requiring reason. Unmatched/duplicate EIDs reviewed before finalization. |
| Finances | Current-year and lifetime actual net separately from retained value and parent contribution. User-entered retained valuations have history. Purchase cost is lifetime basis. Explicitly ignore depreciation. Never count purchase and allocated usage twice. |
| Feed | Reusable versioned rations; historical feeding retains used version. Percent mix and lb/head entry; actual group/subgroup/individual feeding periods. Calculation-only weights are not official weights unless deliberately saved. Feed allocation still needs design per latest printed review. |
| Health | Individual/batch treatments and animal vet bills, lab sessions/attachments, reusable products, event-specific dose, multidose protocols. Product-specific review warnings rather than universal dose blocks. Inventory approximate/optional. |
| Retention | Retained breeding stock is a dated decision, not a replacement for Active status. Lamb-to-adult class at 12 months, with uncertainty acknowledged when date unknown. |
| Reports/home | Shared filters for reports/charts; saved filter setups; broad export/print. Species summary launcher and customizable yearly dashboard. Current user wants Section dropdown rather than expanding navigation tabs. |
| Recovery | Offline sessions, explicit Pending/Synced/Failed/Conflict, manual retry/review, no silent overwrite. Weekly records backups and monthly media-inclusive backups, 12 of each retained; manual backups kept. Restore scope preview and safety backup. Not yet delivered by current exports. |
| Deferred/open | Animal sorting and batch editor polish later. Management flags versus favorites, central health-inventory warning placement, feed allocation rules and nutrition integration remain open design decisions. |

## Source hierarchy and calculation gates

User decisions govern product behavior. Original supplied workbooks, expert correspondence and current official university publications support calculations and management references. Historical assistant summaries are discovery leads, not independent validation. Keep source title, URL/file, sheet/cell, units, assumptions and version for each implemented calculation.

Ohio State: preferred spreadsheet workflow. Budget workbook is financial; Meat Sheep Balancer is a separate nutrition workbook. Neither's examples become actual farm data. Nutrition dry-matter conversion conflicts with an older request for simple as-fed entry: preserve a simple entry UI but resolve the model's required basis explicitly before implementing nutrition equivalence.

SDSU: preferred management guidance. [Breeding-season nutrition](https://extension.sdstate.edu/nutritional-considerations-flocks-during-breeding-season) supports condition-aware flushing and nutrition before, during and after breeding. [Body-condition reference](https://extension.sdstate.edu/managing-sheep-body-condition-score-throughout-year) supports dated BCS records. [Supplementation guidance](https://extension.sdstate.edu/supplementation-considerations-ewes-grazing-dormant-winter-pastures-and-rangelands) emphasizes forage quality and production stage. Application implication: group defaults with animal overrides, source-tagged feed analysis and dated condition checks, not one universal ration.

Iowa State: additional nutrition validation and the user's Dahlke materials. [Sheep BRaNDS module](https://shop.iastate.edu/extension/farm-environment/animals-and-livestock/sheep/sheepbrands100.html) establishes a separate sheep nutrition tool; it does not publish its full formulas. Do not claim parity or substitute cattle equations. Retrieve and review original ration PDFs before using their numerical targets.

Official Ohio State [budget resource](https://u.osu.edu/sheep/tag/budget/) links the 2025 enterprise workbook found locally. No matching public page for the exact Meat Sheep Balancer v6 file was found in this search; preserve its local provenance until verified.

## Next build sequence

1. Finish source/attachment review and reconcile contradictory rules in this register.
2. Correct identity/breeding dependencies, then complete lambing and dated group/session links.
3. Connect lamb weights, health, feed and financial events through those shared records.
4. Complete dashboard/reports, calendar, settings, import/recovery and phone support; validate source formulas with worked examples.
5. Deliver one cumulative additions/changes summary and grouped testing schedule. Do not require the user to test each small increment.

No live animal data was changed by this review. Existing unpublished implementation remains unfinished and must be checked against these findings before release.

### Additional project source review, September 13

Read the remaining older pages of Sheep Ration Advice, including the user's pasted Garland Dahlke / Iowa State email. Replacement breeding stock explicitly includes retained ram lambs as well as ewe lambs. Feeding programs must distinguish market development from breeding-stock development, and preserve source, production stage, target weight/growth and forage/mineral context. Historical assistant-proposed diets are not adopted as farm facts or prescriptions.

Recall Feeding Groups confirms the user's then-current 48-head main breeding group and two replacement groups (3 hair sheep and 5 black-face ewes), trough feeding, and a request to reference the Ohio State spreadsheet. These are historical group descriptions, not permission to fabricate memberships in today's records. The thread's discussion of missing hay/mineral analyses reinforces that unknown nutrients cannot be counted as zero. Further earlier Recall Feeding Groups page remains at cursor 2d84d622-48dc-4759-8852-78725a6288bd.

The remaining older user requests in Sheep Coccidia Treatment Options concern product-specific dosing and local product availability. Earlier assistant dosage calculations are not authoritative application rules. User-entered product-specific review limits retain their source.

Official SDSU sources rechecked: https://extension.sdstate.edu/nutritional-considerations-flocks-during-breeding-season and https://extension.sdstate.edu/mineral-considerations-sheep . No universal ration or mineral dose has been installed from these articles.


September 13 source follow-up: completed the remaining pages of Sheep Ration Advice and Recall Feeding Groups. User messages distinguish market lambs from replacement breeding stock (both sexes), feeding groups and physical feeding concerns. Prior assistant recipes and medical doses are not treated as validated defaults. Historical quantities are not silently installed as current farm records. Original ration PDFs and workbook nutrient parity still require verification.
