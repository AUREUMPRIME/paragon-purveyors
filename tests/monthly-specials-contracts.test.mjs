import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
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

const publicHtmlPath = path.join(
  projectRoot,
  "public",
  "specials",
  "monthly-specials.html",
);

const publicPdfPath = path.join(
  projectRoot,
  "public",
  "specials",
  "monthly-specials.pdf",
);

const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");

const assertUnique = (values, label) => {
  assert.equal(
    new Set(values).size,
    values.length,
    `${label} must be unique`,
  );
};

const assertFiniteNumber = (value, label) => {
  assert.equal(
    Number.isFinite(value),
    true,
    `${label} must be a finite number`,
  );
};

const assertRange = (
  value,
  minimum,
  maximum,
  label,
) => {
  assertFiniteNumber(value, label);

  assert.ok(
    value >= minimum && value <= maximum,
    `${label} must be between ${minimum} and ${maximum}`,
  );
};

const assertNonEmptyString = (value, label) => {
  assert.equal(
    typeof value,
    "string",
    `${label} must be a string`,
  );

  assert.ok(
    value.trim().length > 0,
    `${label} must not be empty`,
  );
};

const escapeHtmlText = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const [
  manifestBytes,
  publicJsonBytes,
  publicHtmlBytes,
  publicPdfBytes,
] = await Promise.all([
  readFile(manifestPath),
  readFile(publicJsonPath),
  readFile(publicHtmlPath),
  readFile(publicPdfPath),
]);

const manifest = JSON.parse(
  manifestBytes.toString("utf8"),
);

const publicJson = JSON.parse(
  publicJsonBytes.toString("utf8"),
);

const publicHtml = publicHtmlBytes.toString("utf8");
const publicPdfText = publicPdfBytes.toString("latin1");

const productSections = manifest.sections.filter(
  (section) => section.category === "product",
);

const footerSections = manifest.sections.filter(
  (section) => section.category === "footer",
);

const productSlots = manifest.slots.filter(
  (slot) => slot.category === "product",
);

const footerSlots = manifest.slots.filter(
  (slot) => slot.category === "footer",
);

const slotByAssetId = new Map(
  manifest.slots.map((slot) => [
    slot.assetId,
    slot,
  ]),
);

const resolveSectionSlots = (section) => {
  assert.ok(
    Array.isArray(section.slotAssetIds),
    `${section.sectionId}.slotAssetIds must be an array`,
  );

  return section.slotAssetIds.map((assetId) => {
    const slot = slotByAssetId.get(assetId);

    assert.ok(
      slot,
      `${section.sectionId} references missing slot ${assetId}`,
    );

    return slot;
  });
};

test(
  "Studio manifest preserves the mutable-safe production topology",
  () => {
    assert.equal(
      manifest.schema,
      "typed-asset-slots",
    );

    assert.ok(Array.isArray(manifest.sections));
    assert.ok(Array.isArray(manifest.slots));

    assert.equal(manifest.sections.length, 5);
    assert.equal(productSections.length, 4);
    assert.equal(footerSections.length, 1);

    assert.equal(manifest.slots.length, 8);
    assert.equal(productSlots.length, 7);
    assert.equal(footerSlots.length, 1);

    assertUnique(
      manifest.sections.map(
        (section) => section.sectionId,
      ),
      "section IDs",
    );

    assertUnique(
      manifest.slots.map(
        (slot) => slot.assetId,
      ),
      "asset IDs",
    );

    for (const section of manifest.sections) {
      assertNonEmptyString(
        section.sectionId,
        "section.sectionId",
      );

      const resolvedSlots =
        resolveSectionSlots(section);

      if (section.category === "product") {
        const expectedCount =
          section.layout === "single"
            ? 1
            : section.layout === "dual"
              ? 2
              : 0;

        assert.ok(
          expectedCount > 0,
          `${section.sectionId} has unsupported layout`,
        );

        assert.equal(
          resolvedSlots.length,
          expectedCount,
          `${section.sectionId} slot count`,
        );

        assert.match(
          resolvedSlots[0].assetId,
          /\.primary$/,
        );

        if (section.layout === "dual") {
          assert.match(
            resolvedSlots[1].assetId,
            /\.secondary$/,
          );
        }
      }
    }

    const triTipSection = productSections.find(
      (section) => section.sectionId === "tri-tip",
    );

    assert.ok(triTipSection);
    assert.equal(triTipSection.layout, "single");

    assert.deepEqual(
      triTipSection.slotAssetIds,
      ["product.tri-tip.primary"],
    );

    const footerSection = footerSections[0];
    const resolvedFooterSlots =
      resolveSectionSlots(footerSection);

    assert.equal(resolvedFooterSlots.length, 1);
    assert.equal(
      resolvedFooterSlots[0].assetId,
      "footer.broll",
    );

    for (const slot of manifest.slots) {
      assertNonEmptyString(
        slot.assetId,
        "slot.assetId",
      );

      assertNonEmptyString(
        slot.libraryId,
        `${slot.assetId}.libraryId`,
      );

      assertNonEmptyString(
        slot.selectedFileName,
        `${slot.assetId}.selectedFileName`,
      );

      assertNonEmptyString(
        slot.productionPath,
        `${slot.assetId}.productionPath`,
      );

      assert.equal(
        path.isAbsolute(slot.productionPath),
        false,
        `${slot.assetId}.productionPath must be relative`,
      );

      assert.equal(
        slot.productionPath.includes(".."),
        false,
        `${slot.assetId}.productionPath must not escape public`,
      );

      assert.match(
        slot.productionPath,
        /^assets\/specials\//,
      );

      assert.ok(
        ["contain", "cover"].includes(slot.fit),
        `${slot.assetId}.fit is invalid`,
      );

      assertRange(
        slot.zoom,
        0.1,
        5,
        `${slot.assetId}.zoom`,
      );

      assertRange(
        slot.focusX,
        0,
        100,
        `${slot.assetId}.focusX`,
      );

      assertRange(
        slot.focusY,
        0,
        100,
        `${slot.assetId}.focusY`,
      );
    }
  },
);

