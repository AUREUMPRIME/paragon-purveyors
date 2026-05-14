# Section 4 Cut Modal Brand Column Audit

## Status

Read-only audit. No source code was modified.

## Build

Build passed before this audit report was generated.

## Goal

Add producer brand to every product row in every Section 4 selected cut modal.

## Current Table State

- Selected cut modals found: 24
- Total product rows found: 82
- Rows with current 3-column shape: 82
- Rows with existing 4-column shape: 0
- Non-standard row shapes: 0
- Modal source appears to already have Brand header: false
- Rows with obvious brand text already inside values: 0

## Producer Labels Found In catalogData.js

- Black Opal
- Mayura Station
- Robbins Island
- Wanderer
- Campo Grande
- F1 Australian Wagyu
- Full-Blood Australian Wagyu
- Pure Blood Tasmanian Wagyu
- Free-Range Barley-Fed Beef
- Spanish Ibérico Pork

## Modal Inventory

| Modal Key | Title | Category | Row Count | Current Row Widths | Proposed Default Brand Context |
| --- | --- | --- | ---: | --- | --- |
| Ribeye | Ribeye | Beef / Wagyu | 8 | 3 | Needs review |
| Tenderloin | Tenderloin | Beef / Wagyu / Pork | 9 | 3 | Campo Grande |
| Striploin | Striploin | Beef / Wagyu | 11 | 3 | Needs review |
| Tomahawk | Tomahawk | Beef / Wagyu | 7 | 3 | Needs review |
| Presa | Presa | Ibérico Pork | 1 | 3 | Campo Grande |
| Secreto | Secreto | Ibérico Pork | 3 | 3 | Campo Grande |
| Rump Cap | Picanha | Beef / Wagyu | 5 | 3 | Needs review |
| Short Rib | Short Rib | Beef | 2 | 3 | Needs review |
| Chuck Roll | Chuck Roll | Wagyu | 1 | 3 | Needs review |
| Shortloin | Shortloin | Wagyu | 2 | 3 | Needs review |
| Flap Meat | Flap Meat | Beef / Wagyu | 6 | 3 | Needs review |
| Flank Steak | Flank Steak | Beef / Ibérico Pork | 2 | 3 | Campo Grande |
| Tri Tip | Tri Tip | Beef / Wagyu | 6 | 3 | Needs review |
| Top Sirloin | Top Sirloin | Beef / Wagyu | 5 | 3 | Needs review |
| Oyster Blade | Oyster Blade | Wagyu | 1 | 3 | Needs review |
| Chuck Tail Flap | Chuck Tail Flap | Beef / Wagyu | 5 | 3 | Needs review |
| Iberico Abanico | Iberico Abanico | Ibérico Pork | 1 | 3 | Campo Grande |
| Iberico Pluma | Iberico Pluma | Ibérico Pork | 1 | 3 | Campo Grande |
| Iberico Coppa | Iberico Coppa | Ibérico Pork | 1 | 3 | Campo Grande |
| Iberico Loin Roast | Iberico Loin Roast | Ibérico Pork | 1 | 3 | Campo Grande |
| Iberico 4 Rib-Rack | Iberico 4 Rib-Rack | Ibérico Pork | 1 | 3 | Campo Grande |
| Iberico St. Louis Ribs | Iberico St. Louis Ribs | Ibérico Pork | 1 | 3 | Campo Grande |
| Iberico Pork Belly | Iberico Pork Belly | Ibérico Pork | 1 | 3 | Campo Grande |
| Iberico Shoulder Picnic | Iberico Shoulder Picnic | Ibérico Pork | 1 | 3 | Campo Grande |

## Row-Level Preview

