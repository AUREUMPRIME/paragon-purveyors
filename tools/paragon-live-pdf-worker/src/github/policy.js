export const GITHUB_API_BASE = "https://api.github.com";
export const GITHUB_API_VERSION = "2026-03-10";
export const GITHUB_USER_AGENT = "Paragon-Live-PDF-Studio-Worker";
export const REPOSITORY_OWNER = "AUREUMPRIME";
export const REPOSITORY_NAME = "paragon-purveyors";
export const DEFAULT_BRANCH = "main";
export const DEFAULT_BRANCH_REF = "refs/heads/main";
export const STAGING_BRANCH_PREFIX = "refs/heads/studio-publish/";
export const CANONICAL_SOURCE_PATH = "src/data/paragon-live-pdf-studio.json";
export const ASSET_LIBRARY_ROOT = "public/assets/specials/library/";
export const PUBLISH_WORKFLOW_ID = "publish-live-pdf-studio.yml";
export const PUBLISH_WORKFLOW_REF = "main";
export const PUBLISH_RUN_TITLE_PREFIX = "Paragon Studio Publish ";
export const MAX_UPLOAD_COUNT = 32;
export const MAX_UPLOAD_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_MULTIPART_BYTES = 64 * 1024 * 1024;
export const MAX_VALIDATION_BODY_BYTES = 1024 * 1024;
export const MAX_CHANGE_COUNT = 64;
export const MAX_TEXT_BYTES = 512 * 1024;
export const MAX_ASSET_BYTES = 8 * 1024 * 1024;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const SHA_PATTERN = /^[0-9a-f]{40}$/u;
const ASSET_PATH_PATTERN = /^public\/assets\/specials\/library\/(?:[a-z0-9][a-z0-9-]*\/)+[a-z0-9][a-z0-9-]*-[0-9a-f]{12}\.(?:jpe?g|png|svg|webp)$/u;

const encoder = new TextEncoder();

export class GitHubPolicyError extends Error {
  constructor(message, code = "POLICY_VIOLATION") {
    super(message);
    this.name = "GitHubPolicyError";
    this.code = code;
  }
}

export const normalizePublishId = (value) => {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new GitHubPolicyError("publishId must be a canonical lowercase UUID.", "INVALID_PUBLISH_ID");
  }

  return value;
};

export const normalizeGitSha = (value, label = "Git SHA") => {
  if (typeof value !== "string" || !SHA_PATTERN.test(value)) {
    throw new GitHubPolicyError(`${label} must be a lowercase forty-character Git SHA.`, "INVALID_GIT_SHA");
  }

  return value;
};

export const createStagingRef = (publishId) => (
  `${STAGING_BRANCH_PREFIX}${normalizePublishId(publishId)}`
);

export const createStagingBranch = (publishId) => (
  `studio-publish/${normalizePublishId(publishId)}`
);

export const isAllowedPublicationPath = (path) => (
  path === CANONICAL_SOURCE_PATH || ASSET_PATH_PATTERN.test(path)
);

const normalizeEncoding = (value, path) => {
  const expected = path === CANONICAL_SOURCE_PATH ? "utf-8" : "base64";
  if (value !== expected) {
    throw new GitHubPolicyError(
      `${path} must use ${expected} encoding.`,
      "INVALID_CONTENT_ENCODING",
    );
  }

  return expected;
};

const decodeBase64Length = (value) => {
  if (typeof value !== "string" || value.length === 0 || !/^[A-Za-z0-9+/]+={0,2}$/u.test(value)) {
    throw new GitHubPolicyError("Asset content must be non-empty canonical base64.", "INVALID_BASE64_CONTENT");
  }

  if (value.length % 4 !== 0) {
    throw new GitHubPolicyError("Asset content must be padded canonical base64.", "INVALID_BASE64_CONTENT");
  }

  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  return (value.length / 4) * 3 - padding;
};

const validatePath = (path) => {
  if (
    typeof path !== "string"
    || path.length === 0
    || path.length > 512
    || path.startsWith("/")
    || path.includes("\\")
    || path.includes("..")
    || path.includes("//")
    || path.includes("?")
    || path.includes("#")
    || !isAllowedPublicationPath(path)
  ) {
    throw new GitHubPolicyError(`Publication path is not allowed: ${String(path)}`, "PATH_NOT_ALLOWED");
  }

  return path;
};

const validateChange = (change) => {
  if (!change || typeof change !== "object" || Array.isArray(change)) {
    throw new GitHubPolicyError("Each publication change must be an object.", "INVALID_CHANGE");
  }

  const path = validatePath(change.path);
  const encoding = normalizeEncoding(change.encoding, path);

  if (typeof change.content !== "string" || change.content.length === 0) {
    throw new GitHubPolicyError(`${path} must include non-empty content.`, "MISSING_CONTENT");
  }

  const byteLength = encoding === "utf-8"
    ? encoder.encode(change.content).byteLength
    : decodeBase64Length(change.content);

  const maximum = path === CANONICAL_SOURCE_PATH ? MAX_TEXT_BYTES : MAX_ASSET_BYTES;
  if (byteLength > maximum) {
    throw new GitHubPolicyError(`${path} exceeds the allowed size.`, "CONTENT_TOO_LARGE");
  }

  return Object.freeze({ path, content: change.content, encoding, byteLength });
};

export const validatePublicationChanges = (changes) => {
  if (!Array.isArray(changes) || changes.length === 0) {
    throw new GitHubPolicyError("At least one publication change is required.", "EMPTY_CHANGESET");
  }

  if (changes.length > MAX_CHANGE_COUNT) {
    throw new GitHubPolicyError("Publication change count exceeds the maximum.", "TOO_MANY_CHANGES");
  }

  const normalized = changes.map(validateChange);
  const seen = new Set();
  for (const change of normalized) {
    if (seen.has(change.path)) {
      throw new GitHubPolicyError(`Duplicate publication path: ${change.path}`, "DUPLICATE_PATH");
    }
    seen.add(change.path);
  }

  return Object.freeze(normalized);
};

export const validateStagingRequest = ({ publishId, baseMainSha, changes } = {}) => Object.freeze({
  publishId: normalizePublishId(publishId),
  baseMainSha: normalizeGitSha(baseMainSha, "baseMainSha"),
  changes: validatePublicationChanges(changes),
});

export const createCommitMessage = (publishId) => (
  `chore: stage Live PDF Studio publication ${normalizePublishId(publishId)}`
);
