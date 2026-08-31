import { inspectReviewFrameGeometry } from "./review-geometry.js";
import {
  createReviewValidation,
  inspectReviewFrameImages,
} from "./review-validation.js";

const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1344;
const SAFE_ZONE = 64;
const REFRESH_DELAY = 120;
const FRAME_LOAD_TIMEOUT = 5000;

export const REVIEW_FIT_MODE = Object.freeze({
  PAGE: "page",
  WIDTH: "width",

});

export const calculateReviewScale = ({
  mode = REVIEW_FIT_MODE.PAGE,
  availableWidth,
  availableHeight,
}) => {
  const widthScale =
    Math.max(0.01, Number(availableWidth) / PAGE_WIDTH);
  const heightScale =
    Math.max(0.01, Number(availableHeight) / PAGE_HEIGHT);



  if (mode === REVIEW_FIT_MODE.WIDTH) {
    return Math.min(widthScale, 1);
  }

  return Math.min(widthScale, heightScale, 1);
};
const fitReviewPage = (
  dialog,
  mode = REVIEW_FIT_MODE.PAGE,
) => {
  const viewport = dialog.querySelector("[data-review-viewport]");
  const stage = dialog.querySelector("[data-review-stage]");
  const scaleOutput = dialog.querySelector("[data-review-scale]");

  if (!viewport || !stage || !scaleOutput) return;

  const availableWidth =
    Math.max(1, viewport.clientWidth - SAFE_ZONE);
  const availableHeight =
    Math.max(1, viewport.clientHeight - SAFE_ZONE);
  const scale = calculateReviewScale({
    mode,
    availableWidth,
    availableHeight,
  });

  viewport.dataset.reviewFitMode = mode;
  stage.style.setProperty("--review-scale", String(scale));
  scaleOutput.textContent = `${Math.round(scale * 100)}%`;
};

const waitForFrameLoad = ({
  frame,
  html,
  timeoutMs = FRAME_LOAD_TIMEOUT,
  setTimeoutImpl = globalThis.setTimeout,
  clearTimeoutImpl = globalThis.clearTimeout,
}) =>
  new Promise((resolve, reject) => {
    let settled = false;

    const settle = (error = null) => {
      if (settled) return;
      settled = true;
      clearTimeoutImpl(timeoutId);
      frame.removeEventListener("load", handleLoad);

      if (error) reject(error);
      else resolve();
    };

    const handleLoad = () => settle();
    const timeoutId = setTimeoutImpl(() => {
      if (frame.contentDocument?.readyState === "complete") {
        settle();
        return;
      }

      settle(new Error("Review frame did not finish loading."));
    }, timeoutMs);

    frame.addEventListener("load", handleLoad, { once: true });
    frame.srcdoc = html;
  });

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const createIssueNode = (dialog, issue) => {
  const item = dialog.ownerDocument.createElement("li");
  item.dataset.issueKind = issue.kind;

  const kind = dialog.ownerDocument.createElement("span");
  kind.textContent = issue.kind === "warning" ? "Warning" : "Error";

  const message = dialog.ownerDocument.createElement("p");
  message.textContent = issue.message;

  item.append(kind, message);
  return item;
};

const setReviewPresentation = (dialog, validation, state = "ready") => {
  const summary = dialog.querySelector("[data-review-summary]");
  const detail = dialog.querySelector("[data-review-detail]");
  const errorCount = dialog.querySelector("[data-review-errors]");
  const warningCount = dialog.querySelector("[data-review-warnings]");
  const issues = dialog.querySelector("[data-review-issues]");
  const validationPanel = dialog.querySelector(
    "[data-review-validation]",
  );

  if (
    !summary ||
    !detail ||
    !errorCount ||
    !warningCount ||
    !issues ||
    !validationPanel
  ) {
    return;
  }

  if (state === "rendering") {
    summary.textContent = "Rendering the current draft…";
    detail.textContent =
      "Preparing the Monthly Specials preview.";
    errorCount.textContent = "--";
    warningCount.textContent = "--";
    issues.replaceChildren();
    validationPanel.dataset.reviewState = "rendering";
    return;
  }

  const hasErrors = validation.errorCount > 0;
  summary.textContent = hasErrors
    ? "Review needs attention."
    : "Current draft preview is ready.";
  detail.textContent = hasErrors
    ? "Resolve every error before publishing."
    : "The current draft rendered successfully. Review the page before publishing.";
  errorCount.textContent = String(validation.errorCount);
  warningCount.textContent = String(validation.warningCount);
  issues.replaceChildren(
    ...validation.issues.map((issue) =>
      createIssueNode(dialog, issue),
    ),
  );
  validationPanel.dataset.reviewState = hasErrors ? "error" : "ready";
};

