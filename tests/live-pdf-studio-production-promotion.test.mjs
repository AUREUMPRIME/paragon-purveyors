import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { cleanupStagingReference } from "../tools/paragon-live-pdf-workflow/cleanup-staging-reference.mjs";
import { prepareProductionPublication, PRODUCTION_METADATA_FILE } from "../tools/paragon-live-pdf-workflow/prepare-production-publication.mjs";
import { ProductionPromotionError, promoteProductionPublication } from "../tools/paragon-live-pdf-workflow/promote-production-publication.mjs";
import { verifyLivePublication } from "../tools/paragon-live-pdf-workflow/verify-live-publication.mjs";

const root = path.resolve(import.meta.dirname, "..");
const publishId = "123e4567-e89b-42d3-a456-426614174000";
const baseMainSha = "1".repeat(40);
const draftCommit = "2".repeat(40);
const draftTree = "3".repeat(40);
const finalTree = "4".repeat(40);
const finalCommit = "5".repeat(40);
const generatedAt = "2026-07-25T12:00:00.000Z";
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const inputs = {
  publish_id: publishId,
  draft_branch: `studio-publish/${publishId}`,
  draft_commit: draftCommit,
  base_main_sha: baseMainSha,
};

const createShadow = async (directory) => {
  await fs.mkdir(directory, { recursive: true });
  const canonical = await fs.readFile(path.join(root, "src/data/paragon-live-pdf-studio.json"));
  const html = Buffer.from(`${'<article class="special-card">x</article>'.repeat(4)}\n`, "utf8");
  const pdf = Buffer.from("%PDF-1.7\n1 0 obj << /Type /Page /MediaBox [0 0 612 1008] >> endobj\n%%EOF", "latin1");
  const files = {
    html: { file: "studio-preview.html", bytes: html.length, sha256: sha256(html) },
    json: { file: "studio-preview.json", bytes: canonical.length, sha256: sha256(canonical) },
    pdf: { file: "studio-preview.pdf", bytes: pdf.length, sha256: sha256(pdf) },
  };
  await Promise.all([
    fs.writeFile(path.join(directory, files.html.file), html),
    fs.writeFile(path.join(directory, files.json.file), canonical),
    fs.writeFile(path.join(directory, files.pdf.file), pdf),
    fs.writeFile(path.join(directory, "publication-metadata.json"), `${JSON.stringify({ schemaVersion: 1, type: "paragon-studio-shadow", files }, null, 2)}\n`),
  ]);
};

const prepareFixture = async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "paragon-phase4fa-"));
  const shadowDirectory = path.join(temp, "shadow");
  const outputDirectory = path.join(temp, "production");
  await createShadow(shadowDirectory);
  const result = await prepareProductionPublication({
    projectRoot: root,
    shadowDirectory,
    outputDirectory,
    publishId,
    draftCommit,
    baseMainSha,
    generatedAt,
  });
  return { temp, shadowDirectory, outputDirectory, result };
};

const createPromotionClient = ({ mainSha = baseMainSha, draftSha = draftCommit } = {}) => {
  const calls = [];
  let blobIndex = 0;
  const blobShas = ["6".repeat(40), "7".repeat(40), "8".repeat(40)];
  const client = {
    request: async (endpoint, init = {}) => {
      calls.push({ endpoint, init });
      if (endpoint === "/git/ref/heads/main" && init.method === undefined) return { object: { sha: mainSha } };
      if (endpoint === `/git/ref/heads/studio-publish/${publishId}`) return { object: { sha: draftSha } };
      if (endpoint === `/git/commits/${draftCommit}`) return { sha: draftCommit, tree: { sha: draftTree }, parents: [{ sha: baseMainSha }] };
      if (endpoint === "/git/blobs") return { sha: blobShas[blobIndex++] };
      if (endpoint === "/git/trees") return { sha: finalTree };
      if (endpoint === "/git/commits") return { sha: finalCommit };
      if (endpoint === "/git/refs/heads/main" && init.method === "PATCH") return { object: { sha: finalCommit } };
      throw new Error(`Unexpected request: ${init.method ?? "GET"} ${endpoint}`);
    },
  };
  return { client, calls };
};

