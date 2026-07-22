# Paragon Purveyors Live PDF Studio — Phase 0 CI Protection Completion Record

**Status:** COMPLETE

**Recorded:** July 21, 2026

**Repository:** `AUREUMPRIME/paragon-purveyors`

**Authoritative branch:** `main`

**Authoritative completion commit:** `0d2a1406245890983b52dbaf000e47b7048e71e6`

## 1. Purpose

This document records the completed and verified Phase 0 protection state for the Paragon Purveyors Monthly Specials Live PDF and future Studio system.

It is an implementation-completion record. It does not replace the Live PDF Studio superseding authority or the Studio technical specification.

Future Monthly Specials and Studio development must preserve these protections unless a later reviewed superseding authority explicitly replaces them.

## 2. Phase 0 outcome

Phase 0 established a verified production baseline and installed mutable-safe structural protection around the current Google Sheet publication system.

The completed foundation protects:

- the approved Studio visual manifest
- Studio library and production asset parity
- the four-card Monthly Specials structure
- generated HTML product-card presence
- generated JSON visual authority
- one-page US Legal PDF geometry
- the existing strict visual parity verifier
- normal GitHub Pages deployments
- Google Sheet-driven Monthly Specials publications

Legitimate business-content changes remain possible without failing routine CI.

## 3. Authority model

The active authority model remains:

~~~text
Google Sheet = business-content authority
Studio manifest = visual authority
Generated HTML / JSON / PDF = publication outputs
~~~

The Google Sheet has not been retired.

The integrated password-gated Studio migration has not started.

## 4. Approved production contract

The approved production contract remains:

- one US Legal portrait page
- HTML canvas: 816 × 1344
- PDF MediaBox: 612 × 1008
- four product cards
- eight visual slots
- seven product-image slots
- one footer slot
- Tri Tip uses one image and no secondary image
- Tenderloin secondary zoom is 1.50
- footer focus Y is 100

Approved Studio manifest SHA-256:

~~~text
02dd0ff7081363182ef2cca981216e240e7e9dec0762e4544ab60fff2e7e4649
~~~

## 5. Phase 0 commit chain

### Repository synchronization baseline

~~~text
8c20fdea280515148223ec5d2a723b249f22225a
~~~

This established the synchronized repository and publication baseline used to begin Phase 0.

### Exact historical authority baseline

~~~text
01ca9201bc4eede8e0cfbf882a3b9c681deca8f3
test: lock monthly specials Phase 0 authority baseline
~~~

This installed the immutable historical baseline fixture and exact regression test.

### Legitimate Google Sheet publication proof

~~~text
358c553f57ac4f8ac23c9b9c85701439902ed046
chore: publish monthly specials pdf
~~~

This proved that the existing Google Sheet publication system could legitimately change business content while preserving visual authority.

The verified business change was:

~~~text
Striploin secondary price: $249.00 → $449.00
~~~

### Mutable-safe structural contracts

~~~text
6d3826fcdb93e69ee84614939309a4d40d1a5c75
test: add mutable-safe monthly specials contracts
~~~

This added the routine six-test structural suite and routed the default `npm test` command to it.

### CI workflow enforcement

~~~text
0d2a1406245890983b52dbaf000e47b7048e71e6
ci: enforce monthly specials structural contracts
~~~

This installed the structural contract gate in both production workflows.

## 6. Test routing

The active routine test commands are:

~~~text
npm test
└── npm run test:specials:contracts
    └── node --test tests/monthly-specials-contracts.test.mjs
~~~

The exact historical Phase 0 baseline remains separately available:

~~~text
npm run test:specials:baseline
└── node --test tests/monthly-specials-authority.test.mjs
~~~

The exact historical baseline must not replace the mutable-safe routine suite in CI.

Legitimate business-content publications can intentionally change prices, timestamps, generated JSON hashes, and generated PDF hashes.

## 7. Mutable-safe structural contracts

The routine suite contains six contracts:

1. The Studio manifest preserves the approved production topology.
2. Studio library assets and production assets maintain byte parity.
3. Generated JSON preserves business mutability and visual authority.
4. Generated HTML contains the four current product cards.
5. Generated PDF remains one non-empty US Legal portrait page.
6. The existing strict visual parity verifier continues to pass.

The routine suite intentionally does not lock:

- business prices
- mutable business copy
- `generatedAt`
- exact generated JSON hashes
- exact generated PDF hashes

## 8. Normal GitHub Pages workflow

Workflow:

~~~text
.github/workflows/deploy.yml
~~~

Required order:

~~~text
npm ci
→ npm test
→ npm run build
→ upload Pages artifact
→ deploy Pages
~~~

Verified workflow SHA-256:

~~~text
02ebe699b4945103c275d2a68292c452bc9ba0e10ab629f5b930c3554dcf7f60
~~~

