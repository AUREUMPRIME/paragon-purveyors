import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath) => fs.readFile(path.join(root, relativePath), "utf8");

const workflowPath = ".github/workflows/validate-live-pdf-studio-shadow.yml";
const workflow = await read(workflowPath);
const packageDocument = JSON.parse(await read("package.json"));

test("shadow workflow is dispatch-only with one exact commit input", () => {
  assert.match(workflow, /^name: Paragon Studio Shadow Validation$/mu);
  assert.match(workflow, /^run-name: Paragon Studio Shadow \$\{\{ inputs\.source_commit \}\}$/mu);
  assert.match(workflow, /^\s{2}workflow_dispatch:$/mu);
  assert.doesNotMatch(workflow, /^\s{2}(?:push|pull_request|schedule):/mu);
  assert.match(workflow, /^\s{6}source_commit:$/mu);
  assert.equal((workflow.match(/^\s{8}required: true$/gmu) ?? []).length, 1);
  assert.equal((workflow.match(/^\s{8}type: string$/gmu) ?? []).length, 1);
});

test("shadow workflow has contents-read only and no privileged permissions", () => {
  assert.match(workflow, /^permissions:\n\s{2}contents: read$/mu);
  assert.doesNotMatch(workflow, /contents:\s*write|pages:\s*write|id-token:\s*write/iu);
  assert.doesNotMatch(workflow, /actions:\s*write|packages:\s*write|issues:\s*write|pull-requests:\s*write/iu);
  assert.doesNotMatch(workflow, /secrets\.|GITHUB_TOKEN|github\.token/iu);
});

test("shadow workflow validates and checks out one exact lowercase commit", () => {
  const validation = workflow.indexOf("Validate exact source commit input");
  const checkout = workflow.indexOf("Check out exact source commit");
  assert.equal(validation >= 0 && checkout > validation, true);
  assert.match(workflow, /\^\[0-9a-f\]\{40\}\$/u);
  assert.match(workflow, /ref: \$\{\{ inputs\.source_commit \}\}/u);
  assert.match(workflow, /fetch-depth: 1/u);
  assert.match(workflow, /persist-credentials: false/u);
});

test("shadow workflow uses locked dependencies and Chromium", () => {
  assert.match(workflow, /node-version: 22/u);
  assert.match(workflow, /run: npm ci/u);
  assert.match(workflow, /npx playwright install --with-deps chromium/u);
  assert.match(workflow, /npm run studio:shadow:workflow:test/u);
});

test("shadow workflow reuses the approved isolated builder and validator", () => {
  assert.match(workflow, /build-shadow-publication\.mjs/u);
  assert.match(workflow, /validate-shadow-publication\.mjs/u);
  assert.match(workflow, /SHADOW_OUTPUT_ROOT: \$\{\{ runner\.temp \}\}\/paragon-studio-shadow/u);
  assert.equal((workflow.match(/--output "\$SHADOW_OUTPUT_ROOT"/gu) ?? []).length, 2);
});

test("shadow workflow uploads only a seven-day runner-temp artifact", () => {
  assert.match(workflow, /actions\/upload-artifact@v4/u);
  assert.match(workflow, /name: paragon-studio-shadow-\$\{\{ inputs\.source_commit \}\}/u);
  assert.match(workflow, /path: \$\{\{ runner\.temp \}\}\/paragon-studio-shadow\//u);
  assert.match(workflow, /if-no-files-found: error/u);
  assert.match(workflow, /retention-days: 7/u);
});

test("shadow workflow contains no production or remote mutation path", () => {
  for (const forbidden of [
    "prepare-production-publication.mjs",
    "promote-production-publication.mjs",
    "verify-live-publication.mjs",
    "cleanup-staging-reference.mjs",
    "actions/deploy-pages",
    "actions/upload-pages-artifact",
    "PARAGON_STUDIO_PRODUCTION_ENABLED",
    "PRODUCTION_PUBLISHING_ENABLED",
    "public/specials/monthly-specials.html",
    "public/specials/monthly-specials.json",
    "public/specials/monthly-specials.pdf",
    "wrangler deploy",
    "git push",
    "git commit",
  ]) {
    assert.equal(workflow.includes(forbidden), false, forbidden);
  }
});

test("shadow workflow has one job and never depends on the production workflow", () => {
  const jobs = [...workflow.matchAll(/^  ([a-z0-9-]+):\n\s{4}name:/gmu)].map((match) => match[1]);
  assert.deepEqual(jobs, ["validate-shadow"]);
  assert.doesNotMatch(workflow, /publish-live-pdf-studio\.yml|workflow_run|workflow_call/iu);
});

test("package scripts permanently register the shadow workflow contract", () => {
  const exact = "node --test tests/live-pdf-studio-shadow-only-workflow.test.mjs";
  assert.equal(packageDocument.scripts["studio:shadow:workflow:test"], exact);
  assert.match(
    packageDocument.scripts["studio:workflow:test"],
    /live-pdf-studio-shadow-only-workflow\.test\.mjs/u,
  );
  assert.match(
    packageDocument.scripts["test:specials:contracts"],
    /live-pdf-studio-shadow-only-workflow\.test\.mjs/u,
  );
});
