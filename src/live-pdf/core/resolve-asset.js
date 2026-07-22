const assetMimeTypes = new Map([
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
]);

export const normalizeAssetReference = (value) =>
  String(value || "").replaceAll("\\", "/").replace(/^public\//, "");

export const resolveAssetReference = (value) => {
  const normalizedPath = normalizeAssetReference(value);
  const extensionMatch = normalizedPath.match(/(\.[^./]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "";
  const mimeType = assetMimeTypes.get(extension);

  if (!mimeType) {
    throw new Error(`Unsupported asset type: ${normalizedPath}`);
  }

  return {
    normalizedPath,
    mimeType,
  };
};

export const createAssetDataUrlResolver = ({ readAsset, encodeBase64 }) => {
  if (typeof readAsset !== "function") {
    throw new TypeError("readAsset must be a function.");
  }

  if (typeof encodeBase64 !== "function") {
    throw new TypeError("encodeBase64 must be a function.");
  }

  return async (assetReference) => {
    const { normalizedPath, mimeType } = resolveAssetReference(assetReference);
    const data = await readAsset(normalizedPath);
    return `data:${mimeType};base64,${encodeBase64(data)}`;
  };
};
