import assert from "node:assert/strict";
import test from "node:test";

import { createGitHubClient, GitHubApiError } from "../src/github/client.js";
import { createGitDatabase } from "../src/github/git-database.js";
import {
  ASSET_LIBRARY_ROOT,
  CANONICAL_SOURCE_PATH,
  createCommitMessage,
  createStagingBranch,
  createStagingRef,
  GitHubPolicyError,
  MAX_CHANGE_COUNT,
  validatePublicationChanges,
  validateStagingRequest,
} from "../src/github/policy.js";
import {
  cleanupStagingBranch,
  stagePublication,
  StagingConflictError,
} from "../src/github/staging.js";

const SHA_MAIN = "1".repeat(40);
const SHA_TREE = "2".repeat(40);
const SHA_BLOB_A = "3".repeat(40);
const SHA_BLOB_B = "4".repeat(40);
const SHA_COMMIT = "5".repeat(40);
const PUBLISH_ID = "123e4567-e89b-42d3-a456-426614174000";
const ASSET_PATH = `${ASSET_LIBRARY_ROOT}ribeye/rib-eye-steak-${"a".repeat(12)}.webp`;

const validChanges = () => [
  {
    path: CANONICAL_SOURCE_PATH,
    encoding: "utf-8",
    content: '{"schemaVersion":"2.0.0"}',
  },
  {
    path: ASSET_PATH,
    encoding: "base64",
    content: Buffer.from("asset-bytes").toString("base64"),
  },
];

const validRequest = () => ({
  publishId: PUBLISH_ID,
  baseMainSha: SHA_MAIN,
  changes: validChanges(),
});

test("Repository policy accepts canonical publish IDs and Git SHAs", () => {
  const result = validateStagingRequest(validRequest());
  assert.equal(result.publishId, PUBLISH_ID);
  assert.equal(result.baseMainSha, SHA_MAIN);
  assert.equal(createStagingRef(PUBLISH_ID), `refs/heads/studio-publish/${PUBLISH_ID}`);
  assert.equal(createStagingBranch(PUBLISH_ID), `studio-publish/${PUBLISH_ID}`);
  assert.equal(createCommitMessage(PUBLISH_ID), `chore: stage Live PDF Studio publication ${PUBLISH_ID}`);
});

test("Repository policy rejects uppercase or malformed publish IDs and SHAs", () => {
  for (const request of [
    { ...validRequest(), publishId: PUBLISH_ID.toUpperCase() },
    { ...validRequest(), publishId: "not-a-uuid" },
    { ...validRequest(), baseMainSha: SHA_MAIN.toUpperCase().replaceAll("1", "A") },
    { ...validRequest(), baseMainSha: "abc" },
  ]) {
    assert.throws(() => validateStagingRequest(request), GitHubPolicyError);
  }
});

test("Publication policy accepts only canonical source and content-addressed asset paths", () => {
  const changes = validatePublicationChanges(validChanges());
  assert.deepEqual(changes.map((change) => change.path), [CANONICAL_SOURCE_PATH, ASSET_PATH]);
  assert.deepEqual(changes.map((change) => change.encoding), ["utf-8", "base64"]);
  assert.equal(changes.every(Object.isFrozen), true);
});

test("Publication policy rejects traversal, generated outputs, code, workflows, and unhashed assets", () => {
  const rejected = [
    "../src/data/paragon-live-pdf-studio.json",
    "public/specials/monthly-specials.json",
    ".github/workflows/deploy.yml",
    "tools/build-monthly-specials-v2.mjs",
    "src/live-pdf-studio/main.js",
    "public/assets/specials/library/ribeye/rib-eye-steak.webp",
    "public\\assets\\specials\\library\\ribeye\\rib-eye-steak-aaaaaaaaaaaa.webp",
  ];

  for (const path of rejected) {
    assert.throws(
      () => validatePublicationChanges([{ path, encoding: "utf-8", content: "x" }]),
      /not allowed/u,
    );
  }
});

