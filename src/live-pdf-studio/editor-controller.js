import { renderContactsEditor } from "./contacts-editor.js";
import { renderCutsEditor } from "./cuts-editor.js";
import { renderFooterEditor } from "./footer-editor.js";
import { renderLogosEditor } from "./logos-editor.js";
import { renderVisualFieldControl } from "./visual-controls.js";
import {
  createCompleteEditorRegistry,
  COMPLETE_EDITOR_SECTION_IDS,
} from "./editor-field-registry.js";
import { validateCompleteStudioDraft } from "./editor-validation.js";
import { fingerprintDocument } from "./state.js";
import { renderHeaderEditor } from "./header-editor.js";

const editorRenderers = Object.freeze({
  header: renderHeaderEditor,
  cuts: renderCutsEditor,
  logos: renderLogosEditor,
  contacts: renderContactsEditor,
  footer: renderFooterEditor,
});

const normalizeTransientErrors = (errors) =>
  Object.fromEntries(errors.entries());

export const parseEditorInputValue = ({
  field,
  element,
}) => {
  if (field.control === "checkbox") {
    return {
      accepted: true,
      value: element.checked,
      error: "",
    };
  }

  const rawValue = element.value;

  if (["number", "integer", "range"].includes(field.control)) {
    if (rawValue.trim() === "") {
      return {
        accepted: true,
        value: null,
        error: "",
      };
    }

    const numericValue = Number(rawValue);

    if (!Number.isFinite(numericValue)) {
      return {
        accepted: false,
        value: null,
        error: `${field.label} must be a valid number.`,
      };
    }

    if (
      field.control === "integer" &&
      !Number.isInteger(numericValue)
    ) {
      return {
        accepted: false,
        value: null,
        error: `${field.label} must be a whole number.`,
      };
    }

    return {
      accepted: true,
      value: numericValue,
      error: "",
    };
  }

  return {
    accepted: true,
    value: rawValue,
    error: "",
  };
};

