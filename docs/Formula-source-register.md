# Formula source register

## Located and inspected

C:/Users/loges/Downloads/SheepEnterpriseBudget2025.xlsx identifies itself in Introduction!B2 as Ohio State University Extension Sheep Enterprise Budget Tool. Sheets: Introduction, Ewe, Ewe Overhead, Fed Lamb, Fed Lamb Overhead, Freezer Lamb. Original workbook remains untouched. Extracted cell/formula inventory: work/osu-budget-formulas.json.

Verified formulas for implementation/verification:
- Ewe!P55 = P53 + P40: total costs = fixed + variable costs.
- Ewe!P59 = P16 - P40: return above variable costs.
- Ewe!P60 = P16 - P55: return above total costs.
- Ewe!P61 = P60 + P51 + P43: return to labor and management.
- Fed Lamb!H17 = (I5 - I4) / I7: planned days on feed = weight gain / estimated daily gain. Keep distinct from measured ADG.
- Fed Lamb!Q52 = Q45 / K52: total-cost break-even per live pound.
- Fed Lamb!Q53 = Q45 / K53, with K53 = K52 * 0.52: break-even per dressed pound. The workbook's 52% is an assumption, not a measured dressing result.
- The reference overhead sheets include depreciation, but the user's explicit project decision is to ignore depreciation. Preserve that exclusion in the application and disclose any difference from workbook totals. Other rates remain editable assumptions.

Not yet implemented or verified as a complete workbook-equivalent model. Meat Sheep Balancer v6.xlsx has now been located and its formulas extracted to work/osu-balancer-formulas.json; numerical parity and exact publisher provenance still require verification. The later formula appendix remains unlocated. Do not claim Ohio State nutrition formulas are implemented. The reference HTML's local rankings are not official NSIP EBVs.

See Clarksons-project-reconciliation.md for the SDSU/Iowa State source hierarchy, official links, recovered requirements and outstanding source access. User prefers Ohio State spreadsheet workflow and SDSU management guidance, with Iowa State information also incorporated.

User direction: use supplied formulas and spreadsheets as sources. Trace inputs/units and verify expected workbook outputs before releasing dependent calculations. Sample prices/rates remain assumptions, not actual farm records.


## Original Iowa ration PDFs reviewed September 13

Extracted all seven PDFs from the user-supplied sheepdietsandmineral.zip; visually checked small ewes, replacement lambs, and market lamb mineral sheets after extraction. The pages identify Iowa State University Extension / Iowa Beef Center and are dated August 25, 2026. These are separate from the Ohio State budget and the Meat Sheep Balancer workbook.

The ration plans show distinct production stages, head counts, date periods, as-fed ingredient percentages, total group daily pounds, period tons, daily/period cost and cost per as-fed ton. Their footnote explicitly says storage shrink is included in estimates and intake scaling is not included. Rounded printed values cannot establish exact underlying formula parity. Replacement and market lamb plans are distinct; the original project user also requires replacement rams to be supported.

Mineral supplement sheets distinguish per-head daily amounts from concentration and contain blank nutrient values. Blank means unspecified, not zero. The market-lamb sheet includes an ionophore line and mineral concentrations; those values have not been installed as prescriptions, universal limits or automatic ingredient defaults. Historical dates, head counts and prices have not been imported into live farm records.

Implementation consequence: preserve source/stage/version and separate projected period quantities from actual feeding, rather than treating a single ingredient mix as every animal's ration. Feed cost allocation remains an open user decision.


## Adjusted-growth calculator (separate from actual measurements)

Verified Virginia Tech Extension's Scott Greiner, Keeping and Using Flock Records, 2015 VA Shepherds' Symposium, PDF page 3: https://www.apsc.vt.edu/content/dam/apsc_vt_edu/extension/sheep/programs/shepherds-symposium/2015/15-greiner.pdf . This is an additional identified source, not an Ohio State or SDSU formula.

The optional sheep calculator accepts actual 45–90-day and later 90–150-day measurements and an explicitly entered weaning adjustment factor with source/basis. It uses the published 60-day and 120-day equations, including the stated birth-weight-omitted option when birth weight was not measured. No factor is guessed from incomplete dam/rearing data; outputs are labeled estimates, never inserted into the weights table, and are not EBVs. A worked synthetic example verifies 10-lb birth, 50-lb at 60 days, 90-lb at 120 days, factor 1.1 -> adjusted 54 and 94 lb.

