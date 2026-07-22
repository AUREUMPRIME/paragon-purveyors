export const normalizeText = (value) => String(value ?? "").trim();

export const normalizeKey = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

export const isActive = (value) => {
  const clean = normalizeText(value).toLowerCase();
  return clean === "yes" || clean === "true" || clean === "1" || clean === "active";
};

export const isSettingVisible = (settings, key, fallback = true) => {
  const value = normalizeText(settings?.[key]);
  return value ? isActive(value) : fallback;
};

export const normalizeAssetPath = (value) =>
  normalizeText(value).replaceAll("\\", "/").replace(/^public\//, "");
