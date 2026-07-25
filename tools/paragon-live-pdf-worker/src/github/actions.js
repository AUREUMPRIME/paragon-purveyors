import { installationTokenProvider } from "./app-auth.js";
import { createGitHubClient, GitHubApiError } from "./client.js";
import {
  createStagingRef,
  normalizePublishId,
  PUBLISH_RUN_TITLE_PREFIX,
  PUBLISH_WORKFLOW_ID,
  PUBLISH_WORKFLOW_REF,
  REPOSITORY_NAME,
  REPOSITORY_OWNER,
} from "./policy.js";

const repoPath = `/repos/${REPOSITORY_OWNER}/${REPOSITORY_NAME}`;

const requireArray = (value) => Array.isArray(value) ? value : [];
const freeze = (value) => Object.freeze(value);

export const createPublishRunTitle = (publishId) => (
  `${PUBLISH_RUN_TITLE_PREFIX}${normalizePublishId(publishId)}`
);

export const mapWorkflowRunState = (run, jobs = []) => {
  if (!run) return "queued";
  if (run.status === "queued" || run.status === "waiting" || run.status === "requested") return "queued";
  if (run.status === "completed") return run.conclusion === "success" ? "success" : "failed";

  const active = requireArray(jobs).find((job) => job?.status === "in_progress")
    ?? requireArray(jobs).find((job) => job?.status === "queued");
  const name = String(active?.name ?? "").toLowerCase();
  if (/publish|deploy/u.test(name)) return "publishing";
  if (/build|render|pdf/u.test(name)) return "building";
  return "validating";
};

const makeClient = async (env, options) => {
  const tokenProvider = options.tokenProvider ?? installationTokenProvider;
  const token = await tokenProvider.getToken(env, options);
  return (options.createClient ?? createGitHubClient)({
    token,
    fetchImpl: options.fetchImpl ?? globalThis.fetch,
    authScheme: "Bearer",
  });
};

export const dispatchPublishWorkflow = async (metadata, env, options = {}) => {
  const publishId = normalizePublishId(metadata?.publishId);
  const client = await makeClient(env, options);
  await client.request(
    `${repoPath}/actions/workflows/${PUBLISH_WORKFLOW_ID}/dispatches`,
    {
      method: "POST",
      body: {
        ref: PUBLISH_WORKFLOW_REF,
        inputs: {
          publish_id: publishId,
          draft_branch: String(metadata?.branch ?? ""),
          draft_commit: String(metadata?.commit ?? ""),
          base_main_sha: String(metadata?.baseMainSha ?? ""),
        },
      },
    },
  );
  return freeze({ dispatched: true, publishId });
};

const findRun = (runs, publishId) => {
  const title = createPublishRunTitle(publishId);
  return requireArray(runs).find((run) => (
    run?.display_title === title
    && run?.event === "workflow_dispatch"
    && run?.head_branch === PUBLISH_WORKFLOW_REF
  )) ?? null;
};

const refExists = async (client, publishId) => {
  const ref = createStagingRef(publishId).replace(/^refs\//u, "");
  try {
    await client.request(`${repoPath}/git/ref/${ref}`);
    return true;
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) return false;
    throw error;
  }
};

export const getPublicationStatus = async (publishIdValue, env, options = {}) => {
  const publishId = normalizePublishId(publishIdValue);
  const client = await makeClient(env, options);
  const data = await client.request(
    `${repoPath}/actions/workflows/${PUBLISH_WORKFLOW_ID}/runs?branch=${PUBLISH_WORKFLOW_REF}&event=workflow_dispatch&per_page=100`,
  );
  const run = findRun(data?.workflow_runs, publishId);

  if (!run) {
    if (!await refExists(client, publishId)) return null;
    return freeze({ publishId, status: "queued", runId: null, conclusion: null, url: null });
  }

  let jobs = [];
  if (run.id) {
    const jobsData = await client.request(`${repoPath}/actions/runs/${run.id}/jobs?per_page=100`);
    jobs = requireArray(jobsData?.jobs);
  }

  return freeze({
    publishId,
    status: mapWorkflowRunState(run, jobs),
    runId: Number.isInteger(run.id) ? run.id : null,
    conclusion: typeof run.conclusion === "string" ? run.conclusion : null,
    url: typeof run.html_url === "string" ? run.html_url : null,
  });
};

export const getLatestPublicationSummary = async (env, options = {}) => {
  const client = await makeClient(env, options);
  const data = await client.request(
    `${repoPath}/actions/workflows/${PUBLISH_WORKFLOW_ID}/runs?branch=${PUBLISH_WORKFLOW_REF}&event=workflow_dispatch&per_page=1`,
  );
  const run = requireArray(data?.workflow_runs)[0];
  if (!run) return null;
  return freeze({
    runId: Number.isInteger(run.id) ? run.id : null,
    status: String(run.status ?? "unknown"),
    conclusion: typeof run.conclusion === "string" ? run.conclusion : null,
    url: typeof run.html_url === "string" ? run.html_url : null,
    createdAt: typeof run.created_at === "string" ? run.created_at : null,
  });
};
