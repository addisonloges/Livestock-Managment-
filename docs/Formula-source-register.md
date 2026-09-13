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
