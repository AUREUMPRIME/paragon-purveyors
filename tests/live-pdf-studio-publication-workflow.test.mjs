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

test("workflow identity is dispatch-only with exact run title", () => {
  assert.match(workflow, /^name: Paragon Studio Shadow Publish$/mu);
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

test("workflow permissions remain contents-read only without environments or secrets", () => {
  assert.match(workflow, /^permissions:\n\s{2}contents: read$/mu);
  assert.doesNotMatch(workflow, /pages:\s*write|id-token:\s*write|contents:\s*write|environment:|secrets\./iu);
});

test("workflow concurrency is publication scoped and never cancels in progress", () => {
  assert.match(workflow, /group: paragon-studio-shadow-\$\{\{ inputs\.publish_id \}\}/u);
  assert.match(workflow, /cancel-in-progress: false/u);
});

test("workflow exposes exact validation build and report jobs with dependencies", () => {
  for (const name of ["Validate draft", "Build shadow", "Report shadow"]) {
    assert.match(workflow, new RegExp(`name: ${name.replaceAll(" ", "\\s")}`, "u"));
  }
  assert.match(workflow, /build-shadow:\n\s{4}name: Build shadow\n\s{4}needs: validate-draft/u);
  assert.match(workflow, /report-shadow:\n\s{4}name: Report shadow\n\s{4}needs: build-shadow/u);
});

test("checkout is exact credential-free and uses two-commit history", () => {
  assert.equal((workflow.match(/ref: \$\{\{ inputs\.draft_commit \}\}/gu) ?? []).length, 2);
  assert.equal((workflow.match(/fetch-depth: 2/gu) ?? []).length, 2);
  assert.equal((workflow.match(/persist-credentials: false/gu) ?? []).length, 2);
});

test("workflow uses Node 22 locked dependencies and Chromium only", () => {
  assert.match(workflow, /node-version: 22/u);
  assert.match(workflow, /run: npm ci/u);
  assert.match(workflow, /npx playwright install --with-deps chromium/u);
  assert.match(workflow, /run: npm run build/u);
});

test("pre-build and post-build conflict checks surround the shadow build", () => {
  const pre = workflow.indexOf("--phase pre-build");
  const build = workflow.indexOf("build-shadow-publication.mjs");
  const post = workflow.indexOf("--phase post-build");
  const upload = workflow.indexOf("actions/upload-artifact@v4");
  assert.equal(pre >= 0 && build > pre && post > build && upload > post, true);
});

test("shadow artifact identity and seven-day retention are exact", () => {
  assert.match(workflow, /name: paragon-studio-shadow-\$\{\{ inputs\.publish_id \}\}/u);
  assert.match(workflow, /path: \.paragon-studio-shadow\//u);
  assert.match(workflow, /if-no-files-found: error/u);
  assert.match(workflow, /retention-days: 7/u);
});

test("workflow contains no main promotion Pages deployment or branch cleanup commands", () => {
  assert.doesNotMatch(
    workflow,
    /git\s+(?:add|commit|push|merge|reset|revert|branch\s+-d|update-ref)|actions\/deploy-pages|configure-pages|upload-pages-artifact|wrangler\s+deploy/iu,
  );
});

test("package scripts register 28 workflow contracts and permanent integration", () => {
  assert.equal(
    packageDocument.scripts["studio:workflow:test"],
    "node --test tests/live-pdf-studio-publication-conflict.test.mjs tests/live-pdf-studio-publication-workflow.test.mjs",
  );
  const permanent = packageDocument.scripts["test:specials:contracts"];
  assert.match(permanent, /live-pdf-studio-publication-conflict\.test\.mjs/u);
  assert.match(permanent, /live-pdf-studio-publication-workflow\.test\.mjs/u);
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

test("workflow utilities remain isolated from production outputs and remote mutation", () => {
  const combined = `${builder}\n${validator}\n${conflict}`;
  assert.doesNotMatch(combined, /public\/specials\/monthly-specials\.(?:html|json|pdf)/u);
  assert.doesNotMatch(combined, /git\s+(?:push|commit|merge|update-ref)|gh\s+api|workflow\s+run|wrangler\s+deploy/iu);
});
