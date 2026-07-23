import {
  renderEditorWorkspace,
  renderFieldGrid,
} from "./editor-controls.js";
import { renderVisualReferenceEditor } from "./visual-controls.js";

export const renderFooterEditor = ({
  draft,
  registry,
  validation,
}) => {
  const body = `
    <div class="editor-stack">
      <fieldset class="editor-panel">
        <legend>Closing Content</legend>
        <p class="editor-panel__copy">
          Edit the closing message, disclaimer, destination label, and secure
          website URL. Art-direct the assigned footer B-roll below. Asset replacement remains in Phase 3.5.
        </p>
        ${renderFieldGrid({
          fields: registry.bySection.footer,
          draft,
          fieldIssues: validation.fieldIssues,
        })}
      </fieldset>
      ${renderVisualReferenceEditor({ draft, reference: draft.footer.broll, prefix: "footer.broll", label: "Footer B-roll", fields: registry.bySection.footer.filter((field) => field.visual), fieldIssues: validation.fieldIssues, footer: true })}
    </div>
  `;

  return renderEditorWorkspace({
    sectionId: "footer",
    eyebrow: "Closing Content",
    title: "Footer",
    copy:
      "Edit the footer message, pricing disclaimer, destination label, and website URL.",
    body,
    issueCount: validation.issueCounts.footer,
    status: validation.statuses.footer,
  });
};
