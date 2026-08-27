import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(
  projectRoot,
  "tools",
  "paragon-cut-image-studio",
  "manifests",
  "approved-selection.json",
);
const publicJsonPath = path.resolve(
  projectRoot,
  process.argv[2] || "public/specials/monthly-specials.json",
);

const normalizeText = (value) => String(value ?? "").trim();
const normalizeAssetPath = (value) =>
  normalizeText(value).replaceAll("\\", "/").replace(/^public\//, "");
const sha256Hex = (value) => createHash("sha256").update(value).digest("hex");

const normalizeLineEndingsForHash = (bytes) =>
  Buffer.from(
    bytes
      .toString("utf8")
      .replaceAll("\r\n", "\n")
      .replaceAll("\r", "\n"),
    "utf8",
  );

const fail = (message) => {
  throw new Error(message);
};

const assertEqual = (actual, expected, label) => {
  if (actual !== expected) {
    fail(`${label} mismatch. Expected: ${expected}. Found: ${actual}`);
  }
};

const assertNumber = (actual, expected, label) => {
  const actualNumber = Number(actual);
  const expectedNumber = Number(expected);

  if (!Number.isFinite(actualNumber) || actualNumber !== expectedNumber) {
    fail(`${label} mismatch. Expected: ${expectedNumber}. Found: ${actual}`);
  }
};

const [manifestBytes, publicJsonText] = await Promise.all([
  fs.readFile(manifestPath),
  fs.readFile(publicJsonPath, "utf8"),
]);

const manifest = JSON.parse(manifestBytes.toString("utf8"));
const data = JSON.parse(publicJsonText);
const manifestHash = sha256Hex(normalizeLineEndingsForHash(manifestBytes));

if (manifest?.schema !== "typed-asset-slots") {
  fail(`Unsupported Studio manifest schema: ${manifest?.schema || "<missing>"}`);
}

if (!Array.isArray(manifest.sections) || !Array.isArray(manifest.slots)) {
  fail("Studio manifest must contain sections and slots arrays.");
}

assertEqual(data.visualSource?.type, "studio-manifest", "visualSource.type");
assertEqual(data.visualSource?.schema, manifest.schema, "visualSource.schema");
assertEqual(data.visualSource?.sha256, manifestHash, "visualSource.sha256");
assertNumber(data.visualSource?.slotCount, manifest.slots.length, "visualSource.slotCount");

const slotsByAssetId = new Map();
for (const slot of manifest.slots) {
  const assetId = normalizeText(slot.assetId);

  if (!assetId || slotsByAssetId.has(assetId)) {
    fail(`Invalid or duplicate Studio assetId: ${assetId || "<missing>"}`);
  }

  slotsByAssetId.set(assetId, slot);

  const productionPath = normalizeAssetPath(slot.productionPath);
  const libraryPath = path.join(
    projectRoot,
    "tools",
    "paragon-cut-image-studio",
    "image-library",
    normalizeText(slot.libraryId),
    normalizeText(slot.selectedFileName),
  );
  const productionFilePath = path.join(projectRoot, "public", productionPath);

  if (!existsSync(libraryPath) || !existsSync(productionFilePath)) {
    fail(`${assetId} is missing its approved library or production asset.`);
  }

  const [libraryBytes, productionBytes] = await Promise.all([
    fs.readFile(libraryPath),
    fs.readFile(productionFilePath),
  ]);

  assertEqual(
    sha256Hex(productionBytes),
    sha256Hex(libraryBytes),
    `${assetId} production asset SHA-256`,
  );
}

const productSections = manifest.sections.filter((section) => section.category === "product");
const productSlots = manifest.slots.filter((slot) => slot.category === "product");
const footerSlots = manifest.slots.filter((slot) => slot.category === "footer");

assertNumber(productSections.length, 4, "Product section count");
assertNumber(productSlots.length, 7, "Product slot count");
assertNumber(footerSlots.length, 1, "Footer slot count");
assertNumber(manifest.slots.length, 8, "Total slot count");
assertNumber(data.specials?.length, 4, "Published special count");

const specialsByCutId = new Map(
  data.specials.map((special) => [normalizeText(special.cutId), special]),
);

for (const section of productSections) {
  const cutId = normalizeText(section.sectionId);
  const special = specialsByCutId.get(cutId);

  if (!special) {
    fail(`Published JSON is missing Studio-controlled cutId: ${cutId}`);
  }

  const sectionSlots = section.slotAssetIds.map((assetId) => {
    const slot = slotsByAssetId.get(assetId);
    if (!slot) fail(`${cutId} references missing Studio slot: ${assetId}`);
    return slot;
  });
  const primary = sectionSlots.find((slot) => slot.role === "primary");
  const secondary = sectionSlots.find((slot) => slot.role === "secondary");

  if (!primary) fail(`${cutId} is missing its approved primary slot.`);

  assertEqual(
    normalizeAssetPath(special.primaryImagePath),
    normalizeAssetPath(primary.productionPath),
    `${cutId} primaryImagePath`,
  );
  assertEqual(special.primaryImageAlt, primary.alt, `${cutId} primaryImageAlt`);
  assertEqual(special.primaryImageFit, primary.fit, `${cutId} primaryImageFit`);
  assertEqual(
    special.primaryImagePosition,
    `${Number(primary.focusX)}% ${Number(primary.focusY)}%`,
    `${cutId} primaryImagePosition`,
  );
  assertNumber(special.primaryImageZoom, primary.zoom, `${cutId} primaryImageZoom`);
  assertNumber(special.primaryImageFocusX, primary.focusX, `${cutId} primaryImageFocusX`);
  assertNumber(special.primaryImageFocusY, primary.focusY, `${cutId} primaryImageFocusY`);

  if (secondary) {
    assertEqual(
      normalizeAssetPath(special.secondaryImagePath),
      normalizeAssetPath(secondary.productionPath),
      `${cutId} secondaryImagePath`,
    );
    assertEqual(special.secondaryImageAlt, secondary.alt, `${cutId} secondaryImageAlt`);
    assertEqual(special.secondaryImageFit, secondary.fit, `${cutId} secondaryImageFit`);
    assertEqual(
      special.secondaryImagePosition,
      `${Number(secondary.focusX)}% ${Number(secondary.focusY)}%`,
      `${cutId} secondaryImagePosition`,
    );
    assertNumber(special.secondaryImageZoom, secondary.zoom, `${cutId} secondaryImageZoom`);
    assertNumber(special.secondaryImageFocusX, secondary.focusX, `${cutId} secondaryImageFocusX`);
    assertNumber(special.secondaryImageFocusY, secondary.focusY, `${cutId} secondaryImageFocusY`);
  } else {
    assertEqual(normalizeText(special.secondaryImagePath), "", `${cutId} secondaryImagePath`);
  }
}

const footer = footerSlots[0];
const settings = data.settings || {};

assertEqual(
  normalizeAssetPath(settings.footerBrollPath),
  normalizeAssetPath(footer.productionPath),
  "footerBrollPath",
);
assertEqual(settings.footerBrollAlt, footer.alt, "footerBrollAlt");
assertEqual(settings.footerBrollVisible, footer.visible ? "yes" : "no", "footerBrollVisible");
assertEqual(settings.footerBrollFit, footer.fit, "footerBrollFit");
assertEqual(
  settings.footerBrollPosition,
  `${Number(footer.focusX)}% ${Number(footer.focusY)}%`,
  "footerBrollPosition",
);
assertNumber(settings.footerBrollZoom, footer.zoom, "footerBrollZoom");
assertNumber(settings.footerBrollFocusX, footer.focusX, "footerBrollFocusX");
assertNumber(settings.footerBrollFocusY, footer.focusY, "footerBrollFocusY");
assertNumber(settings.footerBrollOpacity, footer.opacity, "footerBrollOpacity");
assertNumber(settings.footerBrollSaturation, footer.saturation, "footerBrollSaturation");
assertNumber(settings.footerBrollContrast, footer.contrast, "footerBrollContrast");
assertNumber(settings.footerBrollBrightness, footer.brightness, "footerBrollBrightness");

console.log(`[OK] Studio manifest hash: ${manifestHash}`);
console.log("[OK] Seven product slots and one footer slot match the approved Studio manifest.");
console.log("[OK] Production asset bytes match the selected Studio library files.");
console.log("[PASS] MONTHLY SPECIALS VISUAL AUTHORITY VERIFIED");
