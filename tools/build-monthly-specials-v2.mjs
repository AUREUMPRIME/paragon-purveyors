import { chromium } from "playwright";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createPriceRows } from "../src/live-pdf/core/format-price.js";
import {
  isActive,
  isSettingVisible,
  normalizeAssetPath,
  normalizeKey,
  normalizeText,
} from "../src/live-pdf/core/normalize-document.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  sourceData: path.join(projectRoot, "src", "data", "monthly-specials-v2.fixture.json"),
  sourceCss: path.join(projectRoot, "src", "specials", "monthly-specials-v2.css"),
  outputDir: path.join(projectRoot, "public", "specials"),
  publicDir: path.join(projectRoot, "public"),
  envLocal: path.join(projectRoot, ".env.local"),
  visualManifest: path.join(
    projectRoot,
    "tools",
    "paragon-cut-image-studio",
    "manifests",
    "approved-selection.json",
  ),
};

const outputPaths = {
  pdf: path.join(paths.outputDir, "monthly-specials-v2.pdf"),
  html: path.join(paths.outputDir, "monthly-specials-v2.html"),
  json: path.join(paths.outputDir, "monthly-specials-v2.json"),
  index: path.join(paths.outputDir, "monthly-specials-v2-index.html"),
};

const productionOutputPaths = {
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

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

const sha256Hex = (value) => createHash("sha256").update(value).digest("hex");

const resolveRequiredNumber = (value, label, minimum, maximum) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${label} must be between ${minimum} and ${maximum}. Found: ${value}`);
  }

  return parsed;
};

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
  const headerIndex = findHeaderIndex(rows, ["active", "cutid", "displayname", "primaryimagepath"]);

  if (headerIndex < 0) {
    throw new Error("Specials tab must include Active, Cut ID, Display Name, and Primary Image Path headers.");
  }

  const headerMap = buildHeaderMap(rows[headerIndex], {
    sort: ["Sort"],
    active: ["Active"],
    cutId: ["Cut ID"],
    offerMode: ["Offer Mode"],
    displayName: ["Display Name"],
    brand: ["Brand"],
    brandLogoKey: ["Brand Logo Key", "Brand Key"],
    productLine: ["Product Line"],
    marblingScore: ["Marbling Score", "Marble Score"],
    quantityAvailable: ["Quantity Available"],
    primaryPriceLabel: ["Primary Price Label"],
    primaryPrice: ["Primary Price"],
    primaryImagePath: ["Primary Image Path"],
    primaryImageAlt: ["Primary Image Alt"],
    primaryImageFit: ["Primary Image Fit"],
    primaryImagePosition: ["Primary Image Position"],
    primaryImageZoom: ["Primary Image Zoom"],
    primaryImageFocusX: ["Primary Image Focus X"],
    primaryImageFocusY: ["Primary Image Focus Y"],
    secondaryPriceLabel: ["Secondary Price Label"],
    secondaryPrice: ["Secondary Price"],
    secondaryImagePath: ["Secondary Image Path"],
    secondaryImageAlt: ["Secondary Image Alt"],
    secondaryImageFit: ["Secondary Image Fit"],
    secondaryImagePosition: ["Secondary Image Position"],
    secondaryImageZoom: ["Secondary Image Zoom"],
    secondaryImageFocusX: ["Secondary Image Focus X"],
    secondaryImageFocusY: ["Secondary Image Focus Y"],
    savingsMessage: ["Savings Message"],
    description: ["Description"],
    internalNotes: ["Internal Notes"],
  });

  return rows
    .slice(headerIndex + 1)
    .map((row) => ({
      sort: Number(valueFrom(row, headerMap, "sort") || 0),
      active: isActive(valueFrom(row, headerMap, "active")),
      cutId: valueFrom(row, headerMap, "cutId"),
      offerMode: valueFrom(row, headerMap, "offerMode"),
      displayName: valueFrom(row, headerMap, "displayName"),
      brand: valueFrom(row, headerMap, "brand"),
      brandLogoKey: valueFrom(row, headerMap, "brandLogoKey"),
      productLine: valueFrom(row, headerMap, "productLine"),
      marblingScore: valueFrom(row, headerMap, "marblingScore"),
      quantityAvailable: valueFrom(row, headerMap, "quantityAvailable"),
      primaryPriceLabel: valueFrom(row, headerMap, "primaryPriceLabel"),
      primaryPrice: valueFrom(row, headerMap, "primaryPrice"),
      primaryImagePath: valueFrom(row, headerMap, "primaryImagePath"),
      primaryImageAlt: valueFrom(row, headerMap, "primaryImageAlt"),
      primaryImageFit: valueFrom(row, headerMap, "primaryImageFit"),
      primaryImagePosition: valueFrom(row, headerMap, "primaryImagePosition"),
      primaryImageZoom: valueFrom(row, headerMap, "primaryImageZoom"),
      primaryImageFocusX: valueFrom(row, headerMap, "primaryImageFocusX"),
      primaryImageFocusY: valueFrom(row, headerMap, "primaryImageFocusY"),
      secondaryPriceLabel: valueFrom(row, headerMap, "secondaryPriceLabel"),
      secondaryPrice: valueFrom(row, headerMap, "secondaryPrice"),
      secondaryImagePath: valueFrom(row, headerMap, "secondaryImagePath"),
      secondaryImageAlt: valueFrom(row, headerMap, "secondaryImageAlt"),
      secondaryImageFit: valueFrom(row, headerMap, "secondaryImageFit"),
      secondaryImagePosition: valueFrom(row, headerMap, "secondaryImagePosition"),
      secondaryImageZoom: valueFrom(row, headerMap, "secondaryImageZoom"),
      secondaryImageFocusX: valueFrom(row, headerMap, "secondaryImageFocusX"),
      secondaryImageFocusY: valueFrom(row, headerMap, "secondaryImageFocusY"),
      savingsMessage: valueFrom(row, headerMap, "savingsMessage"),
      description: valueFrom(row, headerMap, "description"),
      internalNotes: valueFrom(row, headerMap, "internalNotes"),
    }))
    .filter((special) => special.active)
    .sort((a, b) => a.sort - b.sort);
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
    ...data,
    source: {
      type: "json",
      file: "src/data/monthly-specials-v2.fixture.json",
    },
  };
};

const loadVisualAuthority = async () => {
  const rawManifest = await fs.readFile(paths.visualManifest);
  const manifest = JSON.parse(rawManifest.toString("utf8"));

  if (manifest?.schema !== "typed-asset-slots") {
    throw new Error(`Unsupported Studio manifest schema: ${manifest?.schema || "<missing>"}`);
  }

  if (!Array.isArray(manifest.sections) || !Array.isArray(manifest.slots)) {
    throw new Error("Studio manifest must contain sections and slots arrays.");
  }

  const expectedProductSectionIds = ["ribeye", "striploin", "tenderloin", "tri-tip"];
  const productSections = manifest.sections.filter((section) => section.category === "product");
  const footerSections = manifest.sections.filter((section) => section.category === "footer");
  const productSlots = manifest.slots.filter((slot) => slot.category === "product");
  const footerSlots = manifest.slots.filter((slot) => slot.category === "footer");
  const actualProductSectionIds = productSections
    .map((section) => normalizeText(section.sectionId))
    .sort();

  if (JSON.stringify(actualProductSectionIds) !== JSON.stringify(expectedProductSectionIds)) {
    throw new Error(
      `Studio manifest product sections must be ${expectedProductSectionIds.join(", ")}. Found: ${actualProductSectionIds.join(", ")}`,
    );
  }

  if (productSections.length !== 4 || footerSections.length !== 1) {
    throw new Error(
      `Studio manifest must contain four product sections and one footer section. Found: ${productSections.length} product, ${footerSections.length} footer.`,
    );
  }

  if (productSlots.length !== 7 || footerSlots.length !== 1 || manifest.slots.length !== 8) {
    throw new Error(
      `Studio manifest must contain seven product slots and one footer slot. Found: ${productSlots.length} product, ${footerSlots.length} footer, ${manifest.slots.length} total.`,
    );
  }

  const slotsByAssetId = new Map();

  for (const slot of manifest.slots) {
    const assetId = normalizeText(slot.assetId);

    if (!assetId) {
      throw new Error("Studio manifest contains a slot without assetId.");
    }

    if (slotsByAssetId.has(assetId)) {
      throw new Error(`Studio manifest contains duplicate assetId: ${assetId}`);
    }

    if (!normalizeText(slot.sectionId)) {
      throw new Error(`${assetId} is missing sectionId.`);
    }

    if (!normalizeText(slot.selectedFileName)) {
      throw new Error(`${assetId} is missing selectedFileName.`);
    }

    const productionPath = normalizeAssetPath(slot.productionPath);
    const requiredPrefix = slot.category === "footer"
      ? "assets/specials/broll/"
      : "assets/specials/products/";

    if (!productionPath.startsWith(requiredPrefix)) {
      throw new Error(`${assetId} has invalid productionPath: ${productionPath}`);
    }

    if (!normalizeText(slot.alt)) {
      throw new Error(`${assetId} is missing alt text.`);
    }

    if (!new Set(["contain", "cover"]).has(normalizeText(slot.fit))) {
      throw new Error(`${assetId} has invalid fit: ${slot.fit}`);
    }

    resolveRequiredNumber(slot.zoom, `${assetId} zoom`, 1, 2.5);
    resolveRequiredNumber(slot.focusX, `${assetId} focusX`, 0, 100);
    resolveRequiredNumber(slot.focusY, `${assetId} focusY`, 0, 100);

    const libraryPath = path.join(
      projectRoot,
      "tools",
      "paragon-cut-image-studio",
      "image-library",
      normalizeText(slot.libraryId),
      normalizeText(slot.selectedFileName),
    );
    const productionFilePath = path.join(paths.publicDir, productionPath);

    if (!existsSync(libraryPath)) {
      throw new Error(`${assetId} selected library file is missing: ${libraryPath}`);
    }

    if (!existsSync(productionFilePath)) {
      throw new Error(`${assetId} production asset is missing: ${productionFilePath}`);
    }

    const [libraryBytes, productionBytes] = await Promise.all([
      fs.readFile(libraryPath),
      fs.readFile(productionFilePath),
    ]);

    if (sha256Hex(libraryBytes) !== sha256Hex(productionBytes)) {
      throw new Error(`${assetId} production asset does not match the approved Studio library file.`);
    }

    if (slot.category === "footer") {
      if (typeof slot.visible !== "boolean") {
        throw new Error(`${assetId} visible must be a boolean.`);
      }

      resolveRequiredNumber(slot.opacity, `${assetId} opacity`, 0, 1);
      resolveRequiredNumber(slot.saturation, `${assetId} saturation`, 0, 2);
      resolveRequiredNumber(slot.contrast, `${assetId} contrast`, 0, 2);
      resolveRequiredNumber(slot.brightness, `${assetId} brightness`, 0, 2);
    }

    slotsByAssetId.set(assetId, {
      ...slot,
      productionPath,
    });
  }

  for (const section of manifest.sections) {
    const sectionId = normalizeText(section.sectionId);
    const slotAssetIds = Array.isArray(section.slotAssetIds) ? section.slotAssetIds : [];

    if (slotAssetIds.length === 0) {
      throw new Error(`Studio manifest section ${sectionId} has no slotAssetIds.`);
    }

    const sectionSlots = slotAssetIds.map((assetId) => {
      const slot = slotsByAssetId.get(assetId);

      if (!slot) {
        throw new Error(`Studio manifest section ${sectionId} references missing slot ${assetId}.`);
      }

      if (normalizeText(slot.sectionId) !== sectionId) {
        throw new Error(`${assetId} sectionId does not match section ${sectionId}.`);
      }

      return slot;
    });

    if (section.category === "product") {
      const expectedSlotCount = section.layout === "single" ? 1 : section.layout === "dual" ? 2 : 0;

      if (!expectedSlotCount || sectionSlots.length !== expectedSlotCount) {
        throw new Error(
          `Product section ${sectionId} layout ${section.layout} requires ${expectedSlotCount || "a supported number of"} slots. Found: ${sectionSlots.length}`,
        );
      }

      const roles = sectionSlots.map((slot) => normalizeText(slot.role)).sort();
      const expectedRoles = expectedSlotCount === 1 ? ["primary"] : ["primary", "secondary"];

      if (JSON.stringify(roles) !== JSON.stringify(expectedRoles)) {
        throw new Error(`Product section ${sectionId} has invalid roles: ${roles.join(", ")}`);
      }
    }
  }

  const manifestHash = sha256Hex(rawManifest);

  return {
    manifest,
    manifestHash,
    slotsByAssetId,
    metadata: {
      type: "studio-manifest",
      schema: manifest.schema,
      version: manifest.version,
      studioVersion: manifest.studioVersion,
      manifestPath: "tools/paragon-cut-image-studio/manifests/approved-selection.json",
      sha256: manifestHash,
      generatedAt: manifest.generatedAt,
      slotCount: manifest.slots.length,
      productSlotCount: productSlots.length,
      footerSlotCount: footerSlots.length,
    },
  };
};

const visualFieldsFromSlot = (slot, prefix) => ({
  [`${prefix}ImagePath`]: slot.productionPath,
  [`${prefix}ImageAlt`]: normalizeText(slot.alt),
  [`${prefix}ImageFit`]: normalizeText(slot.fit),
  [`${prefix}ImagePosition`]: `${Number(slot.focusX)}% ${Number(slot.focusY)}%`,
  [`${prefix}ImageZoom`]: Number(slot.zoom),
  [`${prefix}ImageFocusX`]: Number(slot.focusX),
  [`${prefix}ImageFocusY`]: Number(slot.focusY),
});

const applyVisualAuthority = (businessData, visualAuthority) => {
  const { manifest, slotsByAssetId, metadata } = visualAuthority;
  const productSections = new Map(
    manifest.sections
      .filter((section) => section.category === "product")
      .map((section) => [normalizeText(section.sectionId), section]),
  );
  const activeCutIds = new Set();

  const specials = (businessData.specials || []).map((item) => {
    const cutId = normalizeText(item.cutId);
    const section = productSections.get(cutId);

    if (!section) {
      throw new Error(`Google business data contains cutId without an approved Studio section: ${cutId}`);
    }

    if (activeCutIds.has(cutId)) {
      throw new Error(`Google business data contains duplicate active cutId: ${cutId}`);
    }

    activeCutIds.add(cutId);

    const slots = section.slotAssetIds.map((assetId) => slotsByAssetId.get(assetId));
    const primarySlot = slots.find((slot) => slot.role === "primary");
    const secondarySlot = slots.find((slot) => slot.role === "secondary");

    if (!primarySlot) {
      throw new Error(`Approved Studio section ${cutId} is missing its primary slot.`);
    }

    const merged = {
      ...item,
      ...visualFieldsFromSlot(primarySlot, "primary"),
    };

    if (secondarySlot) {
      Object.assign(merged, visualFieldsFromSlot(secondarySlot, "secondary"));
    } else {
      Object.assign(merged, {
        secondaryImagePath: "",
        secondaryImageAlt: "",
        secondaryImageFit: "",
        secondaryImagePosition: "",
        secondaryImageZoom: "",
        secondaryImageFocusX: "",
        secondaryImageFocusY: "",
      });
    }

    return merged;
  });

  const missingCutIds = [...productSections.keys()].filter((cutId) => !activeCutIds.has(cutId));

  if (missingCutIds.length > 0) {
    throw new Error(`Google business data is missing approved Studio cuts: ${missingCutIds.join(", ")}`);
  }

  const footerSection = manifest.sections.find((section) => section.category === "footer");
  const footerSlot = slotsByAssetId.get(footerSection.slotAssetIds[0]);
  const settings = {
    ...(businessData.settings || {}),
    footerBrollPath: footerSlot.productionPath,
    footerBrollAlt: normalizeText(footerSlot.alt),
    footerBrollVisible: footerSlot.visible ? "yes" : "no",
    footerBrollFit: normalizeText(footerSlot.fit),
    footerBrollPosition: `${Number(footerSlot.focusX)}% ${Number(footerSlot.focusY)}%`,
    footerBrollZoom: Number(footerSlot.zoom),
    footerBrollFocusX: Number(footerSlot.focusX),
    footerBrollFocusY: Number(footerSlot.focusY),
    footerBrollOpacity: Number(footerSlot.opacity),
    footerBrollSaturation: Number(footerSlot.saturation),
    footerBrollContrast: Number(footerSlot.contrast),
    footerBrollBrightness: Number(footerSlot.brightness),
  };

  return {
    ...businessData,
    settings,
    specials,
    visualSource: metadata,
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

    if (!normalizeText(item.primaryImagePath)) {
      errors.push(`${label} is missing primaryImagePath.`);
    }

    if (normalizeText(item.offerMode) === "dual-offer" && !normalizeText(item.secondaryImagePath)) {
      errors.push(`${label} is dual-offer but is missing secondaryImagePath.`);
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

  const resolveImagePath = (item) =>
  normalizeText(item.imagePath) || path.join("assets", "cuts", item.imageFile).replaceAll("\\", "/");

const createSpecialCard = async (item) => {
    const primaryImageData = await toDataUrl(item.primaryImagePath);
    const hasSecondaryImage = Boolean(normalizeText(item.secondaryImagePath));
    const secondaryImageData = hasSecondaryImage ? await toDataUrl(item.secondaryImagePath) : "";
    const imagePanelClass = hasSecondaryImage
      ? "special-card__image-wrap special-card__image-wrap--dual"
      : "special-card__image-wrap";
    const resolveImageNumber = (value, fallback, minimum, maximum) => {
      const text = normalizeText(value);
      if (!text) return fallback;
      const parsed = Number(text);
      if (!Number.isFinite(parsed)) return fallback;
      return Math.min(maximum, Math.max(minimum, parsed));
    };
    const imageStyle = (fit, position, zoom, focusX, focusY) => {
      const focusXText = normalizeText(focusX);
      const focusYText = normalizeText(focusY);
      const resolvedZoom = resolveImageNumber(zoom, 1, 1, 2.5);
      const resolvedFocusX = resolveImageNumber(focusX, 50, 0, 100);
      const resolvedFocusY = resolveImageNumber(focusY, 50, 0, 100);
      const resolvedPosition = focusXText || focusYText
        ? `${resolvedFocusX}% ${resolvedFocusY}%`
        : normalizeText(position) || "center";
      return `object-fit: ${normalizeText(fit) === "cover" ? "cover" : "contain"}; object-position: ${escapeHtml(resolvedPosition)}; transform: scale(${resolvedZoom}); transform-origin: ${resolvedFocusX}% ${resolvedFocusY}%;`;
    };
    const primaryImageMarkup = `<img class="special-card__image" src="${primaryImageData}" alt="${escapeHtml(item.primaryImageAlt || item.displayName)}" style="${imageStyle(item.primaryImageFit, item.primaryImagePosition, item.primaryImageZoom, item.primaryImageFocusX, item.primaryImageFocusY)}">`;
    const secondaryImageMarkup = hasSecondaryImage
      ? `<img class="special-card__image" src="${secondaryImageData}" alt="${escapeHtml(item.secondaryImageAlt || item.displayName)}" style="${imageStyle(item.secondaryImageFit, item.secondaryImagePosition, item.secondaryImageZoom, item.secondaryImageFocusX, item.secondaryImageFocusY)}">`
      : "";
    const imageMarkup = hasSecondaryImage
      ? `<div class="special-card__image-slot">${primaryImageMarkup}</div>
          <div class="special-card__image-slot">${secondaryImageMarkup}</div>`
      : primaryImageMarkup;
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
      <article class="special-card" data-cut-id="${escapeHtml(item.cutId)}" data-offer-mode="${escapeHtml(item.offerMode)}">
        <div class="special-card__content">
          <div class="special-card__topline">
            <div class="special-card__heading">
              <h2 class="special-card__name">${escapeHtml(item.displayName)}</h2>
              ${productBrand}
            </div>
            <p class="special-card__qty">${escapeHtml(item.quantityAvailable)}</p>
          </div>
          <div class="special-card__center">
            <div class="${priceListClass}">${priceRows}</div>
            ${marblingBlock}
          </div>
          <div class="special-card__bottom">
            ${savingsMessage}
            ${item.description ? `<p class="special-description">${escapeHtml(item.description)}</p>` : ""}
          </div>
        </div>
        <div class="${imagePanelClass}">
          ${imageMarkup}
        </div>
      </article>`;
  };

  const createContactCards = (contacts) =>
  contacts
    .filter(
      (contact) =>
        contact.active !== false &&
        (
          normalizeText(contact.name) ||
          normalizeText(contact.phone) ||
          normalizeText(contact.location) ||
          normalizeText(contact.email)
        ),
    )
    .map(
      (contact) => `
        <article class="contact-card">
          <div class="contact-card__row contact-card__row--primary">
            <p class="contact-kicker">${escapeHtml(contact.location || "Contact")}</p>
            <h2 class="contact-name">${escapeHtml(contact.name || "Paragon Purveyors")}</h2>
          </div>
          <div class="contact-card__row contact-card__row--secondary">
            <p class="contact-meta">${escapeHtml(contact.phone || "Phone pending")}</p>
            ${contact.email ? `<p class="contact-email">${escapeHtml(contact.email)}</p>` : ""}
          </div>
        </article>`,
    )
    .join("");

