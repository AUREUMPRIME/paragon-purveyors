import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  createReviewAssetPathIndex,
  createReviewAssetResolver,
  createReviewPreview,
} from "../src/live-pdf-studio/review-preview.js";
import {
  createReviewValidation,
  inspectReviewFrameImages,
  SECURE_PUBLISHING_WARNING,
} from "../src/live-pdf-studio/review-validation.js";
import {
  getReviewStatus,
  STUDIO_SECTION_STATUS,
} from "../src/live-pdf-studio/status-model.js";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath) =>
  fs.readFile(path.join(root, relativePath), "utf8");
const fixture = async () =>
  JSON.parse(
    await read("src/data/paragon-live-pdf-studio.json"),
  );

const imageDataUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'/%3E";

test("Review asset path index maps every canonical asset path to its immutable ID", async () => {
  const document = await fixture();
  const index = createReviewAssetPathIndex(document);
  assert.equal(index.size, 13);
  assert.equal(
    index.get(
      "assets/specials/library/tenderloin/filet-mignon2-436ae92089e2.webp",
    ),
    "asset_tenderloin_436ae92089e2",
  );
});

test("Review asset resolver prefers pending object URLs and resolves committed paths against the Studio origin", async () => {
  const document = await fixture();
  const pendingId = "asset_tenderloin_436ae92089e2";
  const resolver = createReviewAssetResolver({
    document,
    baseUrl: "http://127.0.0.1:5190",
    assetPreviewResolver: {
      getUrl(_document, assetId) {
        return assetId === pendingId
          ? "blob:pending-tenderloin"
          : "";
      },
    },
  });
  assert.equal(
    await resolver(document.assetLibrary[pendingId].path),
    "blob:pending-tenderloin",
  );
  assert.equal(
    await resolver("assets/brand/paragon-cow-mark.svg"),
    "http://127.0.0.1:5190/assets/brand/paragon-cow-mark.svg",
  );
});