## September 15 — sheep master balancer integration

User reconfirmed that the master balancer is the priority; use Ohio State, SDSU and Iowa State sources on the ration page. Re-read project-only conversations Ohio State Conversation Summary, Update Ohio State Thread, SDSU Conversation Summary, and the newest Recall Feeding Groups messages. These confirm the separate roles: nutrient balancing first; enterprise-budget cost/profit structure second. Historical assistant ration recipes, protein progression and mineral doses are not installed as defaults. Latest user explicitly authorizes GitHub upload.

Implemented source: supplied Meat Sheep Balancer v6.xlsx. Ration!A34 credits Dr. Benjamin Wenner, Ohio State University, and Corienne Gammariello. A35 describes NRC tables; workbook text calls them 2006 whereas historical correspondence calls them 2007. We identify the exact workbook/version rather than silently resolving that edition discrepancy.

- 332 feed reference rows and 54 sheep class/weight profiles. Feed values saved with each ration; users can enter test values and custom adviser targets. No fabricated targets for lactation, maintenance, small sheep or replacement rams outside the workbook profiles.
- Ration!E19 weighted DM; G19:X19 weighted as-fed nutrient concentrations; E25:N25 daily intake; F5 expected as-fed intake from target DMI; E29 Ca:P; C21 weighted cost per US ton. Exact workbook 0.454 kg/lb factor retained for parity.
- Known-value cached outputs match the supplied example. Excel blanks treated as zero for copper/zinc are deliberately NOT replicated in production: unknown totals remain unknown. Explicit-zero test reproduces those cached outputs to verify arithmetic separately from missing-data policy.
- Negative DE/ME/TDN entries for Cherry (tree) Bark and Walnut Bark are normalized to unknown, never negative usable nutrients. Other source values remain estimates; CP equivalents and TDN can exceed 100, so validation permits them. Non-protein nitrogen/ammonium inputs show review advice.
- Workbook NDF minimum is 10% as-fed. Ca:P review range 1.5–3 is an app review band around the workbook's described 2:1 target, not an exact conditional-formatting reproduction. Workbook copper daily limit retained and labeled; additional 15 ppm DM review avoids understating concentration in wet diets. These are review checks, not safety certification or prescriptions.
- Whole-diet versus supplement distinction: supplement-only never claims adequacy. Blank analysis, missing vitamins/iodine, effective fiber and water contributions are disclosed. No automatic least-cost optimizer or universal feeding recommendation.
- Iowa State supplied PDFs inform group/period layout. Planned purchase lb = consumed lb / (1 - storage shrink fraction); this explicit app assumption is not claimed as BRaNDS formula parity. Period planning does not automatically scale intake with growth. No example ration/mineral recipe is inserted into farm records.
- SDSU official sources checked September 15: https://extension.sdstate.edu/mineral-considerations-sheep and https://extension.sdstate.edu/nutritional-considerations-flocks-during-breeding-season . UI references condition-aware groups, forage testing and mineral interactions; no hard-coded supplementation doses.
- New dated ration version copies ingredients/analyses/targets while existing ration history remains. Saved version inputs travel through existing event storage, backups and audit. Actual feed allocation continues to snapshot selected ration cost/version and membership; planning estimates do not post expenses or change official weights.

Validation: focused cached-workbook parity, unknown nutrient propagation, wet-feed conversion, reference data validation, sheep-only enforcement, legacy cost-only compatibility. Full app regression and browser save/reopen checks are required before publishing this increment.

### September 15 ration release verification

87 regression tests pass, including five focused nutrition tests. TypeScript and production build pass. An isolated browser test entered a sheep requirement and book feed, edited the laboratory analysis, checked calculated output, saved and reopened the ration, verified retained group-planning values, and copied a new ration version. Desktop and phone dialog screenshots inspected. Main farm records were not used as test data.

Try on the main app after publishing: Sessions → Feed & rations → Balance a ration. Enter a title/date, select sheep class/weight and diet coverage, load ingredients, enter mix pounds/prices and lb/head/day, review Feed analysis, then Nutrient check. Review → Save event. Use New ration version for later diets; Edit corrects a saved record. Test blank minerals, a wet forage, different ewe/lamb requirements, and copying a saved version. Feed allocation remains the separate action for actual bills.
