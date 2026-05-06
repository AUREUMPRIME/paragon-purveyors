# V3.2 Direct Button Jumps

- Stamp: 20260504-235136
- Status: implemented
- Root cause fixed: hero button jumps no longer tween through intermediate timeline labels

## Files changed

- src/forwardDepth.js

## Behavior

- View Portfolio jumps directly from Hero to Portfolio.
- Request Information jumps directly from Hero to Inquiry.
- Intermediate sections are not shown during button transitions.
- Wheel, touch, and keyboard still move one scene at a time.
- Transition uses one direct GSAP timeline between the current and target scenes.
- Mobile under 900px remains normal document flow.
- prefers-reduced-motion remains normal document flow.

## Browser debug

Run this in DevTools console:
window.__paragonForwardDepth.getState()

Expected mode:
direct-step-commit

## Backup

- archive/backups/v3-2-direct-button-jumps-20260504-235136

## Verification

- npm run build passed
