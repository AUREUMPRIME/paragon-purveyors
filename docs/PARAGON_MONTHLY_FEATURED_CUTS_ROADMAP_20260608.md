# Paragon Purveyors — Monthly Featured Cuts PDF Redesign Roadmap

Created: 2026-06-08  
Purpose: Guide the next Live PDF system update in a safe, ordered way so future ChatGPT project threads can continue without losing context.

---

## 1. Current baseline to protect

Production site:

```text
https://paragonpurveyors.com
```

Monthly Featured Cuts landing page:

```text
https://paragonpurveyors.com/specials/
```

Public PDF:

```text
https://paragonpurveyors.com/specials/monthly-specials.pdf
```

Local project path:

```text
C:\Users\Psyfr\Documents\Data\GitHub\PP Wagyu\paragon-purveyors
```

Current system status:

```text
Google Sheet-driven PDF system works.
GitHub Action publish flow works.
Custom domain works.
PDF is one page.
Title is Monthly Featured Cuts.
Copy phone buttons exist on /specials/.
Current Sheet has Instructions, Settings, Contacts, Specials, and Lookups tabs.
```

Latest known committed feature state:

```text
feat: add featured cuts landing contact actions
checkpoint/monthly-featured-cuts-contact-actions-20260608-012846
```

Do not mix this new redesign with unrelated mobile or main website work.

---

## 2. Client-requested changes

### 2.1 Replace Compare At with Marbling Score

Remove:

```text
COMPARE AT
$80/lb
```

Add in that place:

```text
MARBLING SCORE
MB 6-7

F1 Australian Wagyu
```

Requested marbling scores:

```text
Tenderloin / Filet Mignon     MB 6-7
Rib Eye                       MB 6-7
NY Strip / Striploin          MB 6-7
Tri Tip Roast                 MB 5+
```

Use the spelling:

```text
Marbling Score
```

Do not use:

```text
Marveling Score
```

---

### 2.2 Product order and names

Required product order:

```text
1. Tenderloin / Filet Mignon
2. Rib Eye
3. NY Strip / Striploin
4. Tri Tip Roast
```

---

### 2.3 New price model

The old four-price layout is no longer correct.

Required pricing:

```text
Tenderloin / Filet Mignon
Primary: 8 oz steak — $35.00
Secondary: Tenderloin AVG 5.5 lb — $260.00

Rib Eye
Primary: 12 oz steak — $34.00
Secondary: Cube Roll AVG 12–13 lb — $450.00

NY Strip / Striploin
Primary: 12 oz steak — $30.00
Secondary: Striploin AVG 12–13 lb — $390.00

Tri Tip Roast
Primary: 2-pack roast — $90.00
Secondary: blank
Note: Tri Tip only has one price because it sells by a 2-pack roast.
```

Generator rule:

```text
If secondary price or secondary label is blank, hide the second price group automatically.
```

---

### 2.4 Add savings message

Add below each cut price area:

```text
Save 20% on 5+ pieces
```

Use premium styling:
- small,
- warm accent,
- clean,
- not coupon-like,
- not overly loud.

---

### 2.5 Add brand logo / brand badge

Product brand mapping:

```text
Tenderloin / Filet Mignon     Black Opal
Rib Eye                       Black Opal
NY Strip / Striploin          Black Opal
Tri Tip Roast                 Altair
```

Important rule:

```text
Do not invent the Altair logo.
```

Implementation rule:
- audit project assets first,
- use real logos if available,
- if logo is missing, use a restrained text badge temporarily:
  - `BLACK OPAL`
  - `ALTAIR`

Recommended placement:
- near the product name,
- subtle,
- small,
- does not overpower Paragon branding.

---

### 2.6 Add F1 Australian Wagyu

Every product should include:

```text
F1 Australian Wagyu
```

Recommended placement:

```text
Below the Marbling Score block.
```

---

### 2.7 Update phone numbers

Phone numbers should not include `+1`.

Required contacts:

```text
Blake B.    (949) 303-9726
Clayton U. (949) 514-3127
```

