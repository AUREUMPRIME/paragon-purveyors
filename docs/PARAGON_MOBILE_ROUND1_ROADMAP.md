# Paragon Purveyors — Mobile Round 1 Fix Roadmap

Created: 2026-06-08  
Purpose: Guide the first mobile polish pass for the live Paragon Purveyors website while protecting the approved desktop experience.

---

## 1. Current production baseline

Production domain:

```text
https://paragonpurveyors.com
```

Local project path:

```text
C:\Users\Psyfr\Documents\Data\GitHub\PP Wagyu\paragon-purveyors
```

Repository:

```text
https://github.com/AUREUMPRIME/paragon-purveyors
```

Current approved commit:

```text
a7de55a fix: update contact and owner placeholders
```

Current checkpoint tag:

```text
checkpoint/contact-owner-placeholders-20260607-232038
```

Current verified production status:

```text
HTTPS: 200 OK
HTTP: 301 redirect to HTTPS
Custom domain: healthy
Vite base path: /
Old /paragon-purveyors/ base path: not deployed
Section 5 contact placeholders: deployed
Section 2 owner blank placeholders: deployed
```

Important custom-domain rule:

```text
Do not reintroduce /paragon-purveyors/ while paragonpurveyors.com is live.
```

---

## 2. Mobile QA setup

Use the real phone as the mobile source of truth.

Current working setup:

```text
ADB installed: yes
Phone detected: yes
Phone authorized: yes
Production preview: http://127.0.0.1:5191/
ADB reverse: phone tcp:5191 -> PC tcp:5191
```

Use this for final visual approval:

```text
Phone URL:
http://127.0.0.1:5191/
```

Use this for desktop protection checks:

```text
Desktop production preview:
http://127.0.0.1:5191/
```

Do not use `pnpm dev` / `localhost:5190` as the final visual approval source. It is useful for quick development, but final visual QA should use production preview after build.

---

## 3. Round 1 mobile problems reported from real phone

### Section 1 — Hero / top CTA

Observed issue:

```text
The floating CTA pill is shifted to the right on mobile.
The CTA text is overflowing outside the pill.
```

Required result:

```text
The CTA pill is centered at the top.
The text fits inside the pill.
The icon, label, and text are aligned cleanly.
There is no horizontal overflow.
Desktop CTA remains unchanged.
```

---

### Section 2 — About / owners

Observed issue:

```text
No mobile changes requested for Round 1.
```

Required result:

```text
Leave Section 2 untouched unless a mobile-only regression appears during testing.
Desktop and mobile owner placeholders must remain intact.
```

---

### Section 3 — Producer modals

Observed issue:

```text
Inside producer modals, the producer logo clips into or overlaps the title area.
The logo appears too high.
```

Required result:

```text
Producer logo sits lower and centered.
Logo and title no longer clip or overlap.
Close button remains visible and easy to tap.
CTA remains usable.
Desktop producer modal remains unchanged.
```

---

### Section 4 — Selected Cuts / All Cuts

Observed issue A:

```text
The All Cuts card/button is not centered on mobile.
```

Required result A:

```text
All Cuts card/button is centered on mobile.
Wagyu / Popular Cuts and Pork / Popular Cuts lists remain aligned.
Desktop Section 4 remains unchanged.
```

Observed issue B:

```text
The All Cuts modal layout is broken on mobile.
The index sits on top of the image/page viewer.
Text and page content clip into each other.
```

Required result B:

```text
The All Cuts modal uses a clean mobile stack:
1. Header
2. Beef/Pork buttons
3. Index area
4. Page/image viewer area below the index
5. CTA area
6. Open in New Tab link

Index and image/page viewer must not overlap.
No clipped text.
No clipped image viewer.
No hidden selected rows.
Desktop All Cuts modal remains unchanged.
```

Observed issue C:

```text
The two buttons inside the All Cuts modal appear slightly left of center.
```

Required result C:

```text
Both All Cuts modal buttons are centered.
CTA button is centered.
Open in New Tab link aligns cleanly.
Desktop modal remains unchanged.
```

---

### Section 5 — Contact / inquiry

Observed issue A:

```text
When a modal redirects to Section 5, the site immediately jumps back to Section 1.
Example: Producer modal -> Create Inquiry Message -> Section 5 -> automatic jump to Section 1.
```

Required result A:

```text
Create Inquiry Message redirects to Section 5 and stays there.
No automatic jump back to Section 1.
Producer modal inquiry flow works.
All Cuts modal inquiry flow works.
Desktop section navigation remains stable.
```

Observed issue B:

```text
Section 5 feels too small on mobile.
The message area is hard to read.
There appears to be enough top and bottom space to enlarge the section.
```

Required result B:

