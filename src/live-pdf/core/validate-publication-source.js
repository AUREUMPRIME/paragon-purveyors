const normalizePublicationSourceType = (value) =>
  String(value ?? "").trim().toLowerCase();

export const validatePublicationSource = ({
  publishMode = false,
  sourceType,
} = {}) => {
  const normalizedSourceType =
    normalizePublicationSourceType(sourceType) ||
    "unknown";

  if (!publishMode) {
    return normalizedSourceType;
  }

  if (normalizedSourceType !== "google") {
    throw new Error(
      "Production publication requires Google business data. " +
        `Found source: ${normalizedSourceType}.`,
    );
  }

  return normalizedSourceType;
};
