import {
  ASSET_LIBRARY_DEFINITIONS,
} from "./asset-library-model.js";

export const PRODUCT_SOURCE_LIMIT_BYTES = 12 * 1024 * 1024;
export const PRODUCT_OUTPUT_LIMIT_BYTES = 4 * 1024 * 1024;
export const PRODUCT_MAX_LONG_EDGE = 3000;
export const PRODUCT_WEBP_QUALITY = 0.88;
export const SVG_LIMIT_BYTES = 1024 * 1024;
export const LOGO_RASTER_LIMIT_BYTES = 4 * 1024 * 1024;
export const LOGO_RASTER_MAX_EDGE = 4096;

const RASTER_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const LOGO_TYPES = Object.freeze([
  "image/svg+xml",
  ...RASTER_TYPES,
]);

const extensionByMime = Object.freeze({
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
});

const textDecoder = new TextDecoder();

const bytesToHex = (bytes) =>
  [...new Uint8Array(bytes)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

export const sanitizeAssetLabel = (value) => {
  const normalized = String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    throw new TypeError("An asset label is required.");
  }

  return normalized.slice(0, 200);
};

export const createAssetSlug = (value) => {
  const slug = sanitizeAssetLabel(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "asset";
};

export const getUploadPolicy = (library) => {
  const definition = ASSET_LIBRARY_DEFINITIONS[library];

  if (!definition) {
    throw new TypeError(`Unsupported asset library: ${library}`);
  }

  return Object.freeze({
    ...definition,
    acceptedMimeTypes:
      definition.kind === "photo" ? RASTER_TYPES : LOGO_TYPES,
    sourceLimitBytes:
      definition.kind === "photo"
        ? PRODUCT_SOURCE_LIMIT_BYTES
        : LOGO_RASTER_LIMIT_BYTES,
  });
};

export const validateUploadCandidate = ({
  library,
  mimeType,
  bytes,
} = {}) => {
  const policy = getUploadPolicy(library);

  if (!policy.acceptedMimeTypes.includes(mimeType)) {
    throw new TypeError(
      `${policy.label} does not accept ${mimeType || "this file type"}.`,
    );
  }

  const limit =
    mimeType === "image/svg+xml"
      ? SVG_LIMIT_BYTES
      : policy.sourceLimitBytes;

  if (!Number.isInteger(bytes) || bytes < 1 || bytes > limit) {
    throw new TypeError(
      `${policy.label} file size exceeds the approved limit.`,
    );
  }

  return policy;
};

export const validateSvgMarkup = (markup) => {
  const source = String(markup ?? "");

  if (!/<svg(?:\s|>)/i.test(source)) {
    throw new TypeError("SVG root element is missing.");
  }

  const forbidden = [
    /<script(?:\s|>)/i,
    /<foreignObject(?:\s|>)/i,
    /\son[a-z]+\s*=/i,
    /\bjavascript\s*:/i,
    /\b(?:href|xlink:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i,
  ];

  if (forbidden.some((pattern) => pattern.test(source))) {
    throw new TypeError("SVG contains active or external content.");
  }

  return source;
};

const parseSvgLength = (value) => {
  const number = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(number) && number > 0
    ? Math.round(number)
    : null;
};

export const readSvgDimensions = (markup) => {
  const source = validateSvgMarkup(markup);
  const openTag = source.match(/<svg\b[^>]*>/i)?.[0] || "";
  const width = parseSvgLength(
    openTag.match(/\bwidth\s*=\s*["']([^"']+)["']/i)?.[1],
  );
  const height = parseSvgLength(
    openTag.match(/\bheight\s*=\s*["']([^"']+)["']/i)?.[1],
  );

  if (width && height) return { width, height };

  const viewBox = openTag
    .match(/\bviewBox\s*=\s*["']([^"']+)["']/i)?.[1]
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);

  if (
    viewBox?.length === 4 &&
    viewBox.every(Number.isFinite) &&
    viewBox[2] > 0 &&
    viewBox[3] > 0
  ) {
    return {
      width: Math.round(viewBox[2]),
      height: Math.round(viewBox[3]),
    };
  }

  throw new TypeError(
    "SVG must include positive width and height or a valid viewBox.",
  );
};

export const computeSha256 = async (
  bytes,
  cryptoImpl = globalThis.crypto,
) => {
  if (!cryptoImpl?.subtle) {
    throw new TypeError("Web Crypto is unavailable.");
  }

  const digest = await cryptoImpl.subtle.digest("SHA-256", bytes);
  return bytesToHex(digest);
};

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Unable to encode the normalized image.")),
      type,
      quality,
    );
  });

