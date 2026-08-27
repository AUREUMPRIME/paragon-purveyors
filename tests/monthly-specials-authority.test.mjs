import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const baselinePath = path.join(
  projectRoot,
  "tests",
  "fixtures",
  "monthly-specials-authority-baseline.json",
);

const manifestPath = path.join(
  projectRoot,
  "tools",
  "paragon-cut-image-studio",
  "manifests",
  "approved-selection.json",
);

const publicJsonPath = path.join(
  projectRoot,
  "public",
  "specials",
  "monthly-specials.json",
);

const publicPdfPath = path.join(
  projectRoot,
  "public",
  "specials",
  "monthly-specials.pdf",
);

const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");

const normalizeLineEndingsForHash = (bytes) =>
  Buffer.from(
    bytes
      .toString("utf8")
      .replaceAll("\r\n", "\n")
      .replaceAll("\r", "\n"),
    "utf8",
  );

const normalizeJsonBytes = (bytes) =>
  Buffer.from(
    bytes
      .toString("utf8")
      .replaceAll("\r\n", "\n")
      .replaceAll("\r", "\n")
      .trimEnd(),
    "utf8",
  );

const [
  baseline,
  manifestBytes,
  publicJsonBytes,
  publicPdfBytes,
] = await Promise.all([
  readFile(baselinePath, "utf8").then(JSON.parse),
  readFile(manifestPath),
  readFile(publicJsonPath),
  readFile(publicPdfPath),
]);

const manifest = JSON.parse(manifestBytes.toString("utf8"));
const publicJson = JSON.parse(publicJsonBytes.toString("utf8"));

test("approved Studio manifest preserves the locked structural authority", () => {

  assert.equal(manifest.schema, "typed-asset-slots");

  const productSections = manifest.sections.filter(
    (section) => section.category === "product",
  );

  const productSlots = manifest.slots.filter(
    (slot) => slot.category === "product",
  );

  const footerSlots = manifest.slots.filter(
    (slot) => slot.category === "footer",
  );

  assert.equal(
    manifest.sections.length,
    baseline.manifest.sectionCount,
  );

  assert.equal(
    productSections.length,
    baseline.manifest.productSectionCount,
  );

  assert.equal(
    manifest.slots.length,
    baseline.manifest.slotCount,
  );

  assert.equal(
    productSlots.length,
    baseline.manifest.productSlotCount,
  );

  assert.equal(
    footerSlots.length,
    baseline.manifest.footerSlotCount,
  );

  const triTipSection = productSections.find(
    (section) => section.sectionId === "tri-tip",
  );

  assert.deepEqual(
    triTipSection?.slotAssetIds,
    ["product.tri-tip.primary"],
  );

  const tenderloinSecondary = manifest.slots.find(
    (slot) =>
      slot.assetId === "product.tenderloin.secondary",
  );

  const footer = manifest.slots.find(
    (slot) => slot.assetId === "footer.broll",
  );

  assert.equal(
    tenderloinSecondary?.zoom,
    baseline.manifest.tenderloinSecondaryZoom,
  );

  assert.equal(
    footer?.focusY,
    baseline.manifest.footerFocusY,
  );
});

test(
  "approved Studio asset bytes match the baseline and production copies",
  async () => {
    for (const slot of manifest.slots) {
      const expectedHash = baseline.assets[slot.assetId];

      assert.ok(
        expectedHash,
        `Missing baseline hash for ${slot.assetId}`,
      );

      const libraryPath = path.join(
        projectRoot,
        "tools",
        "paragon-cut-image-studio",
        "image-library",
        slot.libraryId,
        slot.selectedFileName,
      );

      const productionPath = path.join(
        projectRoot,
        "public",
        slot.productionPath,
      );

      const [libraryBytes, productionBytes] =
        await Promise.all([
          readFile(libraryPath),
          readFile(productionPath),
        ]);

      assert.equal(
        sha256(libraryBytes),
        expectedHash,
        `${slot.assetId} library SHA-256`,
      );

      assert.equal(
        sha256(productionBytes),
        expectedHash,
        `${slot.assetId} production SHA-256`,
      );
    }
  },
);

test(
  "generated public JSON preserves current business and visual authority",
  () => {

    assert.equal(publicJson.source?.type, "google");

    assert.equal(
      publicJson.visualSource?.type,
      "studio-manifest",
    );

    assert.equal(
      publicJson.visualSource?.sha256,
      sha256(normalizeLineEndingsForHash(manifestBytes)),
    );

    assert.equal(
      publicJson.visualSource?.slotCount,
      baseline.manifest.slotCount,
    );

    assert.equal(
      publicJson.visualSource?.productSlotCount,
      baseline.manifest.productSlotCount,
    );

    assert.equal(
      publicJson.visualSource?.footerSlotCount,
      baseline.manifest.footerSlotCount,
    );

    assert.equal(publicJson.specials?.length, 4);

    const triTip = publicJson.specials.find(
      (special) => special.cutId === "tri-tip",
    );

    assert.equal(triTip?.offerMode, "single-offer");

    assert.equal(
      String(triTip?.secondaryImagePath ?? "").trim(),
      "",
    );

    assert.equal(
      publicJson.settings?.footerBrollFocusY,
      baseline.manifest.footerFocusY,
    );
  },
);

test(
  "generated PDF preserves the locked one-page US Legal geometry",
  () => {

    const pdfText = publicPdfBytes.toString("latin1");

    const pageCount =
      pdfText.match(/\/Type\s*\/Page\b/g)?.length ?? 0;

    assert.equal(pageCount, baseline.pdf.pageCount);

    assert.match(
      pdfText,
      new RegExp(
        `/MediaBox\\s*\\[\\s*${baseline.pdf.mediaBox.replaceAll(
          " ",
          "\\s+",
        )}\\s*\\]`,
      ),
    );
  },
);

test("existing visual parity verifier still passes", () => {
  const result = spawnSync(
    process.execPath,
    [
      "tools/verify-monthly-specials-visual-parity.mjs",
      "public/specials/monthly-specials.json",
    ],
    {
      cwd: projectRoot,
      encoding: "utf8",
    },
  );

  assert.equal(
    result.status,
    0,
    result.stderr || result.stdout,
  );

  assert.match(
    result.stdout,
    /MONTHLY SPECIALS VISUAL AUTHORITY VERIFIED/,
  );
});
