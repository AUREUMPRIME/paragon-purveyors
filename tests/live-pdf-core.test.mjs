import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

import { createPriceRows } from "../src/live-pdf/core/format-price.js";
import {
  isActive,
  isSettingVisible,
  normalizeAssetPath,
  normalizeKey,
  normalizeText,
} from "../src/live-pdf/core/normalize-document.js";
import {
  createAssetDataUrlResolver,
  normalizeAssetReference,
  resolveAssetReference,
} from "../src/live-pdf/core/resolve-asset.js";
import {
  escapeHtml,
  renderMonthlySpecialsHtml,
} from "../src/live-pdf/core/render-monthly-specials.js";

test("normalizeText preserves the current trimmed-string contract", () => {
  assert.equal(normalizeText(null), "");
  assert.equal(normalizeText(undefined), "");
  assert.equal(normalizeText("  Paragon Purveyors  "), "Paragon Purveyors");
  assert.equal(normalizeText(2026), "2026");
});

test("normalizeKey preserves the current lowercase alphanumeric contract", () => {
  assert.equal(normalizeKey(" Black Opal — Wagyu "), "blackopalwagyu");
  assert.equal(normalizeKey("A5/BMS 8-9"), "a5bms89");
});

test("isActive preserves the accepted active values", () => {
  for (const value of ["yes", " YES ", "true", "1", "active", "Active"]) {
    assert.equal(isActive(value), true, `Expected ${JSON.stringify(value)} to be active.`);
  }

  for (const value of ["", "no", "false", "0", "inactive", null]) {
    assert.equal(isActive(value), false, `Expected ${JSON.stringify(value)} to be inactive.`);
  }
});

test("isSettingVisible preserves explicit values and fallback behavior", () => {
  assert.equal(isSettingVisible({}, "campaignMarkVisible"), true);
  assert.equal(isSettingVisible({}, "campaignMarkVisible", false), false);
  assert.equal(
    isSettingVisible({ campaignMarkVisible: "yes" }, "campaignMarkVisible", false),
    true,
  );
  assert.equal(
    isSettingVisible({ campaignMarkVisible: "no" }, "campaignMarkVisible", true),
    false,
  );
});

test("normalizeAssetPath preserves slash normalization and public-prefix removal", () => {
  assert.equal(
    normalizeAssetPath(" public\\assets\\specials\\image.webp "),
    "assets/specials/image.webp",
  );
  assert.equal(
    normalizeAssetPath("assets/specials/image.webp"),
    "assets/specials/image.webp",
  );
});

test("createPriceRows preserves the primary-only price-row shape", () => {
  assert.deepEqual(
    createPriceRows({
      primaryPriceLabel: "Whole Loin",
      primaryPrice: "$39.95/lb",
      secondaryPriceLabel: "",
      secondaryPrice: "",
    }),
    [["EA", "Whole Loin", "$39.95/lb"]],
  );
});

test("createPriceRows includes the secondary row when its label is present", () => {
  assert.deepEqual(
    createPriceRows({
      primaryPriceLabel: "Whole Loin",
      primaryPrice: "$39.95/lb",
      secondaryPriceLabel: "Cut Steaks",
      secondaryPrice: "$44.95/lb",
    }),
    [
      ["EA", "Whole Loin", "$39.95/lb"],
      ["CUT", "Cut Steaks", "$44.95/lb"],
    ],
  );
});

test("createPriceRows includes the secondary row when only its value is present", () => {
  assert.deepEqual(
    createPriceRows({
      primaryPriceLabel: "Whole Loin",
      primaryPrice: "$39.95/lb",
      secondaryPriceLabel: "",
      secondaryPrice: "$44.95/lb",
    }),
    [
      ["EA", "Whole Loin", "$39.95/lb"],
      ["CUT", "", "$44.95/lb"],
    ],
  );
});

const builderUrl = new URL("../tools/build-monthly-specials-v2.mjs", import.meta.url);

test("production builder imports the remaining Node-side Live PDF helpers", async () => {
  const source = await fs.readFile(builderUrl, "utf8");

  assert.match(
    source,
    /import \{\s+isActive,\s+normalizeAssetPath,\s+normalizeKey,\s+normalizeText,\s+\} from "\.\.\/src\/live-pdf\/core\/normalize-document\.js";/s,
  );
  assert.match(
    source,
    /import \{\s+escapeHtml,\s+renderMonthlySpecialsHtml,\s+\} from "\.\.\/src\/live-pdf\/core\/render-monthly-specials\.js";/s,
  );
  assert.doesNotMatch(
    source,
    /import \{ createPriceRows \} from "\.\.\/src\/live-pdf\/core\/format-price\.js";/,
  );
});

