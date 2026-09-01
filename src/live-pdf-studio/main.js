import "./styles.css";
import { createStudioApiClient } from "./api-client.js";
import { createAssetLibraryController } from "./asset-library-controller.js";
import { createAssetPreviewResolver } from "./asset-preview-resolver.js";
import { createStudioAuthController } from "./auth.js";
import { createAutosaveController } from "./autosave-controller.js";
import {
  loadCanonicalDocument,
} from "./document-source.js";
import { createDraftStore } from "./draft-store.js";
import { createDave2DialogController } from "./dave2-dialog.js";
import { createEditorController } from "./editor-controller.js";
import { createNavigationController } from "./navigation.js";
import { createPublishController } from "./publish-controller.js";
import { createReviewDialogController } from "./review-dialog.js";
import { createReviewPreview } from "./review-preview.js";
import { renderStudioShell } from "./shell.js";
import { createStudioState, fingerprintDocument } from "./state.js";
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

const dave2DialogController =
  createDave2DialogController({ root });

const reviewDialog = root.querySelector("[data-review-dialog]");
const assetDialog = root.querySelector("[data-asset-library-dialog]");
const authForm = root.querySelector("[data-studio-auth-form]");
const passwordInput = root.querySelector("[data-studio-password]");

if (!authForm || !passwordInput) {
  throw new Error("Live PDF Studio authentication controls not found.");
}

const getConfiguredStudioApiBaseUrl = () => {
  const value =
    import.meta.env.VITE_PARAGON_STUDIO_API_BASE;

  return typeof value === "string" ? value.trim() : "";
};

const resolveStudioApiBaseUrl = () => {
  const override =
    globalThis.__PARAGON_LIVE_PDF_STUDIO_API_BASE__;

  if (typeof override === "string" && override.trim()) {
    return override.trim();
  }

  if (
    ["127.0.0.1", "localhost"].includes(
      window.location.hostname,
    )
  ) {
    return "http://127.0.0.1:8787";
  }

  return getConfiguredStudioApiBaseUrl();
};

const apiClient = createStudioApiClient({
  baseUrl: resolveStudioApiBaseUrl(),
});

const authController = createStudioAuthController({
  client: apiClient,
  onStateChange: (state) => {
    if (!state.authenticated) {
      shell.setAuthState({
        authenticated: false,
        loading: false,
        message: "",
      });
    }
  },
});

let studioState = null;
let validationAwareState = null;
let draftStore = null;
let autosaveController = null;
let editorController = null;
let assetLibraryController = null;
let assetPreviewResolver = null;
let reviewPreview = null;
let reviewController = null;
let publishController = null;
let productionPublishingEnabled = false;
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

const navigationController = createNavigationController({
  root,
  onNavigate: (sectionId) => {
    activeSection = sectionId;

    if (editorController) {
      editorController.navigate(sectionId);
    } else {
      shell.renderWorkspace(sectionId);
    }

    if (sectionId === "assets") openAssetLibrary();
    if (sectionId === "review") void reviewController?.open();
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
  if (action === "open-review") void reviewController?.open();
  if (action === "publish") void publishController?.publish();

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

const initializeDraftFoundation = async (bootstrap) => {
  if (studioState) return validationAwareState.getSnapshot();

  const source = {
    document: bootstrap.document,
    baseMainSha: bootstrap.currentMainSha,
  };

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

  reviewPreview = createReviewPreview({
    getDraft: () => studioState.getDraft(),
    assetPreviewResolver,
  });

  reviewController = createReviewDialogController(reviewDialog, {
    createPreview: () => reviewPreview.render(),
    getEditorValidation: () =>
      editorController.getReviewInputValidation(),
    getDraftFingerprint: () =>
      fingerprintDocument(studioState.getDraft()),
    getPublishingEnabled: () => productionPublishingEnabled,
    onValidationChange: (reviewValidation) =>
      editorController.setReviewValidation(reviewValidation),
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
      reviewController.scheduleRefresh();
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

  publishController = createPublishController({
    apiClient,
    authController,
    shell,
    state: studioState,
    store: draftStore,
    reviewController,
    navigateToOverview: () => navigationController.setActive("overview"),
  });
  publishController.setAvailability(productionPublishingEnabled);

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
    openReview: () => reviewController.open(),
    refreshReview: () => reviewController.refresh(),
    getReviewValidation: () =>
      reviewController.getValidation(),
    publish: () => publishController.publish(),
    getPublicationState: () => publishController.getState(),
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
      reviewPreviewMode: "current-draft-srcdoc",
      reviewOpen: reviewController.isOpen(),
    }),
    dispose: async () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
      unsubscribeDraftState?.();
      assetLibraryController?.dispose();
      publishController?.dispose();
      reviewController?.dispose();
      assetPreviewResolver?.dispose();
      editorController?.dispose();
      dave2DialogController.dispose();
      await autosaveController.dispose();
    },
  });

  return validationAwareState.getSnapshot();
};

const initializeAuthenticatedStudio = async (bootstrap) => {
  if (
    !bootstrap?.document
    || typeof bootstrap.currentMainSha !== "string"
    || bootstrap.currentMainSha.length === 0
  ) {
    throw new TypeError(
      "Authenticated Studio bootstrap is invalid.",
    );
  }

  productionPublishingEnabled =
    bootstrap.productionPublishingEnabled === true;
  await initializeDraftFoundation(bootstrap);
  publishController?.setAvailability(productionPublishingEnabled);
  shell.setAuthState({
    authenticated: true,
    loading: false,
    message: "",
  });
};

const formatAuthError = (error) => {
  const message =
    error instanceof Error
      ? error.message
      : "Unable to authenticate.";

  if (Number.isFinite(error?.retryAfterSeconds)) {
    return `${message} Try again in ${error.retryAfterSeconds} seconds.`;
  }

  return message;
};

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const password = passwordInput.value;

  shell.setAuthState({
    authenticated: false,
    loading: true,
    message: "Verifying secure access…",
  });

  try {
    const result = await authController.login(password);
    passwordInput.value = "";
    await initializeAuthenticatedStudio(result.bootstrap);
  } catch (error) {
    passwordInput.value = "";
    authController.clearSession();
    console.error(error);
    shell.setAuthState({
      authenticated: false,
      loading: false,
      message: formatAuthError(error),
    });
  }
});

shell.setDraftState({
  persistenceStatus: STUDIO_DRAFT_STATUS.LOADING,
  isModified: false,
  lastSavedAt: null,
  staleDraft: false,
  errorMessage: "",
});

shell.setAuthState({
  authenticated: false,
  loading: true,
  message: "Checking secure session…",
});

const startStudio = async () => {
  const result = await authController.startup();

  if (!result.authenticated) {
    shell.setAuthState({
      authenticated: false,
      loading: false,
      message: "",
    });
    return;
  }

  await initializeAuthenticatedStudio(result.bootstrap);
};

startStudio().catch((error) => {
  authController.clearSession();
  console.error(error);
  shell.setAuthState({
    authenticated: false,
    loading: false,
    message: formatAuthError(error),
  });
});

window.__PARAGON_LIVE_PDF_STUDIO_AUTH__ = Object.freeze({
  version: 1,
  getSession: () => authController.getSession(),
  logout: () => authController.logout(),
});

window.__PARAGON_LIVE_PDF_STUDIO_SHELL__ = Object.freeze({
  version: 4,
  navigationSections: 8,
  primaryActions: 5,
  get productionPublishingEnabled() {
    return productionPublishingEnabled;
  },
  publicationBridge: "worker-validated",
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
