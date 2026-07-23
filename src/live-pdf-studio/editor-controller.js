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
} = {}) => {
  if (!root || !shell || !state) {
    throw new TypeError(
      "Editor controller requires root, shell, and Studio state.",
    );
  }

  let activeSection = "overview";
  let registry = createCompleteEditorRegistry(state.getDraft());
  let validation = null;
  const transientErrors = new Map();

  const computeValidation = () => {
    registry = createCompleteEditorRegistry(state.getDraft());
    validation = validateCompleteStudioDraft({
      draft: state.getDraft(),
      liveDocument: state.getLiveBaseline(),
      transientErrors: normalizeTransientErrors(transientErrors),
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
  };

  let dragState = null;
  const getVisualFields = (prefix) => ({
    focusX: registry.byKey.get(`${prefix}.focusX`),
    focusY: registry.byKey.get(`${prefix}.focusY`),
    zoom: registry.byKey.get(`${prefix}.zoom`),
  });
  const updateFocusFromPointer = (stage, event) => {
    const fields = getVisualFields(stage.dataset.visualStage);
    if (!fields.focusX || !fields.focusY) return;
    const rect = stage.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    state.setValue(fields.focusX.path, Math.round(x));
    state.setValue(fields.focusY.path, Math.round(y));
    renderActiveSection();
  };
  const handlePointerDown = (event) => {
    const stage = event.target.closest("[data-visual-stage]");
    if (!stage) return;
    dragState = stage;
    stage.setPointerCapture?.(event.pointerId);
    updateFocusFromPointer(stage, event);
  };
  const handlePointerMove = (event) => { if (dragState) updateFocusFromPointer(dragState, event); };
  const handlePointerUp = () => { dragState = null; };
  const handleWheel = (event) => {
    const stage = event.target.closest("[data-visual-stage]");
    if (!stage) return;
    const field = getVisualFields(stage.dataset.visualStage).zoom;
    if (!field) return;
    event.preventDefault();
    const current = field.path.reduce((value, segment) => value?.[segment], state.getDraft());
    const next = Math.max(1, Math.min(2.5, Number((current + (event.deltaY < 0 ? 0.05 : -0.05)).toFixed(2))));
    state.setValue(field.path, next);
    renderActiveSection();
  };

  root.addEventListener("pointerdown", handlePointerDown);
  root.addEventListener("pointermove", handlePointerMove);
  root.addEventListener("pointerup", handlePointerUp);
  root.addEventListener("pointercancel", handlePointerUp);
  root.addEventListener("wheel", handleWheel, { passive: false });
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
    getValidationResults: () =>
      computeValidation().issues.map((issue) => ({ ...issue })),
    getSectionStatuses: () => ({
      ...computeValidation().statuses,
    }),
    dispose() {
      root.removeEventListener("pointerdown", handlePointerDown);
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerup", handlePointerUp);
      root.removeEventListener("pointercancel", handlePointerUp);
      root.removeEventListener("wheel", handleWheel);
      root.removeEventListener("input", handleEditorEvent);
      root.removeEventListener("change", handleEditorEvent);
    },
  };
};
