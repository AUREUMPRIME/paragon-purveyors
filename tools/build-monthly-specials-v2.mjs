import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(toolDir, "..");

const paths = {
  sourceData: path.join(projectRoot, "src", "data", "monthly-specials-v2.fixture.json"),
  sourceCss: path.join(projectRoot, "src", "specials", "monthly-specials-v2.css"),
  publicRoot: path.join(projectRoot, "public"),
  outputDir: path.join(projectRoot, "public", "specials"),
};

const outputPaths = {
  html: path.join(paths.outputDir, "monthly-specials-v2.html"),
  pdf: path.join(paths.outputDir, "monthly-specials-v2.pdf"),
};

const allowedOfferModes = new Set(["dual-offer", "single-offer"]);
const allowedImageFits = new Set(["cover", "contain"]);
const allowedImagePositions = new Set([
  "center",
  "center top",
  "center bottom",
  "left center",
  "right center",
]);

const brandLogoPaths = {
  "black-opal": "assets/provider-icons/black-opal.svg",
  altair: "assets/provider-logos/modal/altair_modal_logo.png",
};

const mimeByExtension = {
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const isYes = (value) => String(value).trim().toLowerCase() === "yes";

const requiredText = (value, label) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    throw new Error(`Missing required V2 field: ${label}`);
  }
  return normalized;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const normalizePublicPath = (value, label) => {
  const normalized = requiredText(value, label).replaceAll("\\", "/");
  if (normalized.startsWith("/") || normalized.includes("..")) {
    throw new Error(`${label} must be a public-relative path without traversal: ${normalized}`);
  }
  return normalized;
};

const resolvePublicFile = (value, label) => {
  const relativePath = normalizePublicPath(value, label);
  const absolutePath = path.resolve(paths.publicRoot, ...relativePath.split("/"));
  const publicRootPrefix = `${path.resolve(paths.publicRoot)}${path.sep}`;

  if (!absolutePath.startsWith(publicRootPrefix)) {
    throw new Error(`${label} resolved outside public root: ${relativePath}`);
  }

  return { relativePath, absolutePath };
};

const toDataUrl = async (value, label) => {
  const { relativePath, absolutePath } = resolvePublicFile(value, label);
  const extension = path.extname(relativePath).toLowerCase();
  const mime = mimeByExtension[extension];

  if (!mime) {
    throw new Error(`Unsupported V2 image extension for ${label}: ${extension}`);
  }

  const bytes = await fs.readFile(absolutePath);
  return `data:${mime};base64,${bytes.toString("base64")}`;
};

const validateImageControls = (item, prefix) => {
  const fit = requiredText(item[`${prefix}ImageFit`], `${item.cutId} ${prefix} Image Fit`);
  const position = requiredText(
    item[`${prefix}ImagePosition`],
    `${item.cutId} ${prefix} Image Position`,
  );

  if (!allowedImageFits.has(fit)) {
    throw new Error(`Invalid ${prefix} Image Fit for ${item.cutId}: ${fit}`);
  }

  if (!allowedImagePositions.has(position)) {
    throw new Error(`Invalid ${prefix} Image Position for ${item.cutId}: ${position}`);
  }
};

