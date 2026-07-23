import {
  renderEditorWorkspace,
  renderFieldGrid,
  renderReadOnlyField,
} from "./editor-controls.js";

export const renderCutsEditor = ({
  draft,
  registry,
  validation,
}) => {
  const cards = draft.specials.map((special, index) => {
    const prefix = `specials[${index}]`;
    const fields = registry.bySection.cuts.filter((field) =>
      field.key.startsWith(prefix),
    );

    return `
      <fieldset
        class="editor-panel editor-panel--cut"
        data-cut-editor="${special.id}"
      >
        <legend>${special.displayName || special.id}</legend>
        <div class="editor-readonly-grid">
          ${renderReadOnlyField({
            label: "Stable ID",
            value: special.id,
          })}
          ${renderReadOnlyField({
            label: "Offer mode",
            value: special.offerMode,
          })}
        </div>
        <p class="editor-panel__copy">
          Product images, logo assignment, crop, zoom, and focus remain
          protected until the visual-control checkpoint.
        </p>
        ${renderFieldGrid({
          fields,
          draft,
          fieldIssues: validation.fieldIssues,
          className: "editor-grid--cut",
        })}
      </fieldset>
    `;
  }).join("");

  return renderEditorWorkspace({
    sectionId: "cuts",
    eyebrow: "Product Content",
    title: "Featured Cuts",
    copy:
      "Edit the four launch-profile cuts, display order, offer text, pricing, availability, savings, and descriptions.",
    body: `<div class="editor-stack">${cards}</div>`,
    issueCount: validation.issueCounts.cuts,
    status: validation.statuses.cuts,
  });
};