test("production builder contains no duplicate Live PDF helper declarations", async () => {
  const source = await fs.readFile(builderUrl, "utf8");

  for (const identifier of [
    "createPriceRows",
    "isActive",
    "isSettingVisible",
    "normalizeAssetPath",
    "normalizeKey",
    "normalizeText",
  ]) {
    assert.doesNotMatch(
      source,
      new RegExp(`\\bconst\\s+${identifier}\\s*=`),
      `Expected ${identifier} to be imported rather than redeclared.`,
    );
  }
});

test("normalizeAssetReference preserves current public-path normalization", () => {
  assert.equal(
    normalizeAssetReference("public\\assets\\specials\\image.webp"),
    "assets/specials/image.webp",
  );
  assert.equal(
    normalizeAssetReference("assets/specials/image.webp"),
    "assets/specials/image.webp",
  );
});

test("resolveAssetReference maps supported MIME types and rejects unsupported assets", () => {
  assert.deepEqual(
    resolveAssetReference("public/assets/specials/image.SVG"),
    {
      normalizedPath: "assets/specials/image.SVG",
      mimeType: "image/svg+xml",
    },
  );
  assert.deepEqual(
    resolveAssetReference("assets/specials/image.jpeg"),
    {
      normalizedPath: "assets/specials/image.jpeg",
      mimeType: "image/jpeg",
    },
  );
  assert.throws(
    () => resolveAssetReference("assets/specials/image.gif"),
    /Unsupported asset type: assets\/specials\/image\.gif/,
  );
});

test("createAssetDataUrlResolver requires injected asset dependencies", () => {
  assert.throws(
    () => createAssetDataUrlResolver({ readAsset: null, encodeBase64: () => "" }),
    /readAsset must be a function/,
  );
  assert.throws(
    () => createAssetDataUrlResolver({ readAsset: async () => new Uint8Array(), encodeBase64: null }),
    /encodeBase64 must be a function/,
  );
});

test("createAssetDataUrlResolver reads normalized assets and returns data URLs", async () => {
  const calls = [];
  const resolveDataUrl = createAssetDataUrlResolver({
    readAsset: async (normalizedPath) => {
      calls.push(normalizedPath);
      return new Uint8Array([80, 80]);
    },
    encodeBase64: (data) => Buffer.from(data).toString("base64"),
  });

  assert.equal(
    await resolveDataUrl("public\\assets\\specials\\image.png"),
    "data:image/png;base64,UFA=",
  );
  assert.deepEqual(calls, ["assets/specials/image.png"]);
});

