import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  inspectGeometryDocument,
  inspectReviewFrameGeometry,
  REVIEW_GEOMETRY_GUARDRAILS,
  REVIEW_GEOMETRY_TOLERANCE,
  REVIEW_PAGE_HEIGHT,
  REVIEW_PAGE_WIDTH,
} from "../src/live-pdf-studio/review-geometry.js";
import { createReviewValidation } from "../src/live-pdf-studio/review-validation.js";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath) =>
  fs.readFile(path.join(root, relativePath), "utf8");

const rectangle = ({ left = 0, top = 0, width = 100, height = 100 } = {}) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

const element = ({
  rect = rectangle(),
  container = null,
  scrollWidth = rect.width,
  scrollHeight = rect.height,
  clientWidth = rect.width,
  clientHeight = rect.height,
} = {}) => ({
  scrollWidth,
  scrollHeight,
  clientWidth,
  clientHeight,
  getBoundingClientRect: () => rect,
  closest: () => container,
});

const documentWith = (entries) => ({
  querySelectorAll(selector) {
    return entries[selector] || [];
  },
});

const singleRule = (overrides = {}) => [
  {
    key: "sample",
    label: "Sample",
    selector: ".sample",
    containerSelector: "",
    minCount: 1,
    maxCount: 1,
    checkScroll: false,
    expectedWidth: null,
    expectedHeight: null,
    ...overrides,
  },
];

test("Review geometry locks the 816 by 1344 page, 0.5 pixel tolerance, and critical guardrail registry", () => {
  assert.equal(REVIEW_PAGE_WIDTH, 816);
  assert.equal(REVIEW_PAGE_HEIGHT, 1344);
  assert.equal(REVIEW_GEOMETRY_TOLERANCE, 0.5);
  assert.equal(REVIEW_GEOMETRY_GUARDRAILS.length, 17);
  for (const key of [
    "page",
    "header",
    "campaignTitle",
    "productCards",
    "productText",
    "priceGroups",
    "imagePanels",
    "contacts",
    "footerMessage",
    "disclaimer",
    "footerMedia",
  ]) {
    assert.ok(REVIEW_GEOMETRY_GUARDRAILS.some((rule) => rule.key === key));
  }
});

test("Geometry inspection accepts a visible node inside its guardrail", () => {
  const container = element({ rect: rectangle({ width: 200, height: 200 }) });
  const child = element({
    rect: rectangle({ left: 20, top: 20, width: 100, height: 100 }),
    container,
  });
  const result = inspectGeometryDocument(
    documentWith({ ".sample": [child] }),
    {
      guardrails: singleRule({ containerSelector: ".container" }),
    },
  );
  assert.equal(result.errorCount, 0);
  assert.equal(result.checkedCount, 1);
  assert.equal(result.isValid, true);
});

test("Geometry inspection reports a missing required critical node", () => {
  const result = inspectGeometryDocument(documentWith({}), {
    guardrails: singleRule(),
  });
  assert.equal(result.errorCount, 1);
  assert.match(result.issues[0].message, /count must be between 1 and 1; found 0/);
});

test("Geometry inspection rejects a page outside the exact CSS page dimensions", () => {
  const page = element({
    rect: rectangle({ width: 815, height: 1344 }),
  });
  const result = inspectGeometryDocument(
    documentWith({ ".sample": [page] }),
    {
      guardrails: singleRule({
        expectedWidth: 816,
        expectedHeight: 1344,
      }),
    },
  );
  assert.equal(result.errorCount, 1);
  assert.match(result.issues[0].message, /816 × 1344 CSS pixels/);
});

