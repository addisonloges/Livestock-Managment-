# Printed requirements review — discovery changes

Recorded September 12, 2026 from the user's review. Requirements/backlog only: none of these additions is marked implemented or complete by this document. Do not begin unresolved items. Items marked Open decision remain open until resolved with the user.

These changes supersede conflicting older planning statements. They do not change the original dependency-based workflow: animal records/history and imports, reproduction, farm operations, finances, then offline/recovery. Composite 4 remains planned within breeding; it does not move ahead of animal records.

| ID | Requirement | Backlog status | Existing scope |
|---|---|---|---|
| PR-01 | Animal-specific veterinary expenses | Required; not implemented by this review | Health, financial ledger, lifetime profile |
| PR-02 | Visible right/left tag colors | Required; not implemented by this review | Animal identity, list/profile views |
| PR-03 | Structured cull reason | Required; not implemented by this review | Status/exit history, reports |
| PR-04 | Registration paperwork attachments | Required; not implemented by this review | Registries, profiles, attachments |
| PR-05 | Multi-day treatment protocols | Required; not implemented by this review | Health, sessions, animal history |
| PR-06 | Treatment warning/review mechanism | Required; clinical rules unresolved | Health, treatment review |
| PR-07 | Group feed costs and individual exceptions | Open decision — design work required | Feed, dated group membership, financial allocation |
| PR-08 | Pins/favorites versus management watch list | Open decision — reevaluate | Dashboard, management flags |
| PR-09 | Central dashboard health-inventory warnings | Open decision — reevaluate | Health inventory, dashboard |

## PR-01 — Animal-specific veterinary expenses

Allow a veterinary expense/bill to be assigned to a specific animal. Include its cost in that animal's current-year and lifetime financial views, using the ledger's dated accounting rules. Preserve group/general veterinary expenses when an individual cannot be identified. Do not force a general bill onto a fabricated individual animal or count the same expense twice through allocations. The mechanics for splitting shared bills remain part of financial design.

## PR-02 — Visible tag color

Animal identity and list views must be capable of showing the color associated with each Right Tag and Left Tag; storing color only inside a tag record is insufficient. Show a readable color name as well as any visual color indicator. Do not claim existing tags already have color data.

Keep EID distinct from visual tag numbers/colors. Preserve the previously requested explicit association between an EID and its physical right/left tag, including joint retirement when linked; a separate identifier field does not require a separate physical tag. Do not infer ear position, color, or an EID association from a number alone.

## PR-03 — Structured Cull Reason

Add a structured Cull Reason attached to the animal's dated exit/status history. It must be reportable and filterable, rather than available only as free-text notes. Keep disposition and reason distinct: support Culled, Sold with Cull as the reason, and Transferred with Cull as the reason. Preserve the reason on the historical event even if later status changes. The exact reason vocabulary and whether custom reasons supplement it still need definition; do not invent a final list.

## PR-04 — Registration documentation/photos

Support pictures/scans of registration papers attached directly to the animal's registry/registration information. Make them easy to access from the registration area of the profile. Generic document storage alone does not satisfy this requirement. Attachment storage, association, and backup support remain to be implemented; no existing uploads or documents are changed by this review.

## PR-05 — Multi-day treatments

A treatment protocol may span consecutive days or a scheduled set of dates. Users should not have to recreate an unrelated treatment from scratch every day. Retain each actual dose/event in the animal's history and link it to the protocol. Distinguish a scheduled dose from an administered dose; scheduling must not imply administration.

## PR-06 — Treatment warnings

Flag potentially problematic activity for review: deworming repeated too close together, potentially excessive doses, and overlapping/repeated entries suggesting accidental duplication. Warnings must explain the issue and support review; do not blindly block treatment based on a heuristic.

Open clinical-design inputs include product/formulation, dose units and route, animal weight and its date, protocol context, and the authoritative source for product-specific dose/interval rules. No universal deworming interval or dose ceiling is approved by this requirement. Do not hard-code such thresholds or treat missing inputs as evidence of safe dosing. This is requirements capture, not veterinary guidance.

## PR-07 — Feed allocation: open design

Support group feeding described by quantities such as lb/head/day over a feeding period, including paddock/feed groups. Costs must be capable of flowing to the animals that were members during the relevant dates. Allow individual ewes/animals to receive a different amount or ration without losing that exception in the group average.

Do not hard-code one allocation formula. Resolve the basis (planned ration, recorded feeding, or another agreed measure), membership changes within a period, treatment of individual overrides versus additions, missing data, unit conversions, and rounding/reconciliation during design. Individual allocations must reconcile to the source cost without duplicate expense postings. Paddock/feed groups do not imply pasture mapping or a new mapping requirement.

## PR-08 — Pins/favorites: open decision

The generic Favorites/Pinned Animals concept is not settled. Reevaluate a Management Flags / Watch List approach, with a reason/category such as heat management or another current concern. Decide whether flags replace favorites or coexist, and how they are activated, resolved, filtered, and displayed. Do not implement or label either option as the accepted final design yet.

## PR-09 — Inventory warning placement: open decision

Reconsider any older statement that low-stock and expiration warnings appear only in Health/Inventory. Decide whether important warnings should also surface on the central dashboard, and which warnings merit that visibility. Neither dashboard inclusion nor Health/Inventory-only placement is final.

## Completion boundaries

This review changes documentation only. It does not implement application features, alter live records, establish clinical thresholds, settle feed allocation, or settle pins/watch-list and inventory-warning placement. Future implementation must refer to these open decisions rather than treating the older specification as final.
