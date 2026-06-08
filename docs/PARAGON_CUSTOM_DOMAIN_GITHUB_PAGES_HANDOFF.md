# Paragon Purveyors — Custom Domain GitHub Pages Handoff

Created: 2026-06-08 02:57:23 UTC

Purpose: Give future ChatGPT project threads the exact context of how `paragonpurveyors.com` was connected to the existing GitHub Pages site, what changed in the build, what was tested, and what must not be changed accidentally.

---

## 1. Final status

The Paragon Purveyors website is now live at:

```text
https://paragonpurveyors.com
```

Final verified behavior:

```text
https://paragonpurveyors.com  -> 200 OK
http://paragonpurveyors.com   -> 301 redirect to HTTPS
```

GitHub Pages is configured with:

```text
Custom domain: paragonpurveyors.com
Source: GitHub Actions
Enforce HTTPS: enabled
DNS check: successful
```

Do not use the old GitHub Pages URL as the primary client-facing URL anymore.

---

## 2. Domain registrar / DNS provider

The domain was managed through:

```text
Name.com
```

The client purchased:

```text
paragonpurveyors.com
```

The DNS records added in Name.com were:

```text
Type: A
Host: paragonpurveyors.com
Answer: 185.199.108.153
TTL: 300

Type: A
Host: paragonpurveyors.com
Answer: 185.199.109.153
TTL: 300

Type: A
Host: paragonpurveyors.com
Answer: 185.199.110.153
TTL: 300

Type: A
Host: paragonpurveyors.com
Answer: 185.199.111.153
TTL: 300

Type: CNAME
Host: www.paragonpurveyors.com
Answer: aureumprime.github.io
TTL: 300
```

Important notes:

- No URL forwarding was used.
- Nameservers were not changed.
- `AAAA` records were not added.
- The `CNAME` answer does not include `https://`.
- The `CNAME` answer does not include `/paragon-purveyors`.

---

## 3. GitHub Pages configuration

Repository:

```text
https://github.com/AUREUMPRIME/paragon-purveyors
```

GitHub Pages settings:

```text
Settings -> Pages
Source: GitHub Actions
Custom domain: paragonpurveyors.com
Enforce HTTPS: enabled
```

Important:

Do not switch the Pages source back to `Deploy from a branch`.

This project is being published through GitHub Actions.

---

## 4. Problem encountered

After the DNS and GitHub custom domain were connected, the site loaded as a blank white page at:

```text
http://paragonpurveyors.com
```

PowerShell confirmed the domain was reaching GitHub and downloading the page, but the HTML still contained old paths:

```text
/paragon-purveyors/
```

This meant the DNS was correct, but the build was still configured for the old GitHub Pages project path:

```text
https://aureumprime.github.io/paragon-purveyors/
```

For a custom root domain, the Vite base path must be:

```text
/
```

not:

```text
/paragon-purveyors/
```

---

## 5. Files changed

Two files were changed to support the custom domain root path.

### `vite.config.js`

Changed from:

```js
const basePath = process.env.VITE_BASE_PATH || "/paragon-purveyors/";
```

To:

```js
const basePath = process.env.VITE_BASE_PATH || "/";
```

### `.github/workflows/deploy.yml`

Changed from:

```yaml
VITE_BASE_PATH: ${{ vars.VITE_BASE_PATH || '/paragon-purveyors/' }}
```

To:

```yaml
VITE_BASE_PATH: ${{ vars.VITE_BASE_PATH || '/' }}
```

Important future rule:

Do not reintroduce `/paragon-purveyors/` as the default build base while the live site uses `paragonpurveyors.com`.

If a GitHub repository variable named `VITE_BASE_PATH` exists, it must not be set to `/paragon-purveyors/` for the production custom-domain build.

---

## 6. Backup created before edits

Before patching, a backup was created at:

```text
archive/backups/backup_custom_domain_basepath_20260607-203500
```

The backup included:

```text
vite.config.js
.github/workflows/deploy.yml
```

---

## 7. Git history for this domain fix

A local commit was first created:

```text
2db4f47 fix: support custom domain base path
```

The first push was rejected because the remote had newer commits.

The local branch was rebased on top of `origin/main`.

Final successful pushed state:

```text
fb05472 main -> main
```

Final commit message:

```text
fix: support custom domain base path
```

GitHub Actions then ran successfully and deployed the site.

---

## 8. Verification commands used

### Check whether GitHub was still redirecting

```powershell
$Url = "https://aureumprime.github.io/paragon-purveyors/"
Invoke-WebRequest -Uri $Url -UseBasicParsing -MaximumRedirection 0
```

