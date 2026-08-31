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
      "Manage the current Monthly Specials draft and review it before publishing.",
  },
  header: {
    eyebrow: "Document Header",
    title: "Header & Campaign",
    copy:
      "Update campaign messaging, month, year, supporting copy, and brand presentation.",
  },
  cuts: {
    eyebrow: "Product Content",
    title: "Featured Cuts",
    copy:
      "Update product details, pricing, offers, availability, descriptions, and images.",
  },
  logos: {
    eyebrow: "Brand Assets",
    title: "Logos & Marks",
    copy:
      "Adjust brand marks, campaign artwork, product logos, and image presentation.",
  },
  contacts: {
    eyebrow: "Ordering Contacts",
    title: "Contacts",
    copy:
      "Update ordering instructions and representative contact details.",
  },
  footer: {
    eyebrow: "Closing Content",
    title: "Footer",
    copy:
      "Update closing copy, disclaimer, destination link, and footer imagery.",
  },
  assets: {
    eyebrow: "Managed Media",
    title: "Asset Library",
    copy:
      "Upload, organize, and assign reusable images and logos.",
  },
  review: {
    eyebrow: "Final Approval",
    title: "Review & Publish",
    copy:
      "Preview the complete Monthly Specials page, resolve any issues, and confirm it is ready.",
  },
});