test("Review preview renders the current in-memory draft through the shared adapter and renderer", async () => {
  const document = await fixture();
  document.header.month.value = "August";
  const preview = createReviewPreview({
    getDraft: () => structuredClone(document),
    baseUrl: "http://127.0.0.1:5190",
    fetchImpl: async () => ({
      ok: true,
      text: async () => "body{background:#fff}",
    }),
    assetPreviewResolver: {
      getUrl: () => imageDataUrl,
      getPendingAssetIds: () => new Set(["asset-local"]),
    },
  });
  const result = await preview.render();
  assert.match(result.html, /August/);
  assert.match(result.html, /body\{background:#fff\}/);
  assert.equal(result.assetCount, 13);
  assert.equal(result.pendingAssetCount, 1);
  assert.ok(result.draftFingerprint.length > 100);
});

test("Review preview caches shared CSS until explicitly cleared", async () => {
  const document = await fixture();
  let fetchCount = 0;
  const preview = createReviewPreview({
    getDraft: () => structuredClone(document),
    baseUrl: "http://127.0.0.1:5190",
    fetchImpl: async () => {
      fetchCount += 1;
      return { ok: true, text: async () => "body{}" };
    },
    assetPreviewResolver: {
      getUrl: () => imageDataUrl,
      getPendingAssetIds: () => new Set(),
    },
  });
  await preview.render();
  await preview.render();
  assert.equal(fetchCount, 1);
  preview.clearCssCache();
  await preview.render();
  assert.equal(fetchCount, 2);
});

test("Review validation converts content, visual, and asset issues into blocking errors", () => {
  const result = createReviewValidation({
    draftFingerprint: "draft-a",
    editorValidation: {
      issues: [
        { section: "header", kind: "missing", message: "Month is required." },
        { section: "assets", kind: "error", message: "Asset missing." },
      ],
    },
  });
  assert.equal(result.errorCount, 2);
  assert.equal(result.warningCount, 1);
  assert.equal(result.isValid, false);
  assert.equal(result.draftFingerprint, "draft-a");
});

test("Review validation reports renderer failures as blocking errors", () => {
  const result = createReviewValidation({
    renderError: new Error("Adapter failed"),
  });
  assert.equal(result.errorCount, 1);
  assert.match(result.errors[0].message, /Adapter failed/);
  assert.equal(result.rendered, false);

  const repeated = createReviewValidation({
    editorValidation: {
      issues: [SECURE_PUBLISHING_WARNING],
    },
  });
  assert.equal(repeated.errorCount, 0);
  assert.equal(repeated.warningCount, 1);
});

test("Review validation reports every unresolved image while preserving the secure-auth warning", () => {
  const result = createReviewValidation({
    imageResults: [
      { ready: true, alt: "Ready" },
      { ready: false, alt: "Tenderloin image" },
    ],
  });
  assert.equal(result.errorCount, 1);
  assert.equal(result.imageCount, 2);
  assert.equal(result.readyImageCount, 1);
  assert.deepEqual(result.warnings[0], SECURE_PUBLISHING_WARNING);
});

test("Review image inspection accepts complete images only when naturalWidth is positive", async () => {
  const results = await inspectReviewFrameImages({
    frame: {
      contentDocument: {
        querySelectorAll: () => [
          { complete: true, naturalWidth: 200, src: "ready", alt: "Ready" },
          { complete: true, naturalWidth: 0, src: "broken", alt: "Broken" },
        ],
      },
    },
  });
  assert.deepEqual(results.map((item) => item.ready), [true, false]);
});

test("Review status is Error for invalid drafts, Modified for valid changes, and Complete for valid live parity", () => {
  assert.equal(
    getReviewStatus({ errorCount: 1, isModified: false }),
    STUDIO_SECTION_STATUS.ERROR,
  );
  assert.equal(
    getReviewStatus({ errorCount: 0, isModified: true }),
    STUDIO_SECTION_STATUS.MODIFIED,
  );
  assert.equal(
    getReviewStatus({ errorCount: 0, isModified: false }),
    STUDIO_SECTION_STATUS.COMPLETE,
  );
});

test("Review shell uses a dynamic srcdoc frame and actionable validation panel while publishing stays disabled", async () => {
  const shell = await read("src/live-pdf-studio/shell.js");
  assert.match(shell, /data-review-frame/);
  assert.match(shell, /data-review-summary/);
  assert.match(shell, /data-review-errors/);
  assert.match(shell, /data-review-warnings/);
  assert.match(shell, /data-review-issues/);
  assert.doesNotMatch(shell, /<iframe[\s\S]{0,400}\ssrc="\/specials\/monthly-specials\.html"/);
  assert.match(shell, /Publish Live PDF[\s\S]{0,300}disabled|disabled[\s\S]{0,300}Publish Live PDF/);
});

test("Review controller renders srcdoc, checks images, refreshes while open, and reports runtime validation", async () => {
  const review = await read("src/live-pdf-studio/review-dialog.js");
  for (const marker of [
    "frame.srcdoc = html",
    "inspectReviewFrameImages",
    "createReviewValidation",
    "scheduleRefresh",
    "onValidationChange",
    "data-review-issues",
  ]) {
    assert.match(review, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("Studio integration connects current draft rendering, pending previews, dynamic status, and 103 contracts without publication writes", async () => {
  const [main, validation, status, packageText] = await Promise.all([
    read("src/live-pdf-studio/main.js"),
    read("src/live-pdf-studio/editor-validation.js"),
    read("src/live-pdf-studio/status-model.js"),
    read("package.json"),
  ]);
  assert.match(main, /createReviewPreview/);
  assert.match(main, /fingerprintDocument/);
  assert.match(main, /reviewController\.scheduleRefresh/);
  assert.match(main, /getReviewInputValidation/);
  assert.match(main, /editorController\.setReviewValidation/);
  assert.match(validation, /getReviewStatus/);
  assert.match(status, /export const getReviewStatus/);
  assert.match(
    JSON.parse(packageText).scripts["test:specials:contracts"],
    /live-pdf-studio-review-pdf/,
  );
  assert.doesNotMatch(
    main,
    /git push|gh workflow|workflow_dispatch|Cloudflare Worker/i,
  );
});