| Modal | Row | Current Values | Proposed Brand Status |
| --- | ---: | --- | --- |
| Ribeye | 1 | 14107 / Ribeye / 3/12.5# AVG. ~ 38# CS | Needs brand added |
| Ribeye | 2 | 24107 / Ribeye / 3/12.5# AVG. ~ 38# CS | Needs brand added |
| Ribeye | 3 | 34107 / Ribeye / 3/12.5# AVG. ~ 38# CS | Needs brand added |
| Ribeye | 4 | 37907 / Ribeye / 4/9# AVG. ~ 38# CS | Needs brand added |
| Ribeye | 5 | 22402W / Ribeye Lip Off / 2/14# AVG. ~ 28# CS | Needs brand added |
| Ribeye | 6 | 22409T / Ribeye Lip Off / 2/14# AVG. ~ 28# CS | Needs brand added |
| Ribeye | 7 | 2240XA / Rib Eye Roll Lip Off 7LB+ / 3/10# AVG. ~ 30# CS | Needs brand added |
| Ribeye | 8 | 2240XB / Rib Eye Roll Lip Off 7LB+ / 3/10# AVG. ~ 30# CS | Needs brand added |
| Tenderloin | 1 | 14135 / Tenderloin / 4/5.5# AVG. ~ 22# CS | Needs brand added |
| Tenderloin | 2 | 24135 / Tenderloin / 4/5.5# AVG. ~ 22# CS | Needs brand added |
| Tenderloin | 3 | 34135 / Tenderloin / 4/5.5# AVG. ~ 22# CS | Needs brand added |
| Tenderloin | 4 | 37905 / Tenderloin / 4/7# AVG. ~ 30# CS | Needs brand added |
| Tenderloin | 5 | FP18 / Tenderloin / 24/0.8# AVG. ~ 19.2# CS | Needs brand added |
| Tenderloin | 6 | 21602W / Tenderloin SS Off / 6/5# AVG. ~ 30# CS | Needs brand added |
| Tenderloin | 7 | 21609T / Tenderloin SS Off / 6/5# AVG. ~ 30# CS | Needs brand added |
| Tenderloin | 8 | 2160XA / Tenderloin SS Off 4LB+ / 6/4# AVG. ~ 24# CS | Needs brand added |
| Tenderloin | 9 | 2160XB / Tenderloin SS Off 4LB+ / 6/4# AVG. ~ 24# CS | Needs brand added |
| Striploin | 1 | 14104 / Striploin / 3/13# AVG. ~ 40# CS | Needs brand added |
| Striploin | 2 | 24104 / Striploin / 3/13# AVG. ~ 40# CS | Needs brand added |
| Striploin | 3 | 34104 / Striploin / 3/13# AVG. ~ 40# CS | Needs brand added |
| Striploin | 4 | 37904 / Striploin / 2/19# AVG. ~ 37# CS | Needs brand added |
| Striploin | 5 | 37974 / Bone-In Striploin / 1/40# AVG. ~ 40# CS | Needs brand added |
| Striploin | 6 | 21402W / Striploin / 2/15# AVG. ~ 30# CS | Needs brand added |
| Striploin | 7 | 21409T / Striploin / 2/15# AVG. ~ 30# CS | Needs brand added |
| Striploin | 8 | 2140XA / Striploin 11LB+ / 3/12# AVG. ~ 36# CS | Needs brand added |
| Striploin | 9 | 1562XA / B/In Striploin Vac / 3/12# AVG. ~ 36# CS | Needs brand added |
| Striploin | 10 | 2140XB / Striploin 11LB+ / 3/12# AVG. ~ 36# CS | Needs brand added |
| Striploin | 11 | 1562XB / Striploin B/I / 2/16# AVG. ~ 32# CS | Needs brand added |
| Tomahawk | 1 | 14101 / Tomahawk / 2/11# AVG. ~ 22# CS | Needs brand added |
| Tomahawk | 2 | 24101 / Tomahawk / 2/11# AVG. ~ 22# CS | Needs brand added |
| Tomahawk | 3 | 34101 / Tomahawk / 2/11# AVG. ~ 22# CS | Needs brand added |
| Tomahawk | 4 | 27972 / Tomahawk / 1/22# AVG. ~ 22# CS | Needs brand added |
| Tomahawk | 5 | 37972 / Tomahawk / 1/22# AVG. ~ 22# CS | Needs brand added |
| Tomahawk | 6 | 1602TW / Tomahawk / 2/12# AVG. ~ 24# CS | Needs brand added |
| Tomahawk | 7 | 1602RW / Tomahawk / 2/12# AVG. ~ 24# CS | Needs brand added |
| Presa | 1 | FP02 / Presa / 12/1.54# AVG. ~ 18.5# CS | Needs brand added |
| Secreto | 1 | FP01 / Secreto / 16/1.1# AVG. ~ 17.5# CS | Needs brand added |
| Secreto | 2 | FP15 / Jowl Secreto / 16/0.5# AVG. ~ 8# CS | Needs brand added |
| Secreto | 3 | FP16 / Belly Secreto / 14/1.3# AVG. ~ 18# CS | Needs brand added |
| Picanha | 1 | 24124 / Rump Cap / 8/3.5# AVG. ~ 28# CS | Needs brand added |
| Picanha | 2 | 34124 / Rump Cap / 8/3.5# AVG. ~ 28# CS | Needs brand added |
| Picanha | 3 | 37924 / Rump Cap (Culotte) / 8/4# AVG. ~ 34# CS | Needs brand added |
| Picanha | 4 | 2091XA / Rump Cap / 6/5# AVG. ~ 30# CS | Needs brand added |
| Picanha | 5 | 2091XB / Rump Cap / 6/5# AVG. ~ 30# CS | Needs brand added |
| Short Rib | 1 | 1688XA / Short Rib 3-Rib / 12/4# AVG. ~ 48# CS | Needs brand added |
| Short Rib | 2 | 1688XB / Short Rib 3-Rib / 8/3# AVG. ~ 48# CS | Needs brand added |
| Chuck Roll | 1 | 34129 / Chuck Roll / 2/20# AVG. ~ 40# CS | Needs brand added |
| Shortloin | 1 | 24105 / Shortloin / 1/28# AVG. ~ 28# CS | Needs brand added |
| Shortloin | 2 | 37975 / Shortloin / 1/22# AVG. ~ 22# CS | Needs brand added |
| Flap Meat | 1 | 14117 / Flap Meat / 8/4.5# AVG. ~ 36# CS | Needs brand added |
| Flap Meat | 2 | 24117 / Flap Meat / 8/4.5# AVG. ~ 36# CS | Needs brand added |
| Flap Meat | 3 | 34117 / Flap Meat / 8/4.5# AVG. ~ 36# CS | Needs brand added |
| Flap Meat | 4 | 37917 / Flap Meat / 8/4# AVG. ~ 35# CS | Needs brand added |
| Flap Meat | 5 | 22061W / Flap Meat / 6/5# AVG. ~ 30# CS | Needs brand added |
| Flap Meat | 6 | 2206XA / Flap Meat / 6/2.5# AVG. ~ 30# CS | Needs brand added |
| Flank Steak | 1 | FP10 / Flank Steak / 18/1.2# AVG. ~ 21# CS | Needs brand added |
| Flank Steak | 2 | 2210XA / Flank Steak / 12/1.5# AVG. ~ 36# CS | Needs brand added |
| Tri Tip | 1 | 14116 / Tri Tip / 16/2.25# AVG. ~ 36# CS | Needs brand added |
| Tri Tip | 2 | 24116 / Tri Tip / 16/2.25# AVG. ~ 36# CS | Needs brand added |
| Tri Tip | 3 | 34116 / Tri Tip / 16/2.25# AVG. ~ 36# CS | Needs brand added |
| Tri Tip | 4 | 37916 / Tri Tip / 12/3# AVG. ~ 33# CS | Needs brand added |
| Tri Tip | 5 | 21311W / Tri Tip / 12/3# AVG. ~ 36# CS | Needs brand added |
| Tri Tip | 6 | 2131XA / Tri Tip / 4/2# AVG. ~ 32# CS | Needs brand added |
| Top Sirloin | 1 | 24123 / Top Sirloin / 4/8# AVG. ~ 32# CS | Needs brand added |
| Top Sirloin | 2 | 34123 / Top Sirloin / 4/8# AVG. ~ 32# CS | Needs brand added |
| Top Sirloin | 3 | 21102W / Top Sirloin / 3/16# AVG. ~ 48# CS | Needs brand added |
| Top Sirloin | 4 | 2110XA / Top Sirloin / 6/6# AVG. ~ 36# CS | Needs brand added |
| Top Sirloin | 5 | 2110XB / Top Sirloin / 6/6# AVG. ~ 36# CS | Needs brand added |
| Oyster Blade | 1 | 37932 / Oyster Blade / 8/6# AVG. ~ 49# CS | Needs brand added |
| Chuck Tail Flap | 1 | 14142 / Chuck Tail Flap / 3/13# AVG. ~ 40# CS | Needs brand added |
| Chuck Tail Flap | 2 | 24142 / Chuck Tail Flap / 12/2.5# AVG. ~ 30# CS | Needs brand added |
| Chuck Tail Flap | 3 | 34142 / Chuck Tail Flap / 12/2.5# AVG. ~ 30# CS | Needs brand added |
| Chuck Tail Flap | 4 | 37942 / Chuck Tail Flap / 12/3# AVG. ~ 35# CS | Needs brand added |
| Chuck Tail Flap | 5 | 2266GS / Chuck Tail Flap / 5/7# AVG. ~ 35# CS | Needs brand added |
| Iberico Abanico | 1 | FP03 / Albanico / 18/1.1# AVG. ~ 19.8# CS | Needs brand added |
| Iberico Pluma | 1 | FP04 / Pluma / 12/1.5# AVG. ~ 18.5# CS | Needs brand added |
| Iberico Coppa | 1 | FP08 / Coppa / 8/2.3# AVG. ~ 18# CS | Needs brand added |
| Iberico Loin Roast | 1 | FP07 / Loin Roast / 12/1.25# AVG. ~ 15# CS | Needs brand added |
| Iberico 4 Rib-Rack | 1 | FP05 / 4-Rib Rack / 6/2.1# AVG. ~ 13# CS | Needs brand added |
| Iberico St. Louis Ribs | 1 | FP09 / St. Louis Rib / 6/1.8# AVG. ~ 11# CS | Needs brand added |
| Iberico Pork Belly | 1 | FP06 / Belly / 12/1.25# AVG. ~ 15# CS | Needs brand added |
| Iberico Shoulder Picnic | 1 | FP21 / Picnic Shoulder / 2/16# AVG. ~ 32# CS | Needs brand added |

## Recommendation

Use a two-step implementation:

1. Convert the modal table renderer from three columns to four columns:

```text
Brand | Code | Cut / Product | Specification
```

2. Convert each row from:

```js
["14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"]
```

to either explicit objects:

```js
{ brand: "Black Opal", code: "14107", cut: "Ribeye", specification: "3/12.5# AVG. ~ 38# CS" }
```

or four-value arrays if we want a smaller patch:

```js
["Black Opal", "14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"]
```

Preferred approach: explicit objects, because this avoids future column-order mistakes.

## Brand Assignment Rule

- Every row must have a brand.
- Do not infer final row-level brand only from the card title.
- Use supplier sheet/code knowledge where available.
- If a modal combines multiple producers, the brand must be assigned row by row.
- After implementation, add a validation script that fails if any row is missing brand/code/cut/specification.

## Next Step

Patch selectedCutsModal.js so all rows across all Section 4 cut modals include a Brand column, then update table CSS for desktop and mobile.