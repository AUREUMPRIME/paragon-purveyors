import assert from "node:assert/strict";
import test from "node:test";

import { getBootstrap } from "../src/studio/bootstrap.js";
import { buildPublicationChanges, StudioValidationError, validateStudioPayload } from "../src/studio/validate.js";
import { readJsonRequest, RequestValidationError, validateUploadFile } from "../src/validate-upload.js";

const SHA = "a".repeat(40);
const UUID = "123e4567-e89b-42d3-a456-426614174000";
const documentFixture = () => ({
  schemaVersion: 1,
  documentId: "monthly-specials",
  revision: 1,
  page: { widthPx: 816, heightPx: 1344 },
  specials: [{ id: "tenderloin" }],
  assetLibrary: {},
});


test("Studio validation accepts the canonical document, catalog, and current main", () => {
  const result = validateStudioPayload({ document: documentFixture(), assetCatalog: {}, baseMainSha: SHA }, { currentMainSha: SHA });
  assert.equal(result.valid, true);
  assert.equal(result.baseMainSha, SHA);
  assert.equal(Object.isFrozen(result), true);
});

test("Studio validation rejects stale main before publication work", () => {
  assert.throws(() => validateStudioPayload({ document: documentFixture(), assetCatalog: {}, baseMainSha: SHA }, { currentMainSha: "b".repeat(40) }), (error) => error instanceof StudioValidationError && error.code === "STALE_MAIN" && error.status === 409);
});

test("Studio validation rejects missing document and asset objects", () => {
  assert.throws(() => validateStudioPayload({ baseMainSha: SHA }), /document must be an object/u);
  assert.throws(() => validateStudioPayload({ document: documentFixture(), baseMainSha: SHA }), /assetCatalog must be an object/u);
});

test("Studio validation locks schema identity and exact page geometry", () => {
  for (const mutate of [
    (value) => { value.schemaVersion = 2; },
    (value) => { value.documentId = "other"; },
    (value) => { value.page.widthPx = 815; },
  ]) {
    const document = documentFixture(); mutate(document);
    assert.throws(() => validateStudioPayload({ document, assetCatalog: {}, baseMainSha: SHA }), /validation failed/u);
  }
});

test("Publication changes contain only canonical source when no upload exists", async () => {
  const changes = await buildPublicationChanges({ document: documentFixture(), assetCatalog: {}, files: [], fileMetadata: {} });
  assert.equal(changes.length, 1);
  assert.equal(changes[0].path, "src/data/paragon-live-pdf-studio.json");
  assert.equal(changes[0].encoding, "utf-8");
  assert.match(changes[0].content, /monthly-specials/u);
});

test("Bootstrap reads current main, canonical source, catalog, publication, and limits", async () => {
  const calls = [];
  const client = { request: async (endpoint) => { calls.push(endpoint); return { content: btoa(JSON.stringify({ ...documentFixture(), assetLibrary: { asset_a: { id: "asset_a" } } })) }; } };
  const result = await getBootstrap({}, {
    tokenProvider: { getToken: async () => "token-value-abcdefghijklmnop" },
    createClient: () => client,
    createDatabase: () => ({ getMainReference: async () => ({ sha: SHA }) }),
    getLatestPublicationSummary: async () => ({ runId: 7, status: "completed", conclusion: "success" }),
  });
  assert.equal(result.currentMainSha, SHA);
  assert.equal(result.assetCatalog.asset_a.id, "asset_a");
  assert.equal(result.publication.runId, 7);
  assert.equal(result.limits.validationPerHour, 60);
  assert.match(calls[0], /contents\/src\/data\/paragon-live-pdf-studio\.json\?ref=/u);
});

test("Bootstrap result is immutable and exposes no credential fields", async () => {
  const result = await getBootstrap({}, {
    tokenProvider: { getToken: async () => "secret-token-value-abcdefghijklmnop" },
    createClient: () => ({ request: async () => ({ content: btoa(JSON.stringify(documentFixture())) }) }),
    createDatabase: () => ({ getMainReference: async () => ({ sha: SHA }) }),
    getLatestPublicationSummary: async () => null,
  });
  assert.equal(Object.isFrozen(result), true);
  assert.doesNotMatch(JSON.stringify(result), /secret-token|private|jwt/iu);
});

test("JSON request reader accepts application JSON within one MiB", async () => {
  const request = new Request("https://worker.test/v1/studio/validate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ok: true }) });
  assert.deepEqual(await readJsonRequest(request), { ok: true });
});

test("JSON request reader rejects unsupported content type", async () => {
  await assert.rejects(readJsonRequest(new Request("https://worker.test", { method: "POST", headers: { "content-type": "text/plain" }, body: "{}" })), (error) => error instanceof RequestValidationError && error.status === 415);
});

test("JSON request reader rejects bodies above the configured limit", async () => {
  await assert.rejects(readJsonRequest(new Request("https://worker.test", { method: "POST", headers: { "content-type": "application/json", "content-length": "10" }, body: "{}" }), 5), (error) => error.status === 413);
});

test("Upload validator accepts supported raster files and rejects unsupported MIME", async () => {
  const accepted = await validateUploadFile(new File([new Uint8Array([1, 2, 3])], "photo.webp", { type: "image/webp" }));
  assert.equal(accepted.type, "image/webp");
  await assert.rejects(validateUploadFile(new File(["x"], "file.gif", { type: "image/gif" })), (error) => error.status === 415);
});

test("Upload validator rejects active SVG content", async () => {
  await assert.rejects(validateUploadFile(new File(["<svg><script>alert(1)</script></svg>"], "mark.svg", { type: "image/svg+xml" })), (error) => error.code === "INVALID_SVG");
});
