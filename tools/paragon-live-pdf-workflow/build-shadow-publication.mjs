import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { chromium } from "playwright";

import { adaptCanonicalDocument } from "../../src/live-pdf/core/adapt-canonical-document.js";
import { renderMonthlySpecialsHtml } from "../../src/live-pdf/core/render-monthly-specials.js";
import { createAssetDataUrlResolver } from "../../src/live-pdf/core/resolve-asset.js";

export const SHADOW_FILE_NAMES = Object.freeze({
  html: "studio-preview.html",
  json: "studio-preview.json",
  pdf: "studio-preview.pdf",
  metadata: "publication-metadata.json",
});

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const freeze = (value) => Object.freeze(value);
const normalizeHtml = (value) => String(value).replace(/\r\n/gu, "\n").replace(/^[ \t]+$/gmu, "").trim();
const countPdfPages = (text) => [...text.matchAll(/\/Type\s*\/Page\b/gu)].length;

const validatePdfBytes = (bytes) => {
  const text = bytes.toString("latin1");
  const pageCount = countPdfPages(text);
  const mediaBox = /\/MediaBox\s*\[\s*0\s+0\s+612\s+1008\s*\]/u.test(text);
  return freeze({
    bytes: bytes.length,
    pageCount,
    mediaBox,
    isValid: bytes.length >= 10000 && pageCount === 1 && mediaBox,
  });
};

const assertSafeOutputDirectory = (projectRoot, outputDirectory) => {
  const project = path.resolve(projectRoot);
  const output = path.resolve(outputDirectory);
  const protectedRoots = [
    project,
    path.join(project, "public"),
    path.join(project, "src"),
    path.join(project, ".github"),
  ];

  if (output === path.parse(output).root) {
    throw new Error("Shadow output directory cannot be a filesystem root.");
  }

  for (const protectedRoot of protectedRoots) {
    const relative = path.relative(protectedRoot, output);
    if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
      throw new Error(`Shadow output directory cannot be inside ${protectedRoot}.`);
    }
  }

  return output;
};

