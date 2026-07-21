# Paragon Visual Asset Studio

Version 4 adds an exact full-page US Legal production-context preview to the typed product and footer image workflow.

## Current image slots

- Tenderloin: primary and secondary product images
- Rib Eye: primary and secondary product images
- Striploin: primary and secondary product images
- Tri Tip: one full-height product image
- Footer: one independent B-roll image

## Production context

The **Full US Legal Page** panel uses the approved current PDF HTML and CSS at 816 × 1344 pixels. Product and footer adjustments are synchronized between the isolated controls and the full-page composition.

You can drag or use the mouse wheel directly inside either preview mode. Use **Fit Page** or **100%** to change only the Studio display scale; those controls do not alter production image crops.

## Safety boundary

The Studio does not edit the Google Sheet, renderer, fixture, PDF outputs, Git staging, commits, pushes, or publication. Export the JSON manifest for later approved integration.

## Open

```powershell
powershell -ExecutionPolicy Bypass -File ".\tools\paragon-cut-image-studio\Open-Studio.ps1"
```

Closing the Studio window or selecting **Close Studio** terminates Chromium, Node, and the local server.