```text
Section 5 mobile panel uses more available vertical space.
Contact rows remain readable.
Form area is larger.
Message field is clearly visible.
Bottom navigation does not cover important content.
Desktop Section 5 remains unchanged.
```

---

## 4. Recommended fix order

### Step 0 — Read-only audit

Goal:

```text
Find exact selectors and JavaScript functions before editing.
```

Audit targets:

```text
Floating CTA pill selectors
Hero mobile layout selectors
Producer modal header/logo/title selectors
All Cuts card/button selectors
All Cuts modal index/page viewer/button selectors
Section 5 redirect/navigation functions
Section 5 mobile layout selectors
Scroll snap / active scene / scene navigation logic
```

Acceptance:

```text
No files changed.
Exact source locations identified.
Clear patch plan prepared.
```

---

### Step 1 — Fix Section 5 redirect bug first

Reason:

```text
This is functional, not visual.
Mobile QA cannot be trusted if navigation jumps away from Section 5 automatically.
```

Likely areas to audit:

```text
Scene navigation
Scroll snap logic
Active section observer
Modal close behavior
Inquiry message creation handler
Scroll restoration code
Bottom navigation state sync
```

Acceptance:

```text
Producer modal -> Create Inquiry Message -> Section 5 and stays there.
All Cuts modal -> Create Inquiry Message -> Section 5 and stays there.
No automatic return to Section 1.
Desktop navigation still works.
pnpm build passes.
Phone production preview passes.
Desktop production preview passes.
```

---

### Step 2 — Fix global mobile floating CTA pill

Reason:

```text
The pill appears across sections and is visibly broken on mobile.
```

Recommended approach:

```text
Use mobile-only CSS.
Constrain width with max-width.
Center with left: 50% and transform, or equivalent existing layout-safe method.
Ensure text truncates or scales inside the pill instead of overflowing.
Do not change desktop positioning.
```

Acceptance:

```text
CTA pill centered at top on phone.
Text fits inside the pill.
No horizontal overflow.
Desktop CTA unchanged.
pnpm build passes.
```

---

### Step 3 — Fix Section 3 producer modal header/logo spacing

Reason:

```text
This is isolated and visible in the producer modal.
```

Recommended approach:

```text
Use mobile-only modal CSS.
Add top padding / header spacing.
Constrain logo height.
Center logo.
Prevent logo/title overlap.
Keep close button tappable.
```

Acceptance:

```text
Black Opal logo no longer clips.
Producer title/logo area looks intentional.
Close button remains usable.
CTA remains visible.
Desktop producer modal unchanged.
pnpm build passes.
```

---

### Step 4 — Fix Section 4 All Cuts card/button centering

Reason:

```text
This is a simpler alignment issue and should be solved before the modal layout.
```

Recommended approach:

```text
Use mobile-only CSS scoped to Section 4 / All Cuts card.
Avoid global card changes.
Protect product cards.
```

Acceptance:

```text
All Cuts card/button is centered.
Wagyu and Pork lists still align correctly.
Desktop Section 4 unchanged.
pnpm build passes.
```

---

### Step 5 — Fix Section 4 All Cuts modal mobile layout

Reason:

```text
This is the largest visual problem and should be handled carefully after simpler fixes.
```

Recommended mobile structure:

```text
Header
Beef/Pork selector buttons
Index block
Page/image viewer block
Footer CTA
Open in New Tab
```

Important rule:

```text
Do not overlay the index on top of the page image on mobile.
```

Recommended approach:

```text
Use mobile-only CSS and, only if necessary, minimal JS class hooks.
Prefer layout stacking over absolute overlays.
Avoid changing desktop modal structure.
Make each scroll area intentional.
Prevent nested scroll traps where possible.
```

Acceptance:

```text
Index is clearly above the image/page viewer.
Image/page viewer sits below index.
No clipping between index and images.
Both selector buttons centered.
CTA centered.
Open in New Tab aligned cleanly.
Desktop All Cuts modal unchanged.
pnpm build passes.
```

---

### Step 6 — Resize Section 5 mobile layout

Reason:

```text
After redirect behavior is stable, improve readability and usable form space.
```

Recommended approach:

```text
Use mobile-only CSS.
Increase panel usable height.
Reduce unnecessary vertical gaps only where safe.
Allow the form/message area to breathe.
Preserve contact card readability.
Protect bottom nav clearance.
```

Acceptance:

```text
Section 5 feels larger and more readable.
Message field is clearly visible.
Form and contact details do not clip.
Bottom nav does not cover form controls.
Desktop Section 5 unchanged.
pnpm build passes.
```

---

## 5. Protection rules

Do not touch unless explicitly requested:

