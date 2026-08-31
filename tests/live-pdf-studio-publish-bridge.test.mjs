import assert from "node:assert/strict";
import test from "node:test";

import { createStudioApiClient } from "../src/live-pdf-studio/api-client.js";
import {
  createPublishFormData,
} from "../src/live-pdf-studio/publish-payload.js";
import {
  createPublishController,
  PUBLICATION_STATE,
} from "../src/live-pdf-studio/publish-controller.js";
import {
  createReviewValidation,
} from "../src/live-pdf-studio/review-validation.js";
import { fingerprintDocument } from "../src/live-pdf-studio/state.js";

const SHA = "a".repeat(40);
const UUID = "123e4567-e89b-42d3-a456-426614174000";

class FakeFormData {
  constructor() {
    this.items = [];
  }

  append(...args) {
    this.items.push(args);
  }

  get(name) {
    return this.items.find(([key]) => key === name)?.[1] ?? null;
  }

  getAll(name) {
    return this.items
      .filter(([key]) => key === name)
      .map(([, value]) => value);
  }
}

class FakeFile extends Blob {
  constructor(parts, name, options = {}) {
    super(parts, options);
    this.name = name;
  }
}

const response = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({
    "content-type": "application/json",
  }),
  json: async () => payload,
});

test("API client adds validate publish and publication-status routes without forcing multipart Content-Type", async () => {
  const calls = [];
  const client = createStudioApiClient({
    baseUrl: "https://studio.example",
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return response({ valid: true });
    },
  });

  await client.validate("token", {
    document: {},
    assetCatalog: {},
    baseMainSha: SHA,
  });

  assert.equal(calls[0].url, "https://studio.example/v1/studio/validate");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers.get("Content-Type"), "application/json");
  assert.equal(calls[0].init.headers.get("Authorization"), "Bearer token");

  const formData = new FormData();
  await client.publish("token", formData);
  assert.equal(calls[1].url, "https://studio.example/v1/studio/publish");
  assert.equal(calls[1].init.method, "POST");
  assert.equal(calls[1].init.headers.get("Content-Type"), null);
  assert.equal(calls[1].init.body, formData);

  await client.publicationStatus("token", UUID);
  assert.equal(
    calls[2].url,
    `https://studio.example/v1/studio/publish/${UUID}`,
  );
  assert.equal(calls[2].init.method, "GET");
});

test("publication payload uses canonical content-addressed filenames and public repository asset paths", () => {
  const assetId = "asset_ribeye_72380d229204";
  const document = {
    documentId: "monthly-specials",
    assetLibrary: {
      [assetId]: {
        id: assetId,
        path:
          "assets/specials/library/ribeye/" +
          "ribeye-whole-cut-upload-test-72380d229204.webp",
      },
    },
  };

  const result = createPublishFormData({
    document,
    baseMainSha: SHA,
    publishId: UUID,
    uploads: [
      {
        assetId,
        blob: new Blob(["ribeye"], { type: "image/webp" }),
        metadata: document.assetLibrary[assetId],
      },
    ],
    FormDataImpl: FakeFormData,
    FileImpl: FakeFile,
  });

  const metadata = JSON.parse(result.formData.get("fileMetadata"));
  const file =
    result.formData.getAll("files[]")[0];

  assert.deepEqual(metadata[file.name], {
    assetId,
    path:
      "public/assets/specials/library/ribeye/" +
      "ribeye-whole-cut-upload-test-72380d229204.webp",
  });
  assert.equal(
    file.name,
    "ribeye-whole-cut-upload-test-72380d229204.webp",
  );
  assert.deepEqual(result.uploadAssetIds, [assetId]);
});

test("Review secure-publishing warning follows runtime publication availability", () => {
  const unavailable = createReviewValidation({
    publishingEnabled: false,
  });
  const available = createReviewValidation({
    publishingEnabled: true,
  });

  assert.equal(unavailable.warningCount, 1);
  assert.match(
    unavailable.warnings[0].message,
    /Publishing is currently disabled/,
  );
  assert.equal(available.warningCount, 0);
});