const createHtml = async (data, activeSpecials, css) => {
  const settings = data.settings || {};
  const activeContacts = (data.contacts || []).filter((contact) => contact.active !== false);
  const headerBrandMarkVisible = isSettingVisible(settings, "headerBrandMarkVisible");
  const headerWordmarkVisible = isSettingVisible(settings, "headerWordmarkVisible");
  const deliveryMessageVisible = isSettingVisible(settings, "deliveryMessageVisible");
  const campaignMarkVisible = isSettingVisible(settings, "campaignMarkVisible");
  const campaignTitleVisible = isSettingVisible(settings, "campaignTitleVisible");
  const monthVisible = isSettingVisible(settings, "monthVisible");
  const yearVisible = isSettingVisible(settings, "yearVisible");
  const headerSupportingLineVisible = isSettingVisible(settings, "headerSupportingLineVisible", false);

  const brandMarkData = headerBrandMarkVisible ? await findBrandMark() : "";
  const brandTextLogoData = headerWordmarkVisible ? await findBrandTextLogo() : "";
  const campaignMarkPath =
    normalizeText(settings.campaignMarkPath) ||
    "specials/tournaments_fifa-world-cup-2026--white_1500x1500.football-logos.cc.png";
  const campaignMarkData = campaignMarkVisible ? await toDataUrl(campaignMarkPath) : "";
  const campaignMarkAlt = normalizeText(settings.campaignMarkAlt) || "World Cup Deals";
  const campaignTitleParts = [settings.campaignTitleLine1, settings.campaignTitleLine2]
    .map(normalizeText)
    .filter(Boolean);
  const resolvedCampaignTitleParts = campaignTitleParts.length > 0 ? campaignTitleParts : ["World Cup", "Deals"];
  const campaignTitle = resolvedCampaignTitleParts.join(" ");
  const campaignTitleHtml = resolvedCampaignTitleParts
    .map((part) => `<span>${escapeHtml(part)}</span>`)
    .join("");
  const deliveryBadge =
    normalizeText(settings.deliveryMessage) ||
    "No Minimum Required for Free Delivery";
  const headerSupportingLine = normalizeText(settings.headerSupportingLine);
  const documentTitle = "Monthly Featured Cuts | Paragon Purveyors";
  const contactCards = createContactCards(activeContacts);
  const cards = [];

  for (const item of activeSpecials) {
    cards.push(await createSpecialCard(item));
  }

  const brandMarkMarkup = headerBrandMarkVisible
    ? `<img class="brand-logo" src="${brandMarkData}" alt="Paragon Purveyors">`
    : "";
  const deliveryBadgeMarkup = deliveryMessageVisible && normalizeText(deliveryBadge)
    ? `<p class="delivery-badge">${escapeHtml(deliveryBadge)}</p>`
    : "";
  const brandWordmarkMarkup = headerWordmarkVisible
    ? `<img class="brand-text-logo" src="${brandTextLogoData}" alt="Paragon Purveyors">`
    : "";
  const campaignMarkMarkup = campaignMarkVisible
    ? `<img class="campaign-mark__image" src="${campaignMarkData}" alt="${escapeHtml(campaignMarkAlt)}">`
    : "";
  const monthMarkup = monthVisible && normalizeText(settings.month)
    ? `<p class="month-label">${escapeHtml(settings.month)}</p>`
    : "";
  const campaignTitleMarkup = campaignTitleVisible
    ? `<h1 class="month-title" aria-label="${escapeHtml(campaignTitle)}">${campaignTitleHtml}</h1>`
    : "";
  const yearMarkup = yearVisible && normalizeText(settings.year)
    ? `<p class="month-subline">${escapeHtml(settings.year)}</p>`
    : "";
  const headerSupportingLineMarkup = headerSupportingLineVisible && headerSupportingLine
    ? `<p class="month-subline header-supporting-line">${escapeHtml(headerSupportingLine)}</p>`
    : "";
  const specialsGridStyle = activeSpecials.length === 4
    ? ""
    : ` style="grid-template-rows: repeat(${activeSpecials.length}, minmax(0, 1fr));"`;
  const contactInstruction = normalizeText(settings.contactInstruction);
  const contactInstructionMarkup = contactInstruction
    ? `<p class="contact-instruction">${escapeHtml(contactInstruction)}</p>`
    : "";
  const footerMessage = normalizeText(settings.footerMessage);
  const disclaimer = normalizeText(settings.disclaimer);
  const footerBrollVisible = isSettingVisible(
    settings,
    "footerBrollVisible",
    false,
  );
  const footerBrollPath = normalizeText(settings.footerBrollPath);
  const footerBrollAlt =
    normalizeText(settings.footerBrollAlt) ||
    "Paragon Purveyors footer editorial image";
  const resolveFooterNumber = (value, fallback, minimum, maximum) => {
    const text = normalizeText(value);
    if (!text) return fallback;

    const parsed = Number(text);
    if (!Number.isFinite(parsed)) return fallback;

    return Math.min(maximum, Math.max(minimum, parsed));
  };
  const footerBrollFit =
    normalizeText(settings.footerBrollFit) === "contain"
      ? "contain"
      : "cover";
  const footerBrollZoom = resolveFooterNumber(
    settings.footerBrollZoom,
    1,
    1,
    2.5,
  );
  const footerBrollFocusX = resolveFooterNumber(
    settings.footerBrollFocusX,
    50,
    0,
    100,
  );
  const footerBrollFocusY = resolveFooterNumber(
    settings.footerBrollFocusY,
    50,
    0,
    100,
  );
  const footerHasFocusValues =
    normalizeText(settings.footerBrollFocusX) ||
    normalizeText(settings.footerBrollFocusY);
  const footerBrollPosition = footerHasFocusValues
    ? `${footerBrollFocusX}% ${footerBrollFocusY}%`
    : normalizeText(settings.footerBrollPosition) || "center";
  const footerBrollOpacity = resolveFooterNumber(
    settings.footerBrollOpacity,
    1,
    0,
    1,
  );
  const footerBrollSaturation = resolveFooterNumber(
    settings.footerBrollSaturation,
    0.82,
    0,
    2,
  );
  const footerBrollContrast = resolveFooterNumber(
    settings.footerBrollContrast,
    1.02,
    0,
    2,
  );
  const footerBrollBrightness = resolveFooterNumber(
    settings.footerBrollBrightness,
    0.88,
    0,
    2,
  );
  const footerBrollData =
    footerBrollVisible && footerBrollPath
      ? await toDataUrl(footerBrollPath)
      : "";
  const footerMessageMarkup = footerMessage
    ? `<p class="footer-message">${escapeHtml(footerMessage)}</p>`
    : "";
  const disclaimerMarkup = disclaimer
    ? `<p class="disclaimer">${escapeHtml(disclaimer)}</p>`
    : "";
  const footerBrollStyle = [
    `object-fit: ${footerBrollFit}`,
    `object-position: ${footerBrollPosition}`,
    `transform: scale(${footerBrollZoom})`,
    `transform-origin: ${footerBrollFocusX}% ${footerBrollFocusY}%`,
    `opacity: ${footerBrollOpacity}`,
    `filter: saturate(${footerBrollSaturation}) contrast(${footerBrollContrast}) brightness(${footerBrollBrightness})`,
  ].join("; ");
  const footerBrollMarkup = footerBrollData
    ? `<img class="footer-broll" src="${footerBrollData}" alt="${escapeHtml(footerBrollAlt)}" style="${footerBrollStyle};">`
    : "";
  const closingClass = footerBrollData
    ? "specials-closing specials-closing--with-broll"
    : "specials-closing";

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
  <main class="monthly-specials-page" aria-label="${escapeHtml(campaignTitle)}">
    <header class="specials-header specials-header--campaign">
      <section class="brand-block" aria-label="Paragon Purveyors mark">
        ${brandMarkMarkup}
      </section>
      <section class="brand-text-block" aria-label="Paragon Purveyors">
        ${deliveryBadgeMarkup}
        ${brandWordmarkMarkup}
      </section>
      <section class="campaign-mark-block" aria-label="${escapeHtml(campaignTitle)}">
        ${campaignMarkMarkup}
      </section>
      <section class="month-block" aria-label="${escapeHtml(campaignTitle)}">
        ${monthMarkup}
        ${campaignTitleMarkup}
        ${yearMarkup}
        ${headerSupportingLineMarkup}
      </section>
    </header>

    <section class="specials-grid" aria-label="Specials"${specialsGridStyle}>
      ${cards.join("\n")}
    </section>

    <footer class="${closingClass}" aria-label="Ordering contacts and footer">
      <div class="specials-closing__content">
        <div class="specials-closing__contacts">
          ${contactCards}
        </div>
        <div class="specials-closing__instructions">
          ${contactInstructionMarkup}
          ${footerMessageMarkup}
          ${disclaimerMarkup}
        </div>
      </div>
      <div class="specials-closing__media">
        ${footerBrollMarkup}
      </div>
    </footer>
  </main>
</body>
</html>`;
};

const createLandingHtml = (data, activeSpecials, buildId) => {
  const settings = data.settings;
  const campaignTitle = "Monthly Featured Cuts";
  const siteUrl = toPublicUrl(settings.footerUrl);
  const livePageUrl = "./monthly-specials.html";
  const pdfUrl = "./monthly-specials.pdf";
  const pageTitle = "Monthly Featured Cuts | Paragon Purveyors";
  const pageDescription = "Explore this month's featured cuts from Paragon Purveyors.";
  const pageUrl = "https://paragonpurveyors.com/specials/";
  const previewImageUrl = "https://paragonpurveyors.com/PP48x48.png";

  const contactCards = (data.contacts || [])
    .filter((contact) => contact.active !== false && (normalizeText(contact.name) || normalizeText(contact.phone) || normalizeText(contact.location) || normalizeText(contact.email)))
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
    :root {
      --specials-accent: #c92b32;
      --specials-accent-rgb: 201, 43, 50;
    }

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
      color: rgba(var(--specials-accent-rgb), 0.78);
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

/* SPECIALS_LANDING_PREMIUM_MENU_START */
    .specials-landing-menu {
      position: relative;
      width: min(94vw, 1060px);
      border-color: rgba(248, 242, 232, 0.2);
      background:
        radial-gradient(circle at 16% 12%, rgba(var(--specials-accent-rgb), 0.08), transparent 34%),
        linear-gradient(135deg, rgba(248, 242, 232, 0.055), rgba(248, 242, 232, 0.015)),
        rgba(12, 10, 8, 0.94);
      box-shadow: 0 32px 92px rgba(0, 0, 0, 0.36);
    }

    .specials-landing-menu .actions {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-top: 34px;
    }

    .specials-landing-menu .actions a {
      min-height: 112px;
      align-items: flex-end;
      justify-content: flex-start;
      padding: 22px;
      border-radius: 0;
      background: rgba(248, 242, 232, 0.035);
      text-align: left;
      transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
    }

    .specials-landing-menu .actions a:hover,
    .specials-landing-menu .actions a:focus-visible {
      transform: translateY(-2px);
      background: rgba(248, 242, 232, 0.06);
    }

    .specials-landing-menu .actions a:first-child {
      border-color: rgba(var(--specials-accent-rgb), 0.44);
      background: linear-gradient(135deg, rgba(var(--specials-accent-rgb), 0.13), rgba(248, 242, 232, 0.025));
    }

    @media (max-width: 760px) {
      .specials-landing-menu .actions {
        grid-template-columns: 1fr;
      }

      .specials-landing-menu .actions a {
        min-height: 76px;
      }
    }
/* SPECIALS_LANDING_PREMIUM_MENU_END */

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
  <main class="specials-landing-menu">
    <p class="eyebrow">${escapeHtml(settings.month)} ${escapeHtml(settings.year)}</p>
    <h1>${campaignTitle === "World Cup Deals" ? "World Cup<br>Deals" : escapeHtml(campaignTitle)}</h1>
    <p>${escapeHtml(settings.subheadline || "Monthly selections for direct ordering.")}</p>
    <p>${activeSpecials.length} current featured cuts are available in the latest campaign PDF.</p>

    <div class="actions">
          <a href="${escapeHtml(livePageUrl)}">View live specials</a>

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

  const businessData = await loadSourceData();
  const visualAuthority = await loadVisualAuthority();
  const data = applyVisualAuthority(businessData, visualAuthority);
  const css = await fs.readFile(paths.sourceCss, "utf8");
  const activeSpecials = validateData(data);
  const buildId = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const publishMode = isActive(process.env.MONTHLY_SPECIALS_V2_PUBLISH);
  const activeOutputPaths = publishMode ? productionOutputPaths : outputPaths;

  const html = (await createHtml(data, activeSpecials, css)).replace(/^[ \t]+$/gm, "");
  const publicSpecials = activeSpecials.map(({ internalNotes, ...item }) => item);
  const publicJson = {
    generatedAt: new Date().toISOString(),
    source: {
      type: data.source?.type || "unknown",
      tabs: data.source?.tabs || null,
    },
    visualSource: data.visualSource,
    settings: data.settings,
    contacts: data.contacts || [],
    specials: publicSpecials,
  };

  await fs.writeFile(activeOutputPaths.html, html, "utf8");
  await fs.writeFile(activeOutputPaths.json, `${JSON.stringify(publicJson, null, 2)}\n`, "utf8");

  if (publishMode) {
    await fs.writeFile(activeOutputPaths.index, createLandingHtml(data, activeSpecials, buildId), "utf8");
  }

  const skipPdf = isActive(process.env.MONTHLY_SPECIALS_V2_SKIP_PDF);
  let pdfStats = null;

  if (!skipPdf) {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 816, height: 1344 }, deviceScaleFactor: 1 });
      await page.setContent(html, { waitUntil: "networkidle" });
      await page.pdf({
        path: activeOutputPaths.pdf,
        format: "Legal",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
    } finally {
      await browser.close();
    }

    pdfStats = await fs.stat(activeOutputPaths.pdf);

    if (pdfStats.size < 10000) {
      throw new Error(`Generated PDF looks too small: ${pdfStats.size} bytes.`);
    }
  }

  console.log("");
  console.log("V2 monthly specials generated successfully.");
  console.log(`- source: ${data.source?.type || "unknown"}`);
  const outputLabel = publishMode ? "monthly-specials" : "monthly-specials-v2";
  console.log(`- mode: ${publishMode ? "production" : "preview"}`);
  console.log(skipPdf ? "- PDF generation skipped for control testing" : `- public/specials/${outputLabel}.pdf (${pdfStats.size} bytes)`);
  console.log(`- public/specials/${outputLabel}.html`);
  console.log(`- public/specials/${outputLabel}.json`);
  console.log(`- visual source: ${data.visualSource?.type || "unknown"} (${data.visualSource?.sha256 || "missing hash"})`);
  if (publishMode) {
    console.log("- public/specials/index.html");
  }

};

main().catch((error) => {
  console.error("");
  console.error("[FAIL] V2 monthly specials build failed.");
  console.error(error);
  process.exit(1);
});
