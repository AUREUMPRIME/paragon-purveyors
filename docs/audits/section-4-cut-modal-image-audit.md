# Section 4 Cut Modal Image Audit

## Status

Read-only audit. No files were changed or deleted.

## Build

Build passed before this report was generated.

## Main Finding

The Section 4 cards can have images while the selected cut modal has no image because cards and modals are separate systems. Card images live in src/main.js. Modal content is rendered from src/selectedCutsModal.js and needs its own image data/rendering path.

## Modal Image Capability Check

- selectedCutsModal.js has img rendering: True
- selectedCutsModal.js has image-like data/property names: True
- selectedCutsModal.js references assets/cuts/: True
- selectedCutsModal.js appears connected to selected cut triggers/data: True
- src/styles.css has likely modal image rules: True

## Section 4 Card Image State

- Selected cut cards found: 24
- Expected PNG files missing: 0
- Cards not using expected PNG path yet: 0

| Cut ID | Trigger | Visible Name | Card Image Source | Expected PNG Exists |
| --- | --- | --- | --- | --- |
| ribeye | Ribeye | Ribeye | assets/cuts/ribeye.png | True |
| tenderloin | Tenderloin | Tenderloin | assets/cuts/tenderloin.png | True |
| striploin | Striploin | Striploin | assets/cuts/striploin.png | True |
| tomahawk | Tomahawk | Tomahawk | assets/cuts/tomahawk.png | True |
| presa | Presa | Presa | assets/cuts/presa.png | True |
| secreto | Secreto | Secreto | assets/cuts/secreto.png | True |
| rump-cap | Rump Cap | Picanha | assets/cuts/rump-cap.png | True |
| short-rib | Short Rib | Short Rib | assets/cuts/short-rib.png | True |
| chuck-roll | Chuck Roll | Chuck Roll | assets/cuts/chuck-roll.png | True |
| shortloin | Shortloin | Shortloin | assets/cuts/shortloin.png | True |
| flap-meat | Flap Meat | Flap Meat | assets/cuts/flap-meat.png | True |
| flank-steak | Flank Steak | Flank Steak | assets/cuts/flank-steak.png | True |
| tri-tip | Tri Tip | Tri Tip | assets/cuts/tri-tip.png | True |
| top-sirloin | Top Sirloin | Top Sirloin | assets/cuts/top-sirloin.png | True |
| oyster-blade | Oyster Blade | Oyster Blade | assets/cuts/oyster-blade.png | True |
| chuck-tail-flap | Chuck Tail Flap | Chuck Tail Flap | assets/cuts/chuck-tail-flap.png | True |
| iberico-abanico | Iberico Abanico | Abanico | assets/cuts/iberico-abanico.png | True |
| iberico-pluma | Iberico Pluma | Pluma | assets/cuts/iberico-pluma.png | True |
| iberico-coppa | Iberico Coppa | Coppa | assets/cuts/iberico-coppa.png | True |
| iberico-loin-roast | Iberico Loin Roast | Loin Roast | assets/cuts/iberico-loin-roast.png | True |
| iberico-4-rib-rack | Iberico 4 Rib-Rack | 4 Rib-Rack | assets/cuts/iberico-4-rib-rack.png | True |
| iberico-st-louis-ribs | Iberico St. Louis Ribs | St. Louis Ribs | assets/cuts/iberico-st-louis-ribs.png | True |
| iberico-pork-belly | Iberico Pork Belly | Pork Belly | assets/cuts/iberico-pork-belly.png | True |
| iberico-shoulder-picnic | Iberico Shoulder Picnic | Shoulder Picnic | assets/cuts/iberico-shoulder-picnic.png | True |

## iberico-loin.png Reference Check

- File checked: public/assets/cuts/iberico-loin.png
- Text references found: 0

No text references were found. If the file exists, it is probably safe to delete after the modal image fix is complete and build passes.

## Recommendation

1. Do not delete iberico-loin.png yet unless this audit shows zero references and the correct iberico-loin-roast.png exists.
2. Add a modal image field or derive the modal image from the cut ID.
3. Render the image inside selected cut modals using assets/cuts/<cut-id>.png.
4. Add CSS for a premium, restrained modal image band.
5. Build and verify every cut modal opens with the matching image.
6. Then delete unused iberico-loin.png if still unreferenced.

## Likely Root Cause

The image replacement work updated Section 4 card image sources only. The selected cut modal does not automatically inherit card images unless selectedCutsModal.js explicitly receives and renders the image source.
