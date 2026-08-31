const PUBLISH_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;

const normalizePublicationAssetPath = (value) => {
  const path = String(value ?? "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+/u, "");

  if (path.startsWith("public/assets/specials/library/")) {
    return path;
  }

  if (path.startsWith("assets/specials/library/")) {
    return `public/${path}`;
  }

  throw new TypeError("Pending upload path is outside the publication asset library.");
};

const getPublicationFileName = (path) => {
  const name = path.split("/").at(-1) || "";
  if (!name || name.includes("\\") || name.includes("/")) {
    throw new TypeError("Pending upload filename is invalid.");
  }
  return name;
};

export const createPublishId = (
  cryptoImpl = globalThis.crypto,
) => {
  if (typeof cryptoImpl?.randomUUID !== "function") {
    throw new TypeError("Web Crypto randomUUID is unavailable.");
  }

  const publishId = String(cryptoImpl.randomUUID()).toLowerCase();
  if (!PUBLISH_ID_PATTERN.test(publishId)) {
    throw new TypeError("Generated publication ID is invalid.");
  }
  return publishId;
};

export const createPublishFormData = ({
  document,
  baseMainSha,
  uploads = [],
  publishId = createPublishId(),
  commitMessage = `Paragon Studio Publish ${publishId}`,
  FormDataImpl = globalThis.FormData,
  FileImpl = globalThis.File,
} = {}) => {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    throw new TypeError("A Studio draft document is required.");
  }
  if (
    typeof baseMainSha !== "string"
    || !/^[0-9a-f]{40}$/u.test(baseMainSha)
  ) {
    throw new TypeError("A lowercase forty-character base main SHA is required.");
  }
  if (!PUBLISH_ID_PATTERN.test(publishId)) {
    throw new TypeError("A canonical lowercase publication UUID is required.");
  }
  if (typeof FormDataImpl !== "function" || typeof FileImpl !== "function") {
    throw new TypeError("FormData and File implementations are required.");
  }

  const assetCatalog = document.assetLibrary;
  if (!assetCatalog || typeof assetCatalog !== "object" || Array.isArray(assetCatalog)) {
    throw new TypeError("The draft asset catalog is required.");
  }

  const fileMetadata = {};
  const preparedFiles = [];
  const uploadAssetIds = [];
  const usedNames = new Set();

  for (const upload of [...uploads].sort((left, right) =>
    String(left?.assetId ?? "").localeCompare(String(right?.assetId ?? "")))) {
    if (!upload?.assetId || !(upload.blob instanceof Blob) || !upload.metadata) {
      throw new TypeError("Pending upload record is incomplete.");
    }

    const metadata = upload.metadata;
    const assetId = String(metadata.id || upload.assetId);
    if (assetId !== String(upload.assetId) || !assetCatalog[assetId]) {
      throw new TypeError("Pending upload is not represented by the draft asset catalog.");
    }

    const publicationPath = normalizePublicationAssetPath(metadata.path);
    const fileName = getPublicationFileName(publicationPath);

    if (usedNames.has(fileName)) {
      throw new TypeError("Pending upload filenames must be unique.");
    }
    usedNames.add(fileName);

    const file = new FileImpl(
      [upload.blob],
      fileName,
      {
        type: upload.blob.type || metadata.mimeType || "application/octet-stream",
      },
    );

    fileMetadata[fileName] = Object.freeze({
      assetId,
      path: publicationPath,
    });
    preparedFiles.push(file);
    uploadAssetIds.push(assetId);
  }

  const formData = new FormDataImpl();
  formData.append("document", JSON.stringify(document));
  formData.append("assetCatalog", JSON.stringify(assetCatalog));
  formData.append("baseMainSha", baseMainSha);
  formData.append("publishId", publishId);
  formData.append("commitMessage", String(commitMessage));
  formData.append("fileMetadata", JSON.stringify(fileMetadata));

  for (const file of preparedFiles) {
    formData.append("files[]", file, file.name);
  }

  return Object.freeze({
    formData,
    publishId,
    commitMessage: String(commitMessage),
    uploadAssetIds: Object.freeze(uploadAssetIds),
    fileMetadata: Object.freeze(fileMetadata),
  });
};
