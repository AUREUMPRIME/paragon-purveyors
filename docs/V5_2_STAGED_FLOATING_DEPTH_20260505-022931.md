# V5.2 Staged Floating Depth

- Stamp: 20260505-022931
- Status: implemented
- Scope: staged blur/depth progression and subtler transition feedback

## Files changed

- src/floatingBackground.js
- src/styles.css

## Behavior

- Hero is the closest and least blurred 3D stage.
- Inquiry is the farthest and most blurred 3D stage.
- Every section has a progressive depth/blur profile.
- 3D transition timing is synced to forwardDepth.js at 1.08 seconds.
- Transition feedback uses a bell curve so it peaks mid-transition and settles by the next sweet spot.
- Object push, camera motion, rotation boost, and layer translation are intentionally subtle.

## Backup

- archive/backups/v5-2-staged-floating-depth-20260505-022931

## Browser test

Run after refresh:
window.__paragonFloatingBackground.getState()

Expected:
- mode: staged-depth
- objectCount: 10

## Verification

- npm run build passed