## 9. Monthly Specials publication workflow

Workflow:

~~~text
.github/workflows/publish-monthly-specials.yml
~~~

Required order:

~~~text
install dependencies
→ generate Monthly Specials outputs
→ verify visual parity
→ verify PDF geometry
→ build website
→ npm test
→ stage generated files
→ commit publication
→ push publication
→ deploy Pages
~~~

Verified workflow SHA-256:

~~~text
861c8552a3e25f9b73551ca7ac4a128b55493c4727c9e644bce1c1e9b08e5803
~~~

The structural contracts run before the publication workflow can stage, commit, or push generated output.

## 10. GitHub Actions verification

Verified deployment run:

~~~text
Run ID: 29883360367
Commit: 0d2a1406245890983b52dbaf000e47b7048e71e6
Event: push
Status: completed
Conclusion: success
~~~

Verified jobs:

~~~text
Build site: success
Deploy site: success
~~~

Verified structural contract step:

~~~text
Run Monthly Specials structural contracts
Status: completed
Conclusion: success
~~~

The Monthly Specials publication workflow remained dormant for the workflow-only commit.

## 11. Verified live production state

The following resources returned HTTP 200:

~~~text
https://paragonpurveyors.com/
https://paragonpurveyors.com/specials/
https://paragonpurveyors.com/specials/monthly-specials.html
https://paragonpurveyors.com/specials/monthly-specials.json
https://paragonpurveyors.com/specials/monthly-specials.pdf
~~~

Verified live authority hashes:

### `/specials/` index — normalized SHA-256

~~~text
bbdc2823fa48f5c8f2bd3f624f86c0ccdbfca93d8332fa0427231b37967f3ab9
~~~

### Monthly Specials HTML — normalized SHA-256

~~~text
1786827bf156cfc8ce966ae9d945efa7a6bb2317e9dae084475913ce8fc31198
~~~

### Monthly Specials JSON — normalized SHA-256

~~~text
0c32fcd372410a69dfb8e2ac2503b1575b4d4eeb3f6d01776ecc09f969643c37
~~~

### Monthly Specials PDF — exact SHA-256

~~~text
140d0a3c4168465288d52317d621e774ce386dbcdc5b9ce6168fb7903a3c3a06
~~~

The live and local canonical JSON matched.

The live and local PDF matched byte-for-byte.

Verified PDF geometry:

~~~text
Pages: 1
MediaBox: 0 0 612 1008
Orientation: US Legal portrait
~~~

## 12. Rollback and evidence

Phase 0 authority-lock archive:

~~~text
C:\Users\Psyfr\Downloads\PARAGON_P_LIVE_PDF_STUDIO_PHASE0_AUTHORITY_LOCK_20260721-174503.zip
SHA-256:
05670d6af55c651bac354cd1a5c4907c4e6858c4023549fc759c4530ea6243bf
~~~

Workflow integration rollback backup:

~~~text
C:\Users\Psyfr\Downloads\PARAGON_BEFORE_WORKFLOW_TEST_INTEGRATION_20260721-191312
~~~

Rollback must use reviewed restoration or a new revert commit.

Do not rewrite shared remote history.

## 13. Operational rules

### Generated business-content changes

A legitimate publication can change:

- prices
- business copy
- timestamps
- generated HTML
- generated JSON
- generated PDF

Routine CI must evaluate structural and visual contracts rather than requiring historical generated-output hashes.

### Workflow safety

Do not move the publication `npm test` step after the Git commit or push commands.

Do not remove the structural contract gate from the normal Pages deployment.

Do not route the default `npm test` command back to the exact historical baseline.

### Line-ending warnings

Git may display:

~~~text
LF will be replaced by CRLF the next time Git touches it
~~~

This warning was informational during Phase 0. Approved hashes, patches, tests, builds, commits, pushes, and GitHub Actions runs all passed.

## 14. Phase 0 completion declaration

Phase 0 is complete.

At commit:

~~~text
0d2a1406245890983b52dbaf000e47b7048e71e6
~~~

the repository, GitHub Actions workflows, live website, Monthly Specials HTML, canonical JSON, and PDF were synchronized and verified.

The working tree was clean.

Nothing was staged.

The normal Pages workflow passed with the structural contract gate.

The publication workflow remained dormant.

## 15. Next implementation gate

The next Live PDF Studio implementation phase must begin from commit `0d2a1406245890983b52dbaf000e47b7048e71e6` or a verified descendant.

Future Studio work must preserve:

- the six mutable-safe structural contracts
- the approved visual manifest
- production asset parity
- one-page US Legal geometry
- the existing Sheet publication system until controlled cutover
- protected GitHub Pages deployment
- a clean and reviewable commit history

No future Studio phase may silently bypass, weaken, or remove the Phase 0 protections recorded here.
