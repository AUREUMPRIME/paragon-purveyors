import { bytesToBase64 } from "../auth.js";
import { installationTokenProvider } from "../github/app-auth.js";
import { createGitHubClient } from "../github/client.js";
import { createGitDatabase } from "../github/git-database.js";
import {
  ASSET_LIBRARY_ROOT,
  CANONICAL_SOURCE_PATH,
  MAX_ASSET_BYTES,
  MAX_CHANGE_COUNT,
  normalizeGitSha,
  validatePublicationChanges,
} from "../github/policy.js";

export class StudioValidationError extends Error {
  constructor(message, { code = "INVALID_DOCUMENT", status = 422, errors = [] } = {}) {
    super(message);
    this.name = "StudioValidationError";
    this.code = code;
    this.status = status;
    this.errors = Object.freeze([...errors]);
  }
}

const requireObject = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new StudioValidationError(`${label} must be an object.`);
  }
  return value;
};

export const validateStudioPayload = (payload, { currentMainSha } = {}) => {
  const value = requireObject(payload, "Validation payload");
  const document = requireObject(value.document, "document");
  const assetCatalog = requireObject(value.assetCatalog, "assetCatalog");
  const baseMainSha = normalizeGitSha(value.baseMainSha, "baseMainSha");
  if (currentMainSha && normalizeGitSha(currentMainSha, "current main SHA") !== baseMainSha) {
    throw new StudioValidationError("baseMainSha does not match current main.", { code: "STALE_MAIN", status: 409 });
  }

  const errors = [];
  if (document.schemaVersion !== 1) errors.push("schemaVersion must equal 1.");
  if (document.documentId !== "monthly-specials") errors.push("documentId must equal monthly-specials.");
  if (!document.page || document.page.widthPx !== 816 || document.page.heightPx !== 1344) errors.push("Page geometry is invalid.");
  if (!Array.isArray(document.specials) || document.specials.length < 1 || document.specials.length > 4) errors.push("Active specials must contain 1 to 4 entries.");
  if (Object.keys(assetCatalog).length > 512) errors.push("Asset catalog is too large.");
  if (errors.length) throw new StudioValidationError("Studio document validation failed.", { errors });

  return Object.freeze({
    valid: true,
    document: Object.freeze(structuredClone(document)),
    assetCatalog: Object.freeze(structuredClone(assetCatalog)),
    baseMainSha,
    limits: Object.freeze({ maxChanges: MAX_CHANGE_COUNT, maxAssetBytes: MAX_ASSET_BYTES }),
  });
};

export const getCurrentMainSha = async (env, options = {}) => {
  const tokenProvider = options.tokenProvider ?? installationTokenProvider;
  const token = await tokenProvider.getToken(env, options);
  const client = (options.createClient ?? createGitHubClient)({
    token,
    fetchImpl: options.fetchImpl ?? globalThis.fetch,
    authScheme: "Bearer",
  });
  const database = (options.createDatabase ?? createGitDatabase)(client);
  return (await database.getMainReference()).sha;
};

export const buildPublicationChanges = async ({ document, assetCatalog, files, fileMetadata }) => {
  const changes = [{
    path: CANONICAL_SOURCE_PATH,
    encoding: "utf-8",
    content: JSON.stringify({ ...document, assetLibrary: assetCatalog }, null, 2) + "\n",
  }];
  const metadata = requireObject(fileMetadata, "fileMetadata");
  const uploads = files ?? [];
  if (Object.keys(metadata).length !== uploads.length) {
    throw new StudioValidationError("Upload metadata count is invalid.");
  }
  const usedNames = new Set();
  for (const upload of uploads) {
    if (usedNames.has(upload.name)) {
      throw new StudioValidationError("Upload names must be unique.");
    }
    usedNames.add(upload.name);
    const record = metadata[upload.name];
    if (
      !record
      || typeof record.assetId !== "string"
      || !record.assetId.startsWith("asset_")
      || typeof record.path !== "string"
      || !record.path.startsWith(ASSET_LIBRARY_ROOT)
    ) {
      throw new StudioValidationError("Upload metadata is invalid.");
    }
    const bytes = new Uint8Array(await upload.file.arrayBuffer());
    changes.push({ path: record.path, encoding: "base64", content: bytesToBase64(bytes) });
  }
  return validatePublicationChanges(changes);
};
