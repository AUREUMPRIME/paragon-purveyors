const committedAssetUrl = (document, assetId) => {
  const path = document?.assetLibrary?.[assetId]?.path;
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
};

export const createAssetPreviewResolver = ({
  store,
  urlApi = globalThis.URL,
} = {}) => {
  if (
    !store ||
    typeof store.listUploads !== "function" ||
    typeof urlApi?.createObjectURL !== "function"
  ) {
    throw new TypeError(
      "Asset preview resolver requires upload storage and URL support.",
    );
  }

  const objectUrls = new Map();
  let documentId = "";

  const revoke = (assetId) => {
    const current = objectUrls.get(assetId);

    if (current) {
      urlApi.revokeObjectURL(current);
      objectUrls.delete(assetId);
    }
  };

  const setUpload = (upload) => {
    revoke(upload.assetId);
    objectUrls.set(
      upload.assetId,
      urlApi.createObjectURL(upload.blob),
    );
  };

  const reload = async (nextDocumentId = documentId) => {
    for (const assetId of [...objectUrls.keys()]) revoke(assetId);

    documentId = nextDocumentId;
    const uploads = await store.listUploads(documentId);

    for (const upload of uploads) setUpload(upload);
    return uploads;
  };

  const getUrl = (document, assetId) =>
    objectUrls.get(assetId) ||
    committedAssetUrl(document, assetId);

  const apply = (root, document) => {
    root
      .querySelectorAll("[data-visual-asset-id]")
      .forEach((node) => {
        const url = getUrl(
          document,
          node.dataset.visualAssetId,
        );

        if (url && node.getAttribute("src") !== url) {
          node.setAttribute("src", url);
        }
      });
  };

  const remove = (assetId) => revoke(assetId);

  const dispose = () => {
    for (const assetId of [...objectUrls.keys()]) revoke(assetId);
    documentId = "";
  };

  return Object.freeze({
    reload,
    setUpload,
    getUrl,
    apply,
    remove,
    dispose,
    getPendingAssetIds: () =>
      new Set(objectUrls.keys()),
  });
};
