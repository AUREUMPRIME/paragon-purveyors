import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath) => fs.readFile(path.join(root, relativePath), "utf8");
const workflowPath = ".github/workflows/publish-live-pdf-studio.yml";
const workflow = await read(workflowPath);
const packageDocument = JSON.parse(await read("package.json"));
const builder = await read("tools/paragon-live-pdf-workflow/build-shadow-publication.mjs");
const validator = await read("tools/paragon-live-pdf-workflow/validate-shadow-publication.mjs");
const conflict = await read("tools/paragon-live-pdf-workflow/validate-conflict-state.mjs");

// Phase 4F keeps every Phase 4E shadow validation contract while adding a
// separately tested production promotion path. These tests intentionally
// protect the retained shadow machinery rather than the superseded
// shadow-only workflow permissions and job count.

test("workflow remains dispatch-only with the exact publication run title", () => {
  assert.match(workflow, /^name: Paragon Studio Production Publish$/mu);
  assert.match(workflow, /^run-name: Paragon Studio Publish \$\{\{ inputs\.publish_id \}\}$/mu);
  assert.match(workflow, /^\s{2}workflow_dispatch:$/mu);
  assert.doesNotMatch(workflow, /^\s{2}(?:push|pull_request|schedule):/mu);
});

test("workflow locks the four required string inputs", () => {
  for (const name of ["publish_id", "draft_branch", "draft_commit", "base_main_sha"]) {
    assert.match(workflow, new RegExp(`^\\s{6}${name}:$`, "mu"));
  }
  assert.equal((workflow.match(/^\s{8}required: true$/gmu) ?? []).length, 4);
  assert.equal((workflow.match(/^\s{8}type: string$/gmu) ?? []).length, 4);
});

test("workflow concurrency remains publication scoped and never cancels in progress", () => {
  assert.match(workflow, /group: paragon-studio-production-\$\{\{ inputs\.publish_id \}\}/u);
  assert.match(workflow, /cancel-in-progress: false/u);
});

test("exact credential-free draft checkout and two-commit history protect conflict checks", () => {
  assert.equal((workflow.match(/ref: \$\{\{ inputs\.draft_commit \}\}/gu) ?? []).length >= 3, true);
  assert.equal((workflow.match(/fetch-depth: 2/gu) ?? []).length >= 3, true);
  assert.equal((workflow.match(/persist-credentials: false/gu) ?? []).length >= 5, true);
});

test("workflow uses Node 22 locked dependencies Chromium and the production build", () => {
  assert.match(workflow, /node-version: 22/u);
  assert.match(workflow, /run: npm ci/u);
  assert.match(workflow, /npx playwright install --with-deps chromium/u);
  assert.match(workflow, /run: npm run build/u);
});

test("pre-build and post-build conflict checks still surround the shadow build", () => {
  const pre = workflow.indexOf("--phase pre-build");
  const build = workflow.indexOf("build-shadow-publication.mjs");
  const post = workflow.indexOf("--phase post-build");
  const upload = workflow.indexOf("actions/upload-artifact@v4");
  assert.equal(pre >= 0 && build > pre && post > build && upload > post, true);
});

test("shadow and production evidence remain outside protected repository roots", () => {
  assert.match(workflow, /name: paragon-studio-publication-\$\{\{ inputs\.publish_id \}\}/u);
  assert.match(workflow, /PUBLICATION_EVIDENCE_ROOT: \$\{\{ runner\.temp \}\}\/paragon-studio-publication/u);
  assert.match(workflow, /path: \$\{\{ runner\.temp \}\}\/paragon-studio-publication\//u);
  assert.match(workflow, /if-no-files-found: error/u);
  assert.match(workflow, /retention-days: 7/u);
});

test("package scripts preserve shadow conflict contracts and add production contracts", () => {
  const workflowScript = packageDocument.scripts["studio:workflow:test"];
  for (const file of [
    "live-pdf-studio-publication-conflict.test.mjs",
    "live-pdf-studio-publication-workflow.test.mjs",
    "live-pdf-studio-production-promotion.test.mjs",
    "live-pdf-studio-production-workflow.test.mjs",
  ]) {
    assert.match(workflowScript, new RegExp(file.replaceAll(".", "\\."), "u"));
    assert.match(
      packageDocument.scripts["test:specials:contracts"],
      new RegExp(file.replaceAll(".", "\\."), "u"),
    );
  }
});

test("shadow builder locks canonical output names renderer schema assets geometry and PDF", () => {
  for (const [key, value] of Object.entries({
    html: "studio-preview.html",
    json: "studio-preview.json",
    pdf: "studio-preview.pdf",
    metadata: "publication-metadata.json",
  })) {
    assert.match(builder, new RegExp(`${key}: "${value.replaceAll(".", "\\.")}"`, "u"));
  }
  for (const marker of [
    "paragon-live-pdf-studio.schema.json",
    "adaptCanonicalDocument",
    "renderMonthlySpecialsHtml",
    "createAssetDataUrlResolver",
    "review-geometry.js",
    "format: \"Legal\"",
    "0\\s+0\\s+612\\s+1008",
  ]) {
    assert.match(builder, new RegExp(marker, "u"));
  }
});

test("shadow validator locks file hashes four cards canonical JSON and one Legal page", () => {
  for (const marker of [
    "sha256(bytes)",
    "special-card",
    "monthly-specials",
    "countPdfPages",
    "guardrailCount: 17",
    "checkedNodeCount: 42",
  ]) {
    assert.equal(validator.includes(marker), true, marker);
  }
  assert.match(validator, /0\\s\+0\\s\+612\\s\+1008/u);
  for (const source of [builder, validator]) {
    assert.equal(
      source.includes(String.raw`class="special-card"\b`),
      false,
      "card counter must not place a word boundary after the closing quote",
    );
    assert.equal(
      source.includes(String.raw`<article\s+class="special-card"(?:\s|>)`),
      true,
      "card counter must accept the rendered article tag and following attributes",
    );
  }
});

test("shadow utilities remain isolated from production outputs and remote mutation", () => {
  const combined = `${builder}\n${validator}\n${conflict}`;
  assert.doesNotMatch(combined, /public\/specials\/monthly-specials\.(?:html|json|pdf)/u);
  assert.doesNotMatch(combined, /git\s+(?:push|commit|merge|update-ref)|gh\s+api|workflow\s+run|wrangler\s+deploy/iu);
});
