const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const getValueAtPath = (source, path) => path.reduce((value, segment) => value?.[segment], source);
const controlId = (key) => `visual-${key.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`;

export const renderVisualFieldControl = ({ field, draft, issue = null }) => {
  const value = getValueAtPath(draft, field.path);
  const id = controlId(field.key);
  const common = `id="${id}" data-editor-field="${escapeHtml(field.key)}" data-editor-type="${escapeHtml(field.control)}" aria-invalid="${issue ? "true" : "false"}"`;
  let control = "";
  if (field.control === "checkbox") control = `<label class="visual-checkbox"><input ${common} type="checkbox" ${value ? "checked" : ""}><span>${escapeHtml(field.label)}</span></label>`;
  else if (field.control === "select") control = `<label for="${id}">${escapeHtml(field.label)}</label><select ${common}>${field.options.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
  else if (field.control === "range") control = `<div class="visual-control__label"><label for="${id}">${escapeHtml(field.label)}</label><output>${escapeHtml(value)}</output></div><input ${common} type="range" value="${escapeHtml(value)}" min="${field.min}" max="${field.max}" step="${field.step}">`;
  else if (field.control === "color") control = `<label for="${id}">${escapeHtml(field.label)}</label><input ${common} type="color" value="${escapeHtml(value)}">`;
  else control = `<label for="${id}">${escapeHtml(field.label)}</label><input ${common} type="text" value="${escapeHtml(value)}">`;
  return `<div class="editor-field visual-control" data-editor-field-wrapper="${escapeHtml(field.key)}" data-field-state="${issue?.kind || "valid"}">${control}<p class="editor-field__error" data-field-error-for="${escapeHtml(field.key)}" role="status">${issue ? escapeHtml(issue.message) : ""}</p></div>`;
};

const assetUrl = (draft, reference) => {
  const asset = draft.assetLibrary?.[reference?.assetId];
  if (!asset?.path) return "";
  return asset.path.startsWith("/") ? asset.path : `/${asset.path}`;
};

const assetLibraryForPrefix = (draft, prefix) => {
  if (prefix === "header.brandMark") return "brand-marks";
  if (prefix === "header.wordmark") return "wordmarks";
  if (prefix === "header.campaignMark") return "campaign-marks";
  if (prefix === "footer.broll") return "footer";
  if (prefix.endsWith(".brandLogo")) return "product-brand-logos";

  const specialIndex = Number(
    prefix.match(/^specials\[(\d+)\]/)?.[1],
  );

  return Number.isInteger(specialIndex)
    ? draft.specials?.[specialIndex]?.id || ""
    : "";
};

export const renderVisualReferenceEditor = ({ draft, reference, prefix, label, fields, fieldIssues = {}, footer = false }) => {
  const src = assetUrl(draft, reference);
  const library = assetLibraryForPrefix(draft, prefix);
  const style = [`object-fit:${reference.fit}`, `object-position:${reference.focusX}% ${reference.focusY}%`, `transform:scale(${reference.zoom})`, `transform-origin:${reference.focusX}% ${reference.focusY}%`, footer ? `opacity:${reference.opacity};filter:saturate(${reference.saturation}) contrast(${reference.contrast}) brightness(${reference.brightness})` : ""].filter(Boolean).join(";");
  return `<section class="visual-editor" data-visual-editor="${escapeHtml(prefix)}"><header class="visual-editor__header"><div><h3>${escapeHtml(label)}</h3><p>Choose a compatible asset, then adjust fit, zoom, focus, visibility, and alternate text.</p></div><div class="visual-editor__asset-actions"><output>${escapeHtml(reference.assetId)}</output><span class="visual-editor__visibility" data-visual-output-visibility data-output-visible="${reference.visible === false ? "false" : "true"}">${reference.visible === false ? "Hidden in PDF" : "Included in PDF"}</span><button type="button" data-asset-picker data-asset-slot="${escapeHtml(prefix)}" data-asset-library="${escapeHtml(library)}" data-asset-label="${escapeHtml(label)}">Choose Asset</button></div></header><div class="visual-editor__layout"><div class="visual-stage" data-visual-stage="${escapeHtml(prefix)}">${src ? `<img src="${escapeHtml(src)}" data-visual-asset-id="${escapeHtml(reference.assetId)}" alt="${escapeHtml(reference.alt)}" style="${escapeHtml(style)}">` : `<span>Asset unavailable</span>`}</div><div class="visual-editor__controls">${fields.map((field) => renderVisualFieldControl({ field, draft, issue: fieldIssues[field.key] || null })).join("")}</div></div></section>`;
};