const errorDocument = (error) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    html, body { margin: 0; width: 100%; min-height: 100%; background: #11100e; color: #f6efe5; font-family: Arial, sans-serif; }
    main { box-sizing: border-box; min-height: 1344px; display: grid; place-items: center; padding: 64px; text-align: center; }
    p { max-width: 620px; line-height: 1.6; color: #c8beb0; }
  </style>
</head>
<body>
  <main>
    <div>
      <h1>Review preview unavailable</h1>
      <p>The preview could not be prepared. Return to the editor and try again.</p>
    </div>
  </main>
</body>
</html>`;

export const createReviewDialogController = (
  dialog,
  {
    createPreview,
    getEditorValidation,
    getDraftFingerprint,
    getPublishingEnabled = () => false,
    onValidationChange = () => {},
    inspectImages = inspectReviewFrameImages,
    inspectGeometry = inspectReviewFrameGeometry,
    createValidation = createReviewValidation,
  } = {},
) => {
  if (
    !dialog ||
    typeof createPreview !== "function" ||
    typeof getEditorValidation !== "function" ||
    typeof getDraftFingerprint !== "function"
  ) {
    throw new TypeError(
      "Review dialog requires its dialog, preview, validation, and draft fingerprint dependencies.",
    );
  }

  const frame = dialog.querySelector("[data-review-frame]");
  const fitControl = dialog.querySelector("[data-review-fit-mode]");

  if (!frame) {
    throw new TypeError("Review dialog frame is missing.");
  }

  if (!fitControl) {
    throw new TypeError("Review dialog fit control is missing.");
  }

  let fitMode = fitControl.value || REVIEW_FIT_MODE.PAGE;
  let refreshToken = 0;
  let refreshTimer = null;
  let currentValidation = null;

  const handleResize = () => {
    if (dialog.open) fitReviewPage(dialog, fitMode);
  };

  const handleFitChange = () => {
    fitMode = fitControl.value || REVIEW_FIT_MODE.PAGE;
    fitReviewPage(dialog, fitMode);
  };

  fitControl.addEventListener("change", handleFitChange);

  const refresh = async () => {
    if (!dialog.open) return currentValidation;

    const token = ++refreshToken;
    const draftFingerprint = getDraftFingerprint();
    setReviewPresentation(dialog, null, "rendering");

    let preview = null;
    let imageResults = [];
    let geometryResults = null;
    let renderError = null;

    try {
      preview = await createPreview();
      await waitForFrameLoad({ frame, html: preview.html });
      imageResults = await inspectImages({ frame });

      if (imageResults.every((result) => result.ready)) {
        geometryResults = inspectGeometry({ frame });
      }
    } catch (error) {
      renderError = error instanceof Error ? error : new Error(String(error));
      frame.srcdoc = errorDocument(renderError);
    }

    if (token !== refreshToken) return currentValidation;

    currentValidation = createValidation({
      editorValidation: getEditorValidation(),
      renderError,
      imageResults,
      geometryResults,
      draftFingerprint:
        preview?.draftFingerprint || draftFingerprint,
      publishingEnabled: getPublishingEnabled() === true,
    });

    setReviewPresentation(dialog, currentValidation);
    onValidationChange(currentValidation);
    requestAnimationFrame(() => fitReviewPage(dialog, fitMode));
    return currentValidation;
  };

  const scheduleRefresh = () => {
    if (!dialog.open) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      void refresh();
    }, REFRESH_DELAY);
  };

  const open = async () => {
    if (!dialog.open) dialog.showModal();
    window.addEventListener("resize", handleResize);
    requestAnimationFrame(() => fitReviewPage(dialog, fitMode));
    return refresh();
  };

  const close = () => {
    clearTimeout(refreshTimer);
    refreshTimer = null;
    refreshToken += 1;
    window.removeEventListener("resize", handleResize);
    if (dialog.open) dialog.close();
  };

  dialog.addEventListener("click", (event) => {
    if (event.target.matches("[data-review-close]")) close();
    if (event.target === dialog) close();
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  dialog.addEventListener("close", () => {
    window.removeEventListener("resize", handleResize);
  });

  return Object.freeze({
    open,
    close,
    refresh,
    scheduleRefresh,
    fit: () => fitReviewPage(dialog, fitMode),
    isOpen: () => dialog.open,
    getValidation: () => currentValidation,
    dispose() {
      fitControl.removeEventListener("change", handleFitChange);
      close();
      currentValidation = null;
    },
  });
};
