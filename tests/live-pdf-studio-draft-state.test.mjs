import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  createAutosaveController,
  DEFAULT_AUTOSAVE_DEBOUNCE_MS,
} from "../src/live-pdf-studio/autosave-controller.js";
import {
  DRAFT_DATABASE_NAME,
  DRAFT_DATABASE_VERSION,
  DRAFT_STORE_NAMES,
  createDraftStore,
} from "../src/live-pdf-studio/draft-store.js";
import {
  cloneDocument,
  createStudioState,
  deepFreeze,
} from "../src/live-pdf-studio/state.js";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");

const read = (relativePath) =>
  fs.readFile(path.join(projectRoot, relativePath), "utf8");

const createDocument = () => ({
  schemaVersion: 1,
  documentId: "monthly-specials",
  revision: 1,
  header: {
    supportingLine: {
      value: "",
      visible: false,
    },
  },
  specials: [{ id: "tenderloin", active: true }],
});

test("live baseline is deeply frozen and editable clones remain independent", () => {
  const source = createDocument();
  const frozen = deepFreeze(cloneDocument(source));
  const draft = cloneDocument(frozen);

  assert.equal(Object.isFrozen(frozen), true);
  assert.equal(Object.isFrozen(frozen.header), true);
  assert.equal(Object.isFrozen(frozen.specials), true);

  draft.header.supportingLine.value = "Local draft";

  assert.equal(
    frozen.header.supportingLine.value,
    "",
  );
});

test("Studio state updates the draft without mutating the live baseline", () => {
  const state = createStudioState({
    liveDocument: createDocument(),
    baseMainSha: "base-sha",
    now: () => "2026-07-23T00:00:00.000Z",
  });

  state.setValue(
    ["header", "supportingLine", "value"],
    "Autosave proof",
  );

  assert.equal(
    state.getDraft().header.supportingLine.value,
    "Autosave proof",
  );
  assert.equal(
    state.getLiveBaseline().header.supportingLine.value,
    "",
  );
  assert.equal(state.getSnapshot().isModified, true);
  assert.equal(
    state.getSnapshot().persistenceStatus,
    "dirty",
  );
});

test("compatible stored drafts restore while incompatible drafts fail safe", () => {
  const document = createDocument();
  const compatibleDocument = cloneDocument(document);
  compatibleDocument.header.supportingLine.value =
    "Stored locally";

  const restored = createStudioState({
    liveDocument: document,
    baseMainSha: "new-main",
    storedRecord: {
      document: compatibleDocument,
      metadata: {
        baseMainSha: "old-main",
        baseRevision: 1,
        createdAt: "2026-07-22T00:00:00.000Z",
        updatedAt: "2026-07-22T01:00:00.000Z",
        validationResults: [],
      },
    },
  });

  assert.equal(
    restored.getDraft().header.supportingLine.value,
    "Stored locally",
  );
  assert.equal(restored.getSnapshot().staleDraft, true);
  assert.equal(restored.getSnapshot().restoredStoredDraft, true);

  const rejected = createStudioState({
    liveDocument: document,
    baseMainSha: "new-main",
    storedRecord: {
      document: {
        ...compatibleDocument,
        schemaVersion: 999,
      },
      metadata: {
        baseMainSha: "old-main",
        baseRevision: 1,
      },
    },
  });

  assert.equal(
    rejected.getDraft().header.supportingLine.value,
    "",
  );
  assert.equal(rejected.getSnapshot().rejectedStoredDraft, true);
});

test("draft store locks the IndexedDB database and three-store contract", () => {
  assert.equal(
    DRAFT_DATABASE_NAME,
    "paragon-live-pdf-studio",
  );
  assert.equal(DRAFT_DATABASE_VERSION, 1);
  assert.deepEqual(
    Object.values(DRAFT_STORE_NAMES).sort(),
    ["documents", "metadata", "uploads"],
  );
  assert.throws(
    () => createDraftStore({ indexedDB: null }),
    /IndexedDB is unavailable/,
  );
});

test("autosave debounces mutations and manual save flushes immediately", async () => {
  const callbacks = new Map();
  let nextTimerId = 1;
  const writes = [];

  const state = createStudioState({
    liveDocument: createDocument(),
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

  state.setValue(
    ["header", "supportingLine", "value"],
    "First",
  );
  state.setValue(
    ["header", "supportingLine", "value"],
    "Second",
  );

  assert.equal(callbacks.size, 1);
  assert.equal(
    [...callbacks.values()][0].delay,
    DEFAULT_AUTOSAVE_DEBOUNCE_MS,
  );

  await controller.saveNow();

  assert.equal(callbacks.size, 0);
  assert.equal(writes.length, 1);
  assert.equal(
    writes[0].document.header.supportingLine.value,
    "Second",
  );
  assert.equal(
    state.getSnapshot().persistenceStatus,
    "saved",
  );

  await controller.dispose();
});

test("Studio integration connects canonical loading, IndexedDB, status, restore, and 64 contracts", async () => {
  const [main, shell, status, packageText] =
    await Promise.all([
      read("src/live-pdf-studio/main.js"),
      read("src/live-pdf-studio/shell.js"),
      read("src/live-pdf-studio/status-model.js"),
      read("package.json"),
    ]);

  const packageJson = JSON.parse(packageText);

  assert.match(main, /loadCanonicalDocument/);
  assert.match(main, /createDraftStore/);
  assert.match(main, /createAutosaveController/);
  assert.match(main, /beforeunload/);
  assert.match(shell, /data-restore-live-dialog/);
  assert.match(shell, /data-draft-status-label/);
  assert.match(status, /DIRTY: "dirty"/);
  assert.match(status, /SAVED: "saved"/);
  assert.match(
    packageJson.scripts["test:specials:contracts"],
    /tests\/live-pdf-studio-draft-state\.test\.mjs/,
  );

  assert.doesNotMatch(main, /localStorage\.setItem/);
  assert.doesNotMatch(main, /git|github|publish\(/i);
});
