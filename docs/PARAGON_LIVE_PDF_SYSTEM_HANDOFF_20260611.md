# Paragon Purveyors — Live PDF System Handoff

Updated: 2026-06-11

## Current source of truth

The Live PDF system now uses the Google Sheet owned by info@paragonpurveyors.com.

Active Sheet ID:
1QF7JYwLYIpPTDA3tVSoir3w8xn-Qd-8myPe-TBjGJVs

Live URLs:
https://paragonpurveyors.com/specials/
https://paragonpurveyors.com/specials/monthly-specials.pdf
https://paragonpurveyors.com/specials/monthly-specials.json

Current publish flow:
info@paragonpurveyors.com Google Sheet -> Paragon PDF -> Publish Live PDF -> GitHub Actions -> paragonpurveyors.com/specials/

## Apps Script setup

Apps Script project name:
Paragon Purveyors Live PDF Publisher

Google Sheet menu:
Paragon PDF

Menu items:
Publish Live PDF
Check Publish Configuration

Required Script Properties:
GITHUB_OWNER = AUREUMPRIME
GITHUB_REPO = paragon-purveyors
GITHUB_WORKFLOW_ID = publish-monthly-specials.yml
GITHUB_BRANCH = main
GITHUB_TOKEN = stored privately in Apps Script Properties

Important: never paste, commit, screenshot, or expose the GitHub token.

## Current Sheet structure and live data

Required tabs:
Instructions
Settings
Contacts
Specials
Lookups

Current active cuts:
1. tenderloin — MB 6-7 — F1 Australian Wagyu — $35.00
2. ribeye — MB 6-7 — F1 Australian Wagyu — $34.00
3. striploin — MB 6-7 — F1 Australian Wagyu — $30.00
4. tri-tip — MB 5+ — F1 Australian Wagyu — $90.00

Current verified contacts:
Blake B. — Irvine / Orange County — (949) 303-9726
Clayton U. — French Valley / Temecula Area — (949) 514-3127

Rule: keep only 4 active cuts for the current one-page PDF layout.
Rule: contact phone numbers should not include +1.

## Current PDF campaign header

Current public PDF header:
World Cup Deals
Free Delivery

Campaign image asset:
public/specials/tournaments_fifa-world-cup-2026--white_1500x1500.football-logos.cc.png

Important note: the World Cup/FIFA-style image should only remain public if the client is comfortable with its commercial-use risk.

## GitHub workflow details

The live PDF workflow reads the Sheet ID from this GitHub repo variable:
MONTHLY_SPECIALS_GOOGLE_SHEET_ID

Current required value:
1QF7JYwLYIpPTDA3tVSoir3w8xn-Qd-8myPe-TBjGJVs

Main workflow file:
.github/workflows/publish-monthly-specials.yml

Main generator file:
tools/build-monthly-specials.mjs

Main PDF CSS file:
src/specials/monthly-specials.css

Rule: if live PDF ever shows old Sheet data, check MONTHLY_SPECIALS_GOOGLE_SHEET_ID first.

## Custom domain and deployment rules

Production domain:
https://paragonpurveyors.com

GitHub Pages must remain:
Source: GitHub Actions
Custom domain: paragonpurveyors.com
Enforce HTTPS: enabled

Vite base path must remain:
/

Do not restore the old GitHub Pages base path:
/paragon-purveyors/

Rule: do not change DNS, GitHub Pages source, or Vite base path unless explicitly requested.

## Standard client update workflow

1. Open the Google Sheet in info@paragonpurveyors.com Drive.
2. Edit only safe data fields.
3. Keep only 4 cuts active.
4. Do not rename tabs or headers.
5. Click Paragon PDF.
6. Click Publish Live PDF.
7. Wait about 1 minute.
8. Verify the live PDF or JSON.

Live verification URLs:
https://paragonpurveyors.com/specials/
https://paragonpurveyors.com/specials/monthly-specials.pdf
https://paragonpurveyors.com/specials/monthly-specials.json

## Do-not-touch rules

Do not change these unless explicitly requested:

- Name.com DNS
- Google Workspace email DNS
- GitHub Pages source
- GitHub Pages custom domain
- Vite base path
- Apps Script token
- GitHub token permissions
- MONTHLY_SPECIALS_GOOGLE_SHEET_ID
- Sheet tab names
- Sheet column headers
- More than 4 active cuts
