export const STUDIO_VISUAL_SECTION_IDS = Object.freeze(["logos", "cuts", "footer"]);
export const STUDIO_SECTION_STATUS = Object.freeze({
  COMPLETE: "Complete",
  MODIFIED: "Modified",
  MISSING: "Missing required field",
  ERROR: "Validation error",
});

export const STUDIO_DRAFT_STATUS = Object.freeze({
  LOADING: "loading",
  CLEAN: "clean",
  DIRTY: "dirty",
  SAVING: "saving",
  SAVED: "saved",
  ERROR: "error",
});

export const createInitialSectionStatuses = () => ({
  overview: STUDIO_SECTION_STATUS.COMPLETE,
  header: STUDIO_SECTION_STATUS.MISSING,
  cuts: STUDIO_SECTION_STATUS.MISSING,
  logos: STUDIO_SECTION_STATUS.MISSING,
  contacts: STUDIO_SECTION_STATUS.MISSING,
  footer: STUDIO_SECTION_STATUS.MISSING,
  assets: STUDIO_SECTION_STATUS.MODIFIED,
  review: STUDIO_SECTION_STATUS.ERROR,
});

export const getSectionStatusTone = (status) => {
  switch (status) {
    case STUDIO_SECTION_STATUS.COMPLETE:
      return "complete";
    case STUDIO_SECTION_STATUS.MODIFIED:
      return "modified";
    case STUDIO_SECTION_STATUS.MISSING:
      return "missing";
    case STUDIO_SECTION_STATUS.ERROR:
      return "error";
    default:
      return "neutral";
  }
};

export const summarizeSectionStatuses = (statuses) => {
  const values = Object.values(statuses);

  return Object.freeze({
    complete: values.filter(
      (value) => value === STUDIO_SECTION_STATUS.COMPLETE,
    ).length,
    modified: values.filter(
      (value) => value === STUDIO_SECTION_STATUS.MODIFIED,
    ).length,
    missing: values.filter(
      (value) => value === STUDIO_SECTION_STATUS.MISSING,
    ).length,
    error: values.filter(
      (value) => value === STUDIO_SECTION_STATUS.ERROR,
    ).length,
  });
};

export const getDraftStatusPresentation = ({
  persistenceStatus = STUDIO_DRAFT_STATUS.LOADING,
  isModified = false,
  lastSavedAt = null,
  staleDraft = false,
  errorMessage = "",
} = {}) => {
  if (staleDraft) {
    return {
      label: "Saved draft needs review",
      detail: "This local draft is based on an earlier live revision.",
      tone: "warning",
    };
  }

  const savedDetail = lastSavedAt
    ? `Saved locally ${new Date(lastSavedAt).toLocaleString()}`
    : "Saved in this browser.";

  switch (persistenceStatus) {
    case STUDIO_DRAFT_STATUS.CLEAN:
      return {
        label: "Live version loaded",
        detail: "No local changes.",
        tone: "neutral",
      };
    case STUDIO_DRAFT_STATUS.DIRTY:
      return {
        label: "Unsaved changes",
        detail: "Autosave is pending.",
        tone: "warning",
      };
    case STUDIO_DRAFT_STATUS.SAVING:
      return {
        label: "Saving draft",
        detail: "Writing changes to this browser.",
        tone: "neutral",
      };
    case STUDIO_DRAFT_STATUS.SAVED:
      return {
        label: isModified ? "Saved locally" : "Live version saved locally",
        detail: savedDetail,
        tone: "success",
      };
    case STUDIO_DRAFT_STATUS.ERROR:
      return {
        label: "Save failed",
        detail: errorMessage || "The in-memory draft is still available.",
        tone: "error",
      };
    default:
      return {
        label: "Loading draft",
        detail: "Preparing local draft storage.",
        tone: "neutral",
      };
  }
};

export const getAssetLibraryStatus = ({
  issueCount = 0,
  missingCount = 0,
  pendingUploadCount = 0,
  catalogModified = false,
} = {}) => {
  if (issueCount > 0) {
    return STUDIO_SECTION_STATUS.ERROR;
  }

  if (missingCount > 0) {
    return STUDIO_SECTION_STATUS.MISSING;
  }

  if (pendingUploadCount > 0 || catalogModified) {
    return STUDIO_SECTION_STATUS.MODIFIED;
  }

  return STUDIO_SECTION_STATUS.COMPLETE;
};


export const getReviewStatus = ({
  errorCount = 0,
  isModified = false,
} = {}) => {
  if (errorCount > 0) {
    return STUDIO_SECTION_STATUS.ERROR;
  }

  if (isModified) {
    return STUDIO_SECTION_STATUS.MODIFIED;
  }

  return STUDIO_SECTION_STATUS.COMPLETE;
};