test("production package converts canonical Studio JSON into the stable public JSON contract", async (t) => {
  const fixture = await prepareFixture();
  t.after(() => fs.rm(fixture.temp, { recursive: true, force: true }));
  const metadata = JSON.parse(await fs.readFile(path.join(fixture.outputDirectory, PRODUCTION_METADATA_FILE), "utf8"));
  const publicJson = JSON.parse(await fs.readFile(path.join(fixture.outputDirectory, metadata.files.json.path), "utf8"));
  assert.equal(metadata.type, "paragon-studio-production");
  assert.equal(publicJson.generatedAt, generatedAt);
  assert.equal(publicJson.source.documentId, "monthly-specials");
  assert.equal(publicJson.specials.length, 4);
  assert.equal(publicJson.settings.footerBrollFocusY, 100);
  assert.equal(metadata.files.html.path, "public/specials/monthly-specials.html");
  assert.equal(metadata.files.pdf.path, "public/specials/monthly-specials.pdf");
});

test("production package preserves exact HTML and PDF bytes while generating adapted JSON", async (t) => {
  const fixture = await prepareFixture();
  t.after(() => fs.rm(fixture.temp, { recursive: true, force: true }));
  const metadata = fixture.result.metadata;
  for (const key of ["html", "json", "pdf"]) {
    const bytes = await fs.readFile(path.join(fixture.outputDirectory, metadata.files[key].path));
    assert.equal(bytes.length, metadata.files[key].bytes);
    assert.equal(sha256(bytes), metadata.files[key].sha256);
  }
});

test("promotion is blocked unless the workflow production gate is explicitly true", async (t) => {
  const fixture = await prepareFixture();
  t.after(() => fs.rm(fixture.temp, { recursive: true, force: true }));
  await assert.rejects(
    promoteProductionPublication({ outputDirectory: fixture.outputDirectory, inputs, client: { request: async () => ({}) } }),
    (error) => error instanceof ProductionPromotionError && error.code === "PUBLISHING_DISABLED",
  );
});

test("promotion creates one final commit whose only parent is base main", async (t) => {
  const fixture = await prepareFixture();
  t.after(() => fs.rm(fixture.temp, { recursive: true, force: true }));
  const { client, calls } = createPromotionClient();
  const result = await promoteProductionPublication({ outputDirectory: fixture.outputDirectory, inputs, client, productionEnabled: true });
  assert.equal(result.finalCommit, finalCommit);
  const commitCall = calls.find((call) => call.endpoint === "/git/commits" && call.init.method === "POST");
  assert.deepEqual(commitCall.init.body.parents, [baseMainSha]);
  assert.equal(commitCall.init.body.tree, finalTree);
  const treeCall = calls.find((call) => call.endpoint === "/git/trees");
  assert.equal(treeCall.init.body.base_tree, draftTree);
  assert.deepEqual(treeCall.init.body.tree.map((entry) => entry.path).sort(), [
    "public/specials/monthly-specials.html",
    "public/specials/monthly-specials.json",
    "public/specials/monthly-specials.pdf",
  ]);
});

test("promotion updates main with force false only after final main and draft rechecks", async (t) => {
  const fixture = await prepareFixture();
  t.after(() => fs.rm(fixture.temp, { recursive: true, force: true }));
  const { client, calls } = createPromotionClient();
  await promoteProductionPublication({ outputDirectory: fixture.outputDirectory, inputs, client, productionEnabled: true });
  const patchIndex = calls.findIndex((call) => call.endpoint === "/git/refs/heads/main" && call.init.method === "PATCH");
  const mainReads = calls.map((call, index) => ({ ...call, index })).filter((call) => call.endpoint === "/git/ref/heads/main");
  const draftReads = calls.map((call, index) => ({ ...call, index })).filter((call) => call.endpoint.includes("/git/ref/heads/studio-publish/"));
  assert.equal(mainReads.length, 2);
  assert.equal(draftReads.length, 2);
  assert.equal(mainReads.at(-1).index < patchIndex, true);
  assert.equal(draftReads.at(-1).index < patchIndex, true);
  assert.deepEqual(calls[patchIndex].init.body, { sha: finalCommit, force: false });
});

