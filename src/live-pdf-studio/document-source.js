export const CANONICAL_DOCUMENT_URL =
  "/src/data/paragon-live-pdf-studio.json";

export const LOCAL_BASE_MAIN_SHA =
  "dd2c1d4191b6b497e490402799ee735233555390";

const REQUIRED_DOCUMENT_KEYS = Object.freeze([
  "schemaVersion",
  "documentId",
  "revision",
  "page",
  "theme",
  "header",
  "specials",
  "contacts",
  "footer",
  "assetLibrary",
  "publication",
]);

const assertCanonicalDocument = (document) => {
  if (!document || typeof document !== "object") {
    throw new TypeError("Canonical Studio source is not an object.");
  }

  for (const key of REQUIRED_DOCUMENT_KEYS) {
    if (!(key in document)) {
      throw new TypeError(
        `Canonical Studio source is missing ${key}.`,
      );
    }
  }

  if (document.documentId !== "monthly-specials") {
    throw new TypeError("Unexpected canonical document ID.");
  }

  if (!Number.isInteger(document.revision)) {
    throw new TypeError("Canonical revision must be an integer.");
  }

  return document;
};

export const loadCanonicalDocument = async ({
  fetchImpl = globalThis.fetch,
  sourceUrl = CANONICAL_DOCUMENT_URL,
  baseMainSha = LOCAL_BASE_MAIN_SHA,
} = {}) => {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("A fetch implementation is required.");
  }

  const response = await fetchImpl(sourceUrl, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load canonical Studio source: HTTP ${response.status}.`,
    );
  }

  const document = assertCanonicalDocument(await response.json());

  return {
    document,
    baseMainSha,
    baseRevision: document.revision,
    sourceUrl,
  };
};
