# Section 4 Image Replacement Audit

## Status

Read-only audit. No image paths were changed and no files were deleted.

## Summary

- Section 4 selected cut cards found: 24
- Expected PNG files found: 23
- Expected PNG files missing: 1
- Current cards still using JPG: 8
- Current cards still using placeholder: 16
- JPG files currently in public/assets/cuts: 8
- PNG files currently in public/assets/cuts: 24
- SVG files currently in public/assets/cuts: 1
- placeholder-cut.svg exists: True

## Replacement Rule

Every Section 4 cut card should use:

```text
assets/cuts/<cut-id>.png
```

After all cards reference PNG files and build passes, remove old JPG files and placeholder-cut.svg.

## Required PNG Checklist

| Cut ID | Modal Trigger | Visible Name | Current Source | Expected PNG | PNG Exists | Current JPG | Current Placeholder |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ribeye | Ribeye | Ribeye | assets/cuts/ribeye.jpg | public/assets/cuts/ribeye.png | True | True | False |
| tenderloin | Tenderloin | Tenderloin | assets/cuts/tenderloin.jpg | public/assets/cuts/tenderloin.png | True | True | False |
| striploin | Striploin | Striploin | assets/cuts/striploin.jpg | public/assets/cuts/striploin.png | True | True | False |
| tomahawk | Tomahawk | Tomahawk | assets/cuts/tomahawk.jpg | public/assets/cuts/tomahawk.png | True | True | False |
| presa | Presa | Presa | assets/cuts/presa.jpg | public/assets/cuts/presa.png | True | True | False |
| secreto | Secreto | Secreto | assets/cuts/secreto.jpg | public/assets/cuts/secreto.png | True | True | False |
| rump-cap | Rump Cap | Picanha | assets/cuts/rump-cap.jpg | public/assets/cuts/rump-cap.png | True | True | False |
| short-rib | Short Rib | Short Rib | assets/cuts/short-rib.jpg | public/assets/cuts/short-rib.png | True | True | False |
| chuck-roll | Chuck Roll | Chuck Roll | assets/cuts/placeholder-cut.svg | public/assets/cuts/chuck-roll.png | True | False | True |
| shortloin | Shortloin | Shortloin | assets/cuts/placeholder-cut.svg | public/assets/cuts/shortloin.png | True | False | True |
| flap-meat | Flap Meat | Flap Meat | assets/cuts/placeholder-cut.svg | public/assets/cuts/flap-meat.png | True | False | True |
| flank-steak | Flank Steak | Flank Steak | assets/cuts/placeholder-cut.svg | public/assets/cuts/flank-steak.png | True | False | True |
| tri-tip | Tri Tip | Tri Tip | assets/cuts/placeholder-cut.svg | public/assets/cuts/tri-tip.png | True | False | True |
| top-sirloin | Top Sirloin | Top Sirloin | assets/cuts/placeholder-cut.svg | public/assets/cuts/top-sirloin.png | True | False | True |
| oyster-blade | Oyster Blade | Oyster Blade | assets/cuts/placeholder-cut.svg | public/assets/cuts/oyster-blade.png | True | False | True |
| chuck-tail-flap | Chuck Tail Flap | Chuck Tail Flap | assets/cuts/placeholder-cut.svg | public/assets/cuts/chuck-tail-flap.png | True | False | True |
| iberico-abanico | Iberico Abanico | Abanico | assets/cuts/placeholder-cut.svg | public/assets/cuts/iberico-abanico.png | True | False | True |
| iberico-pluma | Iberico Pluma | Pluma | assets/cuts/placeholder-cut.svg | public/assets/cuts/iberico-pluma.png | True | False | True |
| iberico-coppa | Iberico Coppa | Coppa | assets/cuts/placeholder-cut.svg | public/assets/cuts/iberico-coppa.png | True | False | True |
| iberico-loin-roast | Iberico Loin Roast | Loin Roast | assets/cuts/placeholder-cut.svg | public/assets/cuts/iberico-loin-roast.png | False | False | True |
| iberico-4-rib-rack | Iberico 4 Rib-Rack | 4 Rib-Rack | assets/cuts/placeholder-cut.svg | public/assets/cuts/iberico-4-rib-rack.png | True | False | True |
| iberico-st-louis-ribs | Iberico St. Louis Ribs | St. Louis Ribs | assets/cuts/placeholder-cut.svg | public/assets/cuts/iberico-st-louis-ribs.png | True | False | True |
| iberico-pork-belly | Iberico Pork Belly | Pork Belly | assets/cuts/placeholder-cut.svg | public/assets/cuts/iberico-pork-belly.png | True | False | True |
| iberico-shoulder-picnic | Iberico Shoulder Picnic | Shoulder Picnic | assets/cuts/placeholder-cut.svg | public/assets/cuts/iberico-shoulder-picnic.png | True | False | True |

## Missing PNG Files

- public/assets/cuts/iberico-loin-roast.png

## Existing JPG Files To Delete After Successful Switch

- public/assets/cuts/presa.jpg
- public/assets/cuts/ribeye.jpg
- public/assets/cuts/rump-cap.jpg
- public/assets/cuts/secreto.jpg
- public/assets/cuts/short-rib.jpg
- public/assets/cuts/striploin.jpg
- public/assets/cuts/tenderloin.jpg
- public/assets/cuts/tomahawk.jpg

## Existing SVG Files To Delete After Successful Switch

- public/assets/cuts/placeholder-cut.svg

## Recommended Next Step

Do not switch or delete files yet. Add the missing PNG files first, then rerun this audit.