const primaryActions = Object.freeze([
  { id: "assets", label: "Asset Library", action: "open-assets" },
  {
    id: "restore",
    label: "Restore Live Version",
    action: "restore-live",
    disabled: true,
    title: "Restore the draft to the current live version.",
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
      "Publishing is currently disabled for this Studio session.",
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
  const overview = sectionId === "overview";

  return `
    <section
      class="studio-workspace${overview ? " studio-workspace--overview" : ""}"
      data-workspace="${sectionId}"
    >
      <header class="workspace-header">
        <div>
          <p class="workspace-eyebrow">${content.eyebrow}</p>
          <h1>${content.title}</h1>
          <p>${content.copy}</p>
        </div>
        <span class="workspace-phase">Live Studio</span>
      </header>

      <div class="workspace-grid${overview ? " workspace-grid--overview" : ""}">
        <article class="workspace-card workspace-card--primary">
          <p class="workspace-card__eyebrow">Current Draft</p>
          <h2>Continue editing.</h2>
          <p>
            Update product details, imagery, contacts, and supporting content
            from one place.
          </p>
        </article>

        <article class="workspace-card">
          <p class="workspace-card__eyebrow">Review PDF</p>
          <h2>Preview before publishing.</h2>
          <p>
            Open Review PDF to inspect the complete Monthly Specials page and
            resolve any issues.
          </p>
        </article>

        <article class="workspace-card">
          <p class="workspace-card__eyebrow">Draft Status</p>
          <h2 data-workspace-draft-label>Loading draft.</h2>
          <p data-workspace-draft-detail>
            Checking saved draft status.
          </p>
        </article>
      </div>
    </section>
  `;
};

export const renderStudioShell = ({ root, statuses }) => {
  root.innerHTML = `
    <div class="studio-shell" data-studio-auth>
      <aside class="studio-sidebar">
        <a class="studio-brand" href="/" aria-label="Paragon Purveyors home">
          <img class="studio-brand__mark" src="/assets/brand/paragon-cow-mark.svg" alt="" aria-hidden="true">
          <span>
            <strong>Paragon Purveyors</strong>
            <small>Live PDF Studio</small>
          </span>
        </a>

        <div class="studio-sidebar__footer">
          <span class="connection-dot" aria-hidden="true"></span>
          <div>
            <strong>Secure Studio</strong>
            <small>Authentication required</small>
          </div>
        </div>
      </aside>

      <main class="studio-main">
        <div class="studio-content">
          <section class="studio-workspace">
            <header class="workspace-header">
              <div>
                <p class="workspace-eyebrow">Private Administration</p>
                <h1>Live PDF Studio</h1>
                <p>
                  Sign in to manage Monthly Specials content, images, and
                  saved drafts.
                </p>
              </div>
              <span class="workspace-phase">Secure Access</span>
            </header>

            <div class="workspace-grid">
              <form
                class="workspace-card workspace-card--primary"
                data-studio-auth-form
              >
                <p class="workspace-card__eyebrow">Studio authentication</p>
                <h2>Enter the Studio password.</h2>
                <p>
                  Use your Studio password to unlock this workspace.
                </p>

                <div class="asset-library-toolbar">
                  <label>
                    <span>Studio password</span>
                    <input
                      type="password"
                      name="password"
                      autocomplete="current-password"
                      data-studio-password
                      required
                    >
                  </label>
                  <button
                    class="studio-action studio-action--primary"
                    type="submit"
                    data-studio-login
                  >
                    Unlock Studio
                  </button>
                </div>

                <p
                  data-studio-auth-message
                  data-message-tone="neutral"
                  role="status"
                  aria-live="polite"
                >
                  Checking secure session…
                </p>
              </form>

              <article class="workspace-card">
                <p class="workspace-card__eyebrow">Private Session</p>
                <h2>Access stays in this window.</h2>
                <p>
                  Closing this Studio window ends the current signed-in
                  session.
                </p>
              </article>

              <article class="workspace-card">
                <p class="workspace-card__eyebrow">Saved Drafts</p>
                <h2>Your draft stays available.</h2>
                <p>
                  Saved edits and uploaded images remain available in this
                  browser between Studio sessions.
                </p>
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>

    <div
      class="studio-shell"
      data-studio-ready="true"
      data-studio-workspace
      hidden
    >
      <aside class="studio-sidebar">
        <a class="studio-brand" href="/" aria-label="Paragon Purveyors home">
          <img class="studio-brand__mark" src="/assets/brand/paragon-cow-mark.svg" alt="" aria-hidden="true">
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
            <strong>Live Studio</strong>
            <small>Publishing disabled</small>
          </div>
          <button
            type="button"
            class="studio-sidebar__credit"
            data-dave2-launch
            aria-label="Open Metadator entertainment module"
            title="Open Dave 2"
          >
            <img
              src="/assets/studio/metadator-prime-mascot.png"
              alt=""
              aria-hidden="true"
            >
          </button>
        </div>
      </aside>

      <main class="studio-main">
        <header class="studio-topbar">
          <div>
            <p class="studio-topbar__eyebrow">Monthly Specials</p>
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
            <small data-draft-status-detail>Checking saved draft status.</small>
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
              Upload, organize, assign, archive, and remove reusable images
              and logos from the Studio.
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
          Choose, upload, assign, archive, or remove assets as needed. Images
          currently used in the draft are protected from accidental removal.
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
              This replaces the current draft with the latest live version and
              clears the saved draft in this browser.
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
            <label class="review-fit-control">
              <span>Fit</span>
              <select
                data-review-fit-mode
                aria-label="Review PDF fit mode"
              >
                <option value="page">Fit Page</option>
                <option value="width">Fit Width</option>

              </select>
            </label>
            <span><strong data-review-scale>--</strong></span>
            <button type="button" data-review-close>Back to Edit</button>
            <button
              class="studio-action studio-action--primary"
              type="button"
              disabled
              title="Publishing is currently disabled for this Studio session."
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
                data-review-frame
                data-live-authority-src="/specials/monthly-specials.html"
              ></iframe>
            </div>
          </div>

          <aside
            class="review-validation"
            data-review-validation
            role="status"
            aria-live="polite"
          >
            <p class="workspace-eyebrow">Validation</p>
            <h3 data-review-summary>Preparing current draft…</h3>
            <p data-review-detail>
              Preparing the Monthly Specials preview.
            </p>
            <dl>
              <div><dt>Errors</dt><dd data-review-errors>--</dd></div>
              <div><dt>Warnings</dt><dd data-review-warnings>--</dd></div>
            </dl>
            <ol class="review-validation__issues" data-review-issues></ol>
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
  const authView = root.querySelector("[data-studio-auth]");
  const studioWorkspace = root.querySelector(
    "[data-studio-workspace]",
  );
  const authPassword = root.querySelector(
    "[data-studio-password]",
  );
  const authButton = root.querySelector("[data-studio-login]");
  const authMessage = root.querySelector(
    "[data-studio-auth-message]",
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
    setAuthState({
      authenticated = false,
      loading = false,
      message = "",
    } = {}) {
      authView.hidden = authenticated;
      studioWorkspace.hidden = !authenticated;
      authPassword.disabled = loading;
      authButton.disabled = loading;
      authMessage.textContent =
        message
        || (loading
          ? "Checking secure session…"
          : "Enter the Studio password.");
      authMessage.dataset.messageTone =
        message && !loading ? "error" : "neutral";
    },
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
