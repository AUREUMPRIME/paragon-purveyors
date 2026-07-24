import { STUDIO_SECTIONS } from "./navigation.js";
import {
  getDraftStatusPresentation,
  getSectionStatusTone,
} from "./status-model.js";

const sectionCopy = Object.freeze({
  overview: {
    eyebrow: "Studio Overview",
    title: "Monthly Specials",
    copy:
      "Work through each section in order, review the complete Legal page, and publish only after every requirement passes.",
  },
  header: {
    eyebrow: "Document Header",
    title: "Header & Campaign",
    copy:
      "Brand marks, campaign messaging, month, year, and supporting copy will be managed here.",
  },
  cuts: {
    eyebrow: "Product Content",
    title: "Featured Cuts",
    copy:
      "Product names, pricing, offers, descriptions, availability, and images will be edited in this section.",
  },
  logos: {
    eyebrow: "Brand Assets",
    title: "Logos & Marks",
    copy:
      "Paragon marks, campaign artwork, and product brand logos will be assigned and adjusted here.",
  },
  contacts: {
    eyebrow: "Ordering Contacts",
    title: "Contacts",
    copy:
      "Representative names, service areas, phone numbers, email addresses, and display order will be controlled here.",
  },
  footer: {
    eyebrow: "Closing Content",
    title: "Footer",
    copy:
      "Footer messaging, disclaimer, destination link, and editorial B-roll will be edited here.",
  },
  assets: {
    eyebrow: "Managed Media",
    title: "Asset Library",
    copy:
      "Upload, review, assign, archive, and safely remove reusable images and logos without opening File Explorer.",
  },
  review: {
    eyebrow: "Final Approval",
    title: "Review & Publish",
    copy:
      "Inspect the full Legal page, resolve validation issues, and publish only through the secured workflow.",
  },
});

const primaryActions = Object.freeze([
  { id: "assets", label: "Asset Library", action: "open-assets" },
  {
    id: "restore",
    label: "Restore Live Version",
    action: "restore-live",
    disabled: true,
    title: "Restore the local draft to the committed live version.",
  },
  {
    id: "save",
    label: "Save Draft",
    action: "save-draft",
    disabled: true,
    title: "Save the current draft in this browser.",
  },
  { id: "review", label: "Review PDF", action: "open-review" },
  {
    id: "publish",
    label: "Publish Live PDF",
    action: "publish",
    disabled: true,
    primary: true,
    title:
      "Publishing becomes available after secure Studio authentication is connected.",
  },
]);

const assetCategories = Object.freeze([
  ["brand-marks", "Brand Marks"],
  ["wordmarks", "Wordmarks"],
  ["campaign-marks", "Campaign Marks"],
  ["product-brand-logos", "Product Brand Logos"],
  ["tenderloin", "Tenderloin Images"],
  ["ribeye", "Ribeye Images"],
  ["striploin", "Striploin Images"],
  ["tri-tip", "Tri Tip Images"],
  ["footer", "Footer B-roll"],
]);

const navigationMarkup = (statuses) =>
  STUDIO_SECTIONS.map((section) => `
    <button
      class="studio-nav__item"
      type="button"
      data-studio-nav="${section.id}"
      aria-current="false"
    >
      <span class="studio-nav__number">${section.number}</span>
      <span class="studio-nav__content">
        <strong>${section.label}</strong>
        <small
          data-studio-nav-status="${section.id}"
          data-status-tone="${getSectionStatusTone(statuses[section.id])}"
        >${statuses[section.id]}</small>
      </span>
      <span class="studio-nav__indicator" aria-hidden="true"></span>
    </button>
  `).join("");

const actionMarkup = () =>
  primaryActions.map((action) => `
    <button
      class="studio-action${action.primary ? " studio-action--primary" : ""}"
      type="button"
      data-studio-action="${action.action}"
      ${action.disabled ? "disabled" : ""}
      ${action.title ? `title="${action.title}"` : ""}
    >
      ${action.label}
    </button>
  `).join("");

const assetLibraryOptionsMarkup = () =>
  assetCategories
    .map(
      ([value, label]) =>
        `<option value="${value}">${label}</option>`,
    )
    .join("");

const placeholderMarkup = (sectionId) => {
  const content = sectionCopy[sectionId];

  return `
    <section class="studio-workspace" data-workspace="${sectionId}">
      <header class="workspace-header">
        <div>
          <p class="workspace-eyebrow">${content.eyebrow}</p>
          <h1>${content.title}</h1>
          <p>${content.copy}</p>
        </div>
        <span class="workspace-phase">Professional Studio Foundation</span>
      </header>

      <div class="workspace-grid">
        <article class="workspace-card workspace-card--primary">
          <p class="workspace-card__eyebrow">Current checkpoint</p>
          <h2>Shell and navigation are active.</h2>
          <p>
            Editors and data mutation are intentionally withheld until their
            dedicated checkpoints are implemented and tested.
          </p>
        </article>

        <article class="workspace-card">
          <p class="workspace-card__eyebrow">Live protection</p>
          <h2>Production remains unchanged.</h2>
          <p>
            The current Monthly Specials landing, HTML, JSON, and PDF remain
            the active publication authorities.
          </p>
        </article>

        <article class="workspace-card">
          <p class="workspace-card__eyebrow">Draft status</p>
          <h2 data-workspace-draft-label>Loading draft.</h2>
          <p data-workspace-draft-detail>
            Preparing local draft storage.
          </p>
        </article>
      </div>
    </section>
  `;
};

