# EasyCare Sheep / Clarkson's Flock

A working foundation for the livestock management application described in [the requirements review and build plan](docs/Requirements-review-and-build-plan.md).

## Working now

- Separate Sheep/Goats views, historic first-recorded years and read-only All Years.
- Durable animal records, current tags/EID, optional breed and recorded sire/dam.
- Manual weights with original units, pounds conversion and actual ADG.
- Prospective offspring COI calculated from recorded ancestry, with incomplete-pedigree disclosure.
- Animal CSV and foundation JSON exports.

This is not the completed 37-area specification. Saved breeding groups, identifier/status history, imports, health, feed, finances, offline sync, scheduled backups and restore remain planned. See the review for every requirement and the disclosed one-database species-partitioning proposal.

## Development

Requires Node.js 24 and npm. Install from the committed lockfile:

```sh
npm ci
npm test
npm run typecheck
npm run build
```

The first database setup requires the generated migration. After building:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_groovy_franklin_richards.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_lumpy_tarantula.sql
npm run dev
```

Use the local URL printed by the development server. Apply a migration once per database, in order. Do not replay applied migrations. Local database state is ignored by Git. The production host applies migrations independently.

## Source and deployment

GitHub stores application source, schema migrations, tests and the working requirements review. It does not store live flock records, credentials, local database state or attachments.

The current app uses a Cloudflare Workers-compatible server and D1 storage through `db/index.ts`. It cannot run as a static GitHub Pages site. `.openai/hosting.json` identifies the existing private Sites project; do not create a replacement project when resuming deployment. The foundation is privately published at https://clarksons-flock-ledger.rf225x7fws.chatgpt.site.

Domain calculations in `lib/livestock.ts` are independent of the hosting layer. Data exports are available in standard formats. Moving hosts requires replacing the environment/storage adapter and deployment configuration.

## Validation

Domain tests cover expected COI cases, pedigree cycles and missing links, ADG and validation/year rules. GitHub Actions runs those tests, TypeScript checks and a production build.

Local integration checks also exercised animal persistence across reload, kilogram conversion, idempotent weight retry, duplicate-date rejection, read-only All Years writes and owning-year validation. Local tests also verify delete/restore, required reasons, stale-version rejection, idempotent retry, preserved weights and pedigree links, and edit history. Production behavior still needs verification after each deployment.

## Current data-entry constraints

Animals can be deleted into a restorable archive. Name and breed-description edits, deletion and restore keep a reason and before/after history. Tags, EIDs and parentage editing are still planned. One weight per animal per date is supported. Unknown ancestors are assumed unrelated for the displayed known-pedigree estimate; zero COI is not proof of unrelatedness. The build is online-only.
