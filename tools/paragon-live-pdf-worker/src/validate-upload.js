import {
  MAX_MULTIPART_BYTES,
  MAX_UPLOAD_COUNT,
  MAX_UPLOAD_FILE_BYTES,
  MAX_VALIDATION_BODY_BYTES,
} from "./github/policy.js";

const encoder = new TextEncoder();
const allowedMimes = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);

export class RequestValidationError extends Error {
  constructor(message, { code = "INVALID_REQUEST", status = 400 } = {}) {
    super(message);
    this.name = "RequestValidationError";
    this.code = code;
    this.status = status;
  }
}

const contentLength = (request) => {
  const value = request.headers.get("content-length");
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export const readJsonRequest = async (request, maxBytes = MAX_VALIDATION_BODY_BYTES) => {
  const type = (request.headers.get("content-type") || "").toLowerCase();
  if (!type.startsWith("application/json")) {
    throw new RequestValidationError("JSON content type is required.", { status: 415, code: "UNSUPPORTED_MEDIA_TYPE" });
  }
  if (contentLength(request) > maxBytes) {
    throw new RequestValidationError("Request body is too large.", { status: 413, code: "BODY_TOO_LARGE" });
  }
  const text = await request.text();
  if (encoder.encode(text).byteLength > maxBytes) {
    throw new RequestValidationError("Request body is too large.", { status: 413, code: "BODY_TOO_LARGE" });
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new RequestValidationError("Request body is not valid JSON.");
  }
};

const safeSvg = async (file) => {
  const text = await file.text();
  if (/<script\b|<foreignObject\b|\son[a-z]+\s*=|(?:href|src)\s*=\s*["'](?:https?:|javascript:)/iu.test(text)) {
    throw new RequestValidationError("SVG contains active content.", { status: 422, code: "INVALID_SVG" });
  }
};

export const validateUploadFile = async (file, { maxFileBytes = MAX_UPLOAD_FILE_BYTES } = {}) => {
  if (!(file instanceof Blob)) {
    throw new RequestValidationError("Upload is not a file.");
  }
  if (!allowedMimes.has(file.type)) {
    throw new RequestValidationError("Upload MIME type is unsupported.", { status: 415, code: "UNSUPPORTED_UPLOAD" });
  }
  if (file.size <= 0 || file.size > maxFileBytes) {
    throw new RequestValidationError("Upload file size is invalid.", { status: 413, code: "FILE_TOO_LARGE" });
  }
  if (file.type === "image/svg+xml") await safeSvg(file);
  return Object.freeze({ name: String(file.name ?? "upload"), type: file.type, size: file.size, file });
};

export const readPublishForm = async (request, limits = {}) => {
  const maxBodyBytes = limits.maxBodyBytes ?? MAX_MULTIPART_BYTES;
  const maxFiles = limits.maxFiles ?? MAX_UPLOAD_COUNT;
  const maxFileBytes = limits.maxFileBytes ?? MAX_UPLOAD_FILE_BYTES;
  const type = (request.headers.get("content-type") || "").toLowerCase();
  if (!type.startsWith("multipart/form-data")) {
    throw new RequestValidationError("Multipart content type is required.", { status: 415, code: "UNSUPPORTED_MEDIA_TYPE" });
  }
  if (contentLength(request) > maxBodyBytes) {
    throw new RequestValidationError("Multipart body is too large.", { status: 413, code: "BODY_TOO_LARGE" });
  }

  const form = await request.formData();
  const allowed = new Set(["document", "assetCatalog", "baseMainSha", "publishId", "commitMessage", "fileMetadata", "files[]"]);
  for (const key of form.keys()) {
    if (!allowed.has(key)) throw new RequestValidationError(`Unknown multipart field: ${key}`);
  }
  for (const scalar of ["document", "assetCatalog", "baseMainSha", "publishId", "commitMessage", "fileMetadata"]) {
    if (form.getAll(scalar).length !== 1) throw new RequestValidationError(`${scalar} must appear exactly once.`);
  }

  const files = form.getAll("files[]");
  if (files.length > maxFiles) {
    throw new RequestValidationError("Upload count exceeds the maximum.", { status: 413, code: "TOO_MANY_FILES" });
  }
  const validatedFiles = [];
  for (const file of files) validatedFiles.push(await validateUploadFile(file, { maxFileBytes }));

  const parse = (name) => {
    try { return JSON.parse(String(form.get(name))); }
    catch { throw new RequestValidationError(`${name} is not valid JSON.`); }
  };

  return Object.freeze({
    document: parse("document"),
    assetCatalog: parse("assetCatalog"),
    baseMainSha: String(form.get("baseMainSha")),
    publishId: String(form.get("publishId")),
    commitMessage: String(form.get("commitMessage")),
    fileMetadata: parse("fileMetadata"),
    files: Object.freeze(validatedFiles),
  });
};
