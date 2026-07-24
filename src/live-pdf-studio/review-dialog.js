import {
  createReviewValidation,
  inspectReviewFrameImages,
} from "./review-validation.js";

const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1344;
const SAFE_ZONE = 64;
const REFRESH_DELAY = 120;
const FRAME_LOAD_TIMEOUT = 5000;

const fitReviewPage = (dialog) => {
  const viewport = dialog.querySelector("[data-review-viewport]");
  const stage = dialog.querySelector("[data-review-stage]");
  const scaleOutput = dialog.querySelector("[data-review-scale]");

  if (!viewport || !stage || !scaleOutput) return;

  const availableWidth = Math.max(1, viewport.clientWidth - SAFE_ZONE);
  const availableHeight = Math.max(1, viewport.clientHeight - SAFE_ZONE);
  const scale = Math.min(
    availableWidth / PAGE_WIDTH,
    availableHeight / PAGE_HEIGHT,
    1,
  );

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
      "The shared Monthly Specials renderer is preparing the Legal page.";
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
    ? "Resolve every error before the future secured publishing workflow can be enabled."
    : "The complete current draft rendered successfully. Secure publishing remains intentionally disabled.";
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
      <p>${escapeHtml(error?.message || error || "Unknown renderer failure.")}</p>
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
    onValidationChange = () => {},
    inspectImages = inspectReviewFrameImages,
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

  if (!frame) {
    throw new TypeError("Review dialog frame is missing.");
  }

  let refreshToken = 0;
  let refreshTimer = null;
  let currentValidation = null;

  const handleResize = () => {
    if (dialog.open) fitReviewPage(dialog);
  };

  const refresh = async () => {
    if (!dialog.open) return currentValidation;

    const token = ++refreshToken;
    const draftFingerprint = getDraftFingerprint();
    setReviewPresentation(dialog, null, "rendering");

    let preview = null;
    let imageResults = [];
    let renderError = null;

    try {
      preview = await createPreview();
      await waitForFrameLoad({ frame, html: preview.html });
      imageResults = await inspectImages({ frame });
    } catch (error) {
      renderError = error instanceof Error ? error : new Error(String(error));
      frame.srcdoc = errorDocument(renderError);
    }

    if (token !== refreshToken) return currentValidation;

    currentValidation = createValidation({
      editorValidation: getEditorValidation(),
      renderError,
      imageResults,
      draftFingerprint:
        preview?.draftFingerprint || draftFingerprint,
    });

    setReviewPresentation(dialog, currentValidation);
    onValidationChange(currentValidation);
    requestAnimationFrame(() => fitReviewPage(dialog));
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
    requestAnimationFrame(() => fitReviewPage(dialog));
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
    fit: () => fitReviewPage(dialog),
    isOpen: () => dialog.open,
    getValidation: () => currentValidation,
    dispose() {
      close();
      currentValidation = null;
    },
  });
};
