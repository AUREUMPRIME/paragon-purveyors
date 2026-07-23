const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const getValueAtPath = (source, path) =>
  path.reduce((value, segment) => value?.[segment], source);

const controlId = (key) =>
  `editor-${key.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`;

const inputType = (control) => {
  if (control === "email") return "email";
  if (control === "url") return "url";
  if (control === "number" || control === "integer") return "number";
  return "text";
};

const renderIssue = (field, issue) => `
  <p
    class="editor-field__error"
    id="${controlId(field.key)}-error"
    data-field-error-for="${escapeHtml(field.key)}"
    role="status"
  >${issue ? escapeHtml(issue.message) : ""}</p>
`;

const renderHelp = (field) =>
  field.help
    ? `
      <p class="editor-field__help" id="${controlId(field.key)}-help">
        ${escapeHtml(field.help)}
      </p>
    `
    : "";

const describedBy = (field) =>
  [
    field.help ? `${controlId(field.key)}-help` : "",
    `${controlId(field.key)}-error`,
  ].filter(Boolean).join(" ");

export const renderFieldControl = ({
  field,
  draft,
  issue = null,
}) => {
  const value = getValueAtPath(draft, field.path);
  const id = controlId(field.key);
  const state = issue?.kind || "valid";

  if (field.control === "checkbox") {
    return `
      <div
        class="editor-field editor-field--checkbox"
        data-editor-field-wrapper="${escapeHtml(field.key)}"
        data-field-state="${state}"
      >
        <label for="${id}">
          <input
            id="${id}"
            type="checkbox"
            data-editor-field="${escapeHtml(field.key)}"
            data-editor-type="checkbox"
            ${value ? "checked" : ""}
            aria-describedby="${id}-error"
            aria-invalid="${issue ? "true" : "false"}"
          >
          <span>${escapeHtml(field.label)}</span>
        </label>
        ${renderIssue(field, issue)}
      </div>
    `;
  }

  const normalizedValue =
    value === null || value === undefined ? "" : String(value);
  const numericAttributes =
    field.control === "number" || field.control === "integer"
      ? `
        ${field.min !== undefined ? `min="${field.min}"` : ""}
        ${field.step !== undefined ? `step="${field.step}"` : ""}
      `
      : "";

  const commonAttributes = `
    id="${id}"
    data-editor-field="${escapeHtml(field.key)}"
    data-editor-type="${escapeHtml(field.control)}"
    aria-describedby="${describedBy(field)}"
    aria-invalid="${issue ? "true" : "false"}"
    ${field.inputMode ? `inputmode="${escapeHtml(field.inputMode)}"` : ""}
    ${field.maxLength ? `maxlength="${field.maxLength}"` : ""}
  `;

  const control =
    field.control === "textarea"
      ? `
        <textarea ${commonAttributes}>${escapeHtml(normalizedValue)}</textarea>
      `
      : `
        <input
          ${commonAttributes}
          type="${inputType(field.control)}"
          value="${escapeHtml(normalizedValue)}"
          ${numericAttributes}
        >
      `;

  return `
    <div
      class="editor-field"
      data-editor-field-wrapper="${escapeHtml(field.key)}"
      data-field-state="${state}"
    >
      <div class="editor-field__label-row">
        <label for="${id}">${escapeHtml(field.label)}</label>
        ${
          field.control === "textarea" && field.maxLength
            ? `<span data-character-count="${escapeHtml(field.key)}">${normalizedValue.length}/${field.maxLength}</span>`
            : ""
        }
      </div>
      ${
        field.prefix
          ? `<div class="editor-field__affix"><span>${escapeHtml(field.prefix)}</span>${control}</div>`
          : control
      }
      ${renderHelp(field)}
      ${renderIssue(field, issue)}
    </div>
  `;
};

export const renderFieldGrid = ({
  fields,
  draft,
  fieldIssues = {},
  className = "",
}) => `
  <div class="editor-grid ${className}">
    ${fields.map((field) =>
      renderFieldControl({
        field,
        draft,
        issue: fieldIssues[field.key] || null,
      }),
    ).join("")}
  </div>
`;

export const renderReadOnlyField = ({ label, value }) => `
  <div class="editor-readonly">
    <span>${escapeHtml(label)}</span>
    <output>${escapeHtml(value)}</output>
  </div>
`;

export const renderEditorSectionSummary = ({
  sectionId,
  issueCount = 0,
  status = "Complete",
}) => `
  <div
    class="editor-section-summary"
    data-editor-section-summary="${escapeHtml(sectionId)}"
    data-section-status="${escapeHtml(status)}"
  >
    <span>${escapeHtml(status)}</span>
    <small>
      ${issueCount === 0
        ? "No content issues."
        : `${issueCount} ${issueCount === 1 ? "issue" : "issues"} to resolve.`}
    </small>
  </div>
`;

export const renderEditorWorkspace = ({
  sectionId,
  eyebrow,
  title,
  copy,
  body,
  issueCount = 0,
  status = "Complete",
}) => `
  <section
    class="studio-workspace studio-workspace--editor"
    data-workspace="${escapeHtml(sectionId)}"
    data-editor-workspace="${escapeHtml(sectionId)}"
  >
    <header class="workspace-header">
      <div>
        <p class="workspace-eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(copy)}</p>
      </div>
      ${renderEditorSectionSummary({
        sectionId,
        issueCount,
        status,
      })}
    </header>
    ${body}
  </section>
`;