const normalizeRasterPhoto = async ({
  blob,
  createImageBitmapImpl = globalThis.createImageBitmap,
  documentImpl = globalThis.document,
}) => {
  if (typeof createImageBitmapImpl !== "function" || !documentImpl) {
    throw new TypeError("Browser image normalization is unavailable.");
  }

  const image = await createImageBitmapImpl(blob);

  try {
    const longEdge = Math.max(image.width, image.height);
    const scale = Math.min(1, PRODUCT_MAX_LONG_EDGE / longEdge);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = documentImpl.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
      alpha: true,
      colorSpace: "srgb",
    });

    if (!context) {
      throw new Error("Unable to create the image-normalization canvas.");
    }

    context.drawImage(image, 0, 0, width, height);
    const normalizedBlob = await canvasToBlob(
      canvas,
      "image/webp",
      PRODUCT_WEBP_QUALITY,
    );

    if (normalizedBlob.size > PRODUCT_OUTPUT_LIMIT_BYTES) {
      throw new TypeError(
        "Normalized image exceeds the 4 MB output limit.",
      );
    }

    return {
      blob: normalizedBlob,
      mimeType: "image/webp",
      extension: "webp",
      width,
      height,
    };
  } finally {
    image.close?.();
  }
};

const inspectRasterLogo = async ({
  blob,
  mimeType,
  createImageBitmapImpl = globalThis.createImageBitmap,
}) => {
  if (typeof createImageBitmapImpl !== "function") {
    throw new TypeError("Browser image inspection is unavailable.");
  }

  const image = await createImageBitmapImpl(blob);

  try {
    if (
      Math.max(image.width, image.height) >
      LOGO_RASTER_MAX_EDGE
    ) {
      throw new TypeError(
        "Logo raster dimensions exceed the 4096 px limit.",
      );
    }

    return {
      blob,
      mimeType,
      extension: extensionByMime[mimeType],
      width: image.width,
      height: image.height,
    };
  } finally {
    image.close?.();
  }
};

export const createPendingAssetRecord = ({
  library,
  label,
  mimeType,
  sha256,
  bytes,
  width,
  height,
  createdAt,
} = {}) => {
  const definition = ASSET_LIBRARY_DEFINITIONS[library];

  if (!definition || !/^[a-f0-9]{64}$/.test(sha256 || "")) {
    throw new TypeError("Pending asset metadata is invalid.");
  }

  const safeLabel = sanitizeAssetLabel(label);
  const extension = extensionByMime[mimeType];

  if (!extension) {
    throw new TypeError("Pending asset MIME type is unsupported.");
  }

  const prefix = sha256.slice(0, 12);
  const libraryId = library.replaceAll("-", "_");

  return Object.freeze({
    id: `asset_${libraryId}_${prefix}`,
    label: safeLabel,
    category: definition.category,
    library,
    path:
      `assets/specials/library/${library}/` +
      `${createAssetSlug(safeLabel)}-${prefix}.${extension}`,
    mimeType,
    sha256,
    bytes,
    width,
    height,
    createdAt,
    archived: false,
  });
};

export const normalizeAssetUpload = async ({
  file,
  library,
  label = file?.name?.replace(/\.[^.]+$/, ""),
  now = () => new Date().toISOString(),
  cryptoImpl = globalThis.crypto,
  createImageBitmapImpl = globalThis.createImageBitmap,
  documentImpl = globalThis.document,
} = {}) => {
  if (!(file instanceof Blob)) {
    throw new TypeError("A browser File or Blob is required.");
  }

  const mimeType = file.type;
  const policy = validateUploadCandidate({
    library,
    mimeType,
    bytes: file.size,
  });

  let normalized;

  if (mimeType === "image/svg+xml") {
    const sourceBytes = await file.arrayBuffer();
    const markup = textDecoder.decode(sourceBytes);
    const dimensions = readSvgDimensions(markup);
    normalized = {
      blob: new Blob([markup], { type: mimeType }),
      mimeType,
      extension: "svg",
      ...dimensions,
    };
  } else if (policy.kind === "photo") {
    normalized = await normalizeRasterPhoto({
      blob: file,
      createImageBitmapImpl,
      documentImpl,
    });
  } else {
    normalized = await inspectRasterLogo({
      blob: file,
      mimeType,
      createImageBitmapImpl,
    });
  }

  const normalizedBytes = await normalized.blob.arrayBuffer();
  const sha256 = await computeSha256(
    normalizedBytes,
    cryptoImpl,
  );
  const record = createPendingAssetRecord({
    library,
    label,
    mimeType: normalized.mimeType,
    sha256,
    bytes: normalized.blob.size,
    width: normalized.width,
    height: normalized.height,
    createdAt: now(),
  });

  return Object.freeze({
    record,
    blob: normalized.blob,
  });
};
