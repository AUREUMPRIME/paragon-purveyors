import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

import { adaptCanonicalDocument } from "../src/live-pdf/core/adapt-canonical-document.js";
import { renderMonthlySpecialsHtml } from "../src/live-pdf/core/render-monthly-specials.js";
import { createAssetDataUrlResolver } from "../src/live-pdf/core/resolve-asset.js";
import { loadPdfFontCss, waitForPdfFonts } from "./paragon-live-pdf-workflow/pdf-font-lock.mjs";

const root = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(
  root,
  "src/data/paragon-live-pdf-studio.json",
);
const cssPath = path.join(root, "src/live-pdf/monthly-specials.css");
const productionHtmlPath = path.join(
  root,
  "public/specials/monthly-specials.html",
);
const geometryModulePath = path.join(
  root,
  "src/live-pdf-studio/review-geometry.js",
);

const normalizeComparableHtml = (value) =>
  String(value)
    .replace(/\r\n/g, "\n")
    .replace(/^[ \t]+$/gm, "")
    .trim();

const countPdfPages = (pdfText) =>
  [...pdfText.matchAll(/\/Type\s*\/Page\b/g)].length;

const validatePdfBytes = (bytes) => {
  const text = bytes.toString("latin1");
  const pageCount = countPdfPages(text);
  const mediaBox = /\/MediaBox\s*\[\s*0\s+0\s+612\s+1008\s*\]/.test(
    text,
  );

  return Object.freeze({
    bytes: bytes.length,
    pageCount,
    mediaBox,
    isValid: bytes.length >= 10000 && pageCount === 1 && mediaBox,
  });
};

const waitForImages = async (page) => {
  await page.waitForFunction(
    () => [...document.images].every((image) => image.complete),
    { timeout: 10000 },
  );

  return page.evaluate(() =>
    [...document.images].map((image, index) => ({
      index,
      alt: image.alt || "",
      src: image.currentSrc || image.src || "",
      ready: Boolean(image.complete && image.naturalWidth > 0),
    })),
  );
};

const main = async () => {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "paragon-live-pdf-geometry-"),
  );
  const tempPdfPath = path.join(tempRoot, "monthly-specials.pdf");
  let browser = null;

  try {
    const [document, css, productionHtml, geometrySource, fontLock] =
      await Promise.all([
        fs.readFile(sourcePath, "utf8").then(JSON.parse),
        fs.readFile(cssPath, "utf8"),
        fs.readFile(productionHtmlPath, "utf8"),
        fs.readFile(geometryModulePath, "utf8"),
        loadPdfFontCss(root),
      ]);
    const adapted = adaptCanonicalDocument(document);
    const resolveAssetDataUrl = createAssetDataUrlResolver({
      readAsset: (normalizedPath) =>
        fs.readFile(path.join(root, "public", normalizedPath)),
      encodeBase64: (data) => data.toString("base64"),
    });
    const productionComparableHtml = (
      await renderMonthlySpecialsHtml({
        data: adapted,
        activeSpecials: adapted.specials,
        css,
        resolveAssetDataUrl,
      })
    ).replace(/^[ \t]+$/gm, "");
    const html = (
      await renderMonthlySpecialsHtml({
        data: adapted,
        activeSpecials: adapted.specials,
        css,
        fontCss: fontLock.css,
        resolveAssetDataUrl,
      })
    ).replace(/^[ \t]+$/gm, "");

    if (
      normalizeComparableHtml(productionComparableHtml) !==
      normalizeComparableHtml(productionHtml)
    ) {
      throw new Error(
        "Canonical Studio source no longer reproduces the committed production HTML.",
      );
    }

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 816, height: 1344 },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: "networkidle" });

    const imageResults = await waitForImages(page);
    const failedImages = imageResults.filter((result) => !result.ready);

    if (failedImages.length) {
      throw new Error(
        `Temporary Review PDF contains ${failedImages.length} unresolved image(s).`,
      );
    }

    const fontResults = await waitForPdfFonts(page);

    const geometryModuleUrl = `data:text/javascript;base64,${Buffer.from(
      geometrySource,
    ).toString("base64")}`;
    const geometry = await page.evaluate(async (moduleUrl) => {
      const { inspectGeometryDocument } = await import(moduleUrl);
      return inspectGeometryDocument(document);
    }, geometryModuleUrl);

    if (!geometry.isValid) {
      throw new Error(
        `DOM geometry validation failed: ${geometry.issues
          .map((issue) => issue.message)
          .join(" | ")}`,
      );
    }

    await page.pdf({
      path: tempPdfPath,
      format: "Legal",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    const pdfResult = validatePdfBytes(await fs.readFile(tempPdfPath));

    if (!pdfResult.isValid) {
      throw new Error(
        `Temporary PDF acceptance failed: ${pdfResult.bytes} bytes, ${pdfResult.pageCount} page(s), MediaBox=${pdfResult.mediaBox}.`,
      );
    }

    console.log("[PASS] LIVE PDF GEOMETRY AND PARITY ACCEPTANCE VERIFIED");
    console.log("[HTML PARITY] Canonical source matches committed production HTML");
    console.log(`[DOM GUARDRAILS] ${geometry.guardrailCount}`);
    console.log(`[DOM NODES CHECKED] ${geometry.checkedCount}`);
    console.log(`[PAGE FRAME] ${geometry.pageWidth} x ${geometry.pageHeight} CSS pixels`);
    console.log(`[IMAGES READY] ${imageResults.length}`);
    console.log(`[PDF FONT REQUIREMENTS READY] ${fontResults.requirements.length}`);
    console.log(`[PDF FONT SELECTORS READY] ${fontResults.selectors.length}`);
    console.log(`[PDF BYTES] ${pdfResult.bytes}`);
    console.log(`[PDF PAGES] ${pdfResult.pageCount}`);
    console.log("[PDF MEDIABOX] 0 0 612 1008");
    console.log("[TEMP DIRECTORY] Removed after validation");
    console.log("[PRODUCTION OUTPUTS] Unchanged");
  } finally {
    await browser?.close();
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
};

await main();