const validateSource = (source) => {
  if (source?.version !== "2.0") {
    throw new Error(`Expected V2 source version 2.0, found: ${source?.version ?? "missing"}`);
  }

  if (source?.source?.type !== "fixture") {
    throw new Error(`Phase 5 V2 renderer requires fixture source, found: ${source?.source?.type ?? "missing"}`);
  }

  const settings = source.settings ?? {};
  requiredText(settings.contactInstruction, "Settings contactInstruction");
  requiredText(settings.footerMessage, "Settings footerMessage");
  requiredText(settings.disclaimer, "Settings disclaimer");
  requiredText(settings.footerButtonLabel, "Settings footerButtonLabel");

  const footerUrl = requiredText(settings.footerUrl, "Settings footerUrl");
  let parsedFooterUrl;
  try {
    parsedFooterUrl = new URL(footerUrl);
  } catch {
    throw new Error(`Settings footerUrl is not a valid absolute URL: ${footerUrl}`);
  }
  if (parsedFooterUrl.protocol !== "https:") {
    throw new Error(`Settings footerUrl must use HTTPS: ${footerUrl}`);
  }

  const activeContacts = (source.contacts ?? []).filter((contact) => isYes(contact.active));
  if (activeContacts.length < 1) {
    throw new Error("V2 source requires at least one active contact.");
  }

  for (const contact of activeContacts) {
    requiredText(contact.name, "Contact Name");
    requiredText(contact.location, `${contact.name} Location`);
    requiredText(contact.phone, `${contact.name} Phone`);
    requiredText(contact.email, `${contact.name} Email`);
  }

  const activeSpecials = (source.specials ?? [])
    .filter((item) => isYes(item.active))
    .sort((a, b) => Number(a.sort) - Number(b.sort));

  if (activeSpecials.length !== 4) {
    throw new Error(`Phase 5 fixture must contain exactly four active cuts. Found: ${activeSpecials.length}`);
  }

  const cutIds = new Set();

  for (const item of activeSpecials) {
    item.cutId = requiredText(item.cutId, "Specials Cut ID");
    if (cutIds.has(item.cutId)) {
      throw new Error(`Duplicate active Cut ID: ${item.cutId}`);
    }
    cutIds.add(item.cutId);

    item.offerMode = requiredText(item.offerMode, `${item.cutId} Offer Mode`);
    if (!allowedOfferModes.has(item.offerMode)) {
      throw new Error(`Invalid Offer Mode for ${item.cutId}: ${item.offerMode}`);
    }

    requiredText(item.displayName, `${item.cutId} Display Name`);
    requiredText(item.brand, `${item.cutId} Brand`);
    requiredText(item.brandLogoKey, `${item.cutId} Brand Logo Key`);
    requiredText(item.primaryPriceLabel, `${item.cutId} Primary Price Label`);
    requiredText(item.primaryPrice, `${item.cutId} Primary Price`);
    normalizePublicPath(item.primaryImagePath, `${item.cutId} Primary Image Path`);
    requiredText(item.primaryImageAlt, `${item.cutId} Primary Image Alt`);
    validateImageControls(item, "primary");

    if (item.offerMode === "dual-offer") {
      requiredText(item.secondaryPriceLabel, `${item.cutId} Secondary Price Label`);
      requiredText(item.secondaryPrice, `${item.cutId} Secondary Price`);
      normalizePublicPath(item.secondaryImagePath, `${item.cutId} Secondary Image Path`);
      requiredText(item.secondaryImageAlt, `${item.cutId} Secondary Image Alt`);
      validateImageControls(item, "secondary");
    } else {
      if (String(item.secondaryPriceLabel ?? "").trim() || String(item.secondaryPrice ?? "").trim()) {
        throw new Error(`${item.cutId} single-offer state must not contain Secondary price data.`);
      }

      if (String(item.secondaryImagePath ?? "").trim()) {
        requiredText(item.secondaryImageAlt, `${item.cutId} Secondary Image Alt`);
        validateImageControls(item, "secondary");
      }
    }
  }

  return { settings, activeContacts, activeSpecials };
};

const createOfferHtml = (label, price) => `
  <div class="v2-offer">
    <span class="v2-offer__label">${escapeHtml(label)}</span>
    <strong class="v2-offer__price">${escapeHtml(price)}</strong>
  </div>`;

const createImageHtml = ({ dataUrl, alt, fit, position }) => `
  <div class="v2-card__image-slot">
    <img
      class="v2-card__image"
      src="${dataUrl}"
      alt="${escapeHtml(alt)}"
      style="object-fit: ${escapeHtml(fit)}; object-position: ${escapeHtml(position)};"
    >
  </div>`;

const buildCard = async (item) => {
  const brandLogoPath = brandLogoPaths[item.brandLogoKey];
  if (!brandLogoPath) {
    throw new Error(`Unsupported Brand Logo Key for V2 fixture: ${item.brandLogoKey}`);
  }

  const [brandLogoData, primaryImageData] = await Promise.all([
    toDataUrl(brandLogoPath, `${item.cutId} Brand Logo`),
    toDataUrl(item.primaryImagePath, `${item.cutId} Primary Image Path`),
  ]);

  const images = [
    createImageHtml({
      dataUrl: primaryImageData,
      alt: item.primaryImageAlt,
      fit: item.primaryImageFit,
      position: item.primaryImagePosition,
    }),
  ];

  const offers = [createOfferHtml(item.primaryPriceLabel, item.primaryPrice)];

  if (String(item.secondaryImagePath ?? "").trim()) {
    const secondaryImageData = await toDataUrl(
      item.secondaryImagePath,
      `${item.cutId} Secondary Image Path`,
    );
    images.push(
      createImageHtml({
        dataUrl: secondaryImageData,
        alt: item.secondaryImageAlt,
        fit: item.secondaryImageFit,
        position: item.secondaryImagePosition,
      }),
    );
  }

  if (item.offerMode === "dual-offer") {
    offers.push(createOfferHtml(item.secondaryPriceLabel, item.secondaryPrice));
  }

  return `<article class="v2-card" data-cut-id="${escapeHtml(item.cutId)}" data-offer-mode="${escapeHtml(item.offerMode)}">
      <div class="v2-card__topline">
        <img class="v2-card__brand" src="${brandLogoData}" alt="${escapeHtml(item.brand)} logo">
        <span class="v2-card__availability">${escapeHtml(item.quantityAvailable)}</span>
      </div>
      <div>
        <h2 class="v2-card__title">${escapeHtml(item.displayName)}</h2>
        <p class="v2-card__submeta">${escapeHtml(item.productLine)} · ${escapeHtml(item.marblingScore)}</p>
      </div>
      <div class="v2-card__images">${images.join("")}</div>
      <div class="v2-card__offers">${offers.join("")}</div>
      <p class="v2-card__copy"><span class="v2-card__savings">${escapeHtml(item.savingsMessage)}</span><br>${escapeHtml(item.description)}</p>
    </article>`;
};