test("Geometry inspection rejects a child outside its guardrail beyond 0.5 pixels", () => {
  const container = element({ rect: rectangle({ width: 100, height: 100 }) });
  const child = element({
    rect: rectangle({ left: 0, top: 0, width: 100.6, height: 100 }),
    container,
  });
  const result = inspectGeometryDocument(
    documentWith({ ".sample": [child] }),
    {
      guardrails: singleRule({ containerSelector: ".container" }),
      tolerance: 0.5,
    },
  );
  assert.equal(result.errorCount, 1);
  assert.match(result.issues[0].message, /exceeds its \.container guardrail/);
});

test("Geometry inspection rejects clipped horizontal or vertical content", () => {
  const child = element({
    scrollWidth: 101,
    clientWidth: 100,
    scrollHeight: 100,
    clientHeight: 100,
  });
  const result = inspectGeometryDocument(
    documentWith({ ".sample": [child] }),
    {
      guardrails: singleRule({ checkScroll: true }),
      tolerance: 0.5,
    },
  );
  assert.equal(result.errorCount, 1);
  assert.match(result.issues[0].message, /clipped or overflowing content/);
});

test("Review frame geometry reports an inaccessible rendered document as blocking", () => {
  const result = inspectReviewFrameGeometry({ frame: null });
  assert.equal(result.errorCount, 1);
  assert.equal(result.checkedCount, 0);
  assert.equal(result.isValid, false);
  assert.match(result.issues[0].message, /could not access/);
});

test("Review frame geometry exposes the measured page dimensions and checked node count", () => {
  const page = element({
    rect: rectangle({ width: 816, height: 1344 }),
    scrollWidth: 816,
    scrollHeight: 1344,
    clientWidth: 816,
    clientHeight: 1344,
  });
  const result = inspectReviewFrameGeometry({
    frame: { contentDocument: documentWith({ ".sample": [page] }) },
    guardrails: singleRule({
      key: "page",
      expectedWidth: 816,
      expectedHeight: 1344,
      checkScroll: true,
    }),
  });
  assert.equal(result.errorCount, 0);
  assert.equal(result.pageWidth, 816);
  assert.equal(result.pageHeight, 1344);
  assert.equal(result.checkedCount, 1);
});

test("Review validation converts DOM geometry failures into blocking Review errors", () => {
  const result = createReviewValidation({
    geometryResults: {
      checkedCount: 24,
      pageWidth: 816,
      pageHeight: 1344,
      issues: [
        {
          fieldKey: "review.geometry.productText.2",
          message: "Product description 3 contains clipped content.",
        },
      ],
    },
  });
  assert.equal(result.errorCount, 1);
  assert.equal(result.geometryChecked, true);
  assert.equal(result.geometryErrorCount, 1);
  assert.equal(result.geometryCheckedCount, 24);
  assert.equal(result.pageWidth, 816);
  assert.equal(result.pageHeight, 1344);
});

test("Phase 3.7 integration registers shared DOM geometry and temporary PDF parity acceptance without production writes", async () => {
  const [dialog, validation, tool, packageText] = await Promise.all([
    read("src/live-pdf-studio/review-dialog.js"),
    read("src/live-pdf-studio/review-validation.js"),
    read("tools/validate-live-pdf-geometry.mjs"),
    read("package.json"),
  ]);
  const scripts = JSON.parse(packageText).scripts;
  assert.match(dialog, /inspectReviewFrameGeometry/);
  assert.match(dialog, /geometryResults/);
  assert.match(validation, /geometryErrorCount/);
  assert.match(tool, /os\.tmpdir/);
  assert.match(tool, /format: "Legal"/);
  assert.match(tool, /\/MediaBox/);
  assert.match(tool, /inspectGeometryDocument/);
  assert.match(tool, /Canonical Studio source no longer reproduces/);
  assert.match(scripts["test:specials:contracts"], /live-pdf-studio-geometry/);
  assert.equal(
    scripts["specials:validate:geometry"],
    "node tools/validate-live-pdf-geometry.mjs",
  );
  assert.doesNotMatch(
    dialog + validation + tool,
    /git push|gh workflow|workflow_dispatch|Cloudflare Worker/i,
  );
});