test("Publication policy locks text and binary encodings to their path type", () => {
  assert.throws(
    () => validatePublicationChanges([{ ...validChanges()[0], encoding: "base64" }]),
    /utf-8 encoding/u,
  );
  assert.throws(
    () => validatePublicationChanges([{ ...validChanges()[1], encoding: "utf-8" }]),
    /base64 encoding/u,
  );
  assert.throws(
    () => validatePublicationChanges([{ ...validChanges()[1], content: "***" }]),
    /canonical base64/u,
  );
});

test("Publication policy rejects empty, duplicate, deletion-like, and missing-content changes", () => {
  assert.throws(() => validatePublicationChanges([]), /At least one/u);
  assert.throws(
    () => validatePublicationChanges([validChanges()[0], validChanges()[0]]),
    /Duplicate/u,
  );
  assert.throws(
    () => validatePublicationChanges([{ path: CANONICAL_SOURCE_PATH, encoding: "utf-8", content: "" }]),
    /non-empty/u,
  );
  assert.throws(
    () => validatePublicationChanges([{ path: CANONICAL_SOURCE_PATH, encoding: "utf-8", delete: true }]),
    /content/u,
  );
});

test("Publication policy enforces operation and content-size limits", () => {
  assert.throws(
    () => validatePublicationChanges(Array.from({ length: MAX_CHANGE_COUNT + 1 }, (_value, index) => ({
      path: `${ASSET_LIBRARY_ROOT}ribeye/item-${String(index).padStart(12, "a").slice(-12)}.webp`,
      encoding: "base64",
      content: "YQ==",
    }))),
    /count exceeds/u,
  );
  assert.throws(
    () => validatePublicationChanges([{
      path: CANONICAL_SOURCE_PATH,
      encoding: "utf-8",
      content: "x".repeat(512 * 1024 + 1),
    }]),
    /exceeds/u,
  );
});

test("Validated staging requests are immutable and preserve no extra fields", async () => {
  const workerRoot = new URL("../", import.meta.url);
  const rootPackage = JSON.parse(await (await import("node:fs/promises")).readFile(new URL("../../package.json", workerRoot), "utf8"));
  const wrangler = JSON.parse(await (await import("node:fs/promises")).readFile(new URL("wrangler.jsonc", workerRoot), "utf8"));
  const example = await (await import("node:fs/promises")).readFile(new URL(".dev.vars.example", workerRoot), "utf8");
  assert.equal(wrangler.workers_dev, false);
  assert.equal(wrangler.preview_urls, false);
  assert.deepEqual(wrangler.secrets.required, [
    "PASSWORD_SALT_B64",
    "PASSWORD_HASH_B64",
    "SESSION_SECRET_B64",
    "ALLOWED_ORIGIN",
    "LOCAL_ALLOWED_ORIGIN",
  ]);
  assert.match(example, /GITHUB_APP_CLIENT_ID=REPLACE_WITH_GITHUB_APP_CLIENT_ID/u);
  assert.match(example, /GITHUB_APP_INSTALLATION_ID=REPLACE_WITH_GITHUB_APP_INSTALLATION_ID/u);
  assert.match(example, /GITHUB_APP_PRIVATE_KEY_PKCS8_PEM=/u);
  assert.match(rootPackage.scripts["studio:github:test"], /github-app-auth\.test\.mjs/u);
  assert.match(rootPackage.scripts["studio:github:test"], /github-git-staging\.test\.mjs/u);
  const result = validateStagingRequest({ ...validRequest(), unexpected: "ignored" });
  assert.deepEqual(Object.keys(result).sort(), ["baseMainSha", "changes", "publishId"]);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.changes), true);
});

