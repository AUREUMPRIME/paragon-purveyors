# Paragon Purveyors — Live PDF System Handoff

Created: 2026-06-08  
Purpose: Give future ChatGPT project threads the full context needed to continue, audit, polish, and safely modify the Paragon Purveyors live Monthly Featured Cuts PDF system.

---

## 1. Current production status

The Paragon Purveyors website is live at:

```text
https://paragonpurveyors.com
```

The Monthly Featured Cuts system is live at:

```text
Landing page:
https://paragonpurveyors.com/specials/

Public PDF:
https://paragonpurveyors.com/specials/monthly-specials.pdf

Public JSON:
https://paragonpurveyors.com/specials/monthly-specials.json
```

Final verified public checks passed:

```text
https://paragonpurveyors.com/                                  -> 200 OK
https://paragonpurveyors.com/specials/                         -> 200 OK
https://paragonpurveyors.com/specials/monthly-specials.pdf     -> 200 OK
https://paragonpurveyors.com/specials/monthly-specials.json    -> 200 OK
```

The public JSON was verified as:

```text
source.type = google
active cuts = tenderloin, ribeye, tri-tip, striploin
contact areas = Orange county, French valley/ Temecula area
```

---

## 2. Local project

Local project path:

```text
C:\Users\Psyfr\Documents\Data\GitHub\PP Wagyu\paragon-purveyors
```

Repository:

```text
https://github.com/AUREUMPRIME/paragon-purveyors
```

Primary production domain:

```text
https://paragonpurveyors.com
```

The old GitHub Pages project URL should not be used as the client-facing URL:

```text
https://aureumprime.github.io/paragon-purveyors/
```

It may still exist for technical history, but production should be verified against the custom domain.

---

## 3. Critical custom-domain rule

The site uses a custom root domain, so the Vite base path must remain:

```text
/
```

Do not restore:

```text
/paragon-purveyors/
```

Critical files:

```text
vite.config.js
.github/workflows/deploy.yml
```

Production GitHub Pages settings should remain:

```text
Settings -> Pages
Source: GitHub Actions
Custom domain: paragonpurveyors.com
Enforce HTTPS: enabled
```

Do not switch Pages back to:

```text
Deploy from a branch
```

---

## 4. Live PDF architecture

The system works like this:

```text
Google Sheet
→ Apps Script menu: Paragon PDF
→ Publish command triggers GitHub Action
→ GitHub Action reads Google Sheet CSV
→ tools/build-monthly-specials.mjs generates:
   public/specials/monthly-specials.html
   public/specials/monthly-specials.pdf
   public/specials/monthly-specials.json
   public/specials/index.html
→ GitHub Action commits generated specials files
→ GitHub Action deploys GitHub Pages directly
→ public domain updates
```

No manual VS Code rebuild is needed for normal client monthly updates.

---

## 5. Google Sheet source

Google Sheet title:

```text
Paragon Monthly Specials Source
```

Sheet ID:

```text
11L5ff5hx9gDutYyq85yOn4EaUns9Hzz5tn0x7QVZ_58
```

Editor URL:

```text
https://docs.google.com/spreadsheets/d/11L5ff5hx9gDutYyq85yOn4EaUns9Hzz5tn0x7QVZ_58/edit
```

Tabs:

```text
Instructions
Settings
Contacts
Specials
Lookups
```

Important:
- Keep the same Google Sheet file and Sheet ID.
- Do not create a new spreadsheet unless the workflow variable and Apps Script config are updated.
- If importing a replacement Excel template into the same Sheet, use `Replace spreadsheet`, not `Create new spreadsheet`.

---

## 6. Google Sheet editable fields

### 6.1 Specials tab

The client/user can safely edit:

```text
Sort
Active
Display Name
Quantity Available
Compare At
Price Per Steak
Price 5+ Steaks
Price Per Roll
Price Per Case
```

Active behavior:

```text
Active = yes -> appears in PDF
Active = no  -> hidden from PDF
```

Sort behavior:

```text
Lower Sort number appears earlier in the PDF.
```

Current active cuts:

```text
1. Tenderloin
2. Ribeye
3. Tri Tip
4. Striploin / NY Strip
```

Current inactive optional cuts:

```text
Tomahawk
Chuck Tail Flap / Denver Steak
```

Important PDF layout rule:

