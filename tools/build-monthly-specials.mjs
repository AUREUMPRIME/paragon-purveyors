import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  sourceData: path.join(projectRoot, "src", "data", "monthly-specials.json"),
  sourceCss: path.join(projectRoot, "src", "specials", "monthly-specials.css"),
  outputDir: path.join(projectRoot, "public", "specials"),
  publicDir: path.join(projectRoot, "public"),
  envLocal: path.join(projectRoot, ".env.local"),
};

const outputPaths = {
  pdf: path.join(paths.outputDir, "monthly-specials.pdf"),
  html: path.join(paths.outputDir, "monthly-specials.html"),
  json: path.join(paths.outputDir, "monthly-specials.json"),
  index: path.join(paths.outputDir, "index.html"),
};

const mimeTypes = new Map([
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
]);

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const normalizeText = (value) => String(value ?? "").trim();

const normalizeKey = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const isActive = (value) => {
  const clean = normalizeText(value).toLowerCase();
  return clean === "yes" || clean === "true" || clean === "1" || clean === "active";
};

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

const loadEnvFile = async () => {
  if (!existsSync(paths.envLocal)) return;

  const text = await fs.readFile(paths.envLocal, "utf8");

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    if (char !== "\r") {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);

  return rows
    .map((cells) => cells.map((value) => normalizeText(value)))
    .filter((cells) => cells.some((value) => normalizeText(value)));
};

