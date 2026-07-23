export const DEFAULT_AUTOSAVE_DEBOUNCE_MS = 650;

export const createAutosaveController = ({
  state,
  store,
  debounceMs = DEFAULT_AUTOSAVE_DEBOUNCE_MS,
  now = () => new Date().toISOString(),
  setTimeoutImpl = globalThis.setTimeout,
  clearTimeoutImpl = globalThis.clearTimeout,
} = {}) => {
  if (!state || typeof state.subscribe !== "function") {
    throw new TypeError("Studio state is required.");
  }

  if (!store || typeof store.saveDraft !== "function") {
    throw new TypeError("Draft store is required.");
  }

  let timer = null;
  let disposed = false;
  let saveQueue = Promise.resolve();

  const cancelPending = () => {
    if (timer !== null) {
      clearTimeoutImpl(timer);
      timer = null;
    }
  };

  const persist = async ({ force = true } = {}) => {
    if (disposed) return null;

    const snapshot = state.getSnapshot();

    if (!force && !snapshot.hasUnsavedChanges) {
      return snapshot;
    }

    state.markSaving();

    const savingSnapshot = state.getSnapshot();
    const timestamp = now();
    const metadata = {
      baseMainSha: savingSnapshot.baseMainSha,
      baseRevision: savingSnapshot.baseRevision,
      createdAt: savingSnapshot.createdAt || timestamp,
      updatedAt: timestamp,
      validationResults: savingSnapshot.validationResults,
    };

    try {
      await store.saveDraft({
        document: state.getDraft(),
        metadata,
      });

      state.markSaved(metadata);
      return state.getSnapshot();
    } catch (error) {
      state.markError(error);
      throw error;
    }
  };

  const saveNow = ({ force = true } = {}) => {
    cancelPending();

    saveQueue = saveQueue.then(
      () => persist({ force }),
      () => persist({ force }),
    );

    return saveQueue;
  };

  const schedule = (snapshot) => {
    if (
      disposed ||
      snapshot.persistenceStatus !== "dirty"
    ) {
      return;
    }

    cancelPending();

    timer = setTimeoutImpl(() => {
      timer = null;
      void saveNow({ force: false }).catch(() => {
        // State already exposes the failure without losing the draft.
      });
    }, debounceMs);
  };

  const unsubscribe = state.subscribe(schedule);

  const restoreLive = async () => {
    cancelPending();
    const documentId = state.getSnapshot().documentId;
    state.restoreLive();
    await store.clearDraft(documentId);
    return state.getSnapshot();
  };

  const dispose = async () => {
    disposed = true;
    cancelPending();
    unsubscribe();

    if (typeof store.close === "function") {
      await store.close();
    }
  };

  return {
    saveNow,
    restoreLive,
    dispose,
    hasPendingAutosave: () => timer !== null,
  };
};