```text
Keep only 4 active cuts for the one-page PDF layout.
```

### 6.2 Compare At rules

The `Compare At` field is a retail reference price per pound.

Correct format:

```text
$80/lb
$75/lb
$55/lb
```

Do not use ranges:

```text
$60-$80/lb
$35-$55/lb
```

Reason:
The client clarified that `Compare At` should show one retail reference price per lb so customers understand the savings.

In the PDF, `Compare At` is rendered:
- in the open right-side space of each cut card,
- centered,
- muted,
- with only the price crossed out.

### 6.3 Contacts tab

The client/user can safely edit:

```text
Active
Name
Location
Phone
Notes
```

Current requested contact area copy:

```text
Blake B.    -> Orange county
Clayton U. -> French valley/ Temecula area
```

Phone numbers in the Sheet appear in:
- PDF contact area,
- public JSON,
- `/specials/` landing page contact cards,
- copy-phone buttons on `/specials/`.

### 6.4 Settings tab

The client/user can safely edit:

```text
month
year
subheadline
footerUrl
footerButtonLabel
footerMessage
disclaimer
contactInstruction
```

Important:
The title `Monthly Featured Cuts` is currently code-driven, not controlled by the `headline` row. Do not expect changing the old `headline` setting to change the PDF title unless the generator is updated.

---

## 7. Things that need developer/code changes

Do these in code, not only in the Sheet:

```text
- Changing the PDF/web title system
- Adding new spreadsheet columns
- Adding new Cut IDs that are not already in Lookups
- Adding or changing cut image assets
- Changing PDF layout, spacing, typography, or visual hierarchy
- Changing the Compare At layout
- Changing copy button behavior
- Changing Apps Script behavior
- Changing GitHub Action behavior
- Changing production domain, base path, or GitHub Pages deployment settings
```

---

## 8. PDF generator files

Main generator:

```text
tools/build-monthly-specials.mjs
```

PDF/landing CSS:

```text
src/specials/monthly-specials.css
```

Generated public files:

```text
public/specials/index.html
public/specials/monthly-specials.html
public/specials/monthly-specials.json
public/specials/monthly-specials.pdf
```

Brand asset used by PDF:

```text
public/assets/brand/Paragon_Purveyors_logo_text.svg
```

The generator reads Google Sheets CSV when:

```text
MONTHLY_SPECIALS_SOURCE=google
```

Local `.env.local` contains the real Sheet ID and must not be committed.

Safe example config:

```text
.env.example
```

---

## 9. GitHub Actions

### 9.1 Main site deployment

File:

```text
.github/workflows/deploy.yml
```

Important:
This workflow must keep the production base path as `/`.

### 9.2 Monthly Featured Cuts PDF publishing

File:

```text
.github/workflows/publish-monthly-specials.yml
```

The workflow:
- uses `workflow_dispatch`,
- reads the Google Sheet ID from a repository variable,
- runs `npm ci`,
- installs Playwright Chromium,
- runs `npm run specials:build`,
- verifies the generated JSON source is Google,
- verifies the PDF is one page,
- runs `npm run build`,
- commits updated `public/specials` files,
- deploys GitHub Pages directly.

Repository variable:

```text
MONTHLY_SPECIALS_GOOGLE_SHEET_ID
```

Value:

```text
11L5ff5hx9gDutYyq85yOn4EaUns9Hzz5tn0x7QVZ_58
```

Do not hardcode the Sheet ID inside the workflow file.

---

## 10. Google Apps Script

The Google Sheet has an Apps Script attached.

Menu shown in the Sheet:

```text
Paragon PDF
```

Current menu item:

```text
Publish Monthly Specials PDF
```

This still works, but it is cosmetically outdated. It can be renamed later to:

```text
Publish Monthly Featured Cuts PDF
```

Apps Script properties:

```text
GITHUB_TOKEN
GITHUB_OWNER
GITHUB_REPO
GITHUB_WORKFLOW_ID
GITHUB_BRANCH
```

Current expected values except token:

```text
GITHUB_OWNER=AUREUMPRIME
GITHUB_REPO=paragon-purveyors
GITHUB_WORKFLOW_ID=publish-monthly-specials.yml
GITHUB_BRANCH=main
```

Security note:
A partial GitHub token appeared in a screenshot during setup. The token should be regenerated once and replaced in Apps Script Properties. Do not put tokens in Sheet cells, repo files, screenshots, or chat.

