import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath) => fs.readFile(path.join(root, relativePath), "utf8");
const workflow = await read(".github/workflows/publish-live-pdf-studio.yml");
const packageDocument = JSON.parse(await read("package.json"));
const preparation = await read("tools/paragon-live-pdf-workflow/prepare-production-publication.mjs");
const promotion = await read("tools/paragon-live-pdf-workflow/promote-production-publication.mjs");
const verification = await read("tools/paragon-live-pdf-workflow/verify-live-publication.mjs");
const cleanup = await read("tools/paragon-live-pdf-workflow/cleanup-staging-reference.mjs");
const workerPolicy = await read("tools/paragon-live-pdf-worker/src/github/policy.js");
const workerRoutes = await read("tools/paragon-live-pdf-worker/src/routes/studio.js");
const wrangler = await read("tools/paragon-live-pdf-worker/wrangler.jsonc");

test("production workflow remains explicit workflow_dispatch with the exact publication title", () => {
  assert.match(workflow, /^name: Paragon Studio Production Publish$/mu);
  assert.match(workflow, /^run-name: Paragon Studio Publish \$\{\{ inputs\.publish_id \}\}$/mu);
  assert.match(workflow, /^\s{2}workflow_dispatch:$/mu);
  assert.doesNotMatch(workflow, /^\s{2}(?:push|pull_request|schedule):/mu);
});

test("workflow grants only the three permissions required for promotion and Pages", () => {
  assert.match(workflow, /^permissions:\n\s{2}contents: write\n\s{2}pages: write\n\s{2}id-token: write$/mu);
  assert.doesNotMatch(workflow, /actions:\s*write|packages:\s*write|issues:\s*write|pull-requests:\s*write/iu);
});

test("double production gate exists and both gates remain disabled by default", () => {
  assert.match(workflow, /PARAGON_STUDIO_PRODUCTION_ENABLED: \$\{\{ vars\.PARAGON_STUDIO_PRODUCTION_ENABLED \}\}/u);
  assert.match(workflow, /if \[ "\$PARAGON_STUDIO_PRODUCTION_ENABLED" != "true" \]/u);
  assert.match(workerPolicy, /PRODUCTION_PUBLISHING_ENABLED/u);
  assert.match(workerRoutes, /PUBLISHING_DISABLED/u);
  assert.match(wrangler, /"PRODUCTION_PUBLISHING_ENABLED": "false"/u);
});

test("workflow executes gate conflict build promotion deployment verification cleanup and report in order", () => {
  const ids = ["production-gate:", "conflict-gate:", "build-shadow:", "promote-main:", "deploy-pages:", "verify-live:", "cleanup-staging:", "report-production:"];
  let previous = -1;
  for (const id of ids) {
    const current = workflow.indexOf(`\n  ${id}`);
    assert.equal(current > previous, true, id);
    previous = current;
  }
  assert.match(workflow, /promote-main:\n\s{4}name: Promote one production commit\n\s{4}needs: build-shadow/u);
  assert.match(workflow, /cleanup-staging:[\s\S]*needs:[\s\S]*verify-live/u);
});

