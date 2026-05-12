# Phase 6 Selected Cuts Batch 2 Plan

## Status

Planning report only. No source code changes.

## Recommended Batch 2 Scope

Batch 2 should focus on Campo Grande / Ibérico pork cuts because Batch 1 already expanded mostly beef and Wagyu utility cuts.

## Batch 2 Candidate Cuts

1. Iberico Abanico
2. Iberico Pluma
3. Iberico Coppa
4. Iberico Loin Roast
5. Iberico 4 Rib-Rack
6. Iberico St. Louis Ribs
7. Iberico Pork Belly
8. Iberico Shoulder Picnic

## Rationale

- Keeps the expansion organized by producer category.
- Gives Campo Grande stronger representation in Section 4.
- Avoids mixing too many beef and pork systems in one step.
- Uses placeholder images until client images are available.
- Keeps the current internal scroll system unchanged.
- Maintains the existing modal-to-modal bridge.

## Implementation Target

The next implementation step should:

- Add 8 new Section 4 cards using the placeholder image.
- Add matching selectedCutsModal entries.
- Add stable cut IDs in catalogData.js.
- Link all Batch 2 cuts to Campo Grande.
- Preserve the current Section 4 scroll behavior.
- Preserve the existing Producer ↔ Cut modal navigation.

## Risks

- Some names may need final client approval before launch.
- Product rows may use shorter product names like Pluma or Coppa, while the display cards should use the clearer Iberico-prefixed names.
- Placeholder images should be replaced later with final client assets.
