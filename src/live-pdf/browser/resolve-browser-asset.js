import {
  normalizeAssetReference,
} from "../core/resolve-asset.js";

const passthroughPattern = /^(?:data:|blob:|https?:\/\/)/i;

export const resolveBrowserAssetUrl = (
  assetReference,
  {
    baseUrl = globalThis.location?.origin,
  } = {},
) => {
  const rawReference = String(assetReference ?? "").trim();

  if (!rawReference) return "";
  if (passthroughPattern.test(rawReference)) return rawReference;

  if (!baseUrl) {
    throw new Error(
      "A browser asset baseUrl is required outside a browser context.",
    );
  }

  const normalizedPath = normalizeAssetReference(rawReference);
  const rootRelativePath = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;

  return new URL(rootRelativePath, baseUrl).href;
};

export const createBrowserAssetUrlResolver = (options = {}) =>
  async (assetReference) =>
    resolveBrowserAssetUrl(assetReference, options);
