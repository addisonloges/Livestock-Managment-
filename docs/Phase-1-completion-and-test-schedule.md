# Phase 1 — Animal identity and records (reopened)

The September 13 completion claim is withdrawn following the user's workflow correction. Phase 1 is animal identity and records, not a combined animal/breeding/weights foundation. Existing code and data are retained. This document supersedes the earlier completion and 45–60 minute test schedule.

## Scope

- Permanent animal identity, species, basic details, origin and first recorded year.
- Tags, multiple tags per ear, tag colors, EID association, correction versus retirement/replacement, and former identifiers.
- Animal imports, duplicate review and nonblocking missing-data flags.
- Registration information with papers/photos attached directly to that registration.
- Dated ownership and status history, recorded reasons, archive/restore and audit trail.
- Maternal/paternal pedigree with unowned ancestors, parent validation and recorded sources.
- Notes, animal search, portable identity/parent exports and durable saves.

## Current status

Available: identity/editing, tags/EID/history, imports, missing-detail flags, registration text, status history, pedigree, notes and exports.

Outstanding: dated ownership history and registration attachments. Ownership precision, overlapping periods and correction behavior need a bounded design before code. Attachment storage and registration association need implementation and verification. These are Phase 1 backlog items, not completed features.

Acceptance requires a coherent animal profile workflow across those areas; save/reload, identity integrity, incomplete-data handling, species/year boundaries, imports and export must be verified together. User acceptance remains pending. Do not mark this phase complete because weight tools or a subset of foundation tests pass.

## Corrected sequence

1. Animal identity and records.
2. Breeding: ram decisions, ewe relationships, flexible groups/exposures, pregnancy and optional Composite 4.
3. Lambing/kidding and offspring: litter outcomes, stillbirths, offspring identities, foster/rearing details linked to breeding.
4. Weights, growth and performance: primarily offspring birth/weaning/later growth, with breeding-stock measurements still supported.
5. Farm operations: health, inventory, feed, management flags and calendar.
6. Finances: expenses, allocation, sales and current-year/lifetime outcomes.
7. Offline and recovery: offline entry/sync and full backup/restore.

Data preservation, exports and technical verification run throughout. Existing weight code remains available; pause further weight feature work until breeding and offspring context is ready. No existing animal or measurement is deleted or remapped by this planning correction.

## Grouped test schedule after Phase 1 is ready

| Block | Time | Coverage |
|---|---|---|
| Identity and imports | 15–20 min | Animal details, tags/EID/colors, missing flags, duplicate review, saved corrections |
| Ownership/registration/history | 15–20 min | Dated ownership, registration attachments, status/exit reasons, audit and restore |
| Pedigree/search/export | 10–15 min | Both family lines, unowned ancestors, current/former identifiers, permanent IDs and parent references |

Total: 40–55 minutes in one combined review, after outstanding implementation. No calendar event is scheduled. Record one consolidated issue list with animal ID, action, expected and observed results. Weight growth, session review and mating decisions are not Phase 1 acceptance tests.
