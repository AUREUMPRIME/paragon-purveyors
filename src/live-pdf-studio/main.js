import "./styles.css";
import { createNavigationController } from "./navigation.js";
import { createReviewDialogController } from "./review-dialog.js";
import { renderStudioShell } from "./shell.js";
import { createInitialSectionStatuses } from "./status-model.js";

const root = document.getElementById("studio-app");

if (!root) {
  throw new Error("Live PDF Studio root not found.");
}

const statuses = createInitialSectionStatuses();
const shell = renderStudioShell({ root, statuses });
const reviewDialog = root.querySelector("[data-review-dialog]");
const assetDialog = root.querySelector("[data-asset-library-dialog]");
const reviewController = createReviewDialogController(reviewDialog);

const openAssetLibrary = () => {
  if (!assetDialog.open) assetDialog.showModal();
};

const closeAssetLibrary = () => {
  if (assetDialog.open) assetDialog.close();
};

assetDialog.addEventListener("click", (event) => {
  if (event.target.matches("[data-assets-close]")) closeAssetLibrary();
  if (event.target === assetDialog) closeAssetLibrary();
});

createNavigationController({
  root,
  onNavigate: (sectionId) => {
    shell.renderWorkspace(sectionId);
    if (sectionId === "assets") openAssetLibrary();
    if (sectionId === "review") reviewController.open();
  },
});

root.addEventListener("click", (event) => {
  const action = event.target.closest("[data-studio-action]")?.dataset.studioAction;
  if (action === "open-assets") openAssetLibrary();
  if (action === "open-review") reviewController.open();
});

window.__PARAGON_LIVE_PDF_STUDIO_SHELL__ = Object.freeze({
  version: 1,
  navigationSections: 8,
  primaryActions: 5,
  productionPublishingEnabled: false,
});
