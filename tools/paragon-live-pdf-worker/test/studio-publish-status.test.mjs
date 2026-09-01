import assert from "node:assert/strict";
import test from "node:test";

import { createPublishRunTitle, dispatchPublishWorkflow, getPublicationStatus, mapWorkflowRunState } from "../src/github/actions.js";
import { publishStudioRevision } from "../src/studio/publish.js";

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

const stage = Object.freeze({ publishId: UUID, branch: `studio-publish/${UUID}`, commit: "b".repeat(40), baseMainSha: SHA });
const provider = { getToken: async () => "ghs_token_value_abcdefghijklmnop" };

test("Publication run title is exact and publish-ID scoped", () => {
  assert.equal(createPublishRunTitle(UUID), `Paragon Studio Publish ${UUID}`);
});

test("Workflow state maps queued and waiting runs to queued", () => {
  assert.equal(mapWorkflowRunState({ status: "queued" }), "queued");
  assert.equal(mapWorkflowRunState({ status: "waiting" }), "queued");
});

test("Workflow state maps active validation jobs", () => {
  assert.equal(mapWorkflowRunState({ status: "in_progress" }, [{ name: "Validate source", status: "in_progress" }]), "validating");
});

test("Workflow state maps active build promotion deployment and verification jobs", () => {
  assert.equal(mapWorkflowRunState({ status: "in_progress" }, [{ name: "Build shadow and production package", status: "in_progress" }]), "building");
  assert.equal(mapWorkflowRunState({ status: "in_progress" }, [{ name: "Promote one production commit", status: "in_progress" }]), "promoting");
  assert.equal(mapWorkflowRunState({ status: "in_progress" }, [{ name: "Deploy exact promoted site", status: "in_progress" }]), "deploying");
  assert.equal(mapWorkflowRunState({ status: "in_progress" }, [{ name: "Verify live publication", status: "in_progress" }]), "verifying");
});

test("Workflow state maps terminal success failure and conflict", () => {
  assert.equal(mapWorkflowRunState({ status: "completed", conclusion: "success" }), "success");
  assert.equal(mapWorkflowRunState({ status: "completed", conclusion: "cancelled" }), "failed");
  assert.equal(
    mapWorkflowRunState(
      { status: "completed", conclusion: "failure" },
      [{ name: "Conflict gate", status: "completed", conclusion: "failure" }],
    ),
    "conflict",
  );
  assert.equal(
    mapWorkflowRunState(
      { status: "completed", conclusion: "failure" },
      [
        { name: "Conflict gate", status: "completed", conclusion: "success" },
        { name: "Deploy exact promoted site", status: "completed", conclusion: "failure" },
      ],
    ),
    "failed",
  );
  assert.equal(
    mapWorkflowRunState(
      { status: "completed", conclusion: "failure" },
      [
        { name: "Conflict gate", status: "completed", conclusion: "success" },
        {
          name: "Build shadow and production package",
          status: "completed",
          conclusion: "failure",
          steps: [
            { name: "Recheck post-build conflict state", conclusion: "success" },
            { name: "Build production package", conclusion: "failure" },
          ],
        },
      ],
    ),
    "failed",
  );
  assert.equal(
    mapWorkflowRunState(
      { status: "completed", conclusion: "failure" },
      [{
        name: "Build shadow and production package",
        status: "completed",
        conclusion: "failure",
        steps: [{ name: "Recheck post-build conflict state", conclusion: "failure" }],
      }],
    ),
    "conflict",
  );
  assert.equal(
    mapWorkflowRunState(
      { status: "in_progress" },
      [{ name: "Report production publication", status: "queued" }],
    ),
    "verifying",
  );
});

