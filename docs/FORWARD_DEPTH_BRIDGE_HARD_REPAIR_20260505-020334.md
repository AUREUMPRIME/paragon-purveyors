# Forward Depth Bridge Hard Repair

- Stamp: 20260505-020334
- Status: repaired and verified
- Root cause: previous regex patch corrupted src/forwardDepth.js by deleting only part of dispatchDepthEvent, causing a Rollup parse error.

## Files changed

- src/forwardDepth.js

## Verification

- transition-start dispatch exists
- transition-complete dispatch exists
- npm run build passed

## Backup

- archive/backups/forward-depth-bridge-hard-repair-20260505-020334
