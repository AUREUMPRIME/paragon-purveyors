import { installationTokenProvider } from "./app-auth.js";
import { createGitHubClient, GitHubApiError } from "./client.js";
import { createGitDatabase } from "./git-database.js";
import {
  createCommitMessage,
  createStagingBranch,
  validateStagingRequest,
} from "./policy.js";

export class StagingConflictError extends Error {
  constructor(message, code = "STAGING_CONFLICT") {
    super(message);
    this.name = "StagingConflictError";
    this.code = code;
  }
}

const mapReferenceConflict = (error) => {
  if (error instanceof GitHubApiError && error.status === 422) {
    return new StagingConflictError("The staging branch already exists.", "STAGING_REF_EXISTS");
  }
  return error;
};

export const stagePublication = async (
  request,
  env,
  {
    tokenProvider = installationTokenProvider,
    fetchImpl = globalThis.fetch,
    createClient = createGitHubClient,
    createDatabase = createGitDatabase,
    nowMs = Date.now(),
    cryptoImpl = globalThis.crypto,
  } = {},
) => {
  const validated = validateStagingRequest(request);
  const token = await tokenProvider.getToken(env, { nowMs, cryptoImpl, fetchImpl });
  const client = createClient({ token, fetchImpl, authScheme: "Bearer" });
  const database = createDatabase(client);

  const mainReference = await database.getMainReference();
  if (mainReference.sha !== validated.baseMainSha) {
    throw new StagingConflictError(
      "baseMainSha does not match the current main branch.",
      "STALE_MAIN",
    );
  }

  const mainCommit = await database.getCommit(mainReference.sha);
  const entries = [];
  for (const change of validated.changes) {
    const blob = await database.createBlob({
      content: change.content,
      encoding: change.encoding,
    });
    entries.push(Object.freeze({ path: change.path, sha: blob.sha }));
  }

  const tree = await database.createTree({
    baseTreeSha: mainCommit.treeSha,
    entries,
  });
  const commit = await database.createCommit({
    message: createCommitMessage(validated.publishId),
    treeSha: tree.sha,
    parentSha: mainReference.sha,
  });

  try {
    await database.createStagingReference({
      publishId: validated.publishId,
      commitSha: commit.sha,
    });
  } catch (error) {
    throw mapReferenceConflict(error);
  }

  return Object.freeze({
    publishId: validated.publishId,
    branch: createStagingBranch(validated.publishId),
    commit: commit.sha,
    baseMainSha: mainReference.sha,
  });
};

export const cleanupStagingBranch = async (
  publishId,
  env,
  {
    tokenProvider = installationTokenProvider,
    fetchImpl = globalThis.fetch,
    createClient = createGitHubClient,
    createDatabase = createGitDatabase,
    nowMs = Date.now(),
    cryptoImpl = globalThis.crypto,
  } = {},
) => {
  const token = await tokenProvider.getToken(env, { nowMs, cryptoImpl, fetchImpl });
  const client = createClient({ token, fetchImpl, authScheme: "Bearer" });
  const database = createDatabase(client);
  return database.deleteStagingReference(publishId);
};
