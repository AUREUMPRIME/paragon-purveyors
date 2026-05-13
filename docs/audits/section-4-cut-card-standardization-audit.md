# Section 4 Cut Card Standardization Audit

## Status

Read-only audit. No source code was modified by this audit script.

## Summary

- Cards inside .cut-scroll: 25
- All Cuts first: Yes
- Cards with long-title class: 7
- Current Ibérico-prefixed display names: 8
- Errors detected: 0
- Warnings detected: 13

## What Went Wrong

The current card system has mixed generations of markup and copy:

1. Older cards were originally made with short labels like Beef, Pork, and Wagyu.
2. Newer cards were added with category labels below the title, then later reordered.
3. The latest standardization inserted richer labels, but some old card styling/markup still leaves extra visible category text on the top.
4. Long Ibérico names are too verbose for compact cards because the word Iberico repeats information already provided by the card category.
5. The card standard needs to separate internal data names from display names.

## Correct Standard Going Forward

Every normal cut card should have this exact visual hierarchy:

1. One category label only.
2. One display name only.
3. Category label appears above the name.
4. Display name should be short enough for two clean lines.
5. Ibérico pork cards should display category as Pork and remove Iberico from the visible card name.
6. Modal titles may keep full names if needed, but card display names should be shorter.

## Recommended Display Mapping

| Current Trigger / Modal Name | Recommended Card Label | Recommended Card Name |
| --- | --- | --- |
| Ribeye | Beef / Wagyu | Ribeye |
| Tenderloin | Beef / Wagyu / Pork | Tenderloin |
| Striploin | Beef / Wagyu | Striploin |
| Tomahawk | Beef / Wagyu | Tomahawk |
| Presa | Pork | Presa |
| Secreto | Pork | Secreto |
| Rump Cap | Beef / Wagyu | Picanha |
| Short Rib | Beef / Wagyu | Short Rib |
| Chuck Roll | Wagyu | Chuck Roll |
| Shortloin | Wagyu | Shortloin |
| Flap Meat | Beef / Wagyu | Flap Meat |
| Flank Steak | Beef / Pork | Flank Steak |
| Tri Tip | Beef / Wagyu | Tri Tip |
| Top Sirloin | Beef / Wagyu | Top Sirloin |
| Oyster Blade | Wagyu | Oyster Blade |
| Chuck Tail Flap | Beef / Wagyu | Chuck Tail Flap |
| Iberico Abanico | Pork | Abanico |
| Iberico Pluma | Pork | Pluma |
| Iberico Coppa | Pork | Coppa |
| Iberico Loin Roast | Pork | Loin Roast |
| Iberico 4 Rib-Rack | Pork | 4 Rib-Rack |
| Iberico St. Louis Ribs | Pork | St. Louis Ribs |
| Iberico Pork Belly | Pork | Pork Belly |
| Iberico Shoulder Picnic | Pork | Shoulder Picnic |

## Current Card Audit

