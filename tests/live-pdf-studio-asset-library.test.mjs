import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {
  archiveAssetRecord,
  assignAssetToSlot,
  canArchiveAsset,
  createAssetSlotRecords,
  createAssetUsageMap,
  getCompatibleAssets,
  removePendingAssetRecord,
  validateAssetCatalog,
} from "../src/live-pdf-studio/asset-library-model.js";
import {
  createAssetSlug,
  createPendingAssetRecord,
  getUploadPolicy,
  readSvgDimensions,
  validateSvgMarkup,
  validateUploadCandidate,
} from "../src/live-pdf-studio/asset-upload-normalizer.js";

const root = path.resolve(import.meta.dirname, "..");
const fixture = async () =>
  JSON.parse(
    await fs.readFile(
      path.join(root, "src/data/paragon-live-pdf-studio.json"),
      "utf8",
    ),
  );
const read = (relativePath) =>
  fs.readFile(path.join(root, relativePath), "utf8");

test("canonical asset catalog validates independently of upload-driven record cardinality and preserves fifteen compatible slots", async () => {
  const document = await fixture();
  const assetIds = Object.keys(document.assetLibrary);
  assert.ok(assetIds.length > 0);
  assert.equal(new Set(assetIds).size, assetIds.length);
  assert.equal(
    assetIds.every((assetId) => document.assetLibrary[assetId].id === assetId),
    true,
  );
  assert.equal(createAssetSlotRecords(document).length, 15);
  assert.equal(validateAssetCatalog(document).length, 0);
});

test("asset usage map preserves shared logos and the seven product-image references", async () => {
  const document = await fixture();
  const usage = createAssetUsageMap(document);
  assert.equal(
    usage.get("asset_product_brand_logos_f3813ec833cd").length,
    3,
  );
  assert.equal(
    createAssetSlotRecords(document).filter((slot) =>
      slot.key.includes("Offer.image"),
    ).length,
    7,
  );
});

test("search and library filtering hide archived assets by default", async () => {
  const document = await fixture();
  const first = document.assetLibrary.asset_tenderloin_436ae92089e2;
  first.archived = true;
  assert.equal(
    getCompatibleAssets({
      document,
      library: "tenderloin",
    }).length,
    1,
  );
  assert.equal(
    getCompatibleAssets({
      document,
      library: "tenderloin",
      includeArchived: true,
      query: "asset_tenderloin_436ae92089e2",
    }).length,
    1,
  );
});

test("asset assignment changes only assetId and enforces slot-library compatibility", async () => {
  const document = await fixture();
  const mutation = assignAssetToSlot({
    document,
    slotPath: "specials[0].primaryOffer.image",
    assetId: "asset_tenderloin_e3602dbdc4f2",
  });
  assert.deepEqual(mutation.path, [
    "specials",
    0,
    "primaryOffer",
    "image",
    "assetId",
  ]);
  assert.equal(mutation.value, "asset_tenderloin_e3602dbdc4f2");
  assert.throws(() =>
    assignAssetToSlot({
      document,
      slotPath: "specials[0].primaryOffer.image",
      assetId: "asset_ribeye_c2b28238aeca",
    }),
  );
});

test("archive and pending removal remain usage-aware", async () => {
  const document = await fixture();
  const pendingId = "asset_tenderloin_aaaaaaaaaaaa";
  document.assetLibrary[pendingId] = {
    ...structuredClone(
      document.assetLibrary.asset_tenderloin_436ae92089e2,
    ),
    id: pendingId,
    label: "Unused Pending",
    path:
      "assets/specials/library/tenderloin/" +
      "unused-pending-aaaaaaaaaaaa.webp",
    sha256: "a".repeat(64),
  };
  assert.equal(canArchiveAsset({ document, assetId: pendingId }), true);
  assert.deepEqual(
    archiveAssetRecord({ document, assetId: pendingId }),
    {
      path: ["assetLibrary", pendingId, "archived"],
      value: true,
    },
  );
  const removal = removePendingAssetRecord({
    document,
    assetId: pendingId,
    pendingAssetIds: new Set([pendingId]),
  });
  assert.equal(removal.path[0], "assetLibrary");
  assert.equal(removal.value[pendingId], undefined);
});

test("upload policy separates product photography from logo SVG support", () => {
  assert.deepEqual(
    getUploadPolicy("tenderloin").acceptedMimeTypes,
    ["image/jpeg", "image/png", "image/webp"],
  );
  assert.ok(
    getUploadPolicy("brand-marks").acceptedMimeTypes.includes(
      "image/svg+xml",
    ),
  );
  assert.throws(() =>
    validateUploadCandidate({
      library: "tenderloin",
      mimeType: "image/svg+xml",
      bytes: 100,
    }),
  );
});

test("SVG validation rejects active content and reads safe dimensions", () => {
  const safe =
    '<svg viewBox="0 0 375 135" xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>';
  assert.equal(validateSvgMarkup(safe), safe);
  assert.deepEqual(readSvgDimensions(safe), {
    width: 375,
    height: 135,
  });
  for (const unsafe of [
    "<svg><script>alert(1)</script></svg>",
    '<svg><foreignObject></foreignObject></svg>',
    '<svg onload="alert(1)"></svg>',
    '<svg><image href="https://example.com/a.png"/></svg>',
    '<svg><a href="javascript:alert(1)"></a></svg>',
  ]) {
    assert.throws(() => validateSvgMarkup(unsafe));
  }
});

test("pending asset records use immutable content-addressed identity and path", () => {
  const sha256 = "b".repeat(64);
  const record = createPendingAssetRecord({
    library: "campaign-marks",
    label: "New Campaign Mark",
    mimeType: "image/svg+xml",
    sha256,
    bytes: 512,
    width: 500,
    height: 200,
    createdAt: "2026-07-24T00:00:00.000Z",
  });
  assert.equal(record.id, "asset_campaign_marks_bbbbbbbbbbbb");
  assert.match(record.path, /new-campaign-mark-b{12}\.svg$/);
  assert.equal(createAssetSlug("  New Campaign Mark  "), "new-campaign-mark");
});

test("IndexedDB upload storage exposes complete document-scoped CRUD", async () => {
  const source = await read("src/live-pdf-studio/draft-store.js");
  for (const marker of [
    "putUpload",
    "getUpload",
    "listUploads",
    "deleteUpload",
    "countUploads",
    "documentId",
    "assetId",
  ]) {
    assert.match(source, new RegExp(marker));
  }
  assert.match(source, /clearDraft[\s\S]*UPLOADS[\s\S]*clear\(\)/);
});

test("Studio integration enables in-app asset management without publication writes", async () => {
  const [main, shell, controls, styles, packageText] =
    await Promise.all([
      read("src/live-pdf-studio/main.js"),
      read("src/live-pdf-studio/shell.js"),
      read("src/live-pdf-studio/visual-controls.js"),
      read("src/live-pdf-studio/styles.css"),
      read("package.json"),
    ]);
  assert.match(main, /createAssetLibraryController/);
  assert.match(main, /createAssetPreviewResolver/);
  assert.match(shell, /data-assets-search/);
  assert.match(shell, /data-assets-upload/);
  assert.match(controls, /data-asset-picker/);
  assert.match(styles, /asset-library-grid/);
  assert.match(
    JSON.parse(packageText).scripts["test:specials:contracts"],
    /live-pdf-studio-asset-library/,
  );
  assert.doesNotMatch(
    main + shell + controls,
    /git push|gh workflow|workflow_dispatch|Cloudflare Worker/i,
  );
});
