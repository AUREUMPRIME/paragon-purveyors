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
} from "../src/live-pdf/core/render-monthly-specials.js";import {
  adaptCanonicalDocument,
  formatCanonicalPrice,
  resolveCanonicalAsset,
} from "../src/live-pdf/core/adapt-canonical-document.js";
import {
  validatePublicationSource,
} from "../src/live-pdf/core/validate-publication-source.js";

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

test("shared renderer makes contact phones clickable without changing visible text", async () => {
  const fixture = createRendererFixture({
    contacts: [
      {
        active: true,
        name: "Blake B.",
        location: "Irvine / Orange County",
        phone: "(949) 303-9726",
        email: "blake@paragonpurveyors.com",
      },
      {
        active: true,
        name: "Clayton U.",
        location: "French Valley / Temecula",
        phone: "(951) 414-5230",
        email: "clay@paragonpurveyors.com",
      },
    ],
  });

  const html = await renderMonthlySpecialsHtml({
    ...fixture,
    resolveAssetDataUrl: async () => "data:image/webp;base64,UFA=",
  });

  assert.match(
    html,
    /class="contact-phone-link" href="tel:\+19493039726">\(949\) 303-9726<\/a>/,
  );
  assert.match(
    html,
    /class="contact-phone-link" href="tel:\+19514145230">\(951\) 414-5230<\/a>/,
  );
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

const sharedMonthlyCssUrl = new URL(
  "../src/live-pdf/monthly-specials.css",
  import.meta.url,
);
const legacyMonthlyCssUrl = new URL(
  "../src/specials/monthly-specials-v2.css",
  import.meta.url,
);
const studioControllerUrl = new URL(
  "../tools/paragon-cut-image-studio/controller.mjs",
  import.meta.url,
);
const productionMonthlyHtmlUrl = new URL(
  "../public/specials/monthly-specials.html",
  import.meta.url,
);

const normalizeCssText = (value) =>
  String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

test("shared monthly CSS is the single committed source authority", async () => {
  const css = await fs.readFile(sharedMonthlyCssUrl, "utf8");

  assert.match(css, /^@page \{/);
  assert.match(css, /\.monthly-specials-page \{/);
  await assert.rejects(
    fs.access(legacyMonthlyCssUrl),
    (error) => error?.code === "ENOENT",
  );
});

test("production builder reads the shared monthly CSS authority", async () => {
  const source = await fs.readFile(builderUrl, "utf8");

  assert.match(
    source,
    /sourceCss: path\.join\(projectRoot, "src", "live-pdf", "monthly-specials\.css"\)/,
  );
  assert.doesNotMatch(
    source,
    /sourceCss: path\.join\(projectRoot, "src", "specials", "monthly-specials-v2\.css"\)/,
  );
});

test("Studio browser loads the shared CSS authority for renderer-driven context", async () => {
  const studioIndex = await fs.readFile(
    new URL(
      "../tools/paragon-cut-image-studio/index.html",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    studioIndex,
    /const loadSharedCss = async \(\) =>/,
  );
  assert.match(
    studioIndex,
    /fetch\(\s*"\/context\/monthly-specials\.css"/,
  );
  assert.match(
    studioIndex,
    /css: sharedCss/,
  );
  assert.doesNotMatch(
    studioIndex,
    /<link rel="stylesheet" href="\/context\/monthly-specials\.css">/,
  );
});

test("Studio controller serves the shared monthly CSS authority", async () => {
  const controller = await fs.readFile(studioControllerUrl, "utf8");

  assert.match(
    controller,
    /const livePdfRoot = path\.join\(\s+projectRoot,\s+"src",\s+"live-pdf",\s+\);/s,
  );
  assert.match(
    controller,
    /const sharedCssPath = path\.join\(\s+livePdfRoot,\s+"monthly-specials\.css",\s+\);/s,
  );
  assert.match(
    controller,
    /requestUrl\.pathname === "\/context\/monthly-specials\.css"[\s\S]*?await fs\.readFile\(sharedCssPath, "utf8"\)[\s\S]*?"text\/css; charset=utf-8"/,
  );
});

test("production monthly HTML embeds the shared CSS bytes", async () => {
  const [css, html] = await Promise.all([
    fs.readFile(sharedMonthlyCssUrl, "utf8"),
    fs.readFile(productionMonthlyHtmlUrl, "utf8"),
  ]);
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);

  assert.ok(styleMatch, "Expected production monthly HTML to contain one style block.");
  assert.equal(normalizeCssText(styleMatch[1]), normalizeCssText(css));
});

const canonicalSourceUrl = new URL(
  "../src/data/paragon-live-pdf-studio.json",
  import.meta.url,
);
const liveMonthlyJsonUrl = new URL(
  "../public/specials/monthly-specials.json",
  import.meta.url,
);
const canonicalAdapterUrl = new URL(
  "../src/live-pdf/core/adapt-canonical-document.js",
  import.meta.url,
);

const readJsonUrl = async (url) =>
  JSON.parse(await fs.readFile(url, "utf8"));

const settingsProjectionKeys = [
  "month",
  "monthVisible",
  "year",
  "yearVisible",
  "headerBrandMarkVisible",
  "headerWordmarkVisible",
  "deliveryMessage",
  "deliveryMessageVisible",
  "campaignMarkPath",
  "campaignMarkAlt",
  "campaignMarkVisible",
  "campaignTitleLine1",
  "campaignTitleLine2",
  "campaignTitleVisible",
  "headerSupportingLine",
  "headerSupportingLineVisible",
  "contactInstruction",
  "footerMessage",
  "disclaimer",
  "footerButtonLabel",
  "footerUrl",
  "footerBrollAlt",
  "footerBrollVisible",
  "footerBrollFit",
  "footerBrollPosition",
  "footerBrollZoom",
  "footerBrollFocusX",
  "footerBrollFocusY",
  "footerBrollOpacity",
  "footerBrollSaturation",
  "footerBrollContrast",
  "footerBrollBrightness",
];

const specialProjectionKeys = [
  "sort",
  "active",
  "cutId",
  "offerMode",
  "displayName",
  "brand",
  "brandLogoKey",
  "productLine",
  "marblingScore",
  "quantityAvailable",
  "primaryPriceLabel",
  "primaryPrice",
  "primaryImageAlt",
  "primaryImageFit",
  "primaryImagePosition",
  "primaryImageZoom",
  "primaryImageFocusX",
  "primaryImageFocusY",
  "secondaryPriceLabel",
  "secondaryPrice",
  "secondaryImageAlt",
  "secondaryImageFit",
  "secondaryImagePosition",
  "secondaryImageZoom",
  "secondaryImageFocusX",
  "secondaryImageFocusY",
  "savingsMessage",
  "description",
];

const projectKeys = (value, keys) =>
  Object.fromEntries(keys.map((key) => [key, value[key]]));

const normalizeComparableHtml = (value) =>
  String(value)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trimEnd();

test("canonical asset resolution enforces active asset-library references", async () => {
  const document = await readJsonUrl(canonicalSourceUrl);
  const asset = resolveCanonicalAsset(
    document,
    document.footer.broll,
    "footer.broll",
  );

  assert.equal(asset.id, document.footer.broll.assetId);
  assert.equal(asset.archived, false);
  assert.match(asset.path, /^assets\/specials\/library\//);

  assert.throws(
    () =>
      resolveCanonicalAsset(
        document,
        { assetId: "asset_missing" },
        "missing",
      ),
    /references missing asset/,
  );

  const archivedDocument = structuredClone(document);
  archivedDocument.assetLibrary[document.footer.broll.assetId].archived = true;

  assert.throws(
    () =>
      resolveCanonicalAsset(
        archivedDocument,
        archivedDocument.footer.broll,
        "footer.broll",
      ),
    /references archived asset/,
  );
});

test("canonical price formatting preserves publication currency and locale", () => {
  assert.equal(
    formatCanonicalPrice(249, {
      currency: "USD",
      locale: "en-US",
    }),
    "$249.00",
  );

  assert.throws(
    () => formatCanonicalPrice(-1, { currency: "USD", locale: "en-US" }),
    /non-negative number/,
  );
});

test("canonical adapter preserves the current renderer-facing business contract", async () => {
  const [document, live] = await Promise.all([
    readJsonUrl(canonicalSourceUrl),
    readJsonUrl(liveMonthlyJsonUrl),
  ]);
  const adapted = adaptCanonicalDocument(document);

  assert.deepEqual(
    projectKeys(adapted.settings, settingsProjectionKeys),
    projectKeys(live.settings, settingsProjectionKeys),
  );
  assert.deepEqual(adapted.contacts, live.contacts);
  assert.deepEqual(
    adapted.specials.map((special) =>
      projectKeys(special, specialProjectionKeys),
    ),
    live.specials.map((special) =>
      projectKeys(special, specialProjectionKeys),
    ),
  );
  assert.equal(adapted.source.type, "canonical");
  assert.equal(adapted.visualSource.type, "canonical-document");
});

test("canonical document adapter remains browser-safe", async () => {
  const source = await fs.readFile(canonicalAdapterUrl, "utf8");

  for (const pattern of [
    /from\s+["']node:/,
    /\bfs\./,
    /\bpath\./,
    /\bprocess\./,
    /\bBuffer\b/,
    /\bchromium\b/,
  ]) {
    assert.doesNotMatch(source, pattern);
  }
});

test("adapted canonical document reproduces the current production HTML", async () => {
  const [document, css, productionHtml] = await Promise.all([
    readJsonUrl(canonicalSourceUrl),
    fs.readFile(sharedMonthlyCssUrl, "utf8"),
    fs.readFile(productionMonthlyHtmlUrl, "utf8"),
  ]);
  const adapted = adaptCanonicalDocument(document);
  const activeSpecials = [...adapted.specials].sort(
    (left, right) => Number(left.sort) - Number(right.sort),
  );
  const resolveAssetDataUrl = createAssetDataUrlResolver({
    readAsset: async (normalizedPath) =>
      fs.readFile(
        new URL(`../public/${normalizedPath}`, import.meta.url),
      ),
    encodeBase64: (data) => data.toString("base64"),
  });
  const rendered = (
    await renderMonthlySpecialsHtml({
      data: adapted,
      activeSpecials,
      css,
      resolveAssetDataUrl,
    })
  ).replace(/^[ \t]+$/gm, "");

  assert.equal(
    normalizeComparableHtml(rendered),
    normalizeComparableHtml(productionHtml),
  );
});

const browserAssetAdapterUrl = new URL(
  "../src/live-pdf/browser/resolve-browser-asset.js",
  import.meta.url,
);
const studioIndexUrl = new URL(
  "../tools/paragon-cut-image-studio/index.html",
  import.meta.url,
);

test("browser asset URL resolver normalizes production and Studio paths", async () => {
  const {
    createBrowserAssetUrlResolver,
    resolveBrowserAssetUrl,
  } = await import(browserAssetAdapterUrl);

  const baseUrl = "http://127.0.0.1:5190/";

  assert.equal(
    resolveBrowserAssetUrl(
      "public\\assets\\specials\\image.webp",
      { baseUrl },
    ),
    "http://127.0.0.1:5190/assets/specials/image.webp",
  );
  assert.equal(
    resolveBrowserAssetUrl(
      "/library/ribeye/image.webp",
      { baseUrl },
    ),
    "http://127.0.0.1:5190/library/ribeye/image.webp",
  );

  const resolveAsset = createBrowserAssetUrlResolver({
    baseUrl,
  });

  assert.equal(
    await resolveAsset("assets/brand/logo.svg"),
    "http://127.0.0.1:5190/assets/brand/logo.svg",
  );
});

test("browser asset URL resolver preserves browser-native references and requires a base URL", async () => {
  const {
    resolveBrowserAssetUrl,
  } = await import(browserAssetAdapterUrl);

  for (const reference of [
    "data:image/png;base64,UFA=",
    "blob:http://127.0.0.1:5190/asset",
    "https://example.com/image.webp",
  ]) {
    assert.equal(
      resolveBrowserAssetUrl(reference, {
        baseUrl: "http://127.0.0.1:5190/",
      }),
      reference,
    );
  }

  assert.throws(
    () =>
      resolveBrowserAssetUrl(
        "assets/image.webp",
        { baseUrl: "" },
      ),
    /baseUrl is required/,
  );
});

test("Studio controller exposes the canonical document and allowlisted shared ESM routes", async () => {
  const controller = await fs.readFile(
    studioControllerUrl,
    "utf8",
  );

  assert.match(
    controller,
    /const canonicalDocumentPath = path\.join\([\s\S]*?"paragon-live-pdf-studio\.json"[\s\S]*?\);/,
  );
  assert.match(
    controller,
    /const sharedModulePaths = new Map\(\[[\s\S]*?"\/live-pdf\/core\/adapt-canonical-document\.js"[\s\S]*?"\/live-pdf\/core\/render-monthly-specials\.js"[\s\S]*?"\/live-pdf\/browser\/resolve-browser-asset\.js"[\s\S]*?\]\);/,
  );
  assert.match(
    controller,
    /requestUrl\.pathname === "\/api\/canonical-document"[\s\S]*?await readCanonicalDocument\(\)/,
  );
  assert.match(
    controller,
    /sharedModulePaths\.has\(requestUrl\.pathname\)[\s\S]*?"text\/javascript; charset=utf-8"/,
  );
});

test("Studio controller serves shared CSS and safe public assets", async () => {
  const controller = await fs.readFile(
    studioControllerUrl,
    "utf8",
  );

  assert.match(
    controller,
    /requestUrl\.pathname === "\/context\/monthly-specials\.css"[\s\S]*?await fs\.readFile\(sharedCssPath, "utf8"\)/,
  );
  assert.match(
    controller,
    /const resolveSafeChild = \(root, relativePath\) =>[\s\S]*?normalizedCandidate\.startsWith\(rootPrefix\)/,
  );
  assert.match(
    controller,
    /requestUrl\.pathname\.startsWith\("\/assets\/"\)[\s\S]*?resolveSafeChild\(\s*publicAssetsRoot,\s*relativeAssetPath,\s*\)[\s\S]*?allowedExtensions\.has\(extension\)/,
  );
});

test("Studio validation probes the exact shared-renderer srcdoc preview", async () => {
  const [controller, studioIndex] =
    await Promise.all([
      fs.readFile(studioControllerUrl, "utf8"),
      fs.readFile(studioIndexUrl, "utf8"),
    ]);

  assert.match(
    controller,
    /await verifyTransportFoundation\(studioUrl\)/,
  );
  assert.match(
    controller,
    /Shared renderer supplies the iframe through srcdoc/,
  );
  assert.match(
    studioIndex,
    /frame\.srcdoc =\s+await renderProductionContextHtml\(\);/,
  );
  assert.doesNotMatch(
    studioIndex,
    /frame\.src = "\/context\/monthly-specials-v2\.html";/,
  );
});

test("Studio browser imports the committed canonical adapter and shared renderer", async () => {
  const studioIndex = await fs.readFile(
    studioIndexUrl,
    "utf8",
  );

  assert.match(studioIndex, /<script type="module">/);
  assert.match(
    studioIndex,
    /from "\/live-pdf\/core\/render-monthly-specials\.js"/,
  );
  assert.match(
    studioIndex,
    /from "\/live-pdf\/core\/adapt-canonical-document\.js"/,
  );
  assert.match(
    studioIndex,
    /from "\/live-pdf\/browser\/resolve-browser-asset\.js"/,
  );
});

test("Studio browser renders the canonical document through the shared renderer", async () => {
  const studioIndex = await fs.readFile(
    studioIndexUrl,
    "utf8",
  );

  assert.match(
    studioIndex,
    /const loadCanonicalDocument = async \(\) =>/,
  );
  assert.match(
    studioIndex,
    /adaptCanonicalDocument\(canonicalDocument\)/,
  );
  assert.match(
    studioIndex,
    /return renderMonthlySpecialsHtml\(\{/,
  );
  assert.match(
    studioIndex,
    /activeSpecials: data\.specials/,
  );
  assert.match(
    studioIndex,
    /createBrowserAssetUrlResolver\(\{/,
  );
});

test("Studio browser removes duplicate escaping and static context dependencies", async () => {
  const studioIndex = await fs.readFile(
    studioIndexUrl,
    "utf8",
  );

  assert.doesNotMatch(
    studioIndex,
    /const escapeHtml = \(value\) =>/,
  );
  assert.doesNotMatch(
    studioIndex,
    /monthly-specials-v2\.html/,
  );
  assert.match(
    studioIndex,
    /window\.__PARAGON_SHARED_RENDERER_PREVIEW__ = true/,
  );
});

test("Studio controller removes and rejects the obsolete static context route", async () => {
  const controller = await fs.readFile(
    studioControllerUrl,
    "utf8",
  );

  assert.doesNotMatch(
    controller,
    /const contextTemplatePath = path\.join/,
  );
  assert.doesNotMatch(
    controller,
    /await fs\.readFile\(contextTemplatePath, "utf8"\)/,
  );
  assert.match(
    controller,
    /"\/context\/monthly-specials-v2\.html",/,
  );
  assert.match(
    controller,
    /initial\.context\.usesSrcdoc !== true/,
  );
});

test("Studio deletes the stale context duplicate while preserving interaction selectors", async () => {
  const studioIndex = await fs.readFile(
    studioIndexUrl,
    "utf8",
  );
  const staticContextUrl = new URL(
    "../tools/paragon-cut-image-studio/context/monthly-specials-v2.html",
    import.meta.url,
  );

  await assert.rejects(
    fs.access(staticContextUrl),
    (error) => error?.code === "ENOENT",
  );

  for (const pattern of [
    /const resolveContextElements = \(slot\) =>/,
    /\.footer-broll/,
    /\.specials-closing__media/,
    /\.special-card__image/,
    /data-cut-id/,
    /bindProductionContext\(\)/,
    /updateAllContextSlots\(\)/,
  ]) {
    assert.match(studioIndex, pattern);
  }
});

test("publication source validator preserves every non-production preview source", () => {
  const cases = [
    ["google", "google"],
    [" JSON ", "json"],
    ["fixture", "fixture"],
    ["unknown", "unknown"],
    ["", "unknown"],
    [null, "unknown"],
    [undefined, "unknown"],
  ];

  for (const [sourceType, expected] of cases) {
    assert.equal(
      validatePublicationSource({
        publishMode: false,
        sourceType,
      }),
      expected,
    );
  }
});

test("publication source validator accepts only Google business data for production", () => {
  assert.equal(
    validatePublicationSource({
      publishMode: true,
      sourceType: " GOOGLE ",
    }),
    "google",
  );

  for (const sourceType of [
    "json",
    "fixture",
    "unknown",
    "",
    null,
    undefined,
  ]) {
    assert.throws(
      () =>
        validatePublicationSource({
          publishMode: true,
          sourceType,
        }),
      /Production publication requires Google business data/,
    );
  }
});

test("production builder validates business source before rendering or writing outputs", async () => {
  const source = await fs.readFile(builderUrl, "utf8");

  assert.match(
    source,
    /import \{ validatePublicationSource \} from "\.\.\/src\/live-pdf\/core\/validate-publication-source\.js";/,
  );

  const businessDataIndex = source.indexOf(
    "const businessData = await loadSourceData();",
  );
  const guardIndex = source.indexOf(
    "validatePublicationSource({",
  );
  const outputDirectoryIndex = source.indexOf(
    "await fs.mkdir(paths.outputDir",
  );
  const visualAuthorityIndex = source.indexOf(
    "const visualAuthority = await loadVisualAuthority();",
  );
  const rendererIndex = source.indexOf(
    "await renderMonthlySpecialsHtml({",
  );
  const writeIndex = source.indexOf(
    "await fs.writeFile(activeOutputPaths.html",
  );

  for (const [label, index] of [
    ["business data", businessDataIndex],
    ["publication guard", guardIndex],
    ["output directory", outputDirectoryIndex],
    ["visual authority", visualAuthorityIndex],
    ["renderer", rendererIndex],
    ["publication write", writeIndex],
  ]) {
    assert.ok(
      index >= 0,
      "Missing builder evidence: " + label,
    );
  }

  assert.ok(businessDataIndex < guardIndex);
  assert.ok(guardIndex < outputDirectoryIndex);
  assert.ok(guardIndex < visualAuthorityIndex);
  assert.ok(guardIndex < rendererIndex);
  assert.ok(guardIndex < writeIndex);

  assert.doesNotMatch(
    source,
    /paragon-live-pdf-studio\.json|adaptCanonicalDocument/,
  );
});