test(
  "Studio library assets and production assets have byte parity",
  async () => {
    for (const slot of manifest.slots) {
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

      const [
        libraryBytes,
        productionBytes,
        libraryStats,
        productionStats,
      ] = await Promise.all([
        readFile(libraryPath),
        readFile(productionPath),
        stat(libraryPath),
        stat(productionPath),
      ]);

      assert.ok(
        libraryStats.size > 0,
        `${slot.assetId} library asset is empty`,
      );

      assert.ok(
        productionStats.size > 0,
        `${slot.assetId} production asset is empty`,
      );

      assert.equal(
        sha256(productionBytes),
        sha256(libraryBytes),
        `${slot.assetId} production bytes`,
      );
    }
  },
);

test(
  "generated JSON preserves business mutability and visual authority",
  () => {
    assert.equal(
      publicJson.source?.type,
      "google",
    );

    assert.equal(
      publicJson.visualSource?.type,
      "studio-manifest",
    );

    assert.equal(
      publicJson.visualSource?.schema,
      manifest.schema,
    );

    assert.equal(
      publicJson.visualSource?.sha256,
      sha256(manifestBytes),
    );

    assert.equal(
      publicJson.visualSource?.slotCount,
      manifest.slots.length,
    );

    assert.equal(
      publicJson.visualSource?.productSlotCount,
      productSlots.length,
    );

    assert.equal(
      publicJson.visualSource?.footerSlotCount,
      footerSlots.length,
    );

    assert.ok(Array.isArray(publicJson.specials));

    assert.equal(
      publicJson.specials.length,
      productSections.length,
    );

    assert.equal(publicJson.specials.length, 4);

    assertUnique(
      publicJson.specials.map(
        (special) => special.cutId,
      ),
      "special cut IDs",
    );

    assertUnique(
      publicJson.specials.map(
        (special) => special.sort,
      ),
      "special sort values",
    );

    const expectedCutIds = productSections
      .map((section) => section.sectionId)
      .sort();

    const actualCutIds = publicJson.specials
      .map((special) => special.cutId)
      .sort();

    assert.deepEqual(
      actualCutIds,
      expectedCutIds,
    );

    for (const special of publicJson.specials) {
      assert.equal(special.active, true);

      assertNonEmptyString(
        special.cutId,
        "special.cutId",
      );

      assertNonEmptyString(
        special.displayName,
        `${special.cutId}.displayName`,
      );

      assertNonEmptyString(
        special.primaryPriceLabel,
        `${special.cutId}.primaryPriceLabel`,
      );

      assertNonEmptyString(
        special.primaryPrice,
        `${special.cutId}.primaryPrice`,
      );

      const section = productSections.find(
        (candidate) =>
          candidate.sectionId === special.cutId,
      );

      assert.ok(
        section,
        `Missing manifest section for ${special.cutId}`,
      );

      const sectionSlots =
        resolveSectionSlots(section);

      const primarySlot = sectionSlots[0];

      assert.equal(
        special.primaryImagePath,
        primarySlot.productionPath,
      );

      assert.equal(
        special.primaryImageFit,
        primarySlot.fit,
      );

      assert.equal(
        special.primaryImageZoom,
        primarySlot.zoom,
      );

      assert.equal(
        special.primaryImageFocusX,
        primarySlot.focusX,
      );

      assert.equal(
        special.primaryImageFocusY,
        primarySlot.focusY,
      );

      if (section.layout === "single") {
        assert.equal(
          special.offerMode,
          "single-offer",
        );

        assert.equal(
          String(
            special.secondaryImagePath ?? "",
          ).trim(),
          "",
        );

        assert.equal(
          String(
            special.secondaryPrice ?? "",
          ).trim(),
          "",
        );
      }

      if (section.layout === "dual") {
        assert.equal(
          special.offerMode,
          "dual-offer",
        );

        const secondarySlot = sectionSlots[1];

        assertNonEmptyString(
          special.secondaryPriceLabel,
          `${special.cutId}.secondaryPriceLabel`,
        );

        assertNonEmptyString(
          special.secondaryPrice,
          `${special.cutId}.secondaryPrice`,
        );

        assert.equal(
          special.secondaryImagePath,
          secondarySlot.productionPath,
        );

        assert.equal(
          special.secondaryImageFit,
          secondarySlot.fit,
        );

        assert.equal(
          special.secondaryImageZoom,
          secondarySlot.zoom,
        );

        assert.equal(
          special.secondaryImageFocusX,
          secondarySlot.focusX,
        );

        assert.equal(
          special.secondaryImageFocusY,
          secondarySlot.focusY,
        );
      }
    }

    const footerSlot = footerSlots[0];

    assert.equal(
      publicJson.settings?.footerBrollPath,
      footerSlot.productionPath,
    );

    assert.equal(
      publicJson.settings?.footerBrollFit,
      footerSlot.fit,
    );

    assert.equal(
      publicJson.settings?.footerBrollZoom,
      footerSlot.zoom,
    );

    assert.equal(
      publicJson.settings?.footerBrollFocusX,
      footerSlot.focusX,
    );

    assert.equal(
      publicJson.settings?.footerBrollFocusY,
      footerSlot.focusY,
    );

    assert.ok(Array.isArray(publicJson.contacts));

    assert.ok(
      publicJson.contacts.length >= 1 &&
        publicJson.contacts.length <= 2,
      "Generated document supports one or two active contacts",
    );

    for (const contact of publicJson.contacts) {
      assertNonEmptyString(
        contact.name,
        "contact.name",
      );

      assertNonEmptyString(
        contact.location,
        `${contact.name}.location`,
      );

      assertNonEmptyString(
        contact.phone,
        `${contact.name}.phone`,
      );

      assertNonEmptyString(
        contact.email,
        `${contact.name}.email`,
      );

      assert.match(contact.email, /@/);
    }

    const footerUrl = new URL(
      publicJson.settings.footerUrl,
    );

    assert.equal(footerUrl.protocol, "https:");
  },
);