test("promotion rejects stale main before creating production blobs", async (t) => {
  const fixture = await prepareFixture();
  t.after(() => fs.rm(fixture.temp, { recursive: true, force: true }));
  const { client, calls } = createPromotionClient({ mainSha: "9".repeat(40) });
  await assert.rejects(
    promoteProductionPublication({ outputDirectory: fixture.outputDirectory, inputs, client, productionEnabled: true }),
    (error) => error.code === "STALE_MAIN_BEFORE_PROMOTION",
  );
  assert.equal(calls.some((call) => call.endpoint === "/git/blobs"), false);
});

test("promotion rejects a moved staging reference before creating production blobs", async (t) => {
  const fixture = await prepareFixture();
  t.after(() => fs.rm(fixture.temp, { recursive: true, force: true }));
  const { client, calls } = createPromotionClient({ draftSha: "9".repeat(40) });
  await assert.rejects(
    promoteProductionPublication({ outputDirectory: fixture.outputDirectory, inputs, client, productionEnabled: true }),
    (error) => error.code === "DRAFT_REF_MOVED_BEFORE_PROMOTION",
  );
  assert.equal(calls.some((call) => call.endpoint === "/git/blobs"), false);
});

test("successful cleanup deletes only the publication-scoped staging reference", async () => {
  const calls = [];
  const result = await cleanupStagingReference({ publishId, client: { request: async (endpoint, init) => { calls.push({ endpoint, init }); return null; } } });
  assert.deepEqual(result, { publishId, deleted: true, alreadyMissing: false });
  assert.deepEqual(calls, [{ endpoint: `/git/refs/heads/studio-publish/${publishId}`, init: { method: "DELETE" } }]);
});

test("live verification checks HTML JSON and PDF through three independent URL variants", async (t) => {
  const fixture = await prepareFixture();
  t.after(() => fs.rm(fixture.temp, { recursive: true, force: true }));
  const metadata = fixture.result.metadata;
  const bytesByName = Object.fromEntries(await Promise.all(Object.values(metadata.files).map(async (record) => [path.basename(record.path), await fs.readFile(path.join(fixture.outputDirectory, record.path))])));
  const urls = [];
  const result = await verifyLivePublication({
    outputDirectory: fixture.outputDirectory,
    baseUrl: "https://paragonpurveyors.com/specials/",
    finalCommit,
    publishId,
    attempts: 1,
    retryDelayMs: 0,
    sleepImpl: async () => {},
    fetchImpl: async (url) => { urls.push(String(url)); return new Response(bytesByName[path.basename(new URL(url).pathname)], { status: 200 }); },
  });
  assert.equal(result.checks.length, 9);
  assert.equal(urls.filter((url) => !new URL(url).search).length, 3);
  assert.equal(urls.filter((url) => new URL(url).searchParams.has("authorityLock")).length, 3);
  assert.equal(urls.filter((url) => new URL(url).searchParams.has("reconcile")).length, 3);
});

test("live verification retries a transient stale response and then accepts exact bytes", async (t) => {
  const fixture = await prepareFixture();
  t.after(() => fs.rm(fixture.temp, { recursive: true, force: true }));
  const metadata = fixture.result.metadata;
  const bytesByName = Object.fromEntries(await Promise.all(Object.values(metadata.files).map(async (record) => [path.basename(record.path), await fs.readFile(path.join(fixture.outputDirectory, record.path))])));
  let staleServed = false;
  let sleeps = 0;
  const result = await verifyLivePublication({
    outputDirectory: fixture.outputDirectory,
    baseUrl: "https://paragonpurveyors.com/specials/",
    finalCommit,
    publishId,
    attempts: 2,
    retryDelayMs: 1,
    sleepImpl: async () => { sleeps += 1; },
    fetchImpl: async (url) => {
      const name = path.basename(new URL(url).pathname);
      if (name === "monthly-specials.json" && !staleServed) { staleServed = true; return new Response("{}\n", { status: 200 }); }
      return new Response(bytesByName[name], { status: 200 });
    },
  });
  assert.equal(result.checks.length, 9);
  assert.equal(sleeps, 1);
});