export const renderStudioShell = ({ root, statuses }) => {
  root.innerHTML = `
    <div class="studio-shell" data-studio-ready="true">
      <aside class="studio-sidebar">
        <a class="studio-brand" href="/" aria-label="Paragon Purveyors home">
          <span class="studio-brand__mark">PP</span>
          <span>
            <strong>Paragon Purveyors</strong>
            <small>Live PDF Studio</small>
          </span>
        </a>

        <nav class="studio-nav" aria-label="Live PDF Studio sections">
          ${navigationMarkup(statuses)}
        </nav>

        <div class="studio-sidebar__footer">
          <span class="connection-dot" aria-hidden="true"></span>
          <div>
            <strong>Local Studio</strong>
            <small>Publishing disabled</small>
          </div>
        </div>
      </aside>

      <main class="studio-main">
        <header class="studio-topbar">
          <div>
            <p class="studio-topbar__eyebrow">Monthly Specials · US Legal</p>
            <strong>Draft workspace</strong>
          </div>
          <div
            class="workspace-phase"
            data-draft-status
            data-draft-tone="neutral"
            role="status"
            aria-live="polite"
          >
            <strong data-draft-status-label>Loading draft</strong>
            <small data-draft-status-detail>Preparing local draft storage.</small>
          </div>
          <div class="studio-actions" aria-label="Studio actions">
            ${actionMarkup()}
          </div>
        </header>

        <div class="studio-content" data-studio-content>
          ${placeholderMarkup("overview")}
        </div>
      </main>
    </div>

    <dialog class="studio-dialog asset-library-dialog" data-asset-library-dialog>
      <div class="studio-dialog__panel studio-dialog__panel--assets">
        <header class="studio-dialog__header">
          <div>
            <p class="workspace-eyebrow">Managed Media</p>
            <h2>Asset Library</h2>
            <p>
              Upload, assign, archive, and remove pending reusable images and
              logos entirely inside the Studio. Existing committed asset bytes
              remain immutable.
            </p>
          </div>
          <button type="button" data-assets-close aria-label="Close Asset Library">
            Close
          </button>
        </header>

        <div class="asset-library-context" data-assets-context hidden></div>

        <div class="asset-library-toolbar">
          <label>
            <span>Search assets</span>
            <input
              type="search"
              placeholder="Search label, file, category, ID, or usage"
              data-assets-search
            >
          </label>
          <label>
            <span>Library</span>
            <select data-assets-library>
              ${assetLibraryOptionsMarkup()}
            </select>
          </label>
          <label>
            <span>Upload label</span>
            <input
              type="text"
              maxlength="200"
              placeholder="Friendly asset name"
              data-assets-label
            >
          </label>
          <label class="asset-library-toggle">
            <input type="checkbox" data-assets-include-archived>
            <span>Show archived</span>
          </label>
          <button type="button" data-assets-upload>Upload New</button>
          <input type="file" data-assets-file hidden>
        </div>

        <div class="asset-library-feedback">
          <p data-assets-summary>Loading asset catalog…</p>
          <p data-assets-message data-message-tone="neutral" role="status" aria-live="polite"></p>
        </div>

        <div class="asset-library-grid" data-assets-grid></div>

        <p class="studio-dialog__notice">
          File Explorer is never used by the permanent Studio. New files remain
          local pending uploads in IndexedDB until a future secured publication
          workflow is connected. Assigned crop geometry is preserved.
        </p>
      </div>
    </dialog>

    <dialog class="studio-dialog" data-restore-live-dialog>
      <div class="studio-dialog__panel">
        <header class="studio-dialog__header">
          <div>
            <p class="workspace-eyebrow">Discard Local Changes</p>
            <h2>Restore Live Version?</h2>
            <p>
              This replaces the local draft with a fresh copy of the committed
              live document and clears its saved browser draft.
            </p>
          </div>
        </header>
        <div class="asset-library-toolbar">
          <button type="button" data-restore-cancel>Keep Draft</button>
          <button
            class="studio-action studio-action--primary"
            type="button"
            data-restore-confirm
          >
            Restore Live Version
          </button>
        </div>
      </div>
    </dialog>

    <dialog class="studio-dialog review-dialog" data-review-dialog>
      <div class="review-dialog__panel">
        <header class="review-dialog__header">
          <div>
            <p class="workspace-eyebrow">Final Approval</p>
            <h2>Review Monthly Specials PDF</h2>
          </div>
          <div class="review-dialog__tools">
            <span>Fit <strong data-review-scale>--</strong></span>
            <button type="button" data-review-close>Back to Edit</button>
            <button
              class="studio-action studio-action--primary"
              type="button"
              disabled
              title="Publishing becomes available after secure Studio authentication is connected."
            >
              Publish Live PDF
            </button>
          </div>
        </header>

        <div class="review-dialog__body">
          <div class="review-viewport" data-review-viewport>
            <div class="review-stage" data-review-stage>
              <iframe
                title="Current Paragon Purveyors Monthly Specials review"
                src="/specials/monthly-specials.html"
              ></iframe>
            </div>
          </div>

          <aside class="review-validation">
            <p class="workspace-eyebrow">Validation</p>
            <h3>Secure publishing is not connected.</h3>
            <p>
              Publishing becomes available after secure Studio authentication
              is connected.
            </p>
            <dl>
              <div><dt>Errors</dt><dd>0</dd></div>
              <div><dt>Warnings</dt><dd>1</dd></div>
            </dl>
          </aside>
        </div>
      </div>
    </dialog>
  `;

  const draftStatus = root.querySelector("[data-draft-status]");
  const draftStatusLabel = root.querySelector(
    "[data-draft-status-label]",
  );
  const draftStatusDetail = root.querySelector(
    "[data-draft-status-detail]",
  );
  const saveButton = root.querySelector(
    '[data-studio-action="save-draft"]',
  );
  const restoreButton = root.querySelector(
    '[data-studio-action="restore-live"]',
  );
  const restoreDialog = root.querySelector(
    "[data-restore-live-dialog]",
  );
  const assetStatusNode = root.querySelector(
    '[data-studio-nav-status="assets"]',
  );

  let latestDraftSnapshot = null;

  const applyDraftSnapshot = (snapshot) => {
    latestDraftSnapshot = snapshot;
    const presentation = getDraftStatusPresentation(snapshot);

    draftStatus.dataset.draftTone = presentation.tone;
    draftStatusLabel.textContent = presentation.label;
    draftStatusDetail.textContent = presentation.detail;

    const isBusy = ["loading", "saving"].includes(
      snapshot.persistenceStatus,
    );

    saveButton.disabled = isBusy;
    restoreButton.disabled = isBusy || !snapshot.isModified;

    const workspaceLabel = root.querySelector(
      "[data-workspace-draft-label]",
    );
    const workspaceDetail = root.querySelector(
      "[data-workspace-draft-detail]",
    );

    if (workspaceLabel) {
      workspaceLabel.textContent = `${presentation.label}.`;
    }

    if (workspaceDetail) {
      workspaceDetail.textContent = presentation.detail;
    }
  };

  const confirmRestoreLive = () =>
    new Promise((resolve) => {
      let settled = false;
      const abortController = new AbortController();
      const { signal } = abortController;

      const settle = (confirmed) => {
        if (settled) return;
        settled = true;
        abortController.abort();

        if (restoreDialog.open) {
          restoreDialog.close();
        }

        resolve(confirmed);
      };

      restoreDialog
        .querySelector("[data-restore-confirm]")
        .addEventListener("click", () => settle(true), { signal });

      restoreDialog
        .querySelector("[data-restore-cancel]")
        .addEventListener("click", () => settle(false), { signal });

      restoreDialog.addEventListener(
        "cancel",
        (event) => {
          event.preventDefault();
          settle(false);
        },
        { signal },
      );

      restoreDialog.addEventListener(
        "click",
        (event) => {
          if (event.target === restoreDialog) settle(false);
        },
        { signal },
      );

      restoreDialog.showModal();
    });

  const setSectionStatuses = (nextStatuses) => {
    for (const section of STUDIO_SECTIONS) {
      const status = nextStatuses[section.id];
      const statusNode = root.querySelector(
        `[data-studio-nav-status="${section.id}"]`,
      );

      if (!statusNode || !status) continue;

      statusNode.textContent = status;
      statusNode.dataset.statusTone = getSectionStatusTone(status);
    }
  };

  return {
    renderWorkspace(sectionId, workspaceMarkup = "") {
      root.querySelector("[data-studio-content]").innerHTML =
        workspaceMarkup || placeholderMarkup(sectionId);

      if (latestDraftSnapshot) {
        applyDraftSnapshot(latestDraftSnapshot);
      }
    },
    setSectionStatuses,
    setAssetLibraryState({ pending = 0, total = 0 } = {}) {
      if (!assetStatusNode) return;
      assetStatusNode.textContent =
        pending > 0
          ? `${pending} pending`
          : `${total} managed`;
      assetStatusNode.dataset.statusTone =
        pending > 0 ? "modified" : "complete";
    },
    setDraftState: applyDraftSnapshot,
    setDraftError(message) {
      applyDraftSnapshot({
        persistenceStatus: "error",
        isModified: false,
        lastSavedAt: null,
        staleDraft: false,
        errorMessage: message,
      });
    },
    confirmRestoreLive,
  };
};