const createGoogleCsvUrl = (sheetId, sheetName) => {
  const encodedSheetName = encodeURIComponent(sheetName);
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodedSheetName}`;
};

const fetchGoogleCsvRows = async (sheetId, sheetName) => {
  const url = createGoogleCsvUrl(sheetId, sheetName);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Google Sheet CSV request failed for ${sheetName}: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  if (!normalizeText(text)) {
    throw new Error(`Google Sheet CSV response was empty for ${sheetName}.`);
  }

  if (/<html|<!doctype|sign in|google account|request access/i.test(text)) {
    throw new Error(`Google Sheet CSV response for ${sheetName} looks like an auth page. Share the Sheet as Anyone with the link can view.`);
  }

  return parseCsv(text);
};

const findHeaderIndex = (rows, requiredHeaderKeys) =>
  rows.findIndex((row) => {
    const normalizedCells = row.map(normalizeKey);
    return requiredHeaderKeys.every((key) =>
      normalizedCells.some((cell) => cell === key || cell.endsWith(key)),
    );
  });

const buildHeaderMap = (headerRow, headerAliases) => {
  const map = new Map();

  for (const [fieldName, aliases] of Object.entries(headerAliases)) {
    const aliasKeys = aliases.map(normalizeKey);
    const index = headerRow.findIndex((cell) => {
      const normalized = normalizeKey(cell);
      return aliasKeys.some((alias) => normalized === alias || normalized.endsWith(alias));
    });

    if (index >= 0) {
      map.set(fieldName, index);
    }
  }

  return map;
};

const valueFrom = (row, headerMap, key) => {
  const index = headerMap.get(key);
  return index === undefined ? "" : normalizeText(row[index]);
};

const parseSettingsRows = (rows) => {
  const headerIndex = findHeaderIndex(rows, ["key", "value"]);

  if (headerIndex < 0) {
    throw new Error("Settings tab must include Key and Value headers.");
  }

  const settings = {};

  for (const row of rows.slice(headerIndex + 1)) {
    const key = normalizeText(row[0]);
    const value = normalizeText(row[1]);

    if (!key) continue;

    settings[key] = value;
  }

  return settings;
};

const parseContactsRows = (rows) => {
  const headerIndex = findHeaderIndex(rows, ["active", "name", "location", "phone"]);

  if (headerIndex < 0) {
    throw new Error("Contacts tab must include Active, Name, Location, and Phone headers.");
  }

  const headerMap = buildHeaderMap(rows[headerIndex], {
    sort: ["Sort"],
    active: ["Active"],
    name: ["Name"],
    location: ["Location"],
    phone: ["Phone"],
    email: ["Email"],
  });

  const contacts = rows
    .slice(headerIndex + 1)
    .map((row) => ({
      sort: Number(valueFrom(row, headerMap, "sort") || 0),
      active: isActive(valueFrom(row, headerMap, "active")),
      name: valueFrom(row, headerMap, "name"),
      location: valueFrom(row, headerMap, "location"),
      phone: valueFrom(row, headerMap, "phone"),
      email: valueFrom(row, headerMap, "email"),
    }))
    .filter((contact) => contact.active && (contact.name || contact.location || contact.phone || contact.email))
    .sort((a, b) => a.sort - b.sort);

  return contacts;
};

const parseSpecialsRows = (rows) => {
  const headerIndex = findHeaderIndex(rows, ["active", "cutid", "displayname", "imagepath"]);

  if (headerIndex < 0) {
    throw new Error("Specials tab must include Active, Cut ID, Display Name, and Image Path headers.");
  }

  const headerMap = buildHeaderMap(rows[headerIndex], {
    sort: ["Sort"],
    active: ["Active"],
    cutId: ["Cut ID"],
    displayName: ["Display Name"],
      brand: ["Brand"],
      brandLogoKey: ["Brand Logo Key", "Brand Key"],
      productLine: ["Product Line"],
      marblingScore: ["Marbling Score", "Marble Score"],
      quantityAvailable: ["Quantity Available"],
      primaryPriceLabel: ["Primary Price Label"],
      primaryPrice: ["Primary Price"],
      secondaryPriceLabel: ["Secondary Price Label"],
      secondaryPrice: ["Secondary Price"],
      savingsMessage: ["Savings Message"],
      imagePath: ["Image Path"],
      description: ["Description"],
  });

  const specials = rows
    .slice(headerIndex + 1)
    .map((row) => ({
      sort: Number(valueFrom(row, headerMap, "sort") || 0),
      active: isActive(valueFrom(row, headerMap, "active")),
      cutId: valueFrom(row, headerMap, "cutId"),
      displayName: valueFrom(row, headerMap, "displayName"),
        brand: valueFrom(row, headerMap, "brand"),
        brandLogoKey: valueFrom(row, headerMap, "brandLogoKey"),
        productLine: valueFrom(row, headerMap, "productLine"),
        marblingScore: valueFrom(row, headerMap, "marblingScore"),
        quantityAvailable: valueFrom(row, headerMap, "quantityAvailable"),
        primaryPriceLabel: valueFrom(row, headerMap, "primaryPriceLabel"),
        primaryPrice: valueFrom(row, headerMap, "primaryPrice"),
        secondaryPriceLabel: valueFrom(row, headerMap, "secondaryPriceLabel"),
        secondaryPrice: valueFrom(row, headerMap, "secondaryPrice"),
        savingsMessage: valueFrom(row, headerMap, "savingsMessage"),
        imagePath: valueFrom(row, headerMap, "imagePath"),
        description: valueFrom(row, headerMap, "description"),
    }))
    .filter((special) => special.active)
    .sort((a, b) => a.sort - b.sort);

  return specials;
};

const loadGoogleSheetData = async () => {
  const sheetId = normalizeText(process.env.GOOGLE_SHEET_ID);
  const settingsName = normalizeText(process.env.GOOGLE_SHEET_SETTINGS_NAME || "Settings");
  const contactsName = normalizeText(process.env.GOOGLE_SHEET_CONTACTS_NAME || "Contacts");
  const specialsName = normalizeText(process.env.GOOGLE_SHEET_SPECIALS_NAME || "Specials");

  if (!sheetId || sheetId === "replace-with-google-sheet-id") {
    throw new Error("GOOGLE_SHEET_ID is missing. Add it to .env.local.");
  }

  const [settingsRows, contactsRows, specialsRows] = await Promise.all([
    fetchGoogleCsvRows(sheetId, settingsName),
    fetchGoogleCsvRows(sheetId, contactsName),
    fetchGoogleCsvRows(sheetId, specialsName),
  ]);

  return {
    source: {
      type: "google",
      sheetId,
      tabs: {
        settings: settingsName,
        contacts: contactsName,
        specials: specialsName,
      },
    },
    settings: parseSettingsRows(settingsRows),
    contacts: parseContactsRows(contactsRows),
    specials: parseSpecialsRows(specialsRows),
  };
};

const loadSourceData = async () => {
  await loadEnvFile();

  const source = normalizeText(process.env.MONTHLY_SPECIALS_SOURCE || "json").toLowerCase();
  const allowJsonFallback = isActive(process.env.MONTHLY_SPECIALS_ALLOW_JSON_FALLBACK);

  if (source === "google") {
    try {
      return await loadGoogleSheetData();
    } catch (error) {
      if (!allowJsonFallback) {
        throw error;
      }

      console.warn("[WARN] Google Sheets source failed. Falling back to local JSON.");
      console.warn(error);
    }
  }

  const data = await readJson(paths.sourceData);
  return {
    source: {
      type: "json",
      file: "src/data/monthly-specials.json",
    },
    ...data,
  };
};

const toPublicUrl = (value) => {
  const clean = normalizeText(value).replace(/^https?:\/\//i, "").replace(/\/+$/g, "");
  return clean ? `https://${clean}` : "#";
};