Keep current areas unless the client changes them:

```text
Blake B.    Orange county
Clayton U. French valley / Temecula area
```

---

### 2.8 Make contact/instruction text bigger

Make these Sheet-driven messages larger and more visible in the PDF:

```text
To place an order, contact the representative closest to your area. For custom requests or larger allocations, use the website link below.
```

```text
For extended selections, wholesale programs, and custom sourcing requests, continue through the website.
```

Keep them refined and premium.

---

## 3. Recommended new Specials Sheet schema

Create a new updated Excel source file first. The user will import it into the existing Google Sheet using:

```text
File -> Import -> Upload -> Replace spreadsheet
```

Do not create a new spreadsheet.

Recommended `Specials` columns:

```text
Sort
Active
Cut ID
Display Name
Brand
Brand Logo Key
Product Line
Marbling Score
Quantity Available
Primary Price Label
Primary Price
Secondary Price Label
Secondary Price
Savings Message
Image Path
Description
Internal Notes
```

Recommended active row data:

```text
Sort: 1
Active: yes
Cut ID: tenderloin
Display Name: Tenderloin / Filet Mignon
Brand: Black Opal
Brand Logo Key: black-opal
Product Line: F1 Australian Wagyu
Marbling Score: MB 6-7
Quantity Available: 24 steaks available
Primary Price Label: 8 oz steak
Primary Price: $35.00
Secondary Price Label: Tenderloin AVG 5.5 lb
Secondary Price: $260.00
Savings Message: Save 20% on 5+ pieces
Image Path: keep current tenderloin image path
Description: keep current tenderloin description unless client provides new copy

Sort: 2
Active: yes
Cut ID: ribeye
Display Name: Rib Eye
Brand: Black Opal
Brand Logo Key: black-opal
Product Line: F1 Australian Wagyu
Marbling Score: MB 6-7
Quantity Available: 18 steaks available
Primary Price Label: 12 oz steak
Primary Price: $34.00
Secondary Price Label: Cube Roll AVG 12–13 lb
Secondary Price: $450.00
Savings Message: Save 20% on 5+ pieces
Image Path: keep current ribeye image path
Description: keep current ribeye description unless client provides new copy

Sort: 3
Active: yes
Cut ID: striploin
Display Name: NY Strip / Striploin
Brand: Black Opal
Brand Logo Key: black-opal
Product Line: F1 Australian Wagyu
Marbling Score: MB 6-7
Quantity Available: 10 steaks available
Primary Price Label: 12 oz steak
Primary Price: $30.00
Secondary Price Label: Striploin AVG 12–13 lb
Secondary Price: $390.00
Savings Message: Save 20% on 5+ pieces
Image Path: keep current striploin image path
Description: keep current striploin description unless client provides new copy

Sort: 4
Active: yes
Cut ID: tri-tip
Display Name: Tri Tip Roast
Brand: Altair
Brand Logo Key: altair
Product Line: F1 Australian Wagyu
Marbling Score: MB 5+
Quantity Available: 12 pieces available
Primary Price Label: 2-pack roast
Primary Price: $90.00
Secondary Price Label:
Secondary Price:
Savings Message: Save 20% on 5+ pieces
Image Path: keep current tri-tip image path
Description: keep current tri-tip description unless client provides new copy
```

Optional inactive rows may remain:

```text
tomahawk
chuck-tail-flap
```

---

## 4. Contacts Sheet updates

Update the `Contacts` tab:

```text
Blake B.
Location: Orange county
Phone: (949) 303-9726

Clayton U.
Location: French valley / Temecula area
Phone: (949) 514-3127
```

No `+1`.

---

## 5. Settings Sheet updates

Recommended Settings values:

```text
month = June
year = 2026
subheadline = Monthly selections for direct ordering.
footerUrl = paragonpurveyors.com
footerButtonLabel = Visit ParagonPurveyors.com
disclaimer = Pricing and availability are subject to change.
contactInstruction = To place an order, contact the representative closest to your area. For custom requests or larger allocations, use the website link below.
footerMessage = For extended selections, wholesale programs, and custom sourcing requests, continue through the website.
```

