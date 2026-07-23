import { renderEditorWorkspace } from "./editor-controls.js";
import { renderVisualReferenceEditor } from "./visual-controls.js";

export const renderLogosEditor = ({ draft, registry, validation }) => {
  const refs = [
    ["header.brandMark", "Brand mark", draft.header.brandMark],
    ["header.wordmark", "Wordmark", draft.header.wordmark],
    ["header.campaignMark", "Campaign mark", draft.header.campaignMark],
    ...draft.specials.map((special, index) => [`specials[${index}].brandLogo`, `${special.displayName} brand logo`, special.brandLogo]),
  ];
  const accent = registry.byKey.get("theme.accentColor");
  const body = `<div class="editor-stack"><fieldset class="editor-panel"><legend>Theme</legend>${accent ? `<div class="editor-grid">${validation.renderField(accent)}</div>` : ""}</fieldset>${refs.map(([prefix,label,reference]) => renderVisualReferenceEditor({ draft, reference, prefix, label, fields: registry.bySection.logos.filter((field) => field.key.startsWith(prefix)), fieldIssues: validation.fieldIssues })).join("")}</div>`;
  return renderEditorWorkspace({ sectionId: "logos", eyebrow: "Brand Presentation", title: "Logos & Marks", copy: "Adjust visibility, alternate text, fit, zoom, and focal position without changing the assigned asset.", body, issueCount: validation.issueCounts.logos, status: validation.statuses.logos });
};