test(
  "generated HTML contains four current product cards",
  async () => {
    const htmlStats = await stat(publicHtmlPath);

    assert.ok(
      htmlStats.size > 10_000,
      "Generated HTML is unexpectedly small",
    );

    const productCardCount =
      publicHtml.match(
        /class="special-card(?:\s|")/g,
      )?.length ?? 0;

    assert.equal(productCardCount, 4);

    for (const special of publicJson.specials) {
      assert.ok(
        publicHtml.includes(
          escapeHtmlText(special.displayName),
        ),
        `HTML is missing ${special.displayName}`,
      );

      assert.ok(
        publicHtml.includes(
          escapeHtmlText(special.primaryPrice),
        ),
        `HTML is missing ${special.cutId} primary price`,
      );

      if (special.offerMode === "dual-offer") {
        assert.ok(
          publicHtml.includes(
            escapeHtmlText(special.secondaryPrice),
          ),
          `HTML is missing ${special.cutId} secondary price`,
        );
      }
    }
  },
);

test(
  "generated PDF remains one non-empty US Legal portrait page",
  async () => {
    const pdfStats = await stat(publicPdfPath);

    assert.ok(
      pdfStats.size > 10_000,
      "Generated PDF is unexpectedly small",
    );

    const pageCount =
      publicPdfText.match(
        /\/Type\s*\/Page\b/g,
      )?.length ?? 0;

    assert.equal(pageCount, 1);

    assert.match(
      publicPdfText,
      /\/MediaBox\s*\[\s*0\s+0\s+612\s+1008\s*\]/,
    );
  },
);

test(
  "existing strict visual parity verifier still passes",
  () => {
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
  },
);