test("GitHub client locks API base, version, user agent, authorization, and JSON body", async () => {
  const calls = [];
  const client = createGitHubClient({
    token: "ghs_client_token_value_abcdefghijklmnop",
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ sha: SHA_BLOB_A }), {
        status: 201,
        headers: { "content-type": "application/json" },
      });
    },
  });

  const result = await client.request("/repos/AUREUMPRIME/paragon-purveyors/git/blobs", {
    method: "POST",
    body: { content: "hello", encoding: "utf-8" },
  });
  assert.equal(result.sha, SHA_BLOB_A);
  assert.equal(calls[0].url, "https://api.github.com/repos/AUREUMPRIME/paragon-purveyors/git/blobs");
  assert.equal(calls[0].init.headers.get("authorization"), "Bearer ghs_client_token_value_abcdefghijklmnop");
  assert.equal(calls[0].init.headers.get("x-github-api-version"), "2026-03-10");
  assert.equal(calls[0].init.headers.get("user-agent"), "Paragon-Live-PDF-Studio-Worker");
  assert.deepEqual(JSON.parse(calls[0].init.body), { content: "hello", encoding: "utf-8" });
});

test("GitHub client rejects arbitrary URLs, traversal, and unapproved methods", async () => {
  const client = createGitHubClient({
    token: "ghs_client_token_value_abcdefghijklmnop",
    fetchImpl: async () => new Response("{}", { status: 200 }),
  });

  await assert.rejects(client.request("https://evil.example/path"), /endpoint/u);
  await assert.rejects(client.request("/repos/../other"), /endpoint/u);
  await assert.rejects(client.request("//evil.example/path"), /endpoint/u);
  await assert.rejects(client.request("/repos/test", { method: "PATCH" }), /method/u);
  assert.throws(
    () => createGitHubClient({ token: "ghs_client_token_value_abcdefghijklmnop", fetchImpl: async () => new Response("{}"), authScheme: "token" }),
    /authorization scheme/u,
  );
});

test("GitHub client maps conflicts and redacts response bodies and credentials", async () => {
  const token = "ghs_sensitive_token_value_abcdefghijklmnop";
  const client = createGitHubClient({
    token,
    fetchImpl: async () => new Response(JSON.stringify({ message: `leak ${token}` }), {
      status: 422,
      headers: { "content-type": "application/json" },
    }),
  });

  await assert.rejects(
    client.request("/repos/AUREUMPRIME/paragon-purveyors/git/refs", { method: "POST", body: {} }),
    (error) => {
      assert.equal(error instanceof GitHubApiError, true);
      assert.equal(error.status, 422);
      assert.equal(error.code, "GITHUB_CONFLICT");
      assert.equal(error.message, "GitHub request failed with HTTP 422.");
      assert.equal(error.message.includes(token), false);
      return true;
    },
  );
});

test("Git database reads only the fixed main reference and exact commit", async () => {
  const calls = [];
  const client = {
    request: async (endpoint, options) => {
      calls.push({ endpoint, options });
      if (endpoint.endsWith("/git/ref/heads/main")) return { object: { sha: SHA_MAIN } };
      return { sha: SHA_MAIN, tree: { sha: SHA_TREE } };
    },
  };
  const database = createGitDatabase(client);

  assert.deepEqual(await database.getMainReference(), { sha: SHA_MAIN });
  assert.deepEqual(await database.getCommit(SHA_MAIN), { sha: SHA_MAIN, treeSha: SHA_TREE });
  assert.deepEqual(calls.map((call) => call.endpoint), [
    "/repos/AUREUMPRIME/paragon-purveyors/git/ref/heads/main",
    `/repos/AUREUMPRIME/paragon-purveyors/git/commits/${SHA_MAIN}`,
  ]);
  assert.equal(calls.every((call) => call.options === undefined), true);
});

