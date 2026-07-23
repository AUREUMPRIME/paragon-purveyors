import {
  renderEditorWorkspace,
  renderFieldGrid,
} from "./editor-controls.js";

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
          website URL. Editorial B-roll remains protected until Phase 3.4.
        </p>
        ${renderFieldGrid({
          fields: registry.bySection.footer,
          draft,
          fieldIssues: validation.fieldIssues,
        })}
      </fieldset>
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