test("build job creates shadow and exact production evidence outside the repository", () => {
  assert.match(workflow, /build-shadow-publication\.mjs/u);
  assert.match(workflow, /validate-shadow-publication\.mjs/u);
  assert.match(workflow, /prepare-production-publication\.mjs/u);
  assert.match(workflow, /PUBLICATION_EVIDENCE_ROOT: \$\{\{ runner\.temp \}\}\/paragon-studio-publication/u);
  assert.match(workflow, /--output "\$PUBLICATION_EVIDENCE_ROOT\/shadow"/u);
  assert.match(workflow, /--output "\$PUBLICATION_EVIDENCE_ROOT\/production"/u);
  assert.match(workflow, /name: paragon-studio-publication-\$\{\{ inputs\.publish_id \}\}/u);
  assert.match(workflow, /path: \$\{\{ runner\.temp \}\}\/paragon-studio-publication\//u);
  assert.match(workflow, /retention-days: 7/u);
  assert.doesNotMatch(workflow, /--output \.paragon-studio-(?:shadow|production)/u);
});

test("promotion helper creates base64 blobs one-parent commit and non-force main update", () => {
  assert.match(promotion, /encoding: "base64"/u);
  assert.match(promotion, /parents: \[baseMainSha\]/u);
  assert.match(promotion, /base_tree: draftTreeSha/u);
  assert.match(promotion, /body: \{ sha: finalCommit, force: false \}/u);
  assert.doesNotMatch(promotion, /force:\s*true|git\s+push|gh\s+api/iu);
});

test("only canonical source library assets and three generated production outputs participate", () => {
  for (const output of [
    "public/specials/monthly-specials.html",
    "public/specials/monthly-specials.json",
    "public/specials/monthly-specials.pdf",
  ]) {
    assert.match(
      preparation,
      new RegExp(output.replaceAll("/", "\\/").replaceAll(".", "\\."), "u"),
    );
  }
  assert.match(promotion, /PRODUCTION_OUTPUT_PATHS/u);
  assert.doesNotMatch(
    `${preparation}\n${promotion}`,
    /public\/specials\/index\.html|publish-monthly-specials\.yml/u,
  );
});

test("Pages deployment uses the exact promoted commit and dedicated Pages actions", () => {
  assert.match(workflow, /ref: \$\{\{ needs\.promote-main\.outputs\.final_commit \}\}/u);
  assert.match(workflow, /actions\/configure-pages@v5/u);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/u);
  assert.match(workflow, /actions\/deploy-pages@v4/u);
  assert.match(workflow, /environment:\n\s{6}name: github-pages/u);
});

test("live verifier locks canonical commit-lock and unique cache variants with bounded retries", () => {
  assert.match(verification, /name: "canonical"/u);
  assert.match(verification, /authorityLock=/u);
  assert.match(verification, /reconcile=/u);
  assert.match(verification, /attempts = 6/u);
  assert.match(verification, /attempts > 12/u);
  assert.match(verification, /MediaBox/u);
  assert.match(verification, /LIVE_JSON_INVALID/u);
});

test("staging cleanup is isolated to success dependency and publication-scoped ref", () => {
  assert.match(workflow, /cleanup-staging:[\s\S]*needs:[\s\S]*verify-live/u);
  assert.match(cleanup, /heads\/studio-publish\/\$\{normalized\}/u);
  assert.doesNotMatch(cleanup, /refs\/heads\/main|force:\s*true/u);
});

test("workflow never dispatches the protected Google publication workflow or deploys the Worker", () => {
  assert.doesNotMatch(workflow, /publish-monthly-specials\.yml|workflow\s+run|wrangler\s+deploy|cloudflare/iu);
});

test("package scripts register Phase 4F-A tests permanently", () => {
  assert.match(packageDocument.scripts["studio:production:test"], /production-promotion/u);
  assert.match(packageDocument.scripts["studio:production:test"], /production-workflow/u);
  assert.match(packageDocument.scripts["studio:workflow:test"], /production-promotion/u);
  assert.match(packageDocument.scripts["test:specials:contracts"], /production-workflow/u);
});
test("production Pages build injects the Studio Worker API base", () => {
  const deployStart = workflow.indexOf("\n  deploy-pages:");
  const verifyStart = workflow.indexOf("\n  verify-live:");

  assert.notEqual(deployStart, -1);
  assert.notEqual(verifyStart, -1);
  assert.equal(verifyStart > deployStart, true);

  const deployPages = workflow.slice(deployStart, verifyStart);

  assert.match(
    deployPages,
    /- name: Build exact promoted site[\s\S]*VITE_BASE_PATH:[\s\S]*VITE_PARAGON_STUDIO_API_BASE:[\s\S]*run: npm run build/u,
  );

  assert.equal(
    deployPages.includes(
      "VITE_PARAGON_STUDIO_API_BASE: ${{ vars.VITE_PARAGON_STUDIO_API_BASE || '' }}",
    ),
    true,
  );
});
