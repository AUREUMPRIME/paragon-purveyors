import "./styles.css";
import { createAutosaveController } from "./autosave-controller.js";
import {
  loadCanonicalDocument,
} from "./document-source.js";
import { createDraftStore } from "./draft-store.js";
import { createNavigationController } from "./navigation.js";
import { createReviewDialogController } from "./review-dialog.js";
import { renderStudioShell } from "./shell.js";
import { createStudioState } from "./state.js";
import {
  createInitialSectionStatuses,
  STUDIO_DRAFT_STATUS,
} from "./status-model.js";

const root = document.getElementById("studio-app");

if (!root) {
  throw new Error("Live PDF Studio root not found.");
}

const statuses = createInitialSectionStatuses();
const shell = renderStudioShell({ root, statuses });
const reviewDialog = root.querySelector("[data-review-dialog]");
const assetDialog = root.querySelector("[data-asset-library-dialog]");
const reviewController = createReviewDialogController(reviewDialog);

let studioState = null;
let draftStore = null;
let autosaveController = null;
let unsubscribeDraftState = null;

const openAssetLibrary = () => {
  if (!assetDialog.open) assetDialog.showModal();
};

const closeAssetLibrary = () => {
  if (assetDialog.open) assetDialog.close();
};

assetDialog.addEventListener("click", (event) => {
  if (event.target.matches("[data-assets-close]")) closeAssetLibrary();
  if (event.target === assetDialog) closeAssetLibrary();
});

createNavigationController({
  root,
  onNavigate: (sectionId) => {
    shell.renderWorkspace(sectionId);
    if (sectionId === "assets") openAssetLibrary();
    if (sectionId === "review") reviewController.open();
  },
});

const handleRestoreLive = async () => {
  if (!autosaveController || !studioState) return;
  if (!studioState.getSnapshot().isModified) return;

  const confirmed = await shell.confirmRestoreLive();

  if (confirmed) {
    await autosaveController.restoreLive();
  }
};

root.addEventListener("click", async (event) => {
  const action =
    event.target.closest("[data-studio-action]")
      ?.dataset.studioAction;

  if (action === "open-assets") openAssetLibrary();
  if (action === "open-review") reviewController.open();

  if (action === "save-draft" && autosaveController) {
    await autosaveController.saveNow();
  }

  if (action === "restore-live") {
    await handleRestoreLive();
  }
});

const handleBeforeUnload = (event) => {
  if (!studioState?.getSnapshot().hasUnsavedChanges) return;

  event.preventDefault();
  event.returnValue = "";
};

const initializeDraftFoundation = async () => {
  const source = await loadCanonicalDocument();
  draftStore = createDraftStore();

  const storedRecord = await draftStore.loadDraft(
    source.document.documentId,
  );

  studioState = createStudioState({
    liveDocument: source.document,
    baseMainSha: source.baseMainSha,
    storedRecord,
  });

  autosaveController = createAutosaveController({
    state: studioState,
    store: draftStore,
  });

  unsubscribeDraftState = studioState.subscribe((snapshot) => {
    shell.setDraftState(snapshot);
  });

  window.addEventListener("beforeunload", handleBeforeUnload);

  window.__PARAGON_LIVE_PDF_STUDIO_DRAFT__ = Object.freeze({
    version: 1,
    getSnapshot: () => studioState.getSnapshot(),
    getDraft: () => studioState.getDraft(),
    getLiveBaseline: () => studioState.getLiveBaseline(),
    setValue: (path, value) => studioState.setValue(path, value),
    saveNow: () => autosaveController.saveNow(),
    restoreLive: () => autosaveController.restoreLive(),
    getDiagnostics: () => ({
      liveBaselineFrozen: studioState.isLiveBaselineFrozen(),
      pendingAutosave:
        autosaveController.hasPendingAutosave(),
      databaseName: "paragon-live-pdf-studio",
      stores: ["documents", "metadata", "uploads"],
    }),
    dispose: async () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
      unsubscribeDraftState?.();
      await autosaveController.dispose();
    },
  });

  return studioState.getSnapshot();
};

shell.setDraftState({
  persistenceStatus: STUDIO_DRAFT_STATUS.LOADING,
  isModified: false,
  lastSavedAt: null,
  staleDraft: false,
  errorMessage: "",
});

initializeDraftFoundation().catch((error) => {
  console.error(error);
  shell.setDraftError(error.message);
});

window.__PARAGON_LIVE_PDF_STUDIO_SHELL__ = Object.freeze({
  version: 2,
  navigationSections: 8,
  primaryActions: 5,
  productionPublishingEnabled: false,
  draftFoundation: "indexeddb",
});