test("Git database creates blobs, a base tree, one-parent commit, and staging ref exactly", async () => {
  const calls = [];
  const responses = [
    { sha: SHA_BLOB_A },
    { sha: SHA_TREE },
    { sha: SHA_COMMIT },
    { ref: createStagingRef(PUBLISH_ID), object: { sha: SHA_COMMIT } },
  ];
  const database = createGitDatabase({
    request: async (endpoint, options) => {
      calls.push({ endpoint, options });
      return responses.shift();
    },
  });

  await database.createBlob({ content: "hello", encoding: "utf-8" });
  await database.createTree({ baseTreeSha: SHA_TREE, entries: [{ path: CANONICAL_SOURCE_PATH, sha: SHA_BLOB_A }] });
  await database.createCommit({ message: createCommitMessage(PUBLISH_ID), treeSha: SHA_TREE, parentSha: SHA_MAIN });
  await database.createStagingReference({ publishId: PUBLISH_ID, commitSha: SHA_COMMIT });

  assert.deepEqual(calls, [
    {
      endpoint: "/repos/AUREUMPRIME/paragon-purveyors/git/blobs",
      options: { method: "POST", body: { content: "hello", encoding: "utf-8" } },
    },
    {
      endpoint: "/repos/AUREUMPRIME/paragon-purveyors/git/trees",
      options: {
        method: "POST",
        body: {
          base_tree: SHA_TREE,
          tree: [{ path: CANONICAL_SOURCE_PATH, mode: "100644", type: "blob", sha: SHA_BLOB_A }],
        },
      },
    },
    {
      endpoint: "/repos/AUREUMPRIME/paragon-purveyors/git/commits",
      options: {
        method: "POST",
        body: { message: createCommitMessage(PUBLISH_ID), tree: SHA_TREE, parents: [SHA_MAIN] },
      },
    },
    {
      endpoint: "/repos/AUREUMPRIME/paragon-purveyors/git/refs",
      options: {
        method: "POST",
        body: { ref: createStagingRef(PUBLISH_ID), sha: SHA_COMMIT },
      },
    },
  ]);

  const invalidDatabase = createGitDatabase({
    request: async () => ({ ref: "refs/heads/main", object: { sha: SHA_COMMIT } }),
  });
  await assert.rejects(
    invalidDatabase.createStagingReference({ publishId: PUBLISH_ID, commitSha: SHA_COMMIT }),
    /response is invalid/u,
  );
});

test("Git database exposes explicit cleanup only for a canonical staging reference", async () => {
  const calls = [];
  const database = createGitDatabase({
    request: async (endpoint, options) => {
      calls.push({ endpoint, options });
      return null;
    },
  });

  assert.deepEqual(await database.deleteStagingReference(PUBLISH_ID), {
    deleted: true,
    ref: createStagingRef(PUBLISH_ID),
  });
  assert.deepEqual(calls, [{
    endpoint: `/repos/AUREUMPRIME/paragon-purveyors/git/refs/heads/studio-publish/${PUBLISH_ID}`,
    options: { method: "DELETE" },
  }]);
  await assert.rejects(database.deleteStagingReference("main"), /publishId/u);
});

test("Atomic staging follows token, main, commit, blobs, tree, commit, and ref sequence", async () => {
  const sequence = [];
  const database = {
    getMainReference: async () => { sequence.push("main-ref"); return { sha: SHA_MAIN }; },
    getCommit: async () => { sequence.push("main-commit"); return { sha: SHA_MAIN, treeSha: SHA_TREE }; },
    createBlob: async ({ content }) => {
      sequence.push(`blob:${content.startsWith("{") ? "source" : "asset"}`);
      return { sha: sequence.includes("blob:asset") ? SHA_BLOB_B : SHA_BLOB_A };
    },
    createTree: async () => { sequence.push("tree"); return { sha: SHA_TREE }; },
    createCommit: async () => { sequence.push("commit"); return { sha: SHA_COMMIT }; },
    createStagingReference: async () => { sequence.push("ref"); return { ref: createStagingRef(PUBLISH_ID), sha: SHA_COMMIT }; },
  };
  const tokenProvider = { getToken: async () => { sequence.push("token"); return "ghs_stage_token_value_abcdefghijklmnop"; } };

  await stagePublication(validRequest(), {}, {
    tokenProvider,
    createClient: () => ({ request() {} }),
    createDatabase: () => database,
  });

  assert.deepEqual(sequence, ["token", "main-ref", "main-commit", "blob:source", "blob:asset", "tree", "commit", "ref"]);
});

