import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  access,
  copyFile,
  mkdir,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import addFormats from "ajv-formats";

const EXPECTED_LIVE_JSON_SHA256 =
  "0c32fcd372410a69dfb8e2ac2503b1575b4d4eeb3f6d01776ecc09f969643c37";
const EXPECTED_MANIFEST_SHA256 =
  "02dd0ff7081363182ef2cca981216e240e7e9dec0762e4544ab60fff2e7e4649";
const EXPECTED_SCHEMA_SHA256 =
  "6324e618068619449e776a26d2834b8d9baacf64c07e37296f096a98e14b9ce3";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const publicRoot = path.join(projectRoot, "public");
const studioRoot = path.join(projectRoot, "tools", "paragon-cut-image-studio");

const liveJsonPath = path.join(publicRoot, "specials", "monthly-specials.json");
const manifestPath = path.join(
  studioRoot,
  "manifests",
  "approved-selection.json",
);
const schemaPath = path.join(
  projectRoot,
  "src",
  "live-pdf",
  "schema",
  "paragon-live-pdf-studio.schema.json",
);
const outputPath = path.join(
  projectRoot,
  "src",
  "data",
  "paragon-live-pdf-studio.json",
);

const allowedArguments = new Set(["--dry-run", "--write"]);
const argumentsProvided = process.argv.slice(2);

for (const argument of argumentsProvided) {
  if (!allowedArguments.has(argument)) {
    throw new Error(`Unknown argument: ${argument}`);
  }
}

if (
  argumentsProvided.includes("--dry-run") &&
  argumentsProvided.includes("--write")
) {
  throw new Error("Use either --dry-run or --write, not both.");
}

const writeMode = argumentsProvided.includes("--write");
const mode = writeMode ? "write" : "dry-run";

const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");

const normalizeTextForHash = (text) =>
  text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const exists = async (targetPath) => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const ensureFile = async (targetPath, label) => {
  const targetStat = await stat(targetPath).catch(() => null);
  assert(targetStat?.isFile(), `${label} is missing: ${targetPath}`);
};

const asText = (value) => String(value ?? "").trim();

const asBoolean = (value, fallback = true) => {
  const normalized = asText(value).toLowerCase();

  if (!normalized) return fallback;
  if (["yes", "true", "1", "on"].includes(normalized)) return true;
  if (["no", "false", "0", "off"].includes(normalized)) return false;

  throw new Error(`Unsupported visibility value: ${value}`);
};

const slugify = (value) => {
  const slug = asText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  assert(slug.length > 0, `Cannot create a slug from: ${value}`);
  return slug;
};

const parsePrice = (value, context) => {
  const normalized = asText(value);
  assert(normalized.length > 0, `${context} is empty.`);
  assert(
    /^\$[0-9,]+(?:\.[0-9]{2})?$/.test(normalized),
    `${context} is not a supported USD price: ${normalized}`,
  );

  const price = Number(normalized.replace(/[$,]/g, ""));
  assert(Number.isFinite(price) && price >= 0, `${context} is invalid.`);
  return price;
};

const resolvePublicPath = (relativePath, context) => {
  const normalized = asText(relativePath)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^public\//, "");

  assert(normalized.length > 0, `${context} path is empty.`);

  const absolutePath = path.resolve(publicRoot, ...normalized.split("/"));
  const publicPrefix = `${path.resolve(publicRoot)}${path.sep}`;

  assert(
    absolutePath.startsWith(publicPrefix),
    `${context} escapes the public directory: ${relativePath}`,
  );

  return {
    normalized,
    absolutePath,
  };
};

const parseSvgDimensions = (bytes) => {
  const source = bytes.toString("utf8");
  const svgTag = source.match(/<svg\b[^>]*>/i)?.[0] ?? "";
  assert(svgTag, "SVG root element is missing.");

  const readAttribute = (name) =>
    svgTag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1];

  const toNumber = (value) => {
    if (!value) return null;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  let width = toNumber(readAttribute("width"));
  let height = toNumber(readAttribute("height"));

  if (!width || !height) {
    const viewBox = readAttribute("viewBox")
      ?.trim()
      .split(/[\s,]+/)
      .map(Number);

    if (
      Array.isArray(viewBox) &&
      viewBox.length === 4 &&
      viewBox.every(Number.isFinite)
    ) {
      width ||= viewBox[2];
      height ||= viewBox[3];
    }
  }

  assert(width && height, "SVG dimensions are unavailable.");

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
};

