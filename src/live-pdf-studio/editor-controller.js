import { renderContactsEditor } from "./contacts-editor.js";
import { renderCutsEditor } from "./cuts-editor.js";
import { renderFooterEditor } from "./footer-editor.js";
import {
  createEditorFieldRegistry,
  EDITOR_SECTION_IDS,
} from "./editor-field-registry.js";
import { validateStudioDraft } from "./editor-validation.js";
import { renderHeaderEditor } from "./header-editor.js";

const editorRenderers = Object.freeze({
  header: renderHeaderEditor,
  cuts: renderCutsEditor,
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

  if (field.control === "number" || field.control === "integer") {
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
  let registry = createEditorFieldRegistry(state.getDraft());
  let validation = null;
  const transientErrors = new Map();

  const computeValidation = () => {
    registry = createEditorFieldRegistry(state.getDraft());
    validation = validateStudioDraft({
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

    if (summary && EDITOR_SECTION_IDS.includes(activeSection)) {
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
    if (!EDITOR_SECTION_IDS.includes(activeSection)) {
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
        validation: current,
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
    getRegistry: () => registry,
    getValidation: () => computeValidation(),
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