Result:

```text
Status: 200
No redirect from GitHub.
```

This proved that the earlier redirect issue was browser cache/profile related.

---

### Check custom domain HTML for old base path

```powershell
$Url = "http://paragonpurveyors.com"
$Html = (Invoke-WebRequest -Uri $Url -UseBasicParsing).Content

if ($Html -match "/paragon-purveyors/") {
    Write-Host "[FOUND] The page still contains /paragon-purveyors/ paths."
}
```

Initial result:

```text
[FOUND] The page still contains /paragon-purveyors/ paths.
```

This identified the blank page root cause.

---

### Verify local build after patch

```powershell
pnpm build

$DistRoot = "dist"
$DistMatches = Get-ChildItem -LiteralPath $DistRoot -Recurse -File |
    Select-String -Pattern "/paragon-purveyors/" -SimpleMatch -ErrorAction SilentlyContinue

if ($DistMatches) {
    Write-Host "[FAIL] Built files still contain /paragon-purveyors/"
} else {
    Write-Host "[OK] Build output no longer contains /paragon-purveyors/."
}
```

Result:

```text
[OK] Build output no longer contains /paragon-purveyors/.
```

---

### Final HTTPS verification

```powershell
$HttpsUrl = "https://paragonpurveyors.com"
$HttpUrl = "http://paragonpurveyors.com"

Invoke-WebRequest -Uri $HttpsUrl -UseBasicParsing -TimeoutSec 20
Invoke-WebRequest -Uri $HttpUrl -UseBasicParsing -MaximumRedirection 0
```

Final result:

```text
HTTPS: 200 OK
HTTP: 301 Moved Permanently
```

This is correct. HTTP redirects to HTTPS.

---

## 9. Browser cache issue encountered

After removing the custom domain during testing, the normal browser still redirected incorrectly, but Incognito worked.

PowerShell confirmed GitHub was returning `200 OK`.

Conclusion:

```text
The normal browser profile had cached the old redirect.
```

Future recommendation:

- Use Incognito for DNS/domain testing.
- Do not assume GitHub is broken if Incognito works.
- Verify with PowerShell before changing GitHub settings.

---

## 10. Future build rules

For all future Paragon Purveyors build/polish work:

1. Keep GitHub Pages source as:

```text
GitHub Actions
```

2. Keep custom domain as:

```text
paragonpurveyors.com
```

3. Keep HTTPS enforced.

4. Keep Vite base path as:

```text
/
```

5. Do not restore:

```text
/paragon-purveyors/
```

unless intentionally reverting away from the custom domain.

6. After every future deployment, test:

```text
https://paragonpurveyors.com
```

not just:

```text
https://aureumprime.github.io/paragon-purveyors/
```

7. If the site turns blank after a future build, first check for old base paths in `dist`:

```powershell
Get-ChildItem -LiteralPath "dist" -Recurse -File |
    Select-String -Pattern "/paragon-purveyors/" -SimpleMatch
```

---

## 11. Do-not-touch list

Do not change these unless explicitly requested:

```text
Name.com DNS records
GitHub Pages custom domain
GitHub Pages source
Enforce HTTPS
vite.config.js base path
.github/workflows/deploy.yml VITE_BASE_PATH default
```

Do not use:

```text
URL Forwarding
Deploy from a branch
/paragon-purveyors/ as production base path
```

---

## 12. Client-facing final wording

Use this final link with the client:

```text
https://paragonpurveyors.com
```

Suggested message:

```text
The Paragon Purveyors website is now connected to the official domain and secured with HTTPS.

Final link:
https://paragonpurveyors.com
```

---

## 13. Quick diagnosis table

| Symptom | Most likely cause | First action |
|---|---|---|
| `http://` says Not Secure | Normal HTTP behavior | Use `https://` |
| `http://` returns 301 | Correct HTTPS redirect | No fix needed |
| `https://` returns 200 | Site is working | No fix needed |
| Site is blank on custom domain | Wrong Vite base path or old deploy | Check for `/paragon-purveyors/` |
| Works in Incognito but not normal browser | Browser cache/profile redirect | Clear browser site data or test in Incognito |
| GitHub says DNS check in progress | Certificate/DNS still processing | Wait, do not change DNS |
| Enforce HTTPS unavailable | GitHub certificate not ready | Wait and refresh later |

---

## 14. Current final state summary

The custom domain migration is complete.

Final production URL:

```text
https://paragonpurveyors.com
```

The site should now be polished and developed against the custom domain root path.