const assertSafeSvg = (text, label) => {
  if (
    /<\s*(?:script|foreignObject|iframe|object|embed|audio|video)\b/iu.test(text) ||
    /\bon[a-z]+\s*=/iu.test(text) ||
    /(?:javascript|data\s*:\s*text\/html)\s*:/iu.test(text) ||
    /<\s*(?:image|use)\b[^>]*(?:href|xlink:href)\s*=\s*["'](?:https?:|\/\/)/iu.test(text)
  ) {
    throw new Error(`Unsafe active SVG content: ${label}`);
  }
};

export const validateCanonicalShadowSource = async ({
  document,
  schema,
  projectRoot,
} = {}) => {
  const ajv = new Ajv({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  if (!validate(document)) {
    throw new Error(
      `Canonical shadow source failed schema validation: ${ajv.errorsText(validate.errors)}`,
    );
  }

  const activeSpecials = document.specials.filter((item) => item.active === true);
  const activeContacts = document.contacts.items.filter((item) => item.active === true);

  if (activeSpecials.length !== 4) {
    throw new Error(`The v1 shadow profile requires exactly four active specials. Found: ${activeSpecials.length}`);
  }

  if (activeContacts.length < 1 || activeContacts.length > 2) {
    throw new Error(`The v1 shadow profile requires one or two active contacts. Found: ${activeContacts.length}`);
  }

  const seenIds = new Set();
  const assets = [];

  for (const [assetId, asset] of Object.entries(document.assetLibrary)) {
    if (assetId !== asset.id || seenIds.has(assetId)) {
      throw new Error(`Asset identity is invalid or duplicated: ${assetId}`);
    }
    seenIds.add(assetId);

    if (!/^assets\/specials\/library\//u.test(asset.path)) {
      throw new Error(`Asset path is outside the content-addressed library: ${asset.path}`);
    }

    const publicRoot = path.resolve(projectRoot, "public");
    const absolutePath = path.resolve(publicRoot, asset.path);
    const relativeAssetPath = path.relative(publicRoot, absolutePath);
    if (relativeAssetPath.startsWith("..") || path.isAbsolute(relativeAssetPath)) {
      throw new Error(`Asset path escapes the public directory: ${asset.path}`);
    }
    const bytes = await fs.readFile(absolutePath);
    const actualHash = sha256(bytes);

    if (actualHash !== asset.sha256 || bytes.length !== asset.bytes) {
      throw new Error(`Asset bytes do not match the canonical record: ${assetId}`);
    }

    if (asset.mimeType === "image/svg+xml") {
      if (!/^(?:brand-mark|wordmark|campaign-mark|product-brand-logo)$/u.test(asset.category)) {
        throw new Error(`SVG is not assigned to an approved logo category: ${assetId}`);
      }
      assertSafeSvg(bytes.toString("utf8"), assetId);
    }

    assets.push(freeze({
      id: assetId,
      path: asset.path,
      sha256: actualHash,
      bytes: bytes.length,
    }));
  }

  return freeze({
    activeSpecials: activeSpecials.length,
    activeContacts: activeContacts.length,
    assets: freeze(assets),
  });
};

const waitForImages = async (page) => {
  await page.waitForFunction(
    () => [...document.images].every((image) => image.complete),
    { timeout: 10000 },
  );

  return page.evaluate(() => [...document.images].map((image) => ({
    ready: Boolean(image.complete && image.naturalWidth > 0),
    alt: image.alt || "",
  })));
};

export const buildShadowPublication = async ({
  projectRoot,
  outputDirectory,
  generatedAt = new Date().toISOString(),
  launchBrowser = (options) => chromium.launch(options),
} = {}) => {
  if (!projectRoot || !outputDirectory) {
    throw new TypeError("projectRoot and outputDirectory are required.");
  }

  const safeOutputDirectory = assertSafeOutputDirectory(projectRoot, outputDirectory);
  const sourcePath = path.join(projectRoot, "src/data/paragon-live-pdf-studio.json");
  const schemaPath = path.join(projectRoot, "src/live-pdf/schema/paragon-live-pdf-studio.schema.json");
  const cssPath = path.join(projectRoot, "src/live-pdf/monthly-specials.css");
  const geometryPath = path.join(projectRoot, "src/live-pdf-studio/review-geometry.js");
  const [document, schema, css, geometrySource] = await Promise.all([
    fs.readFile(sourcePath, "utf8").then(JSON.parse),
    fs.readFile(schemaPath, "utf8").then(JSON.parse),
    fs.readFile(cssPath, "utf8"),
    fs.readFile(geometryPath, "utf8"),
  ]);

  const sourceAcceptance = await validateCanonicalShadowSource({
    document,
    schema,
    projectRoot,
  });
  const adapted = adaptCanonicalDocument(document);
  const resolveAssetDataUrl = createAssetDataUrlResolver({
    readAsset: (assetPath) => fs.readFile(path.join(projectRoot, "public", assetPath)),
    encodeBase64: (data) => data.toString("base64"),
  });
  const html = normalizeHtml(await renderMonthlySpecialsHtml({
    data: adapted,
    activeSpecials: adapted.specials,
    css,
    resolveAssetDataUrl,
  }));

  if ([...html.matchAll(/<article\s+class="special-card"(?:\s|>)/gu)].length !== 4) {
    throw new Error("Shadow HTML must contain exactly four product cards.");
  }

  await fs.rm(safeOutputDirectory, { recursive: true, force: true });
  await fs.mkdir(safeOutputDirectory, { recursive: true });

  let browser = null;
  try {
    browser = await launchBrowser({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 816, height: 1344 },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: "networkidle" });
    const images = await waitForImages(page);

    if (images.some((image) => !image.ready)) {
      throw new Error("Shadow HTML contains unresolved images.");
    }

    const geometryModuleUrl = `data:text/javascript;base64,${Buffer.from(geometrySource).toString("base64")}`;
    const geometry = await page.evaluate(async (moduleUrl) => {
      const { inspectGeometryDocument } = await import(moduleUrl);
      return inspectGeometryDocument(document);
    }, geometryModuleUrl);

    if (!geometry.isValid) {
      throw new Error(`Shadow geometry failed: ${geometry.issues.map((issue) => issue.message).join(" | ")}`);
    }

    const pdfPath = path.join(safeOutputDirectory, SHADOW_FILE_NAMES.pdf);
    await page.pdf({
      path: pdfPath,
      format: "Legal",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    const jsonBytes = Buffer.from(`${JSON.stringify(document, null, 2)}\n`, "utf8");
    const htmlBytes = Buffer.from(`${html}\n`, "utf8");
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfAcceptance = validatePdfBytes(pdfBytes);

    if (!pdfAcceptance.isValid) {
      throw new Error("Shadow PDF must be one non-empty US Legal portrait page.");
    }

    await Promise.all([
      fs.writeFile(path.join(safeOutputDirectory, SHADOW_FILE_NAMES.json), jsonBytes),
      fs.writeFile(path.join(safeOutputDirectory, SHADOW_FILE_NAMES.html), htmlBytes),
    ]);

    const files = {
      html: { file: SHADOW_FILE_NAMES.html, bytes: htmlBytes.length, sha256: sha256(htmlBytes) },
      json: { file: SHADOW_FILE_NAMES.json, bytes: jsonBytes.length, sha256: sha256(jsonBytes) },
      pdf: { file: SHADOW_FILE_NAMES.pdf, bytes: pdfBytes.length, sha256: sha256(pdfBytes) },
    };
    const metadata = {
      schemaVersion: 1,
      type: "paragon-studio-shadow",
      generatedAt,
      documentId: document.documentId,
      revision: document.revision,
      files,
      acceptance: {
        activeSpecials: sourceAcceptance.activeSpecials,
        activeContacts: sourceAcceptance.activeContacts,
        assetCount: sourceAcceptance.assets.length,
        imageCount: images.length,
        guardrailCount: geometry.guardrailCount,
        checkedNodeCount: geometry.checkedCount,
        pageWidth: geometry.pageWidth,
        pageHeight: geometry.pageHeight,
        pdfPages: pdfAcceptance.pageCount,
        pdfMediaBox: "0 0 612 1008",
      },
    };
    const metadataBytes = Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`, "utf8");
    await fs.writeFile(
      path.join(safeOutputDirectory, SHADOW_FILE_NAMES.metadata),
      metadataBytes,
    );

    return freeze({
      outputDirectory: safeOutputDirectory,
      metadata: freeze(metadata),
      metadataSha256: sha256(metadataBytes),
    });
  } finally {
    await browser?.close();
  }
};

const parseOutputDirectory = (argv) => {
  const index = argv.indexOf("--output");
  if (index < 0 || !argv[index + 1]) {
    throw new Error("Usage: node build-shadow-publication.mjs --output <directory>");
  }
  return path.resolve(argv[index + 1]);
};

const currentPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentPath) {
  const projectRoot = path.resolve(path.dirname(currentPath), "../..");
  const outputDirectory = parseOutputDirectory(process.argv.slice(2));
  const result = await buildShadowPublication({ projectRoot, outputDirectory });
  console.log(`[SHADOW BUILD PASS] ${result.outputDirectory}`);
}