test("production builder keeps the injected Node asset adapter and Studio parity checks", async () => {
  const source = await fs.readFile(builderUrl, "utf8");

  assert.match(
    source,
    /import \{ createAssetDataUrlResolver \} from "\.\.\/src\/live-pdf\/core\/resolve-asset\.js";/,
  );
  assert.match(
    source,
    /const toDataUrl = createAssetDataUrlResolver\(\{\s+readAsset: async \(normalizedPath\) => \{\s+const absolutePath = path\.join\(paths\.publicDir, normalizedPath\);[\s\S]*?return fs\.readFile\(absolutePath\);\s+\},\s+encodeBase64: \(data\) => data\.toString\("base64"\),\s+\}\);/,
  );
  assert.match(
    source,
    /sha256Hex\(libraryBytes\) !== sha256Hex\(productionBytes\)/,
  );
  assert.doesNotMatch(source, /const mimeTypes = new Map\(/);
});

const rendererUrl = new URL("../src/live-pdf/core/render-monthly-specials.js", import.meta.url);

const createRendererFixture = ({ settings = {}, special = {}, contacts = [] } = {}) => ({
  data: {
    settings: {
      headerBrandMarkVisible: "no",
      headerWordmarkVisible: "no",
      deliveryMessageVisible: "no",
      campaignMarkVisible: "no",
      campaignTitleVisible: "yes",
      monthVisible: "yes",
      yearVisible: "yes",
      footerBrollVisible: "no",
      month: "July",
      year: "2026",
      ...settings,
    },
    contacts,
  },
  activeSpecials: [
    {
      active: true,
      cutId: "ribeye",
      offerMode: "single-offer",
      displayName: "Ribeye",
      brand: "House",
      brandLogoKey: "",
      productLine: "Wagyu",
      marblingScore: "8-9",
      quantityAvailable: "12",
      primaryPriceLabel: "Whole Loin",
      primaryPrice: "$39.95/lb",
      secondaryPriceLabel: "",
      secondaryPrice: "",
      savingsMessage: "Save",
      description: "",
      primaryImagePath: "assets/specials/products/ribeye.webp",
      primaryImageAlt: "Ribeye",
      primaryImageFit: "contain",
      primaryImagePosition: "center",
      primaryImageZoom: 1,
      primaryImageFocusX: 50,
      primaryImageFocusY: 50,
      secondaryImagePath: "",
      ...special,
    },
  ],
  css: "/* renderer-contract */",
});

test("escapeHtml preserves current document escaping", () => {
  assert.equal(
    escapeHtml('Paragon & <Wagyu> "Special"'),
    "Paragon &amp; &lt;Wagyu&gt; &quot;Special&quot;",
  );
});

test("shared renderer returns the complete monthly document with injected CSS", async () => {
  const fixture = createRendererFixture();
  const html = await renderMonthlySpecialsHtml({
    ...fixture,
    resolveAssetDataUrl: async () => "data:image/webp;base64,UFA=",
  });

  assert.match(html, /^<!doctype html>/);
  assert.match(html, /<style>\/\* renderer-contract \*\/<\/style>/);
  assert.match(html, /<main class="monthly-specials-page"/);
  assert.match(html, /<article class="special-card" data-cut-id="ribeye"/);
  assert.match(html, /<footer class="specials-closing"/);
  assert.match(html, /<\/html>$/);
});

test("shared renderer resolves header, campaign, product, dual, and footer media through injection", async () => {
  const calls = [];
  const fixture = createRendererFixture({
    settings: {
      headerBrandMarkVisible: "yes",
      headerWordmarkVisible: "yes",
      campaignMarkVisible: "yes",
      footerBrollVisible: "yes",
      footerBrollPath: "assets/specials/broll/footer.webp",
    },
    special: {
      offerMode: "dual-offer",
      secondaryImagePath: "assets/specials/products/ribeye-secondary.webp",
      secondaryImageAlt: "Ribeye secondary",
    },
  });
  const html = await renderMonthlySpecialsHtml({
    ...fixture,
    resolveAssetDataUrl: async (assetPath) => {
      calls.push(assetPath);
      return `data:image/mock;base64,${calls.length}`;
    },
  });

  assert.deepEqual(calls, [
    "assets/brand/paragon-cow-mark.svg",
    "assets/brand/Paragon_Purveyors_logo_text.svg",
    "specials/tournaments_fifa-world-cup-2026--white_1500x1500.football-logos.cc.png",
    "assets/specials/products/ribeye.webp",
    "assets/specials/products/ribeye-secondary.webp",
    "assets/specials/broll/footer.webp",
  ]);
  assert.match(html, /special-card__image-wrap--dual/);
  assert.match(html, /specials-closing--with-broll/);
});

test("shared renderer preserves optional provider-logo text fallback", async () => {
  const fixture = createRendererFixture({
    special: {
      brand: "Black Opal",
      brandLogoKey: "black-opal",
    },
  });
  const html = await renderMonthlySpecialsHtml({
    ...fixture,
    resolveAssetDataUrl: async (assetPath) => {
      if (assetPath.includes("black-opal_modal_logo.png")) {
        throw new Error("Optional provider logo unavailable.");
      }

      return "data:image/webp;base64,UFA=";
    },
  });

  assert.match(
    html,
    /<span class="product-brand__fallback">Black Opal<\/span>/,
  );
});

test("production builder delegates monthly rendering while retaining Node orchestration", async () => {
  const [builderSource, rendererSource] = await Promise.all([
    fs.readFile(builderUrl, "utf8"),
    fs.readFile(rendererUrl, "utf8"),
  ]);

  assert.match(
    builderSource,
    /await renderMonthlySpecialsHtml\(\{\s+data,\s+activeSpecials,\s+css,\s+resolveAssetDataUrl: toDataUrl,\s+\}\)/s,
  );
  assert.match(
    builderSource,
    /const createLandingHtml = \(data, activeSpecials, buildId\) =>/,
  );
  assert.match(builderSource, /await chromium\.launch\(\{ headless: true \}\)/);
  assert.doesNotMatch(builderSource, /const createSpecialCard = async/);
  assert.doesNotMatch(builderSource, /const createHtml = async/);

  for (const pattern of [
    /from\s+["']node:/,
    /\bfs\./,
    /\bpath\./,
    /\bprocess\./,
    /\bBuffer\b/,
    /\bchromium\b/,
  ]) {
    assert.doesNotMatch(rendererSource, pattern);
  }
});
