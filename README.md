# EasyCare Sheep / Clarkson's Flock

A working foundation for the livestock management application described in [the requirements review and build plan](docs/Requirements-review-and-build-plan.md).

## Working now

- Separate Sheep/Goats views, historic first-recorded years and read-only All Years.
- Durable animal records, current tags/EID, optional breed and recorded sire/dam.
- Manual weights with original units, pounds conversion and actual ADG.
- Multi-generation paternal and maternal pedigree entry, including unowned ancestors with optional birth, farm, registry and source information.
- Prospective offspring COI calculated from all recorded ancestry, including pedigree-only ancestors, with incomplete-pedigree disclosure.
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
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_thick_spiral.sql
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

Animals can be deleted into a restorable archive. Name and breed-description edits, deletion and restore keep a reason and before/after history. Tags and EIDs editing/history are still planned. Parentage can be edited from the Pedigree view. One weight per animal per date is supported. Unknown ancestors are assumed unrelated for the displayed known-pedigree estimate; zero COI is not proof of unrelatedness. The build is online-only.

## Entering ancestors you do not own

Open Pedigree, choose a flock animal, and use Add sire or Add dam in either line. Select an existing record or Enter unowned ancestor. Name/identifying label is required; exact birth date, year, breed, breeder/farm, registry, registration number and notes/source are optional. Three ancestor generations are displayed initially; expand a branch or focus an ancestor to enter earlier generations. An ancestor is one shared record even when it appears in multiple places.

Pedigree-only records are excluded from flock counts, breeding candidate lists and weight entry, but remain in parent pickers, global search, JSON exports and COI calculations. They can be edited and archived/restored with history. Existing flock records remain flock records; this release does not automatically reinterpret them as unowned.

## Animal imports

Import animals accepts CSV and Excel `.xlsx` files with column mapping, worksheet selection, editable preview and explicit review before saving. A CSV template is available in the dialog. Up to 200 new records can be saved atomically; existing records are not overwritten. Duplicate EIDs, matching tags and matching name/sex/birth details are flagged. Historical first-recorded years, unowned ancestors and parent links between import keys in the same batch are supported. Dates must use YYYY-MM-DD; identifiers should be stored as text in Excel.

PDF-assisted import renders pages locally and displays extracted text. The user can draft a record from explicitly labeled text, then review or enter remaining fields. Scanned PDFs and graphical pedigrees require manual transcription and parent mapping; OCR and automatic tree recognition are not implemented. Source filename/page is retained in notes, not the original file. Legacy `.xls` files must be saved as `.xlsx` or CSV first.

Set pedigree in an animal profile now opens the full pedigree workspace, including the unowned-parent entry flow and prefilled change reason.
