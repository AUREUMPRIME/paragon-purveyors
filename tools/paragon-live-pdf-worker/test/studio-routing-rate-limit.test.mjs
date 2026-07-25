import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../src/index.js";
import { createSessionRateKey, FixedWindowRateLimiter, PUBLISH_RATE_LIMIT, VALIDATION_RATE_LIMIT } from "../src/rate-limit.js";

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

const env = {
  ALLOWED_ORIGIN: "https://paragonpurveyors.com",
  LOCAL_ALLOWED_ORIGIN: "http://127.0.0.1:5190",
  PRODUCTION_PUBLISHING_ENABLED: "false",
};
const claims = Object.freeze({ sub: "paragon-admin", nonce: "nonce-value-1234567890" });
const options = { verifySessionToken: async () => claims };
const auth = { authorization: "Bearer token.value.signature", origin: env.ALLOWED_ORIGIN };

test("Session rate keys contain nonce and operation only", () => {
  assert.equal(createSessionRateKey(claims, "validate"), "session:nonce-value-1234567890:validate");
  assert.throws(() => createSessionRateKey({ nonce: "short" }, "validate"), /nonce/u);
});

test("Validation fixed window permits sixty and blocks sixty-one", () => {
  const limiter = new FixedWindowRateLimiter();
  for (let index = 0; index < 60; index += 1) assert.equal(limiter.consume("v", VALIDATION_RATE_LIMIT).allowed, true);
  assert.equal(limiter.consume("v", VALIDATION_RATE_LIMIT).allowed, false);
});

test("Publish fixed window permits ten and blocks eleven", () => {
  const limiter = new FixedWindowRateLimiter();
  for (let index = 0; index < 10; index += 1) assert.equal(limiter.consume("p", PUBLISH_RATE_LIMIT).allowed, true);
  assert.equal(limiter.consume("p", PUBLISH_RATE_LIMIT).allowed, false);
});

test("All four Studio routes reject missing bearer authentication", async () => {
  for (const [method, pathname] of [["GET", "/v1/studio/bootstrap"], ["POST", "/v1/studio/validate"], ["POST", "/v1/studio/publish"], ["GET", `/v1/studio/publish/${UUID}`]]) {
    const response = await handleRequest(new Request(`https://worker.test${pathname}`, { method }), env);
    assert.equal(response.status, 401);
  }
});

test("Authenticated bootstrap route returns service data", async () => {
  const response = await handleRequest(new Request("https://worker.test/v1/studio/bootstrap", { headers: auth }), env, { ...options, getBootstrap: async () => ({ currentMainSha: SHA, document: documentFixture() }) });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).currentMainSha, SHA);
});

test("Authenticated validate route returns a successful validation envelope", async () => {
  const body = { document: documentFixture(), assetCatalog: {}, baseMainSha: SHA };
  const response = await handleRequest(new Request("https://worker.test/v1/studio/validate", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(body) }), env, { ...options, currentMainSha: SHA });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).errors, []);
});

test("Validate route returns Retry-After when its session limit is exceeded", async () => {
  const limiter = { consume: () => ({ allowed: false, retryAfterSeconds: 17 }) };
  const response = await handleRequest(new Request("https://worker.test/v1/studio/validate", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: "{}" }), env, { ...options, limiter });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "17");
});

test("Authenticated publish route remains disabled unless the strict Worker gate is true", async () => {
  const form = new FormData();
  form.set("document", JSON.stringify(documentFixture()));
  form.set("assetCatalog", "{}");
  form.set("baseMainSha", SHA);
  form.set("publishId", UUID);
  form.set("commitMessage", "Publish monthly specials");
  form.set("fileMetadata", "{}");
  const response = await handleRequest(
    new Request("https://worker.test/v1/studio/publish", { method: "POST", headers: auth, body: form }),
    env,
    { ...options, publishStudioRevision: async () => { throw new Error("must not run"); } },
  );
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "PUBLISHING_DISABLED");
});

test("Authenticated publish route accepts validated multipart data", async () => {
  const form = new FormData();
  form.set("document", JSON.stringify(documentFixture())); form.set("assetCatalog", "{}"); form.set("baseMainSha", SHA); form.set("publishId", UUID); form.set("commitMessage", "Publish monthly specials"); form.set("fileMetadata", "{}");
  const response = await handleRequest(new Request("https://worker.test/v1/studio/publish", { method: "POST", headers: auth, body: form }), env, { ...options, productionPublishingEnabled: true, publishStudioRevision: async () => ({ accepted: true, publishId: UUID, status: "queued" }) });
  assert.equal(response.status, 202);
  assert.equal((await response.json()).status, "queued");
});

test("Publish route returns Retry-After when its session limit is exceeded", async () => {
  const form = new FormData();
  for (const [key, value] of Object.entries({ document: "{}", assetCatalog: "{}", baseMainSha: SHA, publishId: UUID, commitMessage: "Publish", fileMetadata: "{}" })) form.set(key, value);
  const response = await handleRequest(new Request("https://worker.test/v1/studio/publish", { method: "POST", headers: auth, body: form }), env, { ...options, productionPublishingEnabled: true, limiter: { consume: () => ({ allowed: false, retryAfterSeconds: 9 }) } });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "9");
});

test("Authenticated status route returns sanitized publication status", async () => {
  const response = await handleRequest(new Request(`https://worker.test/v1/studio/publish/${UUID}`, { headers: auth }), env, { ...options, readStudioPublishStatus: async () => ({ publishId: UUID, status: "building", runId: 10 }) });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, "building");
});

test("Authenticated status route returns 404 for unknown publication", async () => {
  const response = await handleRequest(new Request(`https://worker.test/v1/studio/publish/${UUID}`, { headers: auth }), env, { ...options, readStudioPublishStatus: async () => null });
  assert.equal(response.status, 404);
});

test("Unknown non-Studio routes retain hardened 404 behavior", async () => {
  const response = await handleRequest(new Request("https://worker.test/v1/studio/unknown", { headers: auth }), env, options);
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("cache-control"), "no-store");
});