| Cut ID | Trigger | Current Labels | Current Name | Selected Modal Category | Hierarchy OK |
| --- | --- | --- | --- | --- | --- |
| all-cuts | - | View the complete visual cut reference. | All Cuts | - | Yes |
| ribeye | Ribeye | Beef / Wagyu | Ribeye | Beef / Wagyu | Yes |
| tenderloin | Tenderloin | Beef / Wagyu / Pork | Tenderloin | Beef / Wagyu / Pork | Yes |
| striploin | Striploin | Beef / Wagyu | Striploin | Beef / Wagyu | Yes |
| tomahawk | Tomahawk | Beef / Wagyu | Tomahawk | Beef / Wagyu | Yes |
| presa | Presa | Ibérico Pork | Presa | Ibérico Pork | Yes |
| secreto | Secreto | Ibérico Pork | Secreto | Ibérico Pork | Yes |
| rump-cap | Rump Cap | Beef / Wagyu | Picanha | Beef / Wagyu | Yes |
| short-rib | Short Rib | Beef / Wagyu | Short Rib | Beef | Yes |
| chuck-roll | Chuck Roll | Wagyu | Chuck Roll | Wagyu | Yes |
| shortloin | Shortloin | Wagyu | Shortloin | Wagyu | Yes |
| flap-meat | Flap Meat | Beef / Wagyu | Flap Meat | Beef / Wagyu | Yes |
| flank-steak | Flank Steak | Beef / Ibérico Pork | Flank Steak | Beef / Ibérico Pork | Yes |
| tri-tip | Tri Tip | Beef / Wagyu | Tri Tip | Beef / Wagyu | Yes |
| top-sirloin | Top Sirloin | Beef / Wagyu | Top Sirloin | Beef / Wagyu | Yes |
| oyster-blade | Oyster Blade | Wagyu | Oyster Blade | Wagyu | Yes |
| chuck-tail-flap | Chuck Tail Flap | Beef / Wagyu | Chuck Tail Flap | Beef / Wagyu | Yes |
| iberico-abanico | Iberico Abanico | Ibérico Pork | Iberico Abanico | Ibérico Pork | Yes |
| iberico-pluma | Iberico Pluma | Ibérico Pork | Iberico Pluma | Ibérico Pork | Yes |
| iberico-coppa | Iberico Coppa | Ibérico Pork | Iberico Coppa | Ibérico Pork | Yes |
| iberico-loin-roast | Iberico Loin Roast | Ibérico Pork | Iberico Loin Roast | Ibérico Pork | Yes |
| iberico-4-rib-rack | Iberico 4 Rib-Rack | Ibérico Pork | Iberico 4 Rib-Rack | Ibérico Pork | Yes |
| iberico-st-louis-ribs | Iberico St. Louis Ribs | Ibérico Pork | Iberico St. Louis Ribs | Ibérico Pork | Yes |
| iberico-pork-belly | Iberico Pork Belly | Ibérico Pork | Iberico Pork Belly | Ibérico Pork | Yes |
| iberico-shoulder-picnic | Iberico Shoulder Picnic | Ibérico Pork | Iberico Shoulder Picnic | Ibérico Pork | Yes |

## Errors

- None

## Warnings

- Redundant Iberico prefix in display name: Iberico Abanico
- Redundant Iberico prefix in display name: Iberico Pluma
- Redundant Iberico prefix in display name: Iberico Coppa
- Redundant Iberico prefix in display name: Iberico Loin Roast
- Long display name needs compact title rule: Iberico Loin Roast
- Redundant Iberico prefix in display name: Iberico 4 Rib-Rack
- Long display name needs compact title rule: Iberico 4 Rib-Rack
- Redundant Iberico prefix in display name: Iberico St. Louis Ribs
- Long display name needs compact title rule: Iberico St. Louis Ribs
- Redundant Iberico prefix in display name: Iberico Pork Belly
- Long display name needs compact title rule: Iberico Pork Belly
- Redundant Iberico prefix in display name: Iberico Shoulder Picnic
- Long display name needs compact title rule: Iberico Shoulder Picnic

## Style Findings

- A previous card standardization CSS block exists.
- Long-title CSS exists, but long Ibérico names still need shorter display names.
- Current standardization targets all cards inside .cut-scroll.

## Recommended Fix

1. Add explicit card display metadata instead of deriving card labels from inconsistent old markup.
2. Rewrite only Section 4 card article display labels and visible h3 text.
3. Preserve data-selected-cut-trigger values so existing modals keep opening correctly.
4. For Ibérico cards, keep data trigger as full name but show shorter card h3:
   - Iberico Abanico -> Abanico
   - Iberico Pluma -> Pluma
   - Iberico Coppa -> Coppa
   - Iberico Loin Roast -> Loin Roast
   - Iberico 4 Rib-Rack -> 4 Rib-Rack
   - Iberico St. Louis Ribs -> St. Louis Ribs
   - Iberico Pork Belly -> Pork Belly
   - Iberico Shoulder Picnic -> Shoulder Picnic
5. Reduce card title font slightly and remove any duplicate/stale labels.
6. Verify every normal card has exactly one .cut-card-description before h3.
7. Keep .cut-scroll containment and scroll-feel code untouched.

## Prevention Rule

Future cards must be created from a display config:

- id
- triggerTitle
- cardLabel
- cardName
- modalTitle
- producerLinks

Never derive visible card labels from old hardcoded markup.
