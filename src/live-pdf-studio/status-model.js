export const STUDIO_SECTION_STATUS = Object.freeze({
  COMPLETE: "Complete",
  MODIFIED: "Modified",
  MISSING: "Missing required field",
  ERROR: "Validation error",
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
