import {
  renderEditorWorkspace,
  renderFieldGrid,
  renderReadOnlyField,
} from "./editor-controls.js";
import { renderVisualReferenceEditor } from "./visual-controls.js";

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
          Edit product details and adjust the assigned images below.
        </p>
        ${renderFieldGrid({
          fields,
          draft,
          fieldIssues: validation.fieldIssues,
          className: "editor-grid--cut",
        })}
        ${renderVisualReferenceEditor({ draft, reference: special.primaryOffer.image, prefix: `${prefix}.primaryOffer.image`, label: "Primary image", fields: registry.bySection.cuts.filter((field) => field.visual && field.key.startsWith(`${prefix}.primaryOffer.image`)), fieldIssues: validation.fieldIssues })}
        ${special.offerMode === "dual-offer" ? renderVisualReferenceEditor({ draft, reference: special.secondaryOffer.image, prefix: `${prefix}.secondaryOffer.image`, label: "Secondary image", fields: registry.bySection.cuts.filter((field) => field.visual && field.key.startsWith(`${prefix}.secondaryOffer.image`)), fieldIssues: validation.fieldIssues }) : ""}
      </fieldset>
    `;
  }).join("");

  return renderEditorWorkspace({
    sectionId: "cuts",
    eyebrow: "Product Content",
    title: "Featured Cuts",
    copy:
      "Edit product names, display order, pricing, availability, offers, savings, descriptions, and images.",
    body: `<div class="editor-stack">${cards}</div>`,
    issueCount: validation.issueCounts.cuts,
    status: validation.statuses.cuts,
  });
};
