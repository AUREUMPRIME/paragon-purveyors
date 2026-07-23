import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  createEditorFieldRegistry,
  EDITOR_DEFERRED_VISUAL_PATHS,
  EDITOR_READ_ONLY_PATHS,
} from "../src/live-pdf-studio/editor-field-registry.js";
import {
  renderFieldControl,
} from "../src/live-pdf-studio/editor-controls.js";
import {
  parseEditorInputValue,
} from "../src/live-pdf-studio/editor-controller.js";
import {
  validateStudioDraft,
} from "../src/live-pdf-studio/editor-validation.js";
import {
  STUDIO_SECTION_STATUS,
} from "../src/live-pdf-studio/status-model.js";
import {
  createAutosaveController,
} from "../src/live-pdf-studio/autosave-controller.js";
import {
  createStudioState,
} from "../src/live-pdf-studio/state.js";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");

const read = (relativePath) =>
  fs.readFile(path.join(projectRoot, relativePath), "utf8");

const createAssetReference = (assetId) => ({
  assetId,
  visible: true,
  alt: assetId,
  fit: "contain",
  zoom: 1,
  focusX: 50,
  focusY: 50,
});

const createFixture = () => ({
  schemaVersion: 1,
  documentId: "monthly-specials",
  revision: 1,
  updatedAt: "2026-07-23T00:00:00.000Z",
  updatedBy: "test",
  page: {
    maxActiveSpecials: 4,
  },
  theme: {
    accentColor: "#c92b32",
  },
  header: {
    brandMark: createAssetReference("brand-mark"),
    wordmark: createAssetReference("wordmark"),
    deliveryMessage: {
      value: "Free delivery",
      visible: true,
    },
    campaignMark: createAssetReference("campaign"),
    campaignTitle: {
      line1: "World Cup",
      line2: "Deals",
      visible: true,
    },
    month: {
      value: "July",
      visible: true,
    },
    year: {
      value: "2026",
      visible: true,
    },
    supportingLine: {
      value: "",
      visible: false,
    },
  },
  specials: [
    ["tenderloin", "dual-offer"],
    ["ribeye", "dual-offer"],
    ["striploin", "dual-offer"],
    ["tri-tip", "single-offer"],
  ].map(([id, offerMode], index) => ({
    id,
    sort: index + 1,
    active: true,
    offerMode,
    displayName: id,
    brand: "Black Opal",
    brandLogo: createAssetReference(`${id}-brand`),
    productLine: "Australian Wagyu",
    marblingScore: "MB 5+",
    quantityAvailable: "Available",
    primaryOffer: {
      label: "Primary offer",
      price: 20 + index,
      image: createAssetReference(`${id}-primary`),
    },
    ...(offerMode === "dual-offer"
      ? {
          secondaryOffer: {
            label: "Secondary offer",
            price: 100 + index,
            image: createAssetReference(`${id}-secondary`),
          },
        }
      : {}),
    savingsMessage: "Special value",
    description: "Description",
  })),
  contacts: {
    instruction: "Contact your nearest representative.",
    items: [
      {
        id: "blake",
        sort: 1,
        active: true,
        name: "Blake B.",
        location: "Orange County",
        phone: "(949) 303-9726",
        email: "blake@paragonpurveyors.com",
      },
      {
        id: "clayton",
        sort: 2,
        active: true,
        name: "Clayton U.",
        location: "Temecula",
        phone: "(951) 414-5230",
        email: "clay@paragonpurveyors.com",
      },
    ],
  },
  footer: {
    message: "Wholesale pricing is available.",
    disclaimer: "Pricing and availability are subject to change.",
    buttonLabel: "Paragon Purveyors",
    url: "https://paragonpurveyors.com",
    broll: createAssetReference("footer"),
  },
  assetLibrary: {},
  publication: {
    profile: "monthly-specials-v1",
  },
});

test("field registry locks all 78 content bindings and section totals", () => {
  const registry = createEditorFieldRegistry(createFixture());

  assert.equal(registry.fields.length, 78);
  assert.equal(registry.bySection.header.length, 11);
  assert.equal(registry.bySection.cuts.length, 50);
  assert.equal(registry.bySection.contacts.length, 13);
  assert.equal(registry.bySection.footer.length, 4);
  assert.equal(registry.byKey.size, 78);
});

