import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  PDF_FONT_ASSETS,
  PDF_FONT_REQUIREMENTS,
  loadPdfFontCss,
  waitForPdfFonts,
} from "../tools/paragon-live-pdf-workflow/pdf-font-lock.mjs";
import { renderMonthlySpecialsHtml } from "../src/live-pdf/core/render-monthly-specials.js";

const root = path.resolve(import.meta.dirname, "..");

test("hash-locked font assets produce deterministic embedded font CSS", async () => {
  const result = await loadPdfFontCss(root);

  assert.equal(PDF_FONT_ASSETS.length, 2);
  assert.equal(PDF_FONT_REQUIREMENTS.length, 6);
  assert.match(result.css, /font-family: "Cormorant Garamond"/u);
  assert.match(result.css, /font-family: "Inter"/u);
  assert.match(result.css, /data:font\/ttf;base64,/u);
  assert.match(result.css, /font-weight: 300 700/u);
  assert.match(result.css, /font-weight: 100 900/u);
  assert.match(result.css, /font-optical-sizing: none/u);
  assert.match(result.css, /font-synthesis: none/u);
  assert.doesNotMatch(result.css, /fonts\.googleapis|fonts\.gstatic/iu);

  for (const asset of result.assets) {
    const bytes = await fs.readFile(asset.absolutePath);
    assert.equal(bytes.length, asset.bytes);
    assert.equal(asset.actualSha256, asset.sha256);
  }
});

test("shared renderer preserves production HTML when fontCss is omitted and appends fontCss when supplied", async () => {
  const fixture = {
    data: {
      settings: {
        headerBrandMarkVisible: false,
        headerWordmarkVisible: false,
        deliveryMessageVisible: false,
        campaignMarkVisible: false,
        campaignTitleVisible: true,
        monthVisible: true,
        yearVisible: true,
        month: "July / August",
        year: "2026",
        campaignTitleLine1: "Selected",
        campaignTitleLine2: "Cuts",
      },
      contacts: [],
    },
    activeSpecials: [],
    css: "body { color: white; }",
    resolveAssetDataUrl: async () => "",
  };

  const production = await renderMonthlySpecialsHtml(fixture);
  const fontLocked = await renderMonthlySpecialsHtml({
    ...fixture,
    fontCss: "body { font-family: Inter, sans-serif; }",
  });

  assert.match(production, /<style>body \{ color: white; \}<\/style>/u);
  assert.doesNotMatch(production, /font-family: Inter/u);
  assert.match(
    fontLocked,
    /<style>body \{ color: white; \}\nbody \{ font-family: Inter, sans-serif; \}<\/style>/u,
  );
});

test("font readiness accepts a complete browser report and rejects unresolved fonts", async () => {
  const validPage = {
    evaluate: async (_function, payload) => ({
      ready: true,
      timeout: false,
      status: "loaded",
      error: null,
      requirements: payload.requirements.map((item) => ({
        ...item,
        ready: true,
      })),
      selectors: payload.selectors.map((item) => ({
        ...item,
        present: true,
        computedFamily: `"${item.family}", serif`,
        primaryFamily: item.family,
        ready: true,
      })),
    }),
  };
  const invalidPage = {
    evaluate: async (_function, payload) => ({
      ready: false,
      timeout: false,
      status: "loaded",
      error: null,
      requirements: payload.requirements.map((item, index) => ({
        ...item,
        ready: index !== 0,
      })),
      selectors: [],
    }),
  };

  const report = await waitForPdfFonts(validPage);
  assert.equal(report.ready, true);
  await assert.rejects(
    waitForPdfFonts(invalidPage),
    /PDF font lock did not resolve/u,
  );
});