const buildHtml = async (source, css) => {
  const { settings, activeContacts, activeSpecials } = validateSource(source);

  const brandMarkData = await toDataUrl(
    "assets/brand/Paragon_Purveyors_full-logo.svg",
    "Paragon brand mark",
  );

  const cards = await Promise.all(activeSpecials.map((item) => buildCard(item)));
  const contactSummary = activeContacts
    .map((contact) => `${contact.name} · ${contact.location} · ${contact.phone}`)
    .join(" | ");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Paragon Purveyors — Monthly Specials V2 Proof</title>
  <style>${css}</style>
</head>
<body>
  <main class="v2-proof">
    <header class="v2-proof__header">
      <p class="v2-proof__eyebrow">Parallel V2 renderer proof</p>
      <h1 class="v2-proof__title">${escapeHtml(settings.month)} ${escapeHtml(settings.year)} · ${escapeHtml(settings.campaignTitleLine1)} ${escapeHtml(settings.campaignTitleLine2)}</h1>
      <p class="v2-proof__meta">Source: ${escapeHtml(source.source.label)} <span class="v2-proof__status">Not live</span></p>
    </header>
    <section class="v2-proof__grid" aria-label="Monthly featured cuts">
      ${cards.join("")}
    </section>
    <footer class="v2-proof__footer">
      <img src="${brandMarkData}" alt="Paragon Purveyors" style="width: 92px; max-height: 28px; object-fit: contain; object-position: left center; vertical-align: middle; margin-right: 10px;">
      ${escapeHtml(settings.contactInstruction)} ${escapeHtml(contactSummary)} · ${escapeHtml(settings.disclaimer)}
    </footer>
  </main>
</body>
</html>`;
};

const waitForImages = async (page) => {
  await page.evaluate(async () => {
    const images = [...document.images];
    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise((resolve, reject) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", reject, { once: true });
          });
        }
        if (typeof image.decode === "function") {
          await image.decode();
        }
      }),
    );
  });
};

const main = async () => {
  const [sourceText, css] = await Promise.all([
    fs.readFile(paths.sourceData, "utf8"),
    fs.readFile(paths.sourceCss, "utf8"),
  ]);

  const source = JSON.parse(sourceText);
  const html = await buildHtml(source, css);

  await fs.mkdir(paths.outputDir, { recursive: true });
  await fs.writeFile(outputPaths.html, html, "utf8");

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 816, height: 1056 },
      deviceScaleFactor: 1,
    });

    await page.setContent(html, { waitUntil: "networkidle" });
    await waitForImages(page);

    await page.pdf({
      path: outputPaths.pdf,
      format: "Letter",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  const [htmlStats, pdfStats] = await Promise.all([
    fs.stat(outputPaths.html),
    fs.stat(outputPaths.pdf),
  ]);

  if (htmlStats.size < 10000) {
    throw new Error(`V2 HTML output looks too small: ${htmlStats.size} bytes.`);
  }

  if (pdfStats.size < 50000) {
    throw new Error(`V2 PDF output looks too small: ${pdfStats.size} bytes.`);
  }

  console.log("[OK] V2 source type: fixture");
  console.log(`[OK] V2 active cuts: ${source.specials.filter((item) => isYes(item.active)).length}`);
  console.log(`[OK] V2 HTML: public/specials/monthly-specials-v2.html (${htmlStats.size} bytes)`);
  console.log(`[OK] V2 PDF: public/specials/monthly-specials-v2.pdf (${pdfStats.size} bytes)`);
  console.log("[PASS] PARALLEL V2 RENDERER BUILD COMPLETE");
};

await main();
