# Paragon Purveyors — Inquiry CTA Email Connection Handoff

Created: 2026-06-11 20:18:56 UTC

Purpose: Give future ChatGPT project threads the exact context and implementation direction needed to connect the Paragon Purveyors website inquiry CTA to the new Google Workspace email address.

---

## 1. Current production site

Production website:

```text
https://paragonpurveyors.com
```

The site is hosted on GitHub Pages through GitHub Actions.

Critical custom-domain build rule:

```text
Vite base path must remain /
```

Do not restore:

```text
/paragon-purveyors/
```

Do not change:

```text
GitHub Pages source = GitHub Actions
Custom domain = paragonpurveyors.com
Enforce HTTPS = enabled
Name.com GitHub DNS records
```

---

## 2. Email setup status

Google Workspace Business Starter was purchased for 3 users through Name.com.

Gmail activation completed successfully.

Domain verification completed successfully.

DKIM setup was performed through Google Workspace and Name.com DNS.

Google showed:

```text
Gmail is activated.
You verified paragonpurveyors.com.
Gmail is now ready.
```

DNS/email records added include:

```text
MX records for Google Workspace
TXT domain verification record
TXT DKIM record using google._domainkey
```

Important:
These email records should stay alongside the existing GitHub Pages DNS records.

Do not delete or replace the website DNS records:

```text
A records for GitHub Pages
CNAME for www -> aureumprime.github.io
```

---

## 3. New inquiry recipient

All website inquiry CTA flows should send or compose messages to:

```text
info@paragonpurveyors.com
```

This should become the default public inquiry destination for:

```text
Global floating CTA
Section 4 selected cut modal CTA
All Cuts modal inquiry CTA
Monthly Featured Cuts / specials inquiry flows if applicable
Any contact or pricing availability CTA
```

Preferred CTA label already used in the project:

```text
Request Pricing and Availability
```

---

## 4. Important mailbox note

The intended three addresses were originally:

```text
info@paragonpurveyors.com
clayt@paragonpurveyors.com
blake@paragonpurveyors.com
```

However, the visible Google Admin Console screenshot showed these active users:

```text
info@paragonpurveyors.com
blake@paragonpurveyors.com
clay@paragonpurveyors.com
```

Before wiring owner-specific addresses anywhere, confirm whether the Clayton address should be:

```text
clay@paragonpurveyors.com
```

or:

```text
clayt@paragonpurveyors.com
```

For now, use only:

```text
info@paragonpurveyors.com
```

as the website inquiry destination.

---

## 5. Recommended implementation strategy

Because the main website is currently static on GitHub Pages, the safest immediate implementation is:

```text
mailto-based inquiry flow
```

This means clicking the CTA opens the visitor's email client with:

```text
To: info@paragonpurveyors.com
Subject: Paragon Purveyors Inquiry
Body: structured inquiry details
```

This does not require:
- backend server,
- paid API,
- database,
- SMTP secrets in frontend,
- cloud function,
- form provider.

This is the lowest-risk option for a static GitHub Pages site.

---

## 6. Important limitation

A static GitHub Pages site cannot secretly send email directly from the browser without a backend or third-party service.

Do not put SMTP credentials, Google passwords, app passwords, API keys, or Workspace credentials in frontend code.

Never expose email-sending secrets in:

```text
src/
public/
client-side JavaScript
GitHub repository
browser-visible environment variables
```

If the client later wants a true "submit form and send email automatically" behavior, that requires a backend/form endpoint.

Recommended future options:
1. Google Apps Script web endpoint
2. Cloudflare Worker
3. Formspree or similar form backend
4. Small Node/Go backend if hosting changes

For the current static site, use `mailto:` first.

---

## 7. Search targets for implementation

Future thread should audit these files first:

```text
src/main.js
src/selectedCutsModal.js
src/styles.css
src/specials/monthly-specials.css
tools/build-monthly-specials.mjs
public/specials/index.html
```

Likely code/data targets:

```text
Request Pricing and Availability
Request Availability
Questions or Orders
data-inquiry
data-contact
mailto:
phone
Clayton
Blake
sales@
thinkculinary
paragonpurveyors
```

Do a read-only audit before patching.

---

## 8. Expected behavior for CTA

### 8.1 Basic CTA without selections

When no product selections exist, compose:

```text
To: info@paragonpurveyors.com
Subject: Paragon Purveyors Inquiry
Body:
Hello Paragon Purveyors,

I would like to request pricing and availability.

Name:
Business / Restaurant:
Phone:
Preferred contact method:
Message:

Thank you.
```

### 8.2 Selected cut inquiry

When a user selected cuts or producer programs, compose a structured email body.

Recommended body:

```text
Hello Paragon Purveyors,

I would like to request pricing and availability for the following selections:

Selected cuts:
- [Cut Name] — [Producer / Program] — [Marbling / Grade if available]

Additional notes:
[User notes if collected]

Customer details:
Name:
Business / Restaurant:
Phone:
Preferred contact method:

Source:
https://paragonpurveyors.com

Thank you.
```

### 8.3 All Cuts modal inquiry

