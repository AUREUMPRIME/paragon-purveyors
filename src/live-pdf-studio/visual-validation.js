import { fingerprintDocument } from "./state.js";
import { STUDIO_SECTION_STATUS } from "./status-model.js";

const issue = (section, fieldKey, kind, message) => ({ section, fieldKey, kind, message });
const validHex = (value) => /^#[0-9a-f]{6}$/i.test(String(value ?? ""));

export const validateVisualDraft = ({ draft, liveDocument, registry, transientErrors = {} }) => {
  const issues = [];
  const fieldIssues = {};
  const add = (entry) => { issues.push(entry); fieldIssues[entry.fieldKey] = entry; };

  for (const field of registry.fields) {
    const value = field.path.reduce((current, segment) => current?.[segment], draft);
    if (field.key === "theme.accentColor" && !validHex(value)) add(issue(field.section, field.key, "error", "Accent color must be a six-digit hexadecimal color."));
    if (field.control === "select" && !field.options.includes(value)) add(issue(field.section, field.key, "error", `${field.label} must be contain or cover.`));
    if (field.control === "range" && (!Number.isFinite(value) || value < field.min || value > field.max)) add(issue(field.section, field.key, value === null || value === undefined ? "missing" : "error", `${field.label} must be between ${field.min} and ${field.max}.`));
    if (field.key.endsWith(".alt") && field.path.slice(0,-1).reduce((current, segment) => current?.[segment], draft)?.visible && !String(value ?? "").trim()) add(issue(field.section, field.key, "missing", `${field.label} is required when visible.`));
  }

  for (const [fieldKey, message] of Object.entries(transientErrors)) {
    const field = registry.byKey.get(fieldKey);
    if (field) add(issue(field.section, fieldKey, "error", message));
  }

  const statuses = {};
  const sectionSources = { logos: { theme: draft.theme, header: draft.header, logos: draft.specials.map((item) => item.brandLogo) }, cuts: draft.specials.map((item) => ({ primary: item.primaryOffer.image, secondary: item.secondaryOffer?.image ?? null })), footer: draft.footer.broll };
  const liveSources = { logos: { theme: liveDocument.theme, header: liveDocument.header, logos: liveDocument.specials.map((item) => item.brandLogo) }, cuts: liveDocument.specials.map((item) => ({ primary: item.primaryOffer.image, secondary: item.secondaryOffer?.image ?? null })), footer: liveDocument.footer.broll };
  for (const section of ["logos", "cuts", "footer"]) {
    const sectionIssues = issues.filter((entry) => entry.section === section);
    statuses[section] = sectionIssues.some((entry) => entry.kind === "error") ? STUDIO_SECTION_STATUS.ERROR : sectionIssues.some((entry) => entry.kind === "missing") ? STUDIO_SECTION_STATUS.MISSING : fingerprintDocument(sectionSources[section]) === fingerprintDocument(liveSources[section]) ? STUDIO_SECTION_STATUS.COMPLETE : STUDIO_SECTION_STATUS.MODIFIED;
  }
  return { issues, fieldIssues, statuses, issueCounts: Object.fromEntries(["logos","cuts","footer"].map((section) => [section, issues.filter((entry) => entry.section === section).length])) };
};