test("Atomic staging returns immutable metadata and uses current main tree and sole parent", async () => {
  let treeInput;
  let commitInput;
  let refInput;
  const database = {
    getMainReference: async () => ({ sha: SHA_MAIN }),
    getCommit: async () => ({ sha: SHA_MAIN, treeSha: SHA_TREE }),
    createBlob: async ({ encoding }) => ({ sha: encoding === "utf-8" ? SHA_BLOB_A : SHA_BLOB_B }),
    createTree: async (value) => { treeInput = value; return { sha: SHA_TREE }; },
    createCommit: async (value) => { commitInput = value; return { sha: SHA_COMMIT }; },
    createStagingReference: async (value) => { refInput = value; return { ref: createStagingRef(PUBLISH_ID), sha: SHA_COMMIT }; },
  };

  const result = await stagePublication(validRequest(), {}, {
    tokenProvider: { getToken: async () => "ghs_stage_token_value_abcdefghijklmnop" },
    createClient: () => ({ request() {} }),
    createDatabase: () => database,
  });

  assert.deepEqual(treeInput, {
    baseTreeSha: SHA_TREE,
    entries: [
      { path: CANONICAL_SOURCE_PATH, sha: SHA_BLOB_A },
      { path: ASSET_PATH, sha: SHA_BLOB_B },
    ],
  });
  assert.deepEqual(commitInput, {
    message: createCommitMessage(PUBLISH_ID),
    treeSha: SHA_TREE,
    parentSha: SHA_MAIN,
  });
  assert.deepEqual(refInput, { publishId: PUBLISH_ID, commitSha: SHA_COMMIT });
  assert.deepEqual(result, {
    publishId: PUBLISH_ID,
    branch: createStagingBranch(PUBLISH_ID),
    commit: SHA_COMMIT,
    baseMainSha: SHA_MAIN,
  });
  assert.equal(Object.isFrozen(result), true);
  assert.equal("token" in result, false);
});

test("Stale baseMainSha rejects before every Git write", async () => {
  const calls = [];
  const database = {
    getMainReference: async () => { calls.push("GET main"); return { sha: "9".repeat(40) }; },
    getCommit: async () => { calls.push("GET commit"); },
    createBlob: async () => { calls.push("POST blob"); },
    createTree: async () => { calls.push("POST tree"); },
    createCommit: async () => { calls.push("POST commit"); },
    createStagingReference: async () => { calls.push("POST ref"); },
  };

  await assert.rejects(
    stagePublication(validRequest(), {}, {
      tokenProvider: { getToken: async () => "ghs_stage_token_value_abcdefghijklmnop" },
      createClient: () => ({ request() {} }),
      createDatabase: () => database,
    }),
    (error) => error instanceof StagingConflictError && error.code === "STALE_MAIN",
  );
  assert.deepEqual(calls, ["GET main"]);
});

test("Existing staging refs become controlled conflicts without update, force, or automatic cleanup", async () => {
  const calls = [];
  const database = {
    getMainReference: async () => ({ sha: SHA_MAIN }),
    getCommit: async () => ({ sha: SHA_MAIN, treeSha: SHA_TREE }),
    createBlob: async () => ({ sha: SHA_BLOB_A }),
    createTree: async () => ({ sha: SHA_TREE }),
    createCommit: async () => ({ sha: SHA_COMMIT }),
    createStagingReference: async () => {
      calls.push("create-ref");
      throw new GitHubApiError("GitHub request failed with HTTP 422.", { status: 422, code: "GITHUB_CONFLICT" });
    },
    deleteStagingReference: async () => { calls.push("delete-ref"); },
  };

  await assert.rejects(
    stagePublication(validRequest(), {}, {
      tokenProvider: { getToken: async () => "ghs_stage_token_value_abcdefghijklmnop" },
      createClient: () => ({ request() {} }),
      createDatabase: () => database,
    }),
    (error) => error instanceof StagingConflictError && error.code === "STAGING_REF_EXISTS",
  );
  assert.deepEqual(calls, ["create-ref"]);

  await cleanupStagingBranch(PUBLISH_ID, {}, {
    tokenProvider: { getToken: async () => "ghs_stage_token_value_abcdefghijklmnop" },
    createClient: () => ({ request() {} }),
    createDatabase: () => database,
  });
  assert.deepEqual(calls, ["create-ref", "delete-ref"]);
});
