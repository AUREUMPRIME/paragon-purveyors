import {
  renderEditorWorkspace,
  renderFieldGrid,
} from "./editor-controls.js";

const groupFields = (fields, prefix) =>
  fields.filter((field) => field.key.startsWith(prefix));

export const renderHeaderEditor = ({
  draft,
  registry,
  validation,
}) => {
  const fields = registry.bySection.header;

  const groups = [
    {
      title: "Delivery Message",
      copy: "Control the delivery statement above the campaign.",
      fields: groupFields(fields, "header.deliveryMessage"),
    },
    {
      title: "Campaign Title",
      copy: "Set the two-line campaign title and its visibility.",
      fields: groupFields(fields, "header.campaignTitle"),
    },
    {
      title: "Month & Year",
      copy: "Set the visible publication period.",
      fields: fields.filter((field) =>
        field.key.startsWith("header.month") ||
        field.key.startsWith("header.year"),
      ),
    },
    {
      title: "Supporting Line",
      copy: "Add optional supporting copy below the date.",
      fields: groupFields(fields, "header.supportingLine"),
    },
  ];

  const body = `
    <div class="editor-stack">
      ${groups.map((group) => `
        <fieldset class="editor-panel">
          <legend>${group.title}</legend>
          <p class="editor-panel__copy">${group.copy}</p>
          ${renderFieldGrid({
            fields: group.fields,
            draft,
            fieldIssues: validation.fieldIssues,
          })}
        </fieldset>
      `).join("")}
    </div>
  `;

  return renderEditorWorkspace({
    sectionId: "header",
    eyebrow: "Document Header",
    title: "Header & Campaign",
    copy:
      "Update the campaign message, title, month, year, and supporting line.",
    body,
    issueCount: validation.issueCounts.header,
    status: validation.statuses.header,
  });
};