const toDataUrl = async (relativePublicPath) => {
  const normalizedPath = String(relativePublicPath || "").replaceAll("\\", "/").replace(/^public\//, "");
  const absolutePath = path.join(paths.publicDir, normalizedPath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Missing asset: public/${normalizedPath}`);
  }

  const extension = path.extname(absolutePath).toLowerCase();
  const mimeType = mimeTypes.get(extension);

  if (!mimeType) {
    throw new Error(`Unsupported asset type: ${normalizedPath}`);
  }

  const data = await fs.readFile(absolutePath);
  return `data:${mimeType};base64,${data.toString("base64")}`;
};

const findBrandMark = async () => toDataUrl("assets/brand/paragon-cow-mark.svg");

const findBrandTextLogo = async () => toDataUrl("assets/brand/Paragon_Purveyors_logo_text.svg");

const findWorldCupMark = async () => toDataUrl("specials/tournaments_fifa-world-cup-2026--white_1500x1500.football-logos.cc.png");

const validateData = (data) => {
  const errors = [];

  if (!data || typeof data !== "object") errors.push("Monthly specials data must contain an object.");
  if (!data.settings || typeof data.settings !== "object") errors.push("Missing settings object.");
  if (!Array.isArray(data.specials)) errors.push("Missing specials array.");

  const activeSpecials = Array.isArray(data.specials)
    ? data.specials.filter((item) => item.active !== false)
    : [];

  if (activeSpecials.length === 0) errors.push("At least one active special is required.");

  for (const item of activeSpecials) {
    const label = item.displayName || item.cutId || "Unknown item";

    for (const key of ["displayName", "brand", "brandLogoKey", "productLine", "marblingScore", "quantityAvailable", "primaryPriceLabel", "primaryPrice", "savingsMessage"]) {
      if (!normalizeText(item[key])) errors.push(`${label} is missing ${key}.`);
    }

    if (!normalizeText(item.imagePath) && !normalizeText(item.imageFile)) {
      errors.push(`${label} is missing imagePath or imageFile.`);
    }
  }

  if (!Array.isArray(data.contacts) || data.contacts.length === 0) {
    errors.push("At least one contact is required.");
  }

  if (errors.length > 0) {
    throw new Error(`Monthly specials validation failed:\n- ${errors.join("\n- ")}`);
  }

  return activeSpecials.sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
};

const brandLogoPaths = new Map([
    ["black-opal", "assets/provider-logos/modal/black-opal_modal_logo.png"],
    ["altair", "assets/provider-logos/modal/altair_modal_logo.png"],
  ]);

  const toBrandLogoKey = (value) => normalizeText(value).replace(/\s+/g, "-");

  const resolveBrandLogoPath = (item) =>
    brandLogoPaths.get(toBrandLogoKey(item.brandLogoKey)) ||
    brandLogoPaths.get(toBrandLogoKey(item.brand)) ||
    "";

  const createPriceRows = (item) =>
    [
      ["EA", item.primaryPriceLabel, item.primaryPrice],
      normalizeText(item.secondaryPriceLabel) || normalizeText(item.secondaryPrice)
        ? ["CUT", item.secondaryPriceLabel, item.secondaryPrice]
        : null,
    ].filter(Boolean);

  const resolveImagePath = (item) =>
  normalizeText(item.imagePath) || path.join("assets", "cuts", item.imageFile).replaceAll("\\", "/");

const createSpecialCard = async (item) => {
    const imageData = await toDataUrl(resolveImagePath(item));
    const brandLogoPath = resolveBrandLogoPath(item);
    const brandLogoData = brandLogoPath ? await toDataUrl(brandLogoPath).catch(() => "") : "";
    const brandLabel = item.brand || item.brandLogoKey || "";
    const brandMark = brandLogoData
      ? `<img class="product-brand__logo" src="${brandLogoData}" alt="${escapeHtml(brandLabel)}">`
      : brandLabel
        ? `<span class="product-brand__fallback">${escapeHtml(brandLabel)}</span>`
        : "";
    const productBrand = brandMark ? `<div class="product-brand">${brandMark}</div>` : "";

    const priceRowItems = createPriceRows(item);
    const priceRows = priceRowItems
      .map(
        ([icon, label, value]) => `
          <div class="price-row">
            <span class="price-icon">${escapeHtml(icon)}</span>
            <div>
              <p class="price-label">${escapeHtml(label)}</p>
              <p class="price-value">${escapeHtml(value)}</p>
            </div>
          </div>`,
      )
      .join("");

    const priceListClass = priceRowItems.length === 1 ? "price-list price-list--single" : "price-list";

    const marblingBlock =
      normalizeText(item.marblingScore) || normalizeText(item.productLine)
        ? `<div class="marbling-score">
            <p class="marbling-score__label">Marbling Score</p>
            ${item.marblingScore ? `<p class="marbling-score__value">${escapeHtml(item.marblingScore)}</p>` : ""}
            ${item.productLine ? `<p class="marbling-score__line">${escapeHtml(item.productLine)}</p>` : ""}
          </div>`
        : "";

    const savingsMessage = normalizeText(item.savingsMessage)
      ? `<p class="savings-message">${escapeHtml(item.savingsMessage)}</p>`
      : "";

    return `
      <article class="special-card">
        <div class="special-card__content">
          <div class="special-card__topline">
            <div class="special-card__heading">
              <h2 class="special-card__name">${escapeHtml(item.displayName)}</h2>
              ${productBrand}
            </div>
            <div class="special-card__meta">
              <p class="special-card__qty">${escapeHtml(item.quantityAvailable)}</p>
              ${marblingBlock}
            </div>
          </div>
          <div class="${priceListClass}">${priceRows}</div>
          ${savingsMessage}
          ${item.description ? `<p class="special-description">${escapeHtml(item.description)}</p>` : ""}
        </div>
        <div class="special-card__image-wrap">
          <img class="special-card__image" src="${imageData}" alt="${escapeHtml(item.displayName)}">
        </div>
      </article>`;
  };

  const createContactCards = (contacts) =>
  contacts
    .filter((contact) => normalizeText(contact.name) || normalizeText(contact.phone) || normalizeText(contact.location) || normalizeText(contact.email))
    .map(
      (contact) => `
        <article class="contact-card">
          <div class="contact-card__main">
            <p class="contact-kicker">${escapeHtml(contact.location || "Contact")}</p>
            <h2 class="contact-name">${escapeHtml(contact.name || "Paragon Purveyors")}</h2>
            <p class="contact-meta">${escapeHtml(contact.phone || "Phone pending")}</p>
          </div>
          ${contact.email ? `<p class="contact-email">${escapeHtml(contact.email)}</p>` : ""}
        </article>`,
    )
    .join("");

const createHtml = async (data, activeSpecials, css) => {
  const brandMarkData = await findBrandMark();
    const brandTextLogoData = await findBrandTextLogo();
    const worldCupMarkData = await findWorldCupMark();
  const cards = [];

  for (const item of activeSpecials) {
    cards.push(await createSpecialCard(item));
  }

  const settings = data.settings;
    const campaignTitle = normalizeText(settings.headline) && settings.headline !== "Monthly Featured Cuts" ? settings.headline : "World Cup Deals";
    const campaignTitleParts = campaignTitle === "World Cup Deals" ? ["World Cup", "Deals"] : [campaignTitle];
    const campaignTitleHtml = campaignTitleParts.map((part) => `<span>${escapeHtml(part)}</span>`).join("");
    const deliveryBadge = "Free Delivery";
    const documentTitle = "Monthly Featured Cuts | Paragon Purveyors";
  const siteUrl = toPublicUrl(settings.footerUrl);
  const contactCards = createContactCards(data.contacts || []);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(documentTitle)}</title>
  <link rel="icon" type="image/png" sizes="16x16" href="/PP16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/PP32x32.png">
  <link rel="icon" type="image/png" sizes="48x48" href="/PP48x48.png">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
</head>
<body>
  <main class="monthly-specials-page" aria-label="${escapeHtml(settings.headline)}">
    <header class="specials-header specials-header--campaign">
      <section class="brand-block" aria-label="Paragon Purveyors mark">
        <img class="brand-logo" src="${brandMarkData}" alt="Paragon Purveyors">
      </section>
      <section class="brand-text-block" aria-label="Paragon Purveyors">
        <p class="delivery-badge">${escapeHtml(deliveryBadge)}</p>
        <img class="brand-text-logo" src="${brandTextLogoData}" alt="Paragon Purveyors">
      </section>
      <section class="campaign-mark-block" aria-label="${escapeHtml(campaignTitle)}">
        <img class="campaign-mark__image" src="${worldCupMarkData}" alt="${escapeHtml(campaignTitle)}">
      </section>
      <section class="month-block" aria-label="${escapeHtml(campaignTitle)}">
        <p class="month-label">${escapeHtml(settings.month)}</p>
        <h1 class="month-title" aria-label="${escapeHtml(campaignTitle)}">${campaignTitleHtml}</h1>
        <p class="month-subline">${escapeHtml(settings.year)}</p>
      </section>
    </header>

    <section class="specials-grid" aria-label="Specials">
      ${cards.join("\n")}
    </section>

    <section class="contact-section" aria-label="Ordering contacts">
      <p class="contact-instruction">${escapeHtml(settings.contactInstruction || "To place an order, contact the representative closest to your area.")}</p>
      <div class="contact-grid">
        ${contactCards}
      </div>
    </section>

    <footer class="specials-footer">
      <div>
        <p class="footer-message">${escapeHtml(settings.footerMessage)}</p>
        <p class="disclaimer">${escapeHtml(settings.disclaimer)}</p>
      </div>
      <a class="site-button" href="${escapeHtml(siteUrl)}">${escapeHtml(settings.footerButtonLabel || "Visit ParagonPurveyors.com")}</a>
    </footer>
  </main>
</body>
</html>`;
};

const createLandingHtml = (data, activeSpecials, buildId) => {
  const settings = data.settings;
  const campaignTitle = "Monthly Featured Cuts";
  const siteUrl = toPublicUrl(settings.footerUrl);
  const pdfUrl = "./monthly-specials.pdf";
  const pageTitle = "Monthly Featured Cuts | Paragon Purveyors";
  const pageDescription = "Explore this month's featured cuts from Paragon Purveyors.";
  const pageUrl = "https://paragonpurveyors.com/specials/";
  const previewImageUrl = "https://paragonpurveyors.com/PP48x48.png";

  const contactCards = (data.contacts || [])
    .filter((contact) => normalizeText(contact.name) || normalizeText(contact.phone) || normalizeText(contact.location) || normalizeText(contact.email))
    .map((contact) => {
      const phone = normalizeText(contact.phone || "");
      const name = normalizeText(contact.name || "Paragon Purveyors");
      const location = normalizeText(contact.location || "Contact");
      const email = normalizeText(contact.email || "");

      return `
        <article class="contact-card">
          <div class="contact-card__main">
            <p class="contact-kicker">${escapeHtml(location)}</p>
            <h2>${escapeHtml(name)}</h2>
            <p class="contact-phone">${escapeHtml(phone || "Phone pending")}</p>
            ${
              phone
                ? `<button class="copy-phone-button" type="button" data-copy-phone="${escapeHtml(phone)}" aria-label="Copy ${escapeHtml(name)} phone number">Copy phone</button>`
                : ""
            }
          </div>
          ${email ? `<p class="contact-email">${escapeHtml(email)}</p>` : ""}
        </article>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(pageDescription)}">
  <link rel="canonical" href="${escapeHtml(pageUrl)}">
  <link rel="icon" type="image/png" sizes="16x16" href="/PP16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/PP32x32.png">
  <link rel="icon" type="image/png" sizes="48x48" href="/PP48x48.png">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(pageDescription)}">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  <meta property="og:image" content="${escapeHtml(previewImageUrl)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(pageDescription)}">
  <meta name="twitter:image" content="${escapeHtml(previewImageUrl)}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #100d0a;
      color: #f8f2e8;
      font-family: Arial, Helvetica, sans-serif;
    }

    main {
      width: min(92vw, 820px);
      border: 1px solid rgba(248, 242, 232, 0.18);
      padding: clamp(32px, 6vw, 54px);
      background: rgba(248, 242, 232, 0.04);
    }

    .eyebrow,
    .contact-kicker {
      color: rgba(197, 114, 88, 0.78);
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 11px;
      font-weight: 700;
    }

    h1 {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(44px, 8vw, 76px);
      line-height: 0.9;
      letter-spacing: -0.05em;
    }

    h2 {
      margin: 6px 0 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 24px;
      line-height: 1;
      letter-spacing: -0.03em;
    }

    p {
      color: rgba(248, 242, 232, 0.72);
      line-height: 1.55;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 24px;
    }

    a,
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      padding: 12px 18px;
      border: 1px solid rgba(248, 242, 232, 0.32);
      border-radius: 999px;
      background: transparent;
      color: #f8f2e8;
      font: inherit;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 11px;
      cursor: pointer;
    }

    a:hover,
    button:hover {
      border-color: rgba(248, 242, 232, 0.58);
    }

    .contact-section {
      margin-top: 34px;
      padding-top: 28px;
      border-top: 1px solid rgba(248, 242, 232, 0.16);
    }

    .contact-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-top: 16px;
    }

    .contact-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 20px;
      border: 1px solid rgba(248, 242, 232, 0.15);
      background: rgba(0, 0, 0, 0.14);
    }

    .contact-card__main {
      min-width: 0;
    }

    .contact-email {
      margin: 0;
      flex: 0 0 auto;
      max-width: 230px;
      color: rgba(248, 242, 232, 0.72);
      font-size: 11px;
      line-height: 1.2;
      letter-spacing: 0.06em;
      text-align: right;
      text-transform: lowercase;
      white-space: nowrap;
    }

    .contact-phone {
      margin: 10px 0 14px;
      color: rgba(248, 242, 232, 0.86);
      font-size: 16px;
      line-height: 1.2;
    }

    .copy-phone-button {
      min-height: 36px;
      padding: 10px 14px;
      font-size: 10px;
    }

    small {
      display: block;
      margin-top: 28px;
      color: rgba(248, 242, 232, 0.48);
      line-height: 1.45;
    }

    @media (max-width: 680px) {
      .contact-grid {
        grid-template-columns: 1fr;
      }

      main {
        padding: 30px 22px;
      }
    }
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">${escapeHtml(settings.month)} ${escapeHtml(settings.year)}</p>
    <h1>${campaignTitle === "World Cup Deals" ? "World Cup<br>Deals" : escapeHtml(campaignTitle)}</h1>
    <p>${escapeHtml(settings.subheadline || "Monthly selections for direct ordering.")}</p>
    <p>${activeSpecials.length} current featured cuts are available in the latest campaign PDF.</p>

    <div class="actions">
      <a href="${escapeHtml(pdfUrl)}">Open latest PDF</a>
      <a href="${escapeHtml(siteUrl)}">${escapeHtml(settings.footerButtonLabel || "Visit ParagonPurveyors.com")}</a>
    </div>

    <section class="contact-section" aria-label="Direct ordering contacts">
      <p class="eyebrow">Direct ordering contacts</p>
      <div class="contact-grid">
        ${contactCards}
      </div>
    </section>

    <small>${escapeHtml(settings.disclaimer || "Availability and pricing are subject to confirmation.")}</small>
  </main>

  <script>
    (() => {
      const copyText = async (text) => {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return;
        }

        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      };

      document.querySelectorAll("[data-copy-phone]").forEach((button) => {
        button.addEventListener("click", async () => {
          const originalLabel = button.textContent;
          const phone = button.getAttribute("data-copy-phone");

          try {
            await copyText(phone);
            button.textContent = "Copied";
            window.setTimeout(() => {
              button.textContent = originalLabel;
            }, 1400);
          } catch (error) {
            button.textContent = "Copy failed";
            window.setTimeout(() => {
              button.textContent = originalLabel;
            }, 1800);
          }
        });
      });
    })();
  </script>
</body>
</html>`;
};

const main = async () => {
  await fs.mkdir(paths.outputDir, { recursive: true });

  const data = await loadSourceData();
  const css = await fs.readFile(paths.sourceCss, "utf8");
  const activeSpecials = validateData(data);
  const buildId = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const html = await createHtml(data, activeSpecials, css);
  const publicJson = {
    generatedAt: new Date().toISOString(),
    source: {
      type: data.source?.type || "unknown",
      tabs: data.source?.tabs || null,
    },
    settings: data.settings,
    contacts: data.contacts || [],
    specials: activeSpecials,
  };

  await fs.writeFile(outputPaths.html, html, "utf8");
  await fs.writeFile(outputPaths.json, `${JSON.stringify(publicJson, null, 2)}\n`, "utf8");
  await fs.writeFile(outputPaths.index, createLandingHtml(data, activeSpecials, buildId), "utf8");

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({
      path: outputPaths.pdf,
      format: "Letter",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await browser.close();
  }

  const pdfStats = await fs.stat(outputPaths.pdf);

  if (pdfStats.size < 10000) {
    throw new Error(`Generated PDF looks too small: ${pdfStats.size} bytes.`);
  }

  console.log("");
  console.log("Monthly specials generated successfully.");
  console.log(`- source: ${data.source?.type || "unknown"}`);
  console.log(`- public/specials/monthly-specials.pdf (${pdfStats.size} bytes)`);
  console.log("- public/specials/monthly-specials.html");
  console.log("- public/specials/monthly-specials.json");
  console.log("- public/specials/index.html");
};

main().catch((error) => {
  console.error("");
  console.error("[FAIL] Monthly specials build failed.");
  console.error(error);
  process.exit(1);
});