---

## 11. Current PDF visual state

The PDF currently uses:
- black/luxury layout,
- Paragon mark and text logo,
- title: `Monthly Featured Cuts`,
- month/year top-right,
- four cut cards,
- product image per cut,
- retail `Compare At` in the open right-side space,
- active contact data from the Sheet,
- one-page layout.

Current PDF card fields:
- Display Name
- Quantity Available
- Price Per Steak
- Price 5+ Steaks
- Price Per Roll
- Price Per Case
- Compare At
- Description
- Image

The PDF was verified to remain exactly one page after the latest changes.

---

## 12. Current `/specials/` landing page state

The public landing page:

```text
https://paragonpurveyors.com/specials/
```

Includes:
- `Monthly Featured Cuts` headline,
- open latest PDF button,
- visit ParagonPurveyors.com button,
- direct ordering contact cards,
- copy phone buttons.

Copy buttons are intentionally web-only.

Do not add JavaScript copy buttons inside the PDF. PDF viewer JavaScript is inconsistent and not reliable across browsers/devices.

---

## 13. Important command blocks

### 13.1 Pull latest before work

```powershell
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ProjectRoot = "C:\Users\Psyfr\Documents\Data\GitHub\PP Wagyu\paragon-purveyors"
Set-Location -LiteralPath $ProjectRoot

git fetch origin main
git pull --ff-only origin main
git status --short
```

### 13.2 Build site

```powershell
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ProjectRoot = "C:\Users\Psyfr\Documents\Data\GitHub\PP Wagyu\paragon-purveyors"
Set-Location -LiteralPath $ProjectRoot

npm run build
```

### 13.3 Build PDF from Google Sheets locally

```powershell
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ProjectRoot = "C:\Users\Psyfr\Documents\Data\GitHub\PP Wagyu\paragon-purveyors"
Set-Location -LiteralPath $ProjectRoot

npm run specials:build
Start-Process -FilePath "public\specials\monthly-specials.pdf"
```

### 13.4 Verify PDF is one page

```powershell
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ProjectRoot = "C:\Users\Psyfr\Documents\Data\GitHub\PP Wagyu\paragon-purveyors"
Set-Location -LiteralPath $ProjectRoot

$PdfPath = "public\specials\monthly-specials.pdf"
$Script = Join-Path $env:TEMP "paragon-pdf-page-count.cjs"

@'
const fs = require("node:fs");
const pdfPath = process.argv[2];
const raw = fs.readFileSync(pdfPath, "latin1");
const matches = raw.match(/\/Type\s*\/Page\b/g) || [];
console.log(`PDF page count estimate: ${matches.length}`);
if (matches.length !== 1) process.exit(1);
'@ | Set-Content -LiteralPath $Script -Encoding UTF8

node $Script $PdfPath
```

### 13.5 Final public verification

```powershell
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$BaseUrl = "https://paragonpurveyors.com"
$CacheBust = Get-Date -Format "yyyyMMddHHmmss"

$Urls = @(
  "$BaseUrl/?b=$CacheBust",
  "$BaseUrl/specials/?b=$CacheBust",
  "$BaseUrl/specials/monthly-specials.pdf?b=$CacheBust",
  "$BaseUrl/specials/monthly-specials.json?b=$CacheBust"
)

foreach ($Url in $Urls) {
  Write-Host "Testing: $Url"
  $Response = Invoke-WebRequest -Uri $Url -UseBasicParsing -Method Head -TimeoutSec 25

  if ($Response.StatusCode -ne 200) {
    throw "Expected 200 OK, got $($Response.StatusCode) for $Url"
  }

  Write-Host "[OK] 200 OK"
}

$Json = Invoke-RestMethod -Uri "$BaseUrl/specials/monthly-specials.json?b=$CacheBust"

if ($Json.source.type -ne "google") {
  throw "Expected source.type to be google."
}

$CutIds = @($Json.specials | ForEach-Object { $_.cutId })
Write-Host "[OK] Source type: $($Json.source.type)"
Write-Host "[OK] Active cuts: $($CutIds -join ', ')"
```

---

## 14. Latest key commits and checkpoints

Custom domain/base path:

```text
fb05472 fix: support custom domain base path
```

Custom domain handoff doc:

