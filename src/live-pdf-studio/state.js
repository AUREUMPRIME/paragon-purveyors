import { STUDIO_DRAFT_STATUS } from "./status-model.js";

const isObject = (value) =>
  value !== null && typeof value === "object";

export const cloneDocument = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

export const deepFreeze = (value) => {
  if (!isObject(value) || Object.isFrozen(value)) return value;

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  return Object.freeze(value);
};

const stableSerialize = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  if (isObject(value)) {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
};

export const fingerprintDocument = (document) =>
  stableSerialize(document);

const isCompatibleStoredRecord = ({
  liveDocument,
  storedRecord,
}) => {
  const storedDocument = storedRecord?.document;
  const metadata = storedRecord?.metadata;

  return Boolean(
    storedDocument &&
      metadata &&
      storedDocument.documentId === liveDocument.documentId &&
      storedDocument.schemaVersion === liveDocument.schemaVersion &&
      typeof metadata.baseMainSha === "string" &&
      Number.isInteger(metadata.baseRevision),
  );
};

const setValueAtPath = (document, path, value) => {
  if (!Array.isArray(path) || path.length === 0) {
    throw new TypeError("Draft update path must be a non-empty array.");
  }

  const nextDocument = cloneDocument(document);
  let target = nextDocument;

  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index];

    if (!isObject(target[segment])) {
      throw new TypeError(
        `Draft update path does not resolve at ${String(segment)}.`,
      );
    }

    target = target[segment];
  }

  target[path.at(-1)] = cloneDocument(value);
  return nextDocument;
};

export const createStudioState = ({
  liveDocument,
  baseMainSha,
  storedRecord = null,
  now = () => new Date().toISOString(),
}) => {
  if (!isObject(liveDocument)) {
    throw new TypeError("A canonical live document is required.");
  }

  if (typeof baseMainSha !== "string" || baseMainSha.length === 0) {
    throw new TypeError("A base main SHA is required.");
  }

  const liveBaseline = deepFreeze(cloneDocument(liveDocument));
  const liveFingerprint = fingerprintDocument(liveBaseline);
  const storedIsCompatible = isCompatibleStoredRecord({
    liveDocument: liveBaseline,
    storedRecord,
  });

  let draft = storedIsCompatible
    ? cloneDocument(storedRecord.document)
    : cloneDocument(liveBaseline);

  let draftFingerprint = fingerprintDocument(draft);
  let savedFingerprint = storedIsCompatible
    ? draftFingerprint
    : liveFingerprint;

  let pendingUploadCount = 0;
  let savedPendingUploadCount = 0;
  let persistenceStatus = storedIsCompatible
    ? STUDIO_DRAFT_STATUS.SAVED
    : STUDIO_DRAFT_STATUS.CLEAN;

  let errorMessage = "";
  let lastSavedAt = storedIsCompatible
    ? storedRecord.metadata.updatedAt || null
    : null;

  let createdAt = storedIsCompatible
    ? storedRecord.metadata.createdAt || now()
    : now();

  let validationResults = storedIsCompatible
    ? cloneDocument(storedRecord.metadata.validationResults || [])
    : [];

  const staleDraft = Boolean(
    storedIsCompatible &&
      storedRecord.metadata.baseMainSha !== baseMainSha,
  );

  const listeners = new Set();

  const isModified = () =>
    draftFingerprint !== liveFingerprint || pendingUploadCount > 0;

  const hasUnsavedChanges = () =>
    draftFingerprint !== savedFingerprint ||
    pendingUploadCount !== savedPendingUploadCount;

  const getSnapshot = () => ({
    documentId: liveBaseline.documentId,
    schemaVersion: liveBaseline.schemaVersion,
    baseMainSha,
    baseRevision: liveBaseline.revision,
    persistenceStatus,
    isModified: isModified(),
    hasUnsavedChanges: hasUnsavedChanges(),
    pendingUploadCount,
    staleDraft,
    restoredStoredDraft: storedIsCompatible,
    rejectedStoredDraft: Boolean(storedRecord && !storedIsCompatible),
    createdAt,
    lastSavedAt,
    validationResults: cloneDocument(validationResults),
    errorMessage,
  });

  const notify = () => {
    const snapshot = getSnapshot();

    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  return {
    getLiveBaseline: () => liveBaseline,
    getDraft: () => cloneDocument(draft),
    getSnapshot,
    isLiveBaselineFrozen: () =>
      Object.isFrozen(liveBaseline) &&
      Object.isFrozen(liveBaseline.header) &&
      Object.isFrozen(liveBaseline.specials),
    subscribe(listener) {
      if (typeof listener !== "function") {
        throw new TypeError("State subscriber must be a function.");
      }

      listeners.add(listener);
      listener(getSnapshot());

      return () => listeners.delete(listener);
    },
    setValue(path, value) {
      draft = setValueAtPath(draft, path, value);
      draftFingerprint = fingerprintDocument(draft);
      persistenceStatus = hasUnsavedChanges()
        ? STUDIO_DRAFT_STATUS.DIRTY
        : isModified()
          ? STUDIO_DRAFT_STATUS.SAVED
          : STUDIO_DRAFT_STATUS.CLEAN;
      errorMessage = "";
      notify();
    },
    setPendingUploadCount(count) {
      if (!Number.isInteger(count) || count < 0) {
        throw new TypeError(
          "Pending upload count must be a non-negative integer.",
        );
      }

      pendingUploadCount = count;
      persistenceStatus = hasUnsavedChanges()
        ? STUDIO_DRAFT_STATUS.DIRTY
        : isModified()
          ? STUDIO_DRAFT_STATUS.SAVED
          : STUDIO_DRAFT_STATUS.CLEAN;
      errorMessage = "";
      notify();
    },
    markSaving() {
      persistenceStatus = STUDIO_DRAFT_STATUS.SAVING;
      errorMessage = "";
      notify();
    },
    markSaved(metadata = {}) {
      savedFingerprint = draftFingerprint;
      savedPendingUploadCount = pendingUploadCount;
      lastSavedAt = metadata.updatedAt || now();
      createdAt = metadata.createdAt || createdAt;
      validationResults = cloneDocument(
        metadata.validationResults || validationResults,
      );
      persistenceStatus = isModified()
        ? STUDIO_DRAFT_STATUS.SAVED
        : STUDIO_DRAFT_STATUS.CLEAN;
      errorMessage = "";
      notify();
    },
    markError(error) {
      persistenceStatus = STUDIO_DRAFT_STATUS.ERROR;
      errorMessage =
        error instanceof Error ? error.message : String(error);
      notify();
    },
    restoreLive() {
      draft = cloneDocument(liveBaseline);
      draftFingerprint = liveFingerprint;
      savedFingerprint = liveFingerprint;
      pendingUploadCount = 0;
      savedPendingUploadCount = 0;
      persistenceStatus = STUDIO_DRAFT_STATUS.CLEAN;
      errorMessage = "";
      lastSavedAt = null;
      validationResults = [];
      createdAt = now();
      notify();
    },
  };
};
