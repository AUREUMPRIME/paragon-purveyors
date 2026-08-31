export const SECURE_PUBLISHING_WARNING = Object.freeze({
  section: "review",
  fieldKey: "review.securePublishing",
  kind: "warning",
  message:
    "Publishing is currently disabled for this Studio session.",
});

const normalizeMessage = (value, fallback) => {
  const message = String(value ?? "").trim();
  return message || fallback;
};

const normalizeEditorIssue = (issue, index) =>
  Object.freeze({
    section: issue.section || "review",
    fieldKey: issue.fieldKey || `review.editor.${index}`,
    kind: issue.kind === "warning" ? "warning" : "error",
    message: normalizeMessage(
      issue.message,
      "The current draft contains a validation issue.",
    ),
  });

const uniqueIssues = (issues) => {
  const seen = new Set();

  return issues.filter((issue) => {
    const key = `${issue.kind}|${issue.fieldKey}|${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const imageIssue = (result, index) =>
  Object.freeze({
    section: "review",
    fieldKey: `review.image.${index}`,
    kind: "error",
    message: `${normalizeMessage(
      result.alt,
      `Preview image ${index + 1}`,
    )} could not be loaded in the Review PDF.`,
  });

const geometryIssue = (issue, index) =>
  Object.freeze({
    section: "review",
    fieldKey: issue.fieldKey || `review.geometry.${index}`,
    kind: "error",
    message: normalizeMessage(
      issue.message,
      "A layout check could not be completed.",
    ),
  });

export const createReviewValidation = ({
  editorValidation = null,
  renderError = null,
  imageResults = [],
  geometryResults = null,
  draftFingerprint = "",
  publishingEnabled = false,
} = {}) => {
  const editorIssues = (editorValidation?.issues || []).map(
    normalizeEditorIssue,
  );
  const editorErrors = editorIssues.filter(
    (issue) => issue.kind === "error",
  );
  const editorWarnings = editorIssues.filter(
    (issue) => issue.kind === "warning",
  );
  const renderIssues = renderError
    ? [
        Object.freeze({
          section: "review",
          fieldKey: "review.renderer",
          kind: "error",
          message:
            "The Review PDF could not be prepared. Return to the editor and try again.",
        }),
      ]
    : [];
  const imageIssues = imageResults
    .filter((result) => !result.ready)
    .map(imageIssue);
  const geometryIssues = (geometryResults?.issues || []).map(
    geometryIssue,
  );
  const errors = Object.freeze(
    uniqueIssues([
      ...editorErrors,
      ...renderIssues,
      ...imageIssues,
      ...geometryIssues,
    ]),
  );
  const warnings = Object.freeze(
    uniqueIssues([
      ...editorWarnings,
      ...(publishingEnabled ? [] : [SECURE_PUBLISHING_WARNING]),
    ]),
  );
  const issues = Object.freeze([...errors, ...warnings]);

  return Object.freeze({
    draftFingerprint,
    issues,
    errors,
    warnings,
    errorCount: errors.length,
    warningCount: warnings.length,
    imageCount: imageResults.length,
    readyImageCount: imageResults.filter((result) => result.ready).length,
    geometryChecked: Boolean(geometryResults),
    geometryErrorCount: geometryIssues.length,
    geometryCheckedCount: geometryResults?.checkedCount || 0,
    pageWidth: geometryResults?.pageWidth || 0,
    pageHeight: geometryResults?.pageHeight || 0,
    isValid: errors.length === 0,
    rendered: !renderError,
  });
};

const inspectImage = (image, index) => ({
  index,
  src: image.currentSrc || image.src || "",
  alt: image.alt || "",
  ready: Boolean(image.complete && image.naturalWidth > 0),
});

const waitForImage = ({
  image,
  index,
  timeoutMs,
  setTimeoutImpl,
  clearTimeoutImpl,
}) =>
  new Promise((resolve) => {
    if (image.complete) {
      resolve(inspectImage(image, index));
      return;
    }

    let settled = false;

    const settle = () => {
      if (settled) return;
      settled = true;
      clearTimeoutImpl(timeoutId);
      image.removeEventListener?.("load", settle);
      image.removeEventListener?.("error", settle);
      resolve(inspectImage(image, index));
    };

    const timeoutId = setTimeoutImpl(settle, timeoutMs);
    image.addEventListener?.("load", settle, { once: true });
    image.addEventListener?.("error", settle, { once: true });
  });

export const inspectReviewFrameImages = async ({
  frame,
  timeoutMs = 5000,
  setTimeoutImpl = globalThis.setTimeout,
  clearTimeoutImpl = globalThis.clearTimeout,
} = {}) => {
  const reviewDocument = frame?.contentDocument;

  if (!reviewDocument) {
    return [
      Object.freeze({
        index: 0,
        src: "",
        alt: "Review document",
        ready: false,
      }),
    ];
  }

  const images = [...reviewDocument.querySelectorAll("img")];

  return Promise.all(
    images.map((image, index) =>
      waitForImage({
        image,
        index,
        timeoutMs,
        setTimeoutImpl,
        clearTimeoutImpl,
      }),
    ),
  );
};
