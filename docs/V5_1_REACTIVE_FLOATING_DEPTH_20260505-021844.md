# V5.1 Reactive Floating Depth

- Stamp: 20260505-021844
- Status: implemented
- Scope: reactive 3D blur, depth, camera, spread, and transition feedback

## Files changed

- src/floatingBackground.js
- src/styles.css
- src/main.js only if floating background wiring was missing

## Behavior

- 3D layer listens to paragon depth transition events.
- Blur reduces during transitions so assets feel closer.
- Opacity and brightness increase subtly during movement.
- Camera performs a restrained depth push.
- Assets drift outward from center during transitions.
- Assets shift with forward/back direction.
- Rotation intensity increases briefly during transitions.
- Each main section has a subtle visual profile.

## Backup

- archive/backups/v5-1-reactive-floating-depth-20260505-021844

## Browser test

Run after refresh:
window.__paragonFloatingBackground.getState()

Expected:
- mode: reactive-depth
- objectCount: 10

## Verification

- npm run build passed