test("field registry excludes identities, offer mode, geometry, publication, and visual references", () => {
  const registry = createEditorFieldRegistry(createFixture());
  const keys = registry.fields.map((field) => field.key);

  for (const forbidden of [
    "documentId",
    "page",
    "publication",
    "assetLibrary",
    "specials[0].id",
    "specials[0].offerMode",
    "specials[0].brandLogo",
    "specials[0].primaryOffer.image",
    "footer.broll",
  ]) {
    assert.equal(keys.includes(forbidden), false, forbidden);
  }

  assert.ok(EDITOR_READ_ONLY_PATHS.includes("specials[].offerMode"));
  assert.ok(
    EDITOR_DEFERRED_VISUAL_PATHS.includes(
      "specials[].primaryOffer.image",
    ),
  );
});

test("reusable controls render accessible labels and canonical field paths", () => {
  const draft = createFixture();
  const registry = createEditorFieldRegistry(draft);
  const textField = registry.byKey.get(
    "header.deliveryMessage.value",
  );
  const checkboxField = registry.byKey.get(
    "header.deliveryMessage.visible",
  );

  const textMarkup = renderFieldControl({
    field: textField,
    draft,
  });
  const checkboxMarkup = renderFieldControl({
    field: checkboxField,
    draft,
  });

  assert.match(textMarkup, /<label for="editor-header-deliveryMessage-value">/);
  assert.match(
    textMarkup,
    /data-editor-field="header\.deliveryMessage\.value"/,
  );
  assert.match(textMarkup, /aria-describedby=/);
  assert.match(checkboxMarkup, /type="checkbox"/);
  assert.match(checkboxMarkup, /checked/);
});

test("canonical launch profile validates as complete", () => {
  const document = createFixture();
  const validation = validateStudioDraft({
    draft: structuredClone(document),
    liveDocument: document,
  });

  assert.equal(validation.issues.length, 0);
  assert.equal(
    validation.statuses.header,
    STUDIO_SECTION_STATUS.COMPLETE,
  );
  assert.equal(
    validation.statuses.cuts,
    STUDIO_SECTION_STATUS.COMPLETE,
  );
  assert.equal(
    validation.statuses.contacts,
    STUDIO_SECTION_STATUS.COMPLETE,
  );
  assert.equal(
    validation.statuses.footer,
    STUDIO_SECTION_STATUS.COMPLETE,
  );
});

test("validation distinguishes missing values from format and structural errors", () => {
  const liveDocument = createFixture();
  const draft = structuredClone(liveDocument);

  draft.header.deliveryMessage.value = "";
  draft.contacts.items[0].email = "invalid";
  draft.specials[1].sort = 1;

  const validation = validateStudioDraft({
    draft,
    liveDocument,
  });

  assert.equal(
    validation.fieldIssues["header.deliveryMessage.value"].kind,
    "missing",
  );
  assert.equal(
    validation.fieldIssues["contacts.items[0].email"].kind,
    "error",
  );
  assert.equal(
    validation.fieldIssues["specials[1].sort"].kind,
    "error",
  );
  assert.equal(
    validation.statuses.header,
    STUDIO_SECTION_STATUS.MISSING,
  );
  assert.equal(
    validation.statuses.contacts,
    STUDIO_SECTION_STATUS.ERROR,
  );
  assert.equal(
    validation.statuses.cuts,
    STUDIO_SECTION_STATUS.ERROR,
  );
});

test("valid draft changes derive Modified status without changing protected sections", () => {
  const liveDocument = createFixture();
  const draft = structuredClone(liveDocument);
  draft.footer.message = "Updated footer message";

  const validation = validateStudioDraft({
    draft,
    liveDocument,
  });

  assert.equal(
    validation.statuses.footer,
    STUDIO_SECTION_STATUS.MODIFIED,
  );
  assert.equal(
    validation.statuses.overview,
    STUDIO_SECTION_STATUS.MODIFIED,
  );
  assert.equal(
    validation.statuses.logos,
    STUDIO_SECTION_STATUS.MISSING,
  );
  assert.equal(
    validation.statuses.assets,
    STUDIO_SECTION_STATUS.MODIFIED,
  );
  assert.equal(
    validation.statuses.review,
    STUDIO_SECTION_STATUS.ERROR,
  );
});