```text
e76d1c9 docs: add custom domain handoff
```

Compare At / Striploin cut menu support:

```text
fd60a23 feat: add compare at support for monthly specials
checkpoint/monthly-specials-compare-at-20260608-011354
```

Monthly Featured Cuts title + `/specials/` copy phone buttons:

```text
7261a3f feat: add featured cuts landing contact actions
checkpoint/monthly-featured-cuts-contact-actions-20260608-012846
```

Older readability checkpoint:

```text
b461396 style: improve monthly specials PDF readability
checkpoint/monthly-specials-pdf-readability-20260606-181322
```

---

## 15. Known issues / notes

### 15.1 Browser/PDF cache

PDF tabs can show old content. Use cache-busted links:

```text
https://paragonpurveyors.com/specials/monthly-specials.pdf?b=YYYYMMDDHHMMSS
```

### 15.2 GitHub Pages deploy delay

After publishing, wait around 1 minute. If the workflow succeeds but the public page looks old, verify JSON with a cache-busted URL.

### 15.3 Sheet CSV delay

Google Sheets CSV export may lag briefly after edits. If a change does not appear immediately, wait and publish again.

### 15.4 Apps Script menu label

The Sheet menu item still says:

```text
Publish Monthly Specials PDF
```

It can be renamed later to:

```text
Publish Monthly Featured Cuts PDF
```

This is cosmetic only. The publish function works.

### 15.5 Token security

Regenerate the GitHub fine-grained token and replace it in Apps Script Properties because a partial token was visible in a screenshot.

---

## 16. Do-not-touch list

Do not change unless explicitly requested:

```text
Name.com DNS records
GitHub Pages custom domain
GitHub Pages source = GitHub Actions
Enforce HTTPS
Vite base path = /
.github/workflows/deploy.yml base path default
Google Sheet ID
Apps Script properties
GitHub token permissions
MONTHLY_SPECIALS_GOOGLE_SHEET_ID repo variable
```

Do not use:

```text
URL forwarding
Deploy from a branch
/paragon-purveyors/ as production base path
New Google Sheet without updating workflow variable
More than 4 active cuts without redesigning the PDF
```

---

## 17. Recommended workflow for future changes

### If the request is data-only

Make the change in Google Sheets, then publish from:

```text
Paragon PDF -> Publish Monthly Specials PDF
```

Data-only examples:
- active yes/no,
- sort order,
- prices,
- compare at values,
- quantity available,
- contact phone,
- contact area,
- contact active status.

### If the request affects layout/design/behavior

Use local dev workflow:

```text
1. git pull --ff-only origin main
2. create backup outside repo
3. patch code
4. npm run specials:build
5. verify PDF is 1 page
6. npm run build
7. visually inspect PDF and /specials/
8. commit
9. tag checkpoint
10. push
11. verify production domain
```

### If the request adds a new cut

Check:
- Does `Lookups` already include the Cut ID?
- Does the image path already exist in `public/assets/...`?
- Is the cut active?
- Does the PDF still have only 4 active cuts?
- Does the image look premium and match the current style?

If any asset or new Cut ID is missing, this is a code/template update, not just a Sheet edit.

---

## 18. Client instructions summary

Client-facing workflow:

```text
1. Open the Google Sheet.
2. Edit the Specials tab.
3. Keep only 4 cuts active.
4. Use one Compare At price per lb, for example $80/lb.
5. Review the Sheet.
6. Click Paragon PDF.
7. Click Publish Monthly Specials PDF.
8. Wait about 1 minute.
9. Open or refresh:
   https://paragonpurveyors.com/specials/monthly-specials.pdf
```

Client should not:
- delete tabs,
- rename headers,
- create a new spreadsheet,
- expose the token,
- activate more than 4 cuts without asking for a layout update.

---

## 19. Final state

The Live PDF system is functional and production-verified.

Current production feature set:

```text
Google Sheet-driven Monthly Featured Cuts PDF
Active yes/no cut control
Sort order control
Compare At price per lb
Striploin / NY Strip active
Tomahawk available as inactive option
Chuck Tail Flap retained as inactive fallback
Contact areas from Sheet
Copy phone buttons on /specials/
Direct GitHub Pages deployment from publish workflow
Custom domain live at paragonpurveyors.com
```

Future threads should preserve the existing system and make changes in the smallest safe step possible.