const parsePngDimensions = (bytes) => {
  const signature = "89504e470d0a1a0a";
  assert(bytes.subarray(0, 8).toString("hex") === signature, "Invalid PNG.");

  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
};

const parseJpegDimensions = (bytes) => {
  assert(bytes[0] === 0xff && bytes[1] === 0xd8, "Invalid JPEG.");

  const startOfFrameMarkers = new Set([
    0xc0,
    0xc1,
    0xc2,
    0xc3,
    0xc5,
    0xc6,
    0xc7,
    0xc9,
    0xca,
    0xcb,
    0xcd,
    0xce,
    0xcf,
  ]);

  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    offset += 2;

    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > bytes.length) break;

    const segmentLength = bytes.readUInt16BE(offset);
    assert(segmentLength >= 2, "Invalid JPEG segment length.");

    if (startOfFrameMarkers.has(marker)) {
      return {
        height: bytes.readUInt16BE(offset + 3),
        width: bytes.readUInt16BE(offset + 5),
      };
    }

    offset += segmentLength;
  }

  throw new Error("JPEG dimensions are unavailable.");
};

const parseWebpDimensions = (bytes) => {
  assert(
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP",
    "Invalid WebP.",
  );

  let offset = 12;

  while (offset + 8 <= bytes.length) {
    const chunkType = bytes.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = bytes.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (chunkType === "VP8X") {
      return {
        width: 1 + bytes.readUIntLE(dataOffset + 4, 3),
        height: 1 + bytes.readUIntLE(dataOffset + 7, 3),
      };
    }

    if (chunkType === "VP8L") {
      assert(bytes[dataOffset] === 0x2f, "Invalid lossless WebP header.");
      const bits = bytes.readUInt32LE(dataOffset + 1);

      return {
        width: 1 + (bits & 0x3fff),
        height: 1 + ((bits >>> 14) & 0x3fff),
      };
    }

    if (chunkType === "VP8 ") {
      assert(
        bytes[dataOffset + 3] === 0x9d &&
          bytes[dataOffset + 4] === 0x01 &&
          bytes[dataOffset + 5] === 0x2a,
        "Invalid lossy WebP frame header.",
      );

      return {
        width: bytes.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: bytes.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }

    offset = dataOffset + chunkSize + (chunkSize % 2);
  }

  throw new Error("WebP dimensions are unavailable.");
};

const imageMetadata = (bytes, extension) => {
  const normalizedExtension = extension.toLowerCase();

  if (normalizedExtension === ".svg") {
    return {
      mimeType: "image/svg+xml",
      ...parseSvgDimensions(bytes),
    };
  }

  if (normalizedExtension === ".png") {
    return {
      mimeType: "image/png",
      ...parsePngDimensions(bytes),
    };
  }

  if ([".jpg", ".jpeg"].includes(normalizedExtension)) {
    return {
      mimeType: "image/jpeg",
      ...parseJpegDimensions(bytes),
    };
  }

  if (normalizedExtension === ".webp") {
    return {
      mimeType: "image/webp",
      ...parseWebpDimensions(bytes),
    };
  }

  throw new Error(`Unsupported image extension: ${extension}`);
};

const assetReference = (assetId, options) => {
  const reference = {
    assetId,
    visible: options.visible ?? true,
    alt: options.alt,
    fit: options.fit ?? "contain",
    zoom: options.zoom ?? 1,
    focusX: options.focusX ?? 50,
    focusY: options.focusY ?? 50,
  };

  for (const appearanceField of [
    "opacity",
    "saturation",
    "contrast",
    "brightness",
  ]) {
    if (options[appearanceField] !== undefined) {
      reference[appearanceField] = options[appearanceField];
    }
  }

  return reference;
};

await ensureFile(liveJsonPath, "Current live JSON");
await ensureFile(manifestPath, "Approved visual manifest");
await ensureFile(schemaPath, "Canonical Studio schema");

const [liveJsonBytes, manifestBytes, schemaBytes] = await Promise.all([
  readFile(liveJsonPath),
  readFile(manifestPath),
  readFile(schemaPath),
]);

const liveJsonText = liveJsonBytes.toString("utf8");
const manifestText = manifestBytes.toString("utf8");
const schemaText = schemaBytes.toString("utf8");

const liveJsonSha256 = sha256(
  Buffer.from(normalizeTextForHash(liveJsonText), "utf8"),
);
const manifestSha256 = sha256(manifestBytes);
const schemaSha256 = sha256(schemaBytes);

assert(
  liveJsonSha256 === EXPECTED_LIVE_JSON_SHA256,
  `Current live JSON hash mismatch: ${liveJsonSha256}`,
);
assert(
  manifestSha256 === EXPECTED_MANIFEST_SHA256,
  `Approved manifest hash mismatch: ${manifestSha256}`,
);
assert(
  schemaSha256 === EXPECTED_SCHEMA_SHA256,
  `Canonical schema hash mismatch: ${schemaSha256}`,
);

const live = JSON.parse(liveJsonText);
const manifest = JSON.parse(manifestText);
const schema = JSON.parse(schemaText);

const activeSpecials = [...(live.specials ?? [])]
  .filter((special) => special.active === true)
  .sort((left, right) => Number(left.sort) - Number(right.sort));
const activeContacts = [...(live.contacts ?? [])]
  .filter((contact) => contact.active === true)
  .sort((left, right) => Number(left.sort) - Number(right.sort));
const manifestSlots = [...(manifest.slots ?? [])];

assert(activeSpecials.length === 4, "Expected exactly four active specials.");
assert(activeContacts.length === 2, "Expected exactly two active contacts.");
assert(manifestSlots.length === 8, "Expected exactly eight visual slots.");

const expectedSlotIds = [
  "product.tenderloin.primary",
  "product.tenderloin.secondary",
  "product.ribeye.primary",
  "product.ribeye.secondary",
  "product.striploin.primary",
  "product.striploin.secondary",
  "product.tri-tip.primary",
  "footer.broll",
];

assert(
  manifestSlots.map((slot) => slot.assetId).join("|") ===
    expectedSlotIds.join("|"),
  "Approved manifest slot order differs from authority.",
);

const slotById = new Map(manifestSlots.map((slot) => [slot.assetId, slot]));
const selectedAssetKeys = new Set();
const assetLibrary = {};
const copyPlans = [];
const assetByLibraryAndHash = new Map();

const migrationTimestamp = new Date(
  Math.max(
    Date.parse(live.generatedAt ?? 0),
    Date.parse(manifest.generatedAt ?? 0),
  ),
).toISOString();

const registerAsset = async ({
  sourcePath,
  label,
  category,
  library,
  productionPath,
}) => {
  await ensureFile(sourcePath, `Source asset ${label}`);
  const bytes = await readFile(sourcePath);
  const hash = sha256(bytes);

  if (productionPath) {
    const production = resolvePublicPath(productionPath, `Production asset ${label}`);
    await ensureFile(production.absolutePath, `Production asset ${label}`);
    const productionBytes = await readFile(production.absolutePath);
    assert(
      sha256(productionBytes) === hash,
      `Selected-library and production bytes differ for ${label}.`,
    );
  }

  const dedupeKey = `${library}:${hash}`;
  const existingAssetId = assetByLibraryAndHash.get(dedupeKey);

  if (existingAssetId) {
    return existingAssetId;
  }

  const extension = path.extname(sourcePath).toLowerCase();
  const metadata = imageMetadata(bytes, extension);
  const hashPrefix = hash.slice(0, 12);
  const assetId = `asset_${library.replace(/-/g, "_")}_${hashPrefix}`;
  const destinationFileName = `${slugify(label)}-${hashPrefix}${extension}`;
  const repositoryPath = path.posix.join(
    "assets",
    "specials",
    "library",
    library,
    destinationFileName,
  );
  const destinationAbsolutePath = path.join(publicRoot, ...repositoryPath.split("/"));

  assert(!assetLibrary[assetId], `Duplicate generated asset ID: ${assetId}`);

  assetLibrary[assetId] = {
    id: assetId,
    label,
    category,
    library,
    path: repositoryPath,
    mimeType: metadata.mimeType,
    sha256: hash,
    bytes: bytes.length,
    width: metadata.width,
    height: metadata.height,
    createdAt: migrationTimestamp,
    archived: false,
  };

  copyPlans.push({
    assetId,
    sourcePath,
    destinationAbsolutePath,
    repositoryPath,
    sha256: hash,
  });
  assetByLibraryAndHash.set(dedupeKey, assetId);
  selectedAssetKeys.add(assetId);

  return assetId;
};

const settings = live.settings ?? {};

const brandMarkSource = resolvePublicPath(
  "assets/brand/paragon-cow-mark.svg",
  "Header brand mark",
);
const brandMarkAssetId = await registerAsset({
  sourcePath: brandMarkSource.absolutePath,
  label: "Paragon Purveyors Brand Mark",
  category: "brand-mark",
  library: "brand-marks",
});

const wordmarkSource = resolvePublicPath(
  "assets/brand/Paragon_Purveyors_logo_text.svg",
  "Header wordmark",
);
const wordmarkAssetId = await registerAsset({
  sourcePath: wordmarkSource.absolutePath,
  label: "Paragon Purveyors Wordmark",
  category: "wordmark",
  library: "wordmarks",
});

const campaignMarkVisible = asBoolean(settings.campaignMarkVisible);
const visibilitySentinels = new Set([
  "yes",
  "no",
  "true",
  "false",
  "on",
  "off",
  "1",
  "0",
]);
const configuredCampaignPath = asText(settings.campaignMarkPath);
const configuredCampaignAlt = asText(settings.campaignMarkAlt);
const campaignFallbackPath =
  "specials/tournaments_fifa-world-cup-2026--white_1500x1500.football-logos.cc.png";
const campaignMarkPath =
  !campaignMarkVisible ||
  visibilitySentinels.has(configuredCampaignPath.toLowerCase())
    ? campaignFallbackPath
    : configuredCampaignPath;
const campaignMarkAlt =
  !campaignMarkVisible ||
  !configuredCampaignAlt ||
  visibilitySentinels.has(configuredCampaignAlt.toLowerCase())
    ? "FIFA World Cup 2026 campaign mark"
    : configuredCampaignAlt;

const campaignSource = resolvePublicPath(
  campaignMarkPath,
  "Campaign mark",
);
const campaignMarkAssetId = await registerAsset({
  sourcePath: campaignSource.absolutePath,
  label: "World Cup 2026 Campaign Mark",
  category: "campaign-mark",
  library: "campaign-marks",
});

const brandLogoSources = new Map([
  ["black-opal", "assets/provider-logos/modal/black-opal_modal_logo.png"],
  ["altair", "assets/provider-logos/modal/altair_modal_logo.png"],
]);
const brandLogoAssetIds = new Map();

for (const special of activeSpecials) {
  const brandKey = slugify(special.brandLogoKey || special.brand);

  if (brandLogoAssetIds.has(brandKey)) continue;

  const sourceRelativePath = brandLogoSources.get(brandKey);
  assert(sourceRelativePath, `Unsupported product brand logo key: ${brandKey}`);

  const brandLogoSource = resolvePublicPath(
    sourceRelativePath,
    `${special.brand} brand logo`,
  );

  const assetId = await registerAsset({
    sourcePath: brandLogoSource.absolutePath,
    label: `${special.brand} Logo`,
    category: "product-brand-logo",
    library: "product-brand-logos",
  });

  brandLogoAssetIds.set(brandKey, assetId);
}

const imageAssetIdBySlotId = new Map();

for (const slot of manifestSlots) {
  const selectedPath = path.join(
    studioRoot,
    "image-library",
    slot.libraryId,
    slot.selectedFileName,
  );

  const label = path.basename(
    slot.selectedFileName,
    path.extname(slot.selectedFileName),
  );
  const category = slot.category === "footer" ? "footer-broll" : "product-photo";
  const library = slot.category === "footer" ? "footer" : slot.libraryId;

  const assetId = await registerAsset({
    sourcePath: selectedPath,
    label,
    category,
    library,
    productionPath: slot.productionPath,
  });

  imageAssetIdBySlotId.set(slot.assetId, assetId);
}

const requireSlot = (slotId) => {
  const slot = slotById.get(slotId);
  assert(slot, `Required visual slot is missing: ${slotId}`);
  return slot;
};

const referenceFromSlot = (slotId) => {
  const slot = requireSlot(slotId);
  const assetId = imageAssetIdBySlotId.get(slotId);
  assert(assetId, `No migrated asset exists for slot: ${slotId}`);

  return assetReference(assetId, {
    visible: slot.visible ?? true,
    alt: slot.alt,
    fit: slot.fit,
    zoom: Number(slot.zoom),
    focusX: Number(slot.focusX),
    focusY: Number(slot.focusY),
    opacity: slot.opacity,
    saturation: slot.saturation,
    contrast: slot.contrast,
    brightness: slot.brightness,
  });
};

const migratedSpecials = activeSpecials.map((special) => {
  const cutId = asText(special.cutId);
  const primarySlotId = `product.${cutId}.primary`;
  const primarySlot = requireSlot(primarySlotId);

  assert(
    primarySlot.productionPath === special.primaryImagePath,
    `${cutId} primary production path differs between business and visual authority.`,
  );

  const brandKey = slugify(special.brandLogoKey || special.brand);
  const brandLogoAssetId = brandLogoAssetIds.get(brandKey);
  assert(brandLogoAssetId, `Brand logo asset is missing for ${cutId}.`);

  const migrated = {
    id: cutId,
    sort: Number(special.sort),
    active: true,
    offerMode: special.offerMode,
    displayName: special.displayName,
    brand: special.brand,
    brandLogo: assetReference(brandLogoAssetId, {
      visible: true,
      alt: `${special.brand} logo`,
      fit: "contain",
      zoom: 1,
      focusX: 50,
      focusY: 50,
    }),
    productLine: special.productLine,
    marblingScore: special.marblingScore,
    quantityAvailable: special.quantityAvailable,
    primaryOffer: {
      label: special.primaryPriceLabel,
      price: parsePrice(special.primaryPrice, `${cutId} primary price`),
      image: referenceFromSlot(primarySlotId),
    },
    savingsMessage: special.savingsMessage,
    description: special.description,
  };

  if (special.offerMode === "dual-offer") {
    const secondarySlotId = `product.${cutId}.secondary`;
    const secondarySlot = requireSlot(secondarySlotId);

    assert(
      secondarySlot.productionPath === special.secondaryImagePath,
      `${cutId} secondary production path differs between business and visual authority.`,
    );

    migrated.secondaryOffer = {
      label: special.secondaryPriceLabel,
      price: parsePrice(special.secondaryPrice, `${cutId} secondary price`),
      image: referenceFromSlot(secondarySlotId),
    };
  } else {
    assert(
      special.offerMode === "single-offer",
      `Unsupported offer mode for ${cutId}: ${special.offerMode}`,
    );

    for (const field of [
      "secondaryPriceLabel",
      "secondaryPrice",
      "secondaryImagePath",
      "secondaryImageAlt",
      "secondaryImageFit",
      "secondaryImagePosition",
    ]) {
      assert(
        asText(special[field]) === "",
        `${cutId} is single-offer but ${field} is populated.`,
      );
    }
  }

  return migrated;
});

const contactIds = new Set();
const migratedContacts = activeContacts.map((contact) => {
  const baseId = slugify(asText(contact.name).split(/\s+/)[0]);
  let id = baseId;
  let suffix = 2;

  while (contactIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  contactIds.add(id);

  return {
    id,
    sort: Number(contact.sort),
    active: true,
    name: contact.name,
    location: contact.location,
    phone: contact.phone,
    email: contact.email,
  };
});

const footerSlot = requireSlot("footer.broll");
assert(
  footerSlot.productionPath === settings.footerBrollPath,
  "Footer production path differs between business and visual authority.",
);

const studioDocument = {
  schemaVersion: 1,
  documentId: "monthly-specials",
  revision: 1,
  updatedAt: migrationTimestamp,
  updatedBy: "phase-1-current-live-migration",
  page: {
    size: "legal",
    orientation: "portrait",
    widthPx: 816,
    heightPx: 1344,
    pdfWidthPt: 612,
    pdfHeightPt: 1008,
    maxActiveSpecials: 4,
  },
  theme: {
    accentColor: "#c92b32",
    accentRgb: "201, 43, 50",
  },
  header: {
    brandMark: assetReference(brandMarkAssetId, {
      visible: asBoolean(settings.headerBrandMarkVisible),
      alt: "Paragon Purveyors brand mark",
      fit: "contain",
      zoom: 1,
      focusX: 50,
      focusY: 50,
    }),
    wordmark: assetReference(wordmarkAssetId, {
      visible: asBoolean(settings.headerWordmarkVisible),
      alt: "Paragon Purveyors wordmark",
      fit: "contain",
      zoom: 1,
      focusX: 50,
      focusY: 50,
    }),
    deliveryMessage: {
      value: settings.deliveryMessage,
      visible: asBoolean(settings.deliveryMessageVisible),
    },
    campaignMark: assetReference(campaignMarkAssetId, {
      visible: campaignMarkVisible,
      alt: campaignMarkAlt,
      fit: "contain",
      zoom: 1,
      focusX: 50,
      focusY: 50,
    }),
    campaignTitle: {
      line1: settings.campaignTitleLine1,
      line2: settings.campaignTitleLine2,
      visible: asBoolean(settings.campaignTitleVisible),
    },
    month: {
      value: settings.month,
      visible: asBoolean(settings.monthVisible),
    },
    year: {
      value: settings.year,
      visible: asBoolean(settings.yearVisible),
    },
    supportingLine: {
      value: settings.headerSupportingLine,
      visible: asBoolean(settings.headerSupportingLineVisible, false),
    },
  },
  specials: migratedSpecials,
  contacts: {
    instruction: settings.contactInstruction,
    items: migratedContacts,
  },
  footer: {
    message: settings.footerMessage,
    disclaimer: settings.disclaimer,
    buttonLabel: settings.footerButtonLabel,
    url: settings.footerUrl,
    broll: referenceFromSlot("footer.broll"),
  },
  assetLibrary,
  publication: {
    profile: "monthly-specials-v1",
    currency: "USD",
    locale: "en-US",
    outputs: {
      json: "public/specials/monthly-specials.json",
      html: "public/specials/monthly-specials.html",
      pdf: "public/specials/monthly-specials.pdf",
    },
  },
};

const assertUnique = (values, context) => {
  assert(new Set(values).size === values.length, `${context} values are not unique.`);
};

assertUnique(
  studioDocument.specials.map((special) => special.id),
  "Special ID",
);
assertUnique(
  studioDocument.specials.map((special) => special.sort),
  "Special sort",
);
assertUnique(
  studioDocument.contacts.items.map((contact) => contact.id),
  "Contact ID",
);
assertUnique(
  studioDocument.contacts.items.map((contact) => contact.sort),
  "Contact sort",
);

const allReferences = [
  studioDocument.header.brandMark,
  studioDocument.header.wordmark,
  studioDocument.header.campaignMark,
  ...studioDocument.specials.flatMap((special) => [
    special.brandLogo,
    special.primaryOffer.image,
    ...(special.secondaryOffer ? [special.secondaryOffer.image] : []),
  ]),
  studioDocument.footer.broll,
];

const referencedAssetIds = new Set();

for (const reference of allReferences) {
  const record = studioDocument.assetLibrary[reference.assetId];
  assert(record, `Referenced asset is missing: ${reference.assetId}`);
  assert(record.archived === false, `Referenced asset is archived: ${reference.assetId}`);
  referencedAssetIds.add(reference.assetId);
}

for (const [assetKey, record] of Object.entries(studioDocument.assetLibrary)) {
  assert(assetKey === record.id, `Asset key/id mismatch: ${assetKey}`);
  assert(
    referencedAssetIds.has(assetKey),
    `Migration produced an unreferenced asset: ${assetKey}`,
  );
}

assert(
  Number(studioDocument.specials[0]?.sort) === 1 &&
    Number(studioDocument.specials.at(-1)?.sort) === 4,
  "Special ordering is not preserved.",
);
assert(
  studioDocument.specials.find((special) => special.id === "tri-tip")
    ?.secondaryOffer === undefined,
  "Tri Tip unexpectedly has a secondary offer.",
);
assert(
  studioDocument.specials
    .find((special) => special.id === "tenderloin")
    ?.secondaryOffer?.image.zoom === 1.5,
  "Tenderloin secondary zoom is not 1.50.",
);
assert(
  studioDocument.footer.broll.focusY === 100,
  "Footer focus Y is not 100.",
);

const ajv = new Ajv({
  strict: true,
  allErrors: true,
  validateFormats: true,
});
addFormats(ajv);

assert(
  ajv.validateSchema(schema),
  `Schema meta-validation failed: ${JSON.stringify(ajv.errors, null, 2)}`,
);

const validate = ajv.compile(schema);
const schemaAccepted = validate(studioDocument);

assert(
  schemaAccepted,
  `Migrated Studio document failed schema validation: ${JSON.stringify(
    validate.errors,
    null,
    2,
  )}`,
);

assert(copyPlans.length === 13, `Expected 13 asset copy plans, found ${copyPlans.length}.`);
assert(
  Object.keys(assetLibrary).length === 13,
  `Expected 13 asset records, found ${Object.keys(assetLibrary).length}.`,
);

const outputText = `${JSON.stringify(studioDocument, null, 2)}\n`;
const outputSha256 = sha256(Buffer.from(outputText, "utf8"));

const writeAsset = async (plan) => {
  if (await exists(plan.destinationAbsolutePath)) {
    const existingBytes = await readFile(plan.destinationAbsolutePath);
    assert(
      sha256(existingBytes) === plan.sha256,
      `Refusing to overwrite different asset bytes: ${plan.repositoryPath}`,
    );
    return "existing";
  }

  await mkdir(path.dirname(plan.destinationAbsolutePath), { recursive: true });
  const temporaryPath = `${plan.destinationAbsolutePath}.tmp-${process.pid}`;

  try {
    await copyFile(plan.sourcePath, temporaryPath, fsConstants.COPYFILE_EXCL);
    const temporaryBytes = await readFile(temporaryPath);
    assert(
      sha256(temporaryBytes) === plan.sha256,
      `Temporary asset copy hash mismatch: ${plan.repositoryPath}`,
    );
    await rename(temporaryPath, plan.destinationAbsolutePath);
    return "created";
  } catch (error) {
    await unlink(temporaryPath).catch(() => {});
    throw error;
  }
};

let assetsCreated = 0;
let assetsExisting = 0;

if (writeMode) {
  assert(!(await exists(outputPath)), `Studio output already exists: ${outputPath}`);

  for (const plan of copyPlans) {
    const result = await writeAsset(plan);
    if (result === "created") assetsCreated += 1;
    if (result === "existing") assetsExisting += 1;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  const temporaryOutputPath = `${outputPath}.tmp-${process.pid}`;

  try {
    await writeFile(temporaryOutputPath, outputText, {
      encoding: "utf8",
      flag: "wx",
    });
    const temporaryOutputBytes = await readFile(temporaryOutputPath);
    assert(
      sha256(temporaryOutputBytes) === outputSha256,
      "Temporary Studio document hash mismatch.",
    );
    await rename(temporaryOutputPath, outputPath);
  } catch (error) {
    await unlink(temporaryOutputPath).catch(() => {});
    throw error;
  }
}

console.log(`[OK] Mode: ${mode}`);
console.log(`[OK] Current live JSON SHA256: ${liveJsonSha256}`);
console.log(`[OK] Approved manifest SHA256: ${manifestSha256}`);
console.log(`[OK] Canonical schema SHA256: ${schemaSha256}`);
console.log(`[OK] Active specials migrated: ${studioDocument.specials.length}`);
console.log(`[OK] Active contacts migrated: ${studioDocument.contacts.items.length}`);
console.log(`[OK] Approved visual slots migrated: ${manifestSlots.length}`);
console.log(`[OK] Immutable asset records planned: ${Object.keys(assetLibrary).length}`);
console.log(`[OK] Schema validation: passed`);
console.log(`[OK] Unified source SHA256: ${outputSha256}`);

if (writeMode) {
  console.log(`[WRITE] Assets created: ${assetsCreated}`);
  console.log(`[WRITE] Assets already present: ${assetsExisting}`);
  console.log(`[WRITE] Studio source: ${path.relative(projectRoot, outputPath)}`);
} else {
  console.log("[DRY RUN] No repository files were written.");
}

console.log(
  JSON.stringify({
    mode,
    liveJsonSha256,
    manifestSha256,
    schemaSha256,
    outputSha256,
    specials: studioDocument.specials.length,
    contacts: studioDocument.contacts.items.length,
    manifestSlots: manifestSlots.length,
    assets: Object.keys(assetLibrary).length,
    outputRelativePath: path
      .relative(projectRoot, outputPath)
      .replace(/\\/g, "/"),
    assetsCreated,
    assetsExisting,
    writePerformed: writeMode,
  }),
);