When selections come from the All Cuts modal, include:

```text
Selected guide pages / cuts:
- [Cut Name]
- [Cut Name]
```

If the system stores producer/category context, include it.

### 8.4 Monthly Featured Cuts inquiry

If wiring `/specials/`, compose:

```text
Subject:
Paragon Monthly Featured Cuts Inquiry

Body:
Hello Paragon Purveyors,

I would like to request availability for the current Monthly Featured Cuts.

Interested cuts:
- [Cut Name] — [Price / pack info if available]

Name:
Phone:
Area:
Message:

Source:
https://paragonpurveyors.com/specials/
```

---

## 9. Recommended helper function

Add or reuse a small helper function instead of repeating mailto logic.

Suggested function shape:

```js
const INQUIRY_EMAIL = "info@paragonpurveyors.com";

function buildMailtoUrl({ subject, body }) {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  return `mailto:${INQUIRY_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;
}
```

Use it from each CTA handler.

Do not hardcode multiple scattered email destinations.

---

## 10. Suggested constants

Use clear constants:

```js
const PARAGON_INQUIRY_EMAIL = "info@paragonpurveyors.com";
const PARAGON_INQUIRY_SUBJECT = "Paragon Purveyors Inquiry";
const PARAGON_SPECIALS_INQUIRY_SUBJECT = "Paragon Monthly Featured Cuts Inquiry";
```

If there is an existing data/config area for contact info, place the constant there.

If the project has no central config file, keep the constant near existing inquiry logic and document it.

---

## 11. Accessibility and UX expectations

For `mailto:` links or buttons:

```text
Use real <a href="mailto:..."> when possible.
If using <button>, set window.location.href to the mailto URL.
Keep keyboard accessibility.
Preserve focus behavior.
Use aria-label only if visible text is not enough.
```

The CTA should make it clear that it opens an email.

Optional helper copy:

```text
Opens your email app with inquiry details prepared.
```

Do not make the CTA look like it submits a form directly unless a backend exists.

---

## 12. Privacy / security rules

Do not collect sensitive personal data.

Do not store customer inquiry data in localStorage unless the existing system already does so intentionally for saved selections.

If using localStorage for selections, keep it limited to product/cut choices.

No secrets in frontend.

No Google Workspace credentials in code.

No client passwords in docs.

No admin recovery email/phone in public files.

---

## 13. Validation checklist

After patching the website, test:

```text
pnpm build
```

Then preview locally and verify:

```text
1. Global fixed CTA opens email to info@paragonpurveyors.com
2. Section 4 cut modal CTA opens email to info@paragonpurveyors.com
3. All Cuts inquiry CTA opens email to info@paragonpurveyors.com
4. The subject is clear
5. The body includes selected cuts when selections exist
6. The body is readable and not URL-garbled after opening email client
7. No old sales@thinkculinary.com inquiry destination remains
8. No old placeholder email remains
9. No visible layout regression
10. Mobile CTA remains tappable
```

Search after patch:

```powershell
Select-String -Path "src\*.js","src\*.css","tools\*.mjs","public\**\*" -Pattern "sales@thinkculinary.com","Request Availability","mailto:" -SimpleMatch
```

Use a safer recursive audit if needed.

---

## 14. Production verification

After commit and push:

```text
Wait for GitHub Actions deployment.
Open https://paragonpurveyors.com in Incognito.
Test every CTA flow.
Confirm the generated email is addressed to info@paragonpurveyors.com.
```

If `/specials/` is also changed, verify:

```text
https://paragonpurveyors.com/specials/
https://paragonpurveyors.com/specials/monthly-specials.pdf
https://paragonpurveyors.com/specials/monthly-specials.json
```

---

## 15. Recommended commit

Suggested commit message:

```text
fix: connect inquiry CTAs to Paragon email
```

Suggested checkpoint tag:

```text
checkpoint/inquiry-email-cta-info-YYYYMMDD-HHMMSS
```

Only commit after visual and behavior approval.

---

## 16. Do-not-touch list

Do not change unless explicitly requested:

```text
Name.com DNS
Google Workspace users
MX records
DKIM record
SPF / DMARC if already added later
GitHub Pages custom domain
Vite base path
Monthly PDF system logic unrelated to inquiry CTA
Main layout/design unrelated to inquiry CTA
```

---

## 17. Future backend upgrade path

If the client later wants a real form submission instead of `mailto:`, create a separate roadmap.

Backend requirements:
- server-side email sending,
- spam protection,
- rate limiting,
- validation,
- error/success states,
- no exposed secrets,
- accessibility-compliant form feedback,
- privacy-conscious data handling.

Recommended low-cost path:

```text
Google Apps Script web app endpoint
```

or:

```text
Cloudflare Worker + email routing/provider
```

Do not implement backend sending as part of the first static CTA email connection unless explicitly requested.

---

## 18. Final direction

Connect all inquiry CTAs to:

```text
info@paragonpurveyors.com
```

Use a static-site-safe `mailto:` implementation first.

Preserve the current premium UI and do not redesign the page during this task.