test("Workflow dispatch uses exact repository workflow, main ref, and four inputs", async () => {
  const calls = [];
  await dispatchPublishWorkflow(stage, {}, { tokenProvider: provider, createClient: () => ({ request: async (endpoint, init) => { calls.push({ endpoint, init }); return null; } }) });
  assert.equal(calls[0].endpoint, "/repos/AUREUMPRIME/paragon-purveyors/actions/workflows/publish-live-pdf-studio.yml/dispatches");
  assert.deepEqual(calls[0].init.body, { ref: "main", inputs: { publish_id: UUID, draft_branch: stage.branch, draft_commit: stage.commit, base_main_sha: SHA } });
});

test("Status discovers only the exact workflow title and returns sanitized metadata", async () => {
  const requests = [];
  const result = await getPublicationStatus(UUID, {}, { tokenProvider: provider, createClient: () => ({ request: async (endpoint) => { requests.push(endpoint); if (endpoint.includes("/runs?")) return { workflow_runs: [{ id: 42, display_title: createPublishRunTitle(UUID), event: "workflow_dispatch", head_branch: "main", status: "completed", conclusion: "success", html_url: "https://github.test/run/42" }] }; return { jobs: [] }; } }) });
  assert.deepEqual(result, { publishId: UUID, status: "success", runId: 42, conclusion: "success", workflowUrl: "https://github.test/run/42" });
  assert.equal(requests.length, 2);
});

test("Status maps an existing staging ref without a propagated run to queued", async () => {
  const result = await getPublicationStatus(UUID, {}, { tokenProvider: provider, createClient: () => ({ request: async (endpoint) => endpoint.includes("/runs?") ? { workflow_runs: [] } : { ref: `refs/heads/studio-publish/${UUID}` } }) });
  assert.deepEqual(result, { publishId: UUID, status: "queued", runId: null, conclusion: null, workflowUrl: null });
});

test("Status returns null when neither workflow run nor staging ref exists", async () => {
  class Missing extends Error { constructor() { super(); this.status = 404; this.name = "GitHubApiError"; } }
  const { GitHubApiError } = await import("../src/github/client.js");
  const result = await getPublicationStatus(UUID, {}, { tokenProvider: provider, createClient: () => ({ request: async (endpoint) => { if (endpoint.includes("/runs?")) return { workflow_runs: [] }; throw new GitHubApiError("missing", { status: 404 }); } }) });
  assert.equal(result, null);
});

test("Publish validates, stages, dispatches, and returns queued metadata", async () => {
  const order = [];
  const result = await publishStudioRevision({ document: documentFixture(), assetCatalog: {}, baseMainSha: SHA, publishId: UUID, fileMetadata: {}, files: [] }, {}, { currentMainSha: SHA, stagePublication: async () => { order.push("stage"); return stage; }, dispatchPublishWorkflow: async () => { order.push("dispatch"); } });
  assert.deepEqual(order, ["stage", "dispatch"]);
  assert.deepEqual(result, { accepted: true, publishId: UUID, draftBranch: stage.branch, draftCommit: stage.commit, status: "queued" });
});

test("Publish cleans the staging branch when workflow dispatch fails", async () => {
  const order = [];
  await assert.rejects(publishStudioRevision({ document: documentFixture(), assetCatalog: {}, baseMainSha: SHA, publishId: UUID, fileMetadata: {}, files: [] }, {}, { currentMainSha: SHA, stagePublication: async () => { order.push("stage"); return stage; }, dispatchPublishWorkflow: async () => { order.push("dispatch"); throw new Error("failed"); }, cleanupStagingBranch: async () => { order.push("cleanup"); } }), /safe staging cleanup/u);
  assert.deepEqual(order, ["stage", "dispatch", "cleanup"]);
});

test("Publish response is immutable and contains no credentials", async () => {
  const result = await publishStudioRevision({ document: documentFixture(), assetCatalog: {}, baseMainSha: SHA, publishId: UUID, fileMetadata: {}, files: [] }, {}, { currentMainSha: SHA, stagePublication: async () => stage, dispatchPublishWorkflow: async () => {} });
  assert.equal(Object.isFrozen(result), true);
  assert.deepEqual(Object.keys(result).sort(), ["accepted", "draftBranch", "draftCommit", "publishId", "status"]);
});
