import {
  ASSET_LIBRARY_DEFINITIONS,
  archiveAssetRecord,
  assignAssetToSlot,
  canArchiveAsset,
  createAssetUsageMap,
  getCompatibleAssets,
  removePendingAssetRecord,
  restoreAssetRecord,
} from "./asset-library-model.js";
import {
  getUploadPolicy,
  normalizeAssetUpload,
} from "./asset-upload-normalizer.js";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const clone = (value) =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

export const createAssetLibraryController = ({
  dialog,
  state,
  store,
  previewResolver,
  shell,
  onDraftChanged = () => {},
} = {}) => {
  if (
    !dialog ||
    !state ||
    !store ||
    !previewResolver ||
    !shell
  ) {
    throw new TypeError(
      "Asset Library controller requires dialog, state, storage, preview resolution, and shell.",
    );
  }

  const searchInput = dialog.querySelector("[data-assets-search]");
  const librarySelect = dialog.querySelector("[data-assets-library]");
  const archivedInput = dialog.querySelector(
    "[data-assets-include-archived]",
  );
  const labelInput = dialog.querySelector("[data-assets-label]");
  const uploadButton = dialog.querySelector("[data-assets-upload]");
  const fileInput = dialog.querySelector("[data-assets-file]");
  const grid = dialog.querySelector("[data-assets-grid]");
  const summary = dialog.querySelector("[data-assets-summary]");
  const context = dialog.querySelector("[data-assets-context]");
  const message = dialog.querySelector("[data-assets-message]");

  let assignmentContext = null;
  let pendingAssetIds = new Set();
  let disposed = false;

  const setMessage = (text, tone = "neutral") => {
    message.textContent = text;
    message.dataset.messageTone = tone;
  };

  const updatePendingState = async () => {
    const documentId = state.getSnapshot().documentId;
    const uploads = await store.listUploads(documentId);
    pendingAssetIds = new Set(
      uploads.map((upload) => upload.assetId),
    );
    state.setPendingUploadCount(uploads.length);
    shell.setAssetLibraryState({
      pending: uploads.length,
      total: Object.keys(
        state.getDraft().assetLibrary || {},
      ).length,
    });
    return uploads;
  };

  const getCurrentLibrary = () =>
    assignmentContext?.library || librarySelect.value || "";

  const renderCard = (asset) => {
    const previewUrl = previewResolver.getUrl(
      state.getDraft(),
      asset.id,
    );
    const assignable =
      assignmentContext &&
      assignmentContext.library === asset.library &&
      !asset.archived;
    const archivable = canArchiveAsset({
      document: state.getDraft(),
      assetId: asset.id,
    });
    const removable =
      asset.pending &&
      asset.usageCount === 0;
    const usageText =
      asset.usageCount === 0
        ? "Unused"
        : `${asset.usageCount} ${asset.usageCount === 1 ? "use" : "uses"}`;

    return `
      <article
        class="asset-card${asset.archived ? " asset-card--archived" : ""}"
        data-asset-card="${escapeHtml(asset.id)}"
      >
        <div class="asset-card__preview">
          ${
            previewUrl
              ? `<img src="${escapeHtml(previewUrl)}" alt="">`
              : `<span>Preview unavailable</span>`
          }
          ${asset.pending ? `<span class="asset-card__badge">Pending</span>` : ""}
          ${asset.archived ? `<span class="asset-card__badge asset-card__badge--muted">Archived</span>` : ""}
        </div>
        <div class="asset-card__body">
          <div>
            <p>${escapeHtml(ASSET_LIBRARY_DEFINITIONS[asset.library].label)}</p>
            <h3>${escapeHtml(asset.label)}</h3>
          </div>
          <dl>
            <div><dt>Type</dt><dd>${escapeHtml(asset.mimeType.replace("image/", ""))}</dd></div>
            <div><dt>Size</dt><dd>${formatBytes(asset.bytes)}</dd></div>
            <div><dt>Dimensions</dt><dd>${asset.width} × ${asset.height}</dd></div>
            <div><dt>Usage</dt><dd>${escapeHtml(usageText)}</dd></div>
          </dl>
          <code>${escapeHtml(asset.id)}</code>
          ${
            asset.usages.length
              ? `<p class="asset-card__usage">${asset.usages
                  .map((usage) => escapeHtml(usage.label))
                  .join(" · ")}</p>`
              : ""
          }
        </div>
        <footer class="asset-card__actions">
          ${
            assignmentContext
              ? `<button
                  type="button"
                  data-assets-assign="${escapeHtml(asset.id)}"
                  ${assignable ? "" : "disabled"}
                >Use Asset</button>`
              : ""
          }
          ${
            asset.archived
              ? `<button type="button" data-assets-restore="${escapeHtml(asset.id)}">Restore</button>`
              : `<button
                  type="button"
                  data-assets-archive="${escapeHtml(asset.id)}"
                  ${archivable ? "" : "disabled"}
                  title="${archivable ? "Archive this unused asset." : "Assigned assets cannot be archived."}"
                >Archive</button>`
          }
          ${
            asset.pending
              ? `<button
                  type="button"
                  data-assets-remove="${escapeHtml(asset.id)}"
                  ${removable ? "" : "disabled"}
                  title="${removable ? "Remove this uncommitted upload." : "Assigned pending uploads cannot be removed."}"
                >Remove Pending</button>`
              : ""
          }
        </footer>
      </article>
    `;
  };

  const render = () => {
    const document = state.getDraft();
    const library = getCurrentLibrary();
    const assets = getCompatibleAssets({
      document,
      library,
      query: searchInput.value,
      includeArchived: archivedInput.checked,
      pendingAssetIds,
    });

    if (assignmentContext) {
      context.hidden = false;
      context.innerHTML = `
        <strong>Assigning ${escapeHtml(assignmentContext.label)}</strong>
        <span>Showing compatible ${escapeHtml(
          ASSET_LIBRARY_DEFINITIONS[assignmentContext.library].label,
        )} only. Crop geometry will be preserved.</span>
        <button type="button" data-assets-clear-context>Browse All</button>
      `;
    } else {
      context.hidden = true;
      context.innerHTML = "";
    }

    summary.textContent =
      `${assets.length} ${assets.length === 1 ? "asset" : "assets"} shown · ` +
      `${pendingAssetIds.size} pending upload${pendingAssetIds.size === 1 ? "" : "s"}`;

    grid.innerHTML = assets.length
      ? assets.map(renderCard).join("")
      : `
        <div class="asset-library-empty">
          <h3>No assets match this view.</h3>
          <p>Adjust the search, library, or archived filter.</p>
        </div>
      `;
  };

  const refresh = async () => {
    await updatePendingState();
    render();
  };

  const open = async ({
    slotPath = "",
    library = "",
    label = "selected visual slot",
  } = {}) => {
    assignmentContext =
      slotPath && library
        ? { slotPath, library, label }
        : null;

    if (library) librarySelect.value = library;
    searchInput.value = "";
    archivedInput.checked = false;
    setMessage("", "neutral");
    await refresh();

    if (!dialog.open) dialog.showModal();
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  const uploadSelectedFile = async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    uploadButton.disabled = true;
    setMessage("Preparing and validating upload…", "neutral");

    try {
      const library = librarySelect.value;
      const label =
        labelInput.value.trim() ||
        file.name.replace(/\.[^.]+$/, "");
      const normalized = await normalizeAssetUpload({
        file,
        library,
        label,
      });
      const draft = state.getDraft();
      const duplicate = Object.values(
        draft.assetLibrary,
      ).find(
        (asset) =>
          asset.sha256 === normalized.record.sha256 &&
          asset.library === normalized.record.library,
      );

      if (duplicate) {
        setMessage(
          `This file already exists as ${duplicate.label}.`,
          "warning",
        );

        if (
          assignmentContext &&
          duplicate.library === assignmentContext.library &&
          !duplicate.archived
        ) {
          const assignment = assignAssetToSlot({
            document: draft,
            slotPath: assignmentContext.slotPath,
            assetId: duplicate.id,
          });
          state.setValue(assignment.path, assignment.value);
          onDraftChanged();
        }

        return;
      }

      await store.putUpload({
        assetId: normalized.record.id,
        documentId: draft.documentId,
        blob: normalized.blob,
        metadata: normalized.record,
      });

      previewResolver.setUpload({
        assetId: normalized.record.id,
        blob: normalized.blob,
      });

      try {
        const nextLibrary = clone(draft.assetLibrary);
        nextLibrary[normalized.record.id] = normalized.record;
        state.setValue(["assetLibrary"], nextLibrary);

        if (
          assignmentContext &&
          assignmentContext.library === normalized.record.library
        ) {
          const assignment = assignAssetToSlot({
            document: state.getDraft(),
            slotPath: assignmentContext.slotPath,
            assetId: normalized.record.id,
          });
          state.setValue(assignment.path, assignment.value);
        }
      } catch (error) {
        await store.deleteUpload(
          draft.documentId,
          normalized.record.id,
        );
        previewResolver.remove(normalized.record.id);
        throw error;
      }

      labelInput.value = "";
      setMessage(
        `${normalized.record.label} is saved locally as a pending upload.`,
        "success",
      );
      await refresh();
      onDraftChanged();
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      uploadButton.disabled = false;
      fileInput.value = "";
    }
  };

  const handleClick = async (event) => {
    if (event.target.matches("[data-assets-close]")) {
      close();
      return;
    }

    if (event.target.matches("[data-assets-clear-context]")) {
      assignmentContext = null;
      render();
      return;
    }

    if (event.target.matches("[data-assets-upload]")) {
      const policy = getUploadPolicy(librarySelect.value);
      fileInput.accept = policy.acceptedMimeTypes.join(",");
      fileInput.click();
      return;
    }

    const assignId = event.target.dataset.assetsAssign;
    if (assignId && assignmentContext) {
      try {
        const assignment = assignAssetToSlot({
          document: state.getDraft(),
          slotPath: assignmentContext.slotPath,
          assetId: assignId,
        });
        state.setValue(assignment.path, assignment.value);
        setMessage("Asset assigned. Existing geometry was preserved.", "success");
        onDraftChanged();
        render();
      } catch (error) {
        setMessage(error.message, "error");
      }
      return;
    }

    const archiveId = event.target.dataset.assetsArchive;
    if (archiveId) {
      try {
        const mutation = archiveAssetRecord({
          document: state.getDraft(),
          assetId: archiveId,
        });
        state.setValue(mutation.path, mutation.value);
        setMessage("Unused asset archived.", "success");
        onDraftChanged();
        render();
      } catch (error) {
        setMessage(error.message, "error");
      }
      return;
    }

    const restoreId = event.target.dataset.assetsRestore;
    if (restoreId) {
      const mutation = restoreAssetRecord({
        document: state.getDraft(),
        assetId: restoreId,
      });
      state.setValue(mutation.path, mutation.value);
      setMessage("Asset restored to the active library.", "success");
      onDraftChanged();
      render();
      return;
    }

    const removeId = event.target.dataset.assetsRemove;
    if (removeId) {
      try {
        const mutation = removePendingAssetRecord({
          document: state.getDraft(),
          assetId: removeId,
          pendingAssetIds,
        });
        state.setValue(mutation.path, mutation.value);
        await store.deleteUpload(
          state.getSnapshot().documentId,
          removeId,
        );
        previewResolver.remove(removeId);
        setMessage("Pending upload removed.", "success");
        await refresh();
        onDraftChanged();
      } catch (error) {
        setMessage(error.message, "error");
      }
    }
  };

  const handleInput = () => render();
  const handleLibraryChange = () => {
    assignmentContext = null;
    render();
  };
  const handleFileChange = () => {
    void uploadSelectedFile();
  };
  const handleDialogClick = (event) => {
    if (event.target === dialog) close();
  };
  const handleCancel = (event) => {
    event.preventDefault();
    close();
  };

  dialog.addEventListener("click", handleClick);
  dialog.addEventListener("click", handleDialogClick);
  dialog.addEventListener("cancel", handleCancel);
  searchInput.addEventListener("input", handleInput);
  archivedInput.addEventListener("change", handleInput);
  librarySelect.addEventListener("change", handleLibraryChange);
  fileInput.addEventListener("change", handleFileChange);

  return Object.freeze({
    open,
    close,
    refresh,
    getPendingAssetIds: () => new Set(pendingAssetIds),
    dispose() {
      if (disposed) return;
      disposed = true;
      dialog.removeEventListener("click", handleClick);
      dialog.removeEventListener("click", handleDialogClick);
      dialog.removeEventListener("cancel", handleCancel);
      searchInput.removeEventListener("input", handleInput);
      archivedInput.removeEventListener("change", handleInput);
      librarySelect.removeEventListener("change", handleLibraryChange);
      fileInput.removeEventListener("change", handleFileChange);
    },
  });
};
