# V3.2 Forward-Depth Scaffold

- Stamp: 20260504-225512
- Status: implemented
- Scope: first V3.2 motion architecture milestone

## Files changed

- src/main.js
- src/styles.css
- src/forwardDepth.js
- package.json only if GSAP was not already installed

## Behavior

- Desktop uses a fixed-stage forward-depth GSAP timeline.
- Mobile under 900px remains normal document flow.
- prefers-reduced-motion keeps normal document flow.
- The fixed footer remains above the motion layer.

## Backup

- archive/backups/v3-2-forward-depth-scaffold-20260504-225512

## Verification

- npm run build passed
