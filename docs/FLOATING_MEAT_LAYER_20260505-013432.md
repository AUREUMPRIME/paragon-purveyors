# Floating Meat Background Layer

- Stamp: 20260505-013432
- Status: implemented
- Layer purpose: decorative Three.js OBJ background in front of the main background and behind page content

## Files changed

- src/main.js
- src/styles.css
- src/floatingBackground.js
- package.json and package-lock.json only if three was installed

## Asset source

- public/assets/floating-meat/composition/floating_background_layout.json
- public/assets/floating-meat/assets/full_atlas_centered
- public/assets/floating-meat/assets/textures/DRAW_texture_atlas.png

## Behavior

- Loads 10 OBJ assets from the homogeneous package.
- Uses the shared texture atlas through MTL files.
- Applies normalized 16x9 layout transforms.
- Uses seamless idle sine drift per object.
- Keeps the layer aria-hidden and pointer-events none.
- Places the layer above the main background and below content.
- Hides the layer for prefers-reduced-motion.

## Backup

- archive/backups/floating-meat-layer-20260505-013432

## Verification

- npm run build passed