test("numeric input parsing preserves empty and invalid states without coercing to zero", () => {
  const field = {
    label: "Primary price",
    control: "number",
  };

  assert.deepEqual(
    parseEditorInputValue({
      field,
      element: { value: "" },
    }),
    {
      accepted: true,
      value: null,
      error: "",
    },
  );

  const invalid = parseEditorInputValue({
    field,
    element: { value: "not-a-price" },
  });

  assert.equal(invalid.accepted, false);
  assert.equal(invalid.value, null);
  assert.match(invalid.error, /valid number/);

  assert.deepEqual(
    parseEditorInputValue({
      field,
      element: { value: "21.50" },
    }),
    {
      accepted: true,
      value: 21.5,
      error: "",
    },
  );
});

test("edit then revert before autosave reconciles saved status and cancels the obsolete timer", async () => {
  const callbacks = new Map();
  let nextTimerId = 1;
  const writes = [];

  const state = createStudioState({
    liveDocument: createFixture(),
    baseMainSha: "base-sha",
    now: () => "2026-07-23T00:00:00.000Z",
  });

  const store = {
    async saveDraft(record) {
      writes.push(record);
    },
    async clearDraft() {},
    async close() {},
  };

  const controller = createAutosaveController({
    state,
    store,
    now: () => "2026-07-23T00:00:01.000Z",
    setTimeoutImpl(callback, delay) {
      const id = nextTimerId;
      nextTimerId += 1;
      callbacks.set(id, { callback, delay });
      return id;
    },
    clearTimeoutImpl(id) {
      callbacks.delete(id);
    },
  });

  const path = [
    "header",
    "deliveryMessage",
    "value",
  ];

  state.setValue(path, "Saved proof");
  await controller.saveNow();

  assert.equal(writes.length, 1);
  assert.equal(
    state.getSnapshot().persistenceStatus,
    "saved",
  );

  state.setValue(path, "Transient proof");

  assert.equal(
    state.getSnapshot().persistenceStatus,
    "dirty",
  );
  assert.equal(callbacks.size, 1);
  assert.equal(controller.hasPendingAutosave(), true);

  state.setValue(path, "Saved proof");

  assert.equal(
    state.getSnapshot().persistenceStatus,
    "saved",
  );
  assert.equal(
    state.getSnapshot().hasUnsavedChanges,
    false,
  );
  assert.equal(callbacks.size, 0);
  assert.equal(controller.hasPendingAutosave(), false);
  assert.equal(writes.length, 1);

  await controller.dispose();
});

test("Studio integration wires four editors, validation, autosave reuse, and 73 contracts", async () => {
  const [
    main,
    shell,
    styles,
    packageText,
    state,
    store,
    autosave,
  ] = await Promise.all([
    read("src/live-pdf-studio/main.js"),
    read("src/live-pdf-studio/shell.js"),
    read("src/live-pdf-studio/styles.css"),
    read("package.json"),
    read("src/live-pdf-studio/state.js"),
    read("src/live-pdf-studio/draft-store.js"),
    read("src/live-pdf-studio/autosave-controller.js"),
  ]);

  const packageJson = JSON.parse(packageText);

  assert.match(main, /createEditorController/);
  assert.match(main, /editableBindings: 78/);
  assert.match(shell, /setSectionStatuses/);
  assert.match(shell, /data-studio-nav-status/);
  assert.match(styles, /editor-panel/);
  assert.match(styles, /editor-grid--cut/);
  assert.match(
    packageJson.scripts["test:specials:contracts"],
    /tests\/live-pdf-studio-editors\.test\.mjs/,
  );

  assert.doesNotMatch(state, /Phase 3\.3/);
  assert.doesNotMatch(store, /Phase 3\.3/);
  assert.doesNotMatch(autosave, /Phase 3\.3/);
  assert.doesNotMatch(main, /localStorage\.setItem|git push|gh workflow/i);
});
