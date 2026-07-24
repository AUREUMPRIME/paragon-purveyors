import "./styles.css";
import { createAssetLibraryController } from "./asset-library-controller.js";
import { createAssetPreviewResolver } from "./asset-preview-resolver.js";
import { createAutosaveController } from "./autosave-controller.js";
import {
  loadCanonicalDocument,
} from "./document-source.js";
import { createDraftStore } from "./draft-store.js";
import { createEditorController } from "./editor-controller.js";
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
let validationAwareState = null;
let draftStore = null;
let autosaveController = null;
let editorController = null;
let assetLibraryController = null;
let assetPreviewResolver = null;
let unsubscribeDraftState = null;
let activeSection = "overview";

const openAssetLibrary = (options = {}) => {
  if (assetLibraryController) {
    void assetLibraryController.open(options);
    return;
  }

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
    activeSection = sectionId;

    if (editorController) {
      editorController.navigate(sectionId);
    } else {
      shell.renderWorkspace(sectionId);
    }

    if (sectionId === "assets") openAssetLibrary();
    if (sectionId === "review") reviewController.open();
  },
});

const createValidationAwareState = ({
  state,
  getValidationResults,
}) => ({
  getLiveBaseline: state.getLiveBaseline,
  getDraft: state.getDraft,
  isLiveBaselineFrozen: state.isLiveBaselineFrozen,
  setValue: state.setValue,
  setPendingUploadCount: state.setPendingUploadCount,
  markSaving: state.markSaving,
  markSaved: state.markSaved,
  markError: state.markError,
  restoreLive: state.restoreLive,
  getSnapshot: () => ({
    ...state.getSnapshot(),
    validationResults: getValidationResults(),
  }),
  subscribe(listener) {
    return state.subscribe((snapshot) => {
      listener({
        ...snapshot,
        validationResults: getValidationResults(),
      });
    });
  },
});

const handleRestoreLive = async () => {
  if (!autosaveController || !studioState) return;
  if (!studioState.getSnapshot().isModified) return;

  const confirmed = await shell.confirmRestoreLive();

  if (confirmed) {
    const documentId = studioState.getSnapshot().documentId;
    await autosaveController.restoreLive();
    await assetPreviewResolver?.reload(documentId);
    await assetLibraryController?.refresh();
    editorController?.refresh();
  }
};

root.addEventListener("click", async (event) => {
  const assetPicker = event.target.closest("[data-asset-picker]");

  if (assetPicker) {
    openAssetLibrary({
      slotPath: assetPicker.dataset.assetSlot,
      library: assetPicker.dataset.assetLibrary,
      label: assetPicker.dataset.assetLabel,
    });
    return;
  }

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

  assetPreviewResolver = createAssetPreviewResolver({
    store: draftStore,
  });

  const restoredUploads = await assetPreviewResolver.reload(
    source.document.documentId,
  );
  studioState.setPendingUploadCount(restoredUploads.length);

  if (studioState.getSnapshot().restoredStoredDraft) {
    studioState.markSaved(storedRecord.metadata);
  }

  editorController = createEditorController({
    root,
    shell,
    state: studioState,
    assetPreviewResolver,
  });

  validationAwareState = createValidationAwareState({
    state: studioState,
    getValidationResults:
      editorController.getValidationResults,
  });

  autosaveController = createAutosaveController({
    state: validationAwareState,
    store: draftStore,
  });

  unsubscribeDraftState = validationAwareState.subscribe(
    (snapshot) => {
      shell.setDraftState(snapshot);
      editorController.handleSnapshot(snapshot);
    },
  );

  assetLibraryController = createAssetLibraryController({
    dialog: assetDialog,
    state: studioState,
    store: draftStore,
    previewResolver: assetPreviewResolver,
    shell,
    onDraftChanged: () => editorController.refresh(),
  });

  await assetLibraryController.refresh();
  editorController.navigate(activeSection);

  window.addEventListener("beforeunload", handleBeforeUnload);

  window.__PARAGON_LIVE_PDF_STUDIO_DRAFT__ = Object.freeze({
    version: 3,
    getSnapshot: () => validationAwareState.getSnapshot(),
    getDraft: () => studioState.getDraft(),
    getLiveBaseline: () => studioState.getLiveBaseline(),
    setValue: (path, value) => studioState.setValue(path, value),
    saveNow: () => autosaveController.saveNow(),
    restoreLive: async () => {
      const documentId = studioState.getSnapshot().documentId;
      const snapshot = await autosaveController.restoreLive();
      await assetPreviewResolver.reload(documentId);
      await assetLibraryController.refresh();
      editorController.refresh();
      return snapshot;
    },
    openAssetLibrary: (options = {}) =>
      assetLibraryController.open(options),
    getValidation: () => editorController.getValidation(),
    getSectionStatuses: () =>
      editorController.getSectionStatuses(),
    getEditorRegistry: () => ({
      bindingCount:
        editorController.getRegistry().fields.length,
      visualBindingCount:
        editorController.getVisualRegistry().fields.length,
      totalBindingCount:
        editorController.getCompleteRegistry().fields.length,
      sectionCounts: Object.fromEntries(
        Object.entries(
          editorController.getRegistry().bySection,
        ).map(([sectionId, fields]) => [
          sectionId,
          fields.length,
        ]),
      ),
    }),
    getDiagnostics: () => ({
      liveBaselineFrozen: studioState.isLiveBaselineFrozen(),
      pendingAutosave:
        autosaveController.hasPendingAutosave(),
      databaseName: "paragon-live-pdf-studio",
      stores: ["documents", "metadata", "uploads"],
      editorBindings:
        editorController.getRegistry().fields.length,
      visualBindings:
        editorController.getVisualRegistry().fields.length,
      totalBindings:
        editorController.getCompleteRegistry().fields.length,
      editorSections: 5,
      assetRecords: Object.keys(
        studioState.getDraft().assetLibrary,
      ).length,
      pendingUploads:
        assetLibraryController.getPendingAssetIds().size,
      assetLibraryMode: "indexeddb-pending",
    }),
    dispose: async () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
      unsubscribeDraftState?.();
      assetLibraryController?.dispose();
      assetPreviewResolver?.dispose();
      editorController?.dispose();
      await autosaveController.dispose();
    },
  });

  return validationAwareState.getSnapshot();
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
  version: 4,
  navigationSections: 8,
  primaryActions: 5,
  productionPublishingEnabled: false,
  draftFoundation: "indexeddb",
  contentEditors: 4,
  visualEditors: 3,
  editableBindings: 78,
  visualBindings: 95,
  totalBindings: 173,
  assetLibrary: "indexeddb-pending",
  assetAssignmentEnabled: true,
  committedAssetDeletionEnabled: false,
});