```text
Name.com DNS records
GitHub Pages custom domain
GitHub Pages source = GitHub Actions
Enforce HTTPS
vite.config.js base path
.github/workflows/deploy.yml VITE_BASE_PATH default
Google Sheet ID
Monthly Specials PDF workflow
Desktop layouts
Provider/cut data
Contact placeholder data already approved
Section 2 owner placeholders already approved
```

Do not reintroduce:

```text
/paragon-purveyors/
+1 (949) 514-3127
John D.
Number pending
assets/owners/clayton-u-placeholder.webp in src/main.js
assets/owners/blake-b-placeholder.webp in src/main.js
```

---

## 6. Patch rules

Every mobile patch must follow this process:

```text
1. Backup files before editing.
2. Patch only the required files.
3. Use mobile-only CSS wherever possible.
4. Avoid global selectors.
5. Run pnpm build.
6. Check phone at http://127.0.0.1:5191/
7. Check desktop at http://127.0.0.1:5191/
8. Commit only after both pass.
```

Preferred CSS scope:

```css
@media (max-width: 767px) {
  /* mobile-only rules */
}

@media (hover: none) and (pointer: coarse) {
  /* touch-specific rules when needed */
}
```

Avoid:

```text
Global typography changes
Desktop media query changes
Shared modal logic changes unless required for the redirect bug
Large rewrites
Unverified assumptions about generated DOM
```

---

## 7. Verification commands

### Build

```powershell
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ProjectRoot = "C:\Users\Psyfr\Documents\Data\GitHub\PP Wagyu\paragon-purveyors"
Set-Location -LiteralPath $ProjectRoot

pnpm build
```

### Start production preview

```powershell
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ProjectRoot = "C:\Users\Psyfr\Documents\Data\GitHub\PP Wagyu\paragon-purveyors"
Set-Location -LiteralPath $ProjectRoot

pnpm preview -- --host 127.0.0.1 --port 5191
```

### Connect phone to production preview

```powershell
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

adb devices
adb reverse tcp:5191 tcp:5191
adb shell am start -a android.intent.action.VIEW -d "http://127.0.0.1:5191/"
```

### Protect custom-domain base path

```powershell
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ProjectRoot = "C:\Users\Psyfr\Documents\Data\GitHub\PP Wagyu\paragon-purveyors"
Set-Location -LiteralPath $ProjectRoot

$Matches = Get-ChildItem -LiteralPath $ProjectRoot -Recurse -File -Include *.js,*.css,*.html,*.yml,*.json,*.ts |
  Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\dist\\" -and
    $_.FullName -notmatch "\\archive\\"
  } |
  Select-String -Pattern "/paragon-purveyors/" -SimpleMatch -ErrorAction SilentlyContinue

if ($Matches) {
  $Matches | ForEach-Object {
    Write-Host ("{0}:{1}: {2}" -f $_.Path.Replace($ProjectRoot + "\", ""), $_.LineNumber, $_.Line.Trim())
  }
  throw "Old GitHub Pages base path found."
}

Write-Host "[OK] No old /paragon-purveyors/ base path found."
```

---

## 8. Commit strategy

For Round 1, prefer separate commits by risk area:

```text
1. fix: stabilize mobile inquiry navigation
2. fix: align mobile floating cta
3. fix: improve mobile producer modal header
4. fix: center mobile all cuts entry
5. fix: improve mobile all cuts modal layout
6. fix: expand mobile inquiry section
```

If fixes are very small and verified together, combine only related changes. Do not mix redirect logic with large modal layout work unless the code requires it.

Recommended checkpoint tag after all Round 1 changes pass:

```text
checkpoint/mobile-round-1-polish-YYYYMMDD-HHMMSS
```

---

## 9. Final production verification after Round 1

After push and GitHub Actions deploy:

```text
1. Verify https://paragonpurveyors.com on desktop.
2. Verify https://paragonpurveyors.com on the real phone.
3. Confirm Section 1 top CTA.
4. Confirm Section 3 producer modal header.
5. Confirm Section 4 All Cuts card.
6. Confirm Section 4 All Cuts modal.
7. Confirm Section 5 redirect behavior.
8. Confirm Section 5 layout/readability.
9. Run live smoke test for HTTPS and deployed assets if code changes affect bundles.
```

Live domain expected behavior:

```text
https://paragonpurveyors.com -> 200 OK
http://paragonpurveyors.com  -> 301 redirect to HTTPS
```

---

## 10. Round 1 definition of done

Round 1 is complete only when:

```text
Phone production preview passes.
Desktop production preview passes.
pnpm build passes.
Working tree is clean after commit.
Checkpoint tag is created.
main is pushed to origin.
Production deploy is verified.
No old base path is deployed.
No approved desktop layout regresses.
```

Final note:

```text
Work one issue at a time.
Assume failure first.
Audit exact selectors before patching.
Use the real phone as the mobile source of truth.
Protect the approved desktop experience at every step.
```