The current PDF title is code-driven:

```text
Monthly Featured Cuts
```

Do not rely on the old `headline` row unless the generator is changed.

---

## 6. Required code changes

After the new Sheet is imported and verified, patch:

```text
tools/build-monthly-specials.mjs
src/specials/monthly-specials.css
```

Generated files will update:

```text
public/specials/index.html
public/specials/monthly-specials.html
public/specials/monthly-specials.json
public/specials/monthly-specials.pdf
```

### 6.1 Generator changes

The generator must read:

```text
brand
brandLogoKey
productLine
marblingScore
primaryPriceLabel
primaryPrice
secondaryPriceLabel
secondaryPrice
savingsMessage
```

The final design should stop using:

```text
Compare At
Price Per Steak
Price 5+ Steaks
Price Per Roll
Price Per Case
```

### 6.2 Card rendering changes

Replace the current four-price layout with:

```text
Primary price group
Secondary price group, hidden if blank
Savings message
```

Replace the Compare At block with:

```text
MARBLING SCORE
MB 6-7
F1 Australian Wagyu
```

Add brand badge/logo near product name.

### 6.3 Contact/message text

Increase visibility of:
- contact instruction,
- footer message.

Keep the PDF one page.

---

## 7. Asset audit needed before code patch

Before adding brand logos, audit the project assets.

Search for:

```text
black opal
blackopal
altair
brand
logo
```

Likely asset folders:

```text
public/assets
public/assets/brand
public/assets/producers
public/assets/logos
src/assets
```

Rules:
- use real logos only if found or provided,
- do not create fake logos,
- if missing, use text badges.

---

## 8. Recommended visual layout

### Product name row

Use product name on the left and brand badge/logo near the name.

Example:

```text
Tenderloin / Filet Mignon        BLACK OPAL
```

### Price area

Use two larger price groups:

```text
8 oz steak
$35.00

Tenderloin AVG 5.5 lb
$260.00
```

For Tri Tip:

```text
2-pack roast
$90.00
```

No empty second price group.

### Meta area

Use the old Compare At space for:

```text
MARBLING SCORE
MB 6-7
F1 Australian Wagyu
```

### Savings message

Use the lower area:

```text
Save 20% on 5+ pieces
```

---

## 9. Verification checklist

### 9.1 Sheet verification

After import, verify:

```text
Tabs exist:
Instructions
Settings
Contacts
Specials
Lookups

Specials has:
Brand
Brand Logo Key
Product Line
Marbling Score
Primary Price Label
Primary Price
Secondary Price Label
Secondary Price
Savings Message

Contacts has correct phone numbers.
Only four cuts are Active = yes.
```

### 9.2 Local build verification

Run:

```powershell
npm run specials:build
npm run build
```

Verify:

```text
PDF is still 1 page.
public/specials/monthly-specials.json source.type = google.
Active cuts are tenderloin, ribeye, striploin, tri-tip.
No Compare At appears in generated HTML/PDF.
Marbling Score appears.
F1 Australian Wagyu appears.
Phone numbers do not include +1.
```

### 9.3 Visual verification

Open local PDF and check:

```text
Product order is correct.
Product names are correct.
Brand badge/logo appears.
Marbling score block replaces Compare At.
F1 Australian Wagyu appears below marbling score.
Pricing is simplified.
Tri Tip only shows one price.
Savings message appears on each card.
Contact/footer messages are larger and readable.
PDF remains premium, balanced, and one page.
```

### 9.4 Production verification

After commit and push:

```text
Wait for deploy.
Open /specials/.
Open PDF with cache bust.
Verify public JSON.
Verify PDF.
```

Cache-busted PDF:

```text
https://paragonpurveyors.com/specials/monthly-specials.pdf?b=YYYYMMDDHHMMSS
```

---

## 10. Safe implementation order

### Step 0 — Safety check

```text
Verify working tree is clean.
Pull latest origin/main.
Confirm current production works.
```

### Step 1 — Create new Excel source template

Create:

