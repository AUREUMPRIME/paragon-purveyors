export const DRAFT_DATABASE_NAME =
  "paragon-live-pdf-studio";

export const DRAFT_DATABASE_VERSION = 1;

export const DRAFT_STORE_NAMES = Object.freeze({
  DOCUMENTS: "documents",
  METADATA: "metadata",
  UPLOADS: "uploads",
});

const requestToPromise = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("IndexedDB request failed."));
  });

const transactionToPromise = (transaction) =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(
        transaction.error ||
          new Error("IndexedDB transaction failed."),
      );
    transaction.onabort = () =>
      reject(
        transaction.error ||
          new Error("IndexedDB transaction was aborted."),
      );
  });

export const createDraftStore = ({
  indexedDB = globalThis.indexedDB,
  databaseName = DRAFT_DATABASE_NAME,
  databaseVersion = DRAFT_DATABASE_VERSION,
} = {}) => {
  if (!indexedDB || typeof indexedDB.open !== "function") {
    throw new TypeError("IndexedDB is unavailable.");
  }

  let databasePromise = null;

  const openDatabase = () => {
    if (databasePromise) return databasePromise;

    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(
        databaseName,
        databaseVersion,
      );

      request.onupgradeneeded = () => {
        const database = request.result;

        for (const storeName of Object.values(
          DRAFT_STORE_NAMES,
        )) {
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName);
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(
          request.error ||
            new Error("Unable to open the draft database."),
        );
      request.onblocked = () =>
        reject(new Error("Draft database upgrade was blocked."));
    });

    return databasePromise;
  };

  const loadDraft = async (documentId) => {
    const database = await openDatabase();
    const transaction = database.transaction(
      [
        DRAFT_STORE_NAMES.DOCUMENTS,
        DRAFT_STORE_NAMES.METADATA,
      ],
      "readonly",
    );

    const documentRequest = transaction
      .objectStore(DRAFT_STORE_NAMES.DOCUMENTS)
      .get(documentId);

    const metadataRequest = transaction
      .objectStore(DRAFT_STORE_NAMES.METADATA)
      .get(documentId);

    const [document, metadata] = await Promise.all([
      requestToPromise(documentRequest),
      requestToPromise(metadataRequest),
      transactionToPromise(transaction),
    ]);

    if (!document && !metadata) return null;

    return { document, metadata };
  };

  const saveDraft = async ({ document, metadata }) => {
    if (!document?.documentId) {
      throw new TypeError(
        "A draft document with documentId is required.",
      );
    }

    const database = await openDatabase();
    const transaction = database.transaction(
      [
        DRAFT_STORE_NAMES.DOCUMENTS,
        DRAFT_STORE_NAMES.METADATA,
      ],
      "readwrite",
    );

    transaction
      .objectStore(DRAFT_STORE_NAMES.DOCUMENTS)
      .put(document, document.documentId);

    transaction
      .objectStore(DRAFT_STORE_NAMES.METADATA)
      .put(
        {
          ...metadata,
          documentId: document.documentId,
        },
        document.documentId,
      );

    await transactionToPromise(transaction);
  };

  const clearDraft = async (documentId) => {
    const database = await openDatabase();
    const transaction = database.transaction(
      Object.values(DRAFT_STORE_NAMES),
      "readwrite",
    );

    transaction
      .objectStore(DRAFT_STORE_NAMES.DOCUMENTS)
      .delete(documentId);

    transaction
      .objectStore(DRAFT_STORE_NAMES.METADATA)
      .delete(documentId);

    transaction
      .objectStore(DRAFT_STORE_NAMES.UPLOADS)
      .clear();

    await transactionToPromise(transaction);
  };

  const putUpload = async ({
    assetId,
    documentId,
    blob,
    metadata,
  }) => {
    if (!assetId || !documentId || !(blob instanceof Blob)) {
      throw new TypeError(
        "Pending upload requires assetId, documentId, and Blob.",
      );
    }

    const database = await openDatabase();
    const transaction = database.transaction(
      DRAFT_STORE_NAMES.UPLOADS,
      "readwrite",
    );

    transaction
      .objectStore(DRAFT_STORE_NAMES.UPLOADS)
      .put(
        {
          assetId,
          documentId,
          blob,
          metadata,
        },
        `${documentId}:${assetId}`,
      );

    await transactionToPromise(transaction);
  };

  const countUploads = async () => {
    const database = await openDatabase();
    const transaction = database.transaction(
      DRAFT_STORE_NAMES.UPLOADS,
      "readonly",
    );

    const count = await requestToPromise(
      transaction
        .objectStore(DRAFT_STORE_NAMES.UPLOADS)
        .count(),
    );

    await transactionToPromise(transaction);
    return count;
  };

  const close = async () => {
    if (!databasePromise) return;

    try {
      const database = await databasePromise;
      database.close();
    } finally {
      databasePromise = null;
    }
  };

  return {
    open: openDatabase,
    loadDraft,
    saveDraft,
    clearDraft,
    putUpload,
    countUploads,
    close,
  };
};
