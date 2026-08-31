import { resolveBrowserAssetUrl } from "../live-pdf/browser/resolve-browser-asset.js";
import { adaptCanonicalDocument } from "../live-pdf/core/adapt-canonical-document.js";
import { normalizeAssetReference } from "../live-pdf/core/resolve-asset.js";
import { renderMonthlySpecialsHtml } from "../live-pdf/core/render-monthly-specials.js";
import { fingerprintDocument } from "./state.js";

export const REVIEW_CSS_URL =
  new URL(
    "../live-pdf/monthly-specials.css",
    import.meta.url,
  ).href;

const normalizePath = (value) =>
  normalizeAssetReference(value).replace(/^\/+/, "");

const assertDraft = (draft) => {
  if (!draft || typeof draft !== "object") {
    throw new TypeError("Review preview requires a current Studio draft.");
  }

  if (!draft.assetLibrary || typeof draft.assetLibrary !== "object") {
    throw new TypeError("Review preview requires the draft asset library.");
  }

  return draft;
};

export const createReviewAssetPathIndex = (document) => {
  assertDraft(document);

  return new Map(
    Object.values(document.assetLibrary).map((asset) => [
      normalizePath(asset.path),
      asset.id,
    ]),
  );
};

export const createReviewAssetResolver = ({
  document,
  assetPreviewResolver = null,
  baseUrl = globalThis.location?.origin,
} = {}) => {
  assertDraft(document);
  const assetPathIndex = createReviewAssetPathIndex(document);

  return async (assetReference) => {
    const normalizedPath = normalizePath(assetReference);
    const assetId = assetPathIndex.get(normalizedPath);
    const previewUrl = assetId
      ? assetPreviewResolver?.getUrl(document, assetId)
      : "";
    const resolvedReference = previewUrl || normalizedPath;

    return resolveBrowserAssetUrl(resolvedReference, { baseUrl });
  };
};

const loadSharedCss = async ({ fetchImpl, cssUrl }) => {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Review preview requires a fetch implementation.");
  }

  const response = await fetchImpl(cssUrl, {
    cache: "no-store",
    headers: {
      Accept: "text/css",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load shared Monthly Specials CSS: HTTP ${response.status}.`,
    );
  }

  return response.text();
};

export const createReviewPreview = ({
  getDraft,
  assetPreviewResolver = null,
  fetchImpl = globalThis.fetch,
  cssUrl = REVIEW_CSS_URL,
  baseUrl = globalThis.location?.origin,
  adaptDocument = adaptCanonicalDocument,
  renderHtml = renderMonthlySpecialsHtml,
} = {}) => {
  if (typeof getDraft !== "function") {
    throw new TypeError("Review preview requires getDraft.");
  }

  let cssPromise = null;

  const getCss = () => {
    cssPromise ||= loadSharedCss({ fetchImpl, cssUrl });
    return cssPromise;
  };

  const render = async () => {
    const draft = assertDraft(getDraft());
    const data = adaptDocument(draft);
    const css = await getCss();
    const resolveAssetDataUrl = createReviewAssetResolver({
      document: draft,
      assetPreviewResolver,
      baseUrl,
    });
    const html = await renderHtml({
      data,
      activeSpecials: data.specials,
      css,
      resolveAssetDataUrl,
    });

    return Object.freeze({
      html,
      draftFingerprint: fingerprintDocument(draft),
      assetCount: Object.keys(draft.assetLibrary).length,
      pendingAssetCount:
        assetPreviewResolver?.getPendingAssetIds?.().size || 0,
    });
  };

  return Object.freeze({
    render,
    clearCssCache() {
      cssPromise = null;
    },
  });
};