export const createEditorController = ({
  root,
  shell,
  state,
  assetPreviewResolver = null,
} = {}) => {
  if (!root || !shell || !state) {
    throw new TypeError(
      "Editor controller requires root, shell, and Studio state.",
    );
  }

  let activeSection = "overview";
  let registry = createCompleteEditorRegistry(state.getDraft());
  let validation = null;
  let reviewValidation = null;
  const transientErrors = new Map();

  const computeValidation = ({ includeReview = true } = {}) => {
    const draft = state.getDraft();
    const draftFingerprint = fingerprintDocument(draft);
    const currentReviewValidation =
      includeReview &&
      reviewValidation?.draftFingerprint === draftFingerprint
        ? reviewValidation
        : null;

    registry = createCompleteEditorRegistry(draft);
    validation = validateCompleteStudioDraft({
      draft,
      liveDocument: state.getLiveBaseline(),
      transientErrors: normalizeTransientErrors(transientErrors),
      reviewValidation: currentReviewValidation,
    });

    return validation;
  };

  const updateVisibleValidation = () => {
    const current = computeValidation();
    shell.setSectionStatuses(current.statuses);

    root
      .querySelectorAll("[data-editor-field-wrapper]")
      .forEach((wrapper) => {
        const key = wrapper.dataset.editorFieldWrapper;
        const issue = current.fieldIssues[key] || null;
        wrapper.dataset.fieldState = issue?.kind || "valid";

        const input = wrapper.querySelector("[data-editor-field]");
        if (input) {
          input.setAttribute(
            "aria-invalid",
            issue ? "true" : "false",
          );
        }

        const error = wrapper.querySelector(
          `[data-field-error-for="${CSS.escape(key)}"]`,
        );

        if (error) {
          error.textContent = issue?.message || "";
        }
      });

    const summary = root.querySelector(
      `[data-editor-section-summary="${activeSection}"]`,
    );

    if (summary && COMPLETE_EDITOR_SECTION_IDS.includes(activeSection)) {
      const issueCount = current.issueCounts[activeSection];
      const status = current.statuses[activeSection];
      summary.dataset.sectionStatus = status;
      summary.querySelector("span").textContent = status;
      summary.querySelector("small").textContent =
        issueCount === 0
          ? "No content issues."
          : `${issueCount} ${issueCount === 1 ? "issue" : "issues"} to resolve.`;
    }

    return current;
  };

  const renderActiveSection = () => {
    if (!COMPLETE_EDITOR_SECTION_IDS.includes(activeSection)) {
      shell.renderWorkspace(activeSection);
      return;
    }

    const current = computeValidation();
    const renderer = editorRenderers[activeSection];

    shell.renderWorkspace(
      activeSection,
      renderer({
        draft: state.getDraft(),
        registry,
        validation: {
          ...current,
          renderField: (field) => renderVisualFieldControl({ field, draft: state.getDraft(), issue: current.fieldIssues[field.key] || null }),
        },
      }),
    );

    assetPreviewResolver?.apply(root, state.getDraft());
    updateVisibleValidation();
  };

  const updateCharacterCount = (element, field) => {
    if (field.control !== "textarea" || !field.maxLength) return;

    const count = root.querySelector(
      `[data-character-count="${CSS.escape(field.key)}"]`,
    );

    if (count) {
      count.textContent = `${element.value.length}/${field.maxLength}`;
    }
  };

  const handleEditorEvent = (event) => {
    const element = event.target.closest("[data-editor-field]");
    if (!element || !root.contains(element)) return;

    const field = registry.byKey.get(element.dataset.editorField);
    if (!field) return;

    if (
      field.control === "checkbox" &&
      event.type !== "change"
    ) {
      return;
    }

    if (
      field.control !== "checkbox" &&
      event.type !== "input"
    ) {
      return;
    }

    updateCharacterCount(element, field);

    const parsed = parseEditorInputValue({
      field,
      element,
    });

    if (!parsed.accepted) {
      transientErrors.set(field.key, parsed.error);
      updateVisibleValidation();
      return;
    }

    transientErrors.delete(field.key);
    state.setValue(field.path, parsed.value);
    syncVisualControlPresentation({
      element,
      field,
      value: parsed.value,
    });
  };

  const visualPreviewProperties = new Set([
    "visible",
    "fit",
    "zoom",
    "focusX",
    "focusY",
    "opacity",
    "saturation",
    "contrast",
    "brightness",
  ]);

  const getVisualPreviewContext = (field) => {
    if (
      !field ||
      !Array.isArray(field.path) ||
      field.path.length < 2 ||
      typeof field.key !== "string"
    ) {
      return null;
    }

    const property = field.path.at(-1);

    if (!visualPreviewProperties.has(property)) {
      return null;
    }

    const separator = field.key.lastIndexOf(".");

    if (separator < 1) {
      return null;
    }

    const prefix = field.key.slice(0, separator);

    const stage = Array.from(
      root.querySelectorAll("[data-visual-stage]"),
    ).find(
      (candidate) =>
        candidate.dataset.visualStage === prefix,
    );

    if (!stage) {
      return null;
    }

    const reference = field.path
      .slice(0, -1)
      .reduce(
        (value, segment) => value?.[segment],
        state.getDraft(),
      );

    return {
      image: stage.querySelector("img"),
      reference,
      stage,
    };
  };

  const syncVisualPreview = (field) => {
    const context = getVisualPreviewContext(field);

    if (!context?.image || !context.reference) {
      return;
    }

    const { image, reference, stage } = context;

    const outputVisibility = stage
      .closest("[data-visual-editor]")
      ?.querySelector("[data-visual-output-visibility]");

    if (outputVisibility) {
      const includedInPdf = reference.visible !== false;
      outputVisibility.dataset.outputVisible =
        String(includedInPdf);
      outputVisibility.textContent =
        includedInPdf
          ? "Included in PDF"
          : "Hidden in PDF";
    }

    if (typeof reference.fit === "string") {
      image.style.objectFit = reference.fit;
    }

    if (
      Number.isFinite(reference.focusX) &&
      Number.isFinite(reference.focusY)
    ) {
      image.style.objectPosition =
        `${reference.focusX}% ${reference.focusY}%`;
      image.style.transformOrigin =
        `${reference.focusX}% ${reference.focusY}%`;
    }

    if (Number.isFinite(reference.zoom)) {
      image.style.transform =
        `scale(${reference.zoom})`;
    }

    if (Number.isFinite(reference.opacity)) {
      image.style.opacity = String(reference.opacity);
    } else {
      image.style.removeProperty("opacity");
    }

    const filters = [];

    if (Number.isFinite(reference.saturation)) {
      filters.push(`saturate(${reference.saturation})`);
    }

    if (Number.isFinite(reference.contrast)) {
      filters.push(`contrast(${reference.contrast})`);
    }

    if (Number.isFinite(reference.brightness)) {
      filters.push(`brightness(${reference.brightness})`);
    }

    if (filters.length > 0) {
      image.style.filter = filters.join(" ");
    } else {
      image.style.removeProperty("filter");
    }
  };

  const syncVisualControlPresentation = ({
    element,
    field,
    value,
  }) => {
    if (field.control === "range") {
      const output = element
        .closest("[data-editor-field-wrapper]")
        ?.querySelector("output");

      if (output) {
        output.textContent = String(value ?? "");
      }
    }

    syncVisualPreview(field);
  };


  root.addEventListener("input", handleEditorEvent);
  root.addEventListener("change", handleEditorEvent);

  computeValidation();
  shell.setSectionStatuses(validation.statuses);

  return {
    navigate(sectionId) {
      activeSection = sectionId;
      renderActiveSection();
    },
    handleSnapshot() {
      updateVisibleValidation();
    },
    refresh() {
      transientErrors.clear();
      renderActiveSection();
    },
    getActiveSection: () => activeSection,
    getRegistry: () => registry.content,
    getVisualRegistry: () => registry.visual,
    getCompleteRegistry: () => registry,
    getValidation: () => computeValidation(),
    getReviewInputValidation: () =>
      computeValidation({ includeReview: false }),
    setReviewValidation(nextValidation) {
      reviewValidation = nextValidation || null;
      updateVisibleValidation();
    },
    getReviewValidation: () => reviewValidation,
    getValidationResults: () =>
      computeValidation().issues.map((issue) => ({ ...issue })),
    getSectionStatuses: () => ({
      ...computeValidation().statuses,
    }),
    dispose() {


      root.removeEventListener("input", handleEditorEvent);
      root.removeEventListener("change", handleEditorEvent);
    },
  };
};
