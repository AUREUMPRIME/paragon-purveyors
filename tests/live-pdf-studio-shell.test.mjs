import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");

const read = (relativePath) =>
  fs.readFile(path.join(projectRoot, relativePath), "utf8");


const exists = async (relativePath) => {
  try {
    await fs.access(path.join(projectRoot, relativePath));
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
};
test("permanent Studio shell exposes the locked eight-section navigation", async () => {
  const navigation = await read("src/live-pdf-studio/navigation.js");
  const labels = [
    "Overview",
    "Header & Campaign",
    "Featured Cuts",
    "Logos & Marks",
    "Contacts",
    "Footer",
    "Asset Library",
    "Review & Publish",
  ];

  assert.equal(
    (navigation.match(/label:/g) || []).length,
    8,
  );

  for (const label of labels) {
    assert.match(navigation, new RegExp(`label: "${label.replace(/[&]/g, "\\&")}"`));
  }
});

test("permanent Studio shell uses the locked client actions without legacy developer actions", async () => {
  const shell = await read("src/live-pdf-studio/shell.js");

  for (const label of [
    "Asset Library",
    "Restore Live Version",
    "Save Draft",
    "Review PDF",
    "Publish Live PDF",
  ]) {
    assert.ok(shell.includes(`label: "${label}"`) || shell.includes(label));
  }

  for (const forbidden of [
    "Refresh Library",
    "Restore Approved",
    "Save Settings",
    "Export JSON",
    "Close Studio",
    "explorer.exe",
    "/api/open-library",
  ]) {
    assert.equal(shell.includes(forbidden), false, forbidden);
  }
});

test("Asset Library is an in-Studio workspace and never a File Explorer action", async () => {
  const shell = await read("src/live-pdf-studio/shell.js");
  const main = await read("src/live-pdf-studio/main.js");

  assert.match(shell, /data-asset-library-dialog/);
  assert.match(shell, /Upload, organize, assign, archive, and remove/);
  assert.doesNotMatch(shell, /explorer\.exe|\/api\/open-library/);
  assert.match(main, /assetDialog\.showModal\(\)/);
  assert.doesNotMatch(main, /fetch\("\/api\/open-library"/);
});

test("Review PDF keeps full-screen geometry while Publish follows runtime Studio authority", async () => {
  const shell = await read("src/live-pdf-studio/shell.js");
  const review = await read("src/live-pdf-studio/review-dialog.js");
  const styles = await read("src/live-pdf-studio/styles.css");

  assert.match(shell, /data-review-dialog/);
  assert.match(
    shell,
    /data-live-authority-src="\/specials\/monthly-specials\.html"/,
  );
  assert.match(shell, /data-studio-action="publish"/);
  assert.match(shell, /setPublishingState/);
  assert.match(review, /getPublishingEnabled/);
  assert.match(review, /Number\(availableWidth\) \/ PAGE_WIDTH/);
  assert.match(review, /Number\(availableHeight\) \/ PAGE_HEIGHT/);
  assert.match(styles, /height: 100vh/);
  assert.match(styles, /place-items: center/);
  assert.match(styles, /overflow: hidden/);
});

test("production /specials/ is owned by the password-gated Studio entry", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const viteConfig = await read("vite.config.js");
  const studioEntry = await read("specials/index.html");

  assert.equal(
    packageJson.scripts["studio:dev"],
    "vite --host 127.0.0.1 --port 5190 --strictPort",
  );
  assert.match(
    packageJson.scripts["test:specials:contracts"],
    /tests\/live-pdf-studio-shell\.test\.mjs/,
  );
  assert.match(viteConfig, /rollupOptions/);
  assert.match(
    viteConfig,
    /specials:\s*resolve\(projectRoot,\s*"specials\/index\.html"\)/,
  );
  assert.match(studioEntry, /id="studio-app"/);
  assert.match(studioEntry, /src="\/src\/live-pdf-studio\/main\.js"/);
  assert.match(studioEntry, /noindex,\s*nofollow/);
  assert.equal(
    await exists("public/specials/index.html"),
    false,
    "The obsolete static landing page must not override the Studio entry.",
  );

  for (const outputPath of [
    "public/specials/monthly-specials.pdf",
    "public/specials/monthly-specials.html",
    "public/specials/monthly-specials.json",
  ]) {
    assert.equal(await exists(outputPath), true, `${outputPath} must remain public.`);
  }
});
test("RUPERT-SYSTEMS blocks Studio interaction until MISSION PASS Close and connection light uses semantic publication tones", async () => {
  const shell = await read("src/live-pdf-studio/shell.js");
  const styles = await read("src/live-pdf-studio/styles.css");
  const main = await read("src/live-pdf-studio/main.js");

  assert.match(shell, /data-publication-progress-dialog/);
  assert.match(shell, /RUPERT-SYSTEMS/);
  assert.match(shell, /MISSION PASS/);
  assert.match(shell, /MISSION FAIL/);
  assert.match(shell, /"████████"/);
  assert.match(shell, /"XXXXXXXX"/);
  assert.match(shell, /dataset\.scanTone/);
  assert.match(shell, /data-publication-progress-close/);
  assert.match(shell, /publicationProgressClose\.disabled = !terminal/);
  assert.match(shell, /publicationProgressDialog\.showModal\(\)/);
  assert.match(shell, /event\.preventDefault\(\)/);
  assert.match(shell, /dataConnectionTone|connectionTone|dataset\.connectionTone/);

  assert.match(main, /navigationController\.setActive\("overview"\)/);

  assert.match(styles, /\.connection-dot\[data-connection-tone="ok"\]/);
  assert.match(styles, /\.connection-dot\[data-connection-tone="warning"\]/);
  assert.match(styles, /\.connection-dot\[data-connection-tone="problem"\]/);
  assert.match(styles, /\.publication-progress-dialog\[open\]/);
  assert.match(
    styles,
    /\.publication-progress-dialog\[data-publication-state="failed"\][\s\S]*\.publication-progress-dialog__mission/,
  );
  assert.match(
    styles,
    /\.publication-progress-dialog\[data-publication-state="conflict"\][\s\S]*\.publication-progress-dialog__mission/,
  );
  assert.match(styles, /#ef7075/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