const createControllerFixture = ({
  validationError = null,
  publicationStatuses = [{ status: "success" }],
} = {}) => {
  const draft = {
    schemaVersion: 1,
    documentId: "monthly-specials",
    revision: 1,
    page: { widthPx: 816, heightPx: 1344 },
    specials: [{ id: "ribeye" }],
    assetLibrary: {},
  };

  const shellStates = [];
  const order = [];
  let cleared = false;
  let reloaded = false;
  let statusIndex = 0;

  const controller = createPublishController({
    apiClient: {
      validate: async () => {
        order.push("validate");
        if (validationError) throw validationError;
        return { valid: true, currentMainSha: SHA };
      },
      publish: async (_token, formData) => {
        order.push("publish");
        const publishId = formData.get("publishId");
        return {
          accepted: true,
          publishId,
          status: "queued",
        };
      },
      publicationStatus: async (_token, publishId) => {
        order.push("status");
        const current = publicationStatuses[
          Math.min(statusIndex++, publicationStatuses.length - 1)
        ];
        return { publishId, ...current };
      },
    },
    authController: {
      getSession: () => ({ accessToken: "token" }),
    },
    shell: {
      setPublishingState: (value) => shellStates.push(value),
      confirmPublishLive: async () => {
        order.push("confirm");
        return true;
      },
    },
    state: {
      getDraft: () => structuredClone(draft),
      getSnapshot: () => ({
        documentId: "monthly-specials",
        baseMainSha: SHA,
      }),
    },
    store: {
      listUploads: async () => {
        order.push("uploads");
        return [];
      },
      clearDraft: async () => {
        order.push("clear");
        cleared = true;
      },
    },
    reviewController: {
      open: async () => {
        order.push("review");
        return {
          isValid: true,
          errorCount: 0,
          draftFingerprint: fingerprintDocument(draft),
        };
      },
    },
    reload: async () => {
      order.push("reload");
      reloaded = true;
    },
    sleep: async () => {},
    pollIntervalMs: 0,
    maxPollAttempts: 10,
  });

  return {
    controller,
    order,
    shellStates,
    wasCleared: () => cleared,
    wasReloaded: () => reloaded,
  };
};

test("publish controller is inert while the Worker publication gate is off", async () => {
  const fixture = createControllerFixture();
  fixture.controller.setAvailability(false);

  const result = await fixture.controller.publish();

  assert.equal(result.accepted, false);
  assert.equal(result.reason, "PUBLISHING_DISABLED");
  assert.deepEqual(fixture.order, []);
  assert.equal(
    fixture.controller.getState().state,
    PUBLICATION_STATE.DISABLED,
  );
});

test("publish controller reviews validates confirms publishes polls then clears and reloads only on terminal success", async () => {
  const fixture = createControllerFixture({
    publicationStatuses: [
      { status: "building" },
      { status: "verifying" },
      { status: "success" },
    ],
  });

  fixture.controller.setAvailability(true);
  const result = await fixture.controller.publish();

  assert.equal(result.accepted, true);
  assert.equal(result.status, "success");
  assert.deepEqual(fixture.order, [
    "review",
    "validate",
    "confirm",
    "uploads",
    "publish",
    "status",
    "status",
    "status",
    "clear",
    "reload",
  ]);
  assert.equal(fixture.wasCleared(), true);
  assert.equal(fixture.wasReloaded(), true);
});

test("STALE_MAIN preserves the local draft and pending uploads", async () => {
  const error = new Error("stale");
  error.code = "STALE_MAIN";

  const fixture = createControllerFixture({
    validationError: error,
  });

  fixture.controller.setAvailability(true);
  const result = await fixture.controller.publish();

  assert.equal(result.accepted, false);
  assert.equal(result.reason, "STALE_MAIN");
  assert.equal(fixture.wasCleared(), false);
  assert.equal(fixture.wasReloaded(), false);
  assert.deepEqual(fixture.order, ["review", "validate"]);
  assert.equal(
    fixture.controller.getState().state,
    PUBLICATION_STATE.CONFLICT,
  );
});