```text
Paragon_Monthly_Featured_Cuts_Source_Redesign.xlsx
```

Must include:
- new Specials columns,
- product data,
- contact phone updates,
- Settings text updates,
- Lookups updated if needed.

### Step 2 — Import the Excel file

User imports into the existing Google Sheet:

```text
File -> Import -> Upload -> Replace spreadsheet
```

Then verify:
- same Sheet URL,
- tabs exist,
- Paragon PDF menu exists,
- Check Publish Configuration passes.

### Step 3 — Asset audit

Run local read-only audit for logos.

Decide:
- real logo path,
- text badge fallback.

### Step 4 — Patch generator and CSS

Patch:
- new field parsing,
- new card layout,
- marbling/product-line block,
- simplified price groups,
- brand badge/logo,
- larger instruction/footer text.

### Step 5 — Rebuild and inspect locally

Run:
- `npm run specials:build`,
- verify one page,
- `npm run build`,
- open local PDF,
- open local `/specials/`.

### Step 6 — Commit and push

Commit message suggestion:

```text
feat: redesign featured cuts PDF card details
```

Checkpoint tag suggestion:

```text
checkpoint/monthly-featured-cuts-card-redesign-YYYYMMDD-HHMMSS
```

### Step 7 — Verify production

Final public verification:
- `/specials/` returns 200,
- PDF returns 200,
- JSON source is google,
- PDF content matches client request.

### Step 8 — Update handoff docs

Update:

```text
docs/PARAGON_LIVE_PDF_SYSTEM_HANDOFF_20260608.md
```

or create a handoff supplement with:
- new Sheet schema,
- new manual edit rules,
- new code field mapping,
- latest commit/tag.

---

## 11. Manual vs code changes after redesign

### Client/user can manually edit in Sheet

```text
Active yes/no
Sort
Display Name
Brand text
Product Line
Marbling Score
Quantity Available
Primary Price Label
Primary Price
Secondary Price Label
Secondary Price
Savings Message
Description
Contact names
Contact areas
Contact phone numbers
Settings text
```

### Code/dev changes required

```text
New column structure
New layout areas
Brand logo image support
New image assets
New cut IDs not in Lookups
PDF typography/spacing changes
Changing one-page capacity
Changing publish workflow
Changing Apps Script behavior
```

---

## 12. Do-not-touch rules

Do not change unless explicitly requested:

```text
Custom domain setup
Vite base path `/`
GitHub Pages source = GitHub Actions
Google Sheet ID
GitHub repo variable MONTHLY_SPECIALS_GOOGLE_SHEET_ID
Apps Script token/settings
Main website layout
Mobile roadmap work
```

Do not:
- create a new Google Sheet,
- change the Sheet ID,
- activate more than four cuts without a layout redesign,
- invent missing logos,
- publish unverified PDF changes,
- commit `.env.local`.

---

## 13. Risk notes

### Risk: PDF becomes too crowded

The new fields add more content. Keep the one-page layout by:
- using compact labels,
- hiding secondary price when blank,
- keeping savings message short,
- avoiding oversized logos.

### Risk: brand logos missing

Use text badges until real logo assets are provided.

### Risk: client changes active cuts

The system should respect `Active = yes/no`, but the one-page layout is designed for four active products.

### Risk: old columns remain

If the generator expects new columns but the Sheet import fails, the build should fail loudly rather than silently create a wrong PDF.

---

## 14. Definition of done

This redesign is complete only when:

```text
Updated Excel source file created.
User imported with Replace spreadsheet.
Generator reads new fields.
PDF no longer shows Compare At.
PDF shows Marbling Score and F1 Australian Wagyu.
PDF shows simplified price groups.
Tri Tip only shows one price.
Savings message appears on each product.
Brand badge/logo appears for each product.
Phone numbers are updated without +1.
Instruction/footer messages are larger.
PDF remains exactly one page.
npm run specials:build passes.
npm run build passes.
Changes are committed and tagged.
main is pushed.
Production PDF is verified at paragonpurveyors.com.
Handoff docs are updated.
```
