import {
  renderEditorWorkspace,
  renderFieldControl,
  renderFieldGrid,
  renderReadOnlyField,
} from "./editor-controls.js";

export const renderContactsEditor = ({
  draft,
  registry,
  validation,
}) => {
  const instructionField = registry.bySection.contacts.find(
    (field) => field.key === "contacts.instruction",
  );

  const contactCards = draft.contacts.items.map((contact, index) => {
    const prefix = `contacts.items[${index}]`;
    const fields = registry.bySection.contacts.filter((field) =>
      field.key.startsWith(prefix),
    );

    return `
      <fieldset
        class="editor-panel editor-panel--contact"
        data-contact-editor="${contact.id}"
      >
        <legend>${contact.name || contact.id}</legend>
        <div class="editor-readonly-grid">
          ${renderReadOnlyField({
            label: "Stable ID",
            value: contact.id,
          })}
        </div>
        ${renderFieldGrid({
          fields,
          draft,
          fieldIssues: validation.fieldIssues,
        })}
      </fieldset>
    `;
  }).join("");

  const body = `
    <div class="editor-stack">
      <fieldset class="editor-panel">
        <legend>Ordering Instruction</legend>
        <p class="editor-panel__copy">
          This statement appears above the representative details.
        </p>
        <div class="editor-grid">
          ${renderFieldControl({
            field: instructionField,
            draft,
            issue:
              validation.fieldIssues[instructionField.key] || null,
          })}
        </div>
      </fieldset>
      ${contactCards}
    </div>
  `;

  return renderEditorWorkspace({
    sectionId: "contacts",
    eyebrow: "Ordering Contacts",
    title: "Contacts",
    copy:
      "Update the ordering instruction and each representative's service area, phone, email, and display order.",
    body,
    issueCount: validation.issueCounts.contacts,
    status: validation.statuses.contacts,
  });
};
