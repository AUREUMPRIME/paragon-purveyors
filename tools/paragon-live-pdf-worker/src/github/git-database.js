import { GitHubApiError } from "./client.js";
import {
  createStagingRef,
  DEFAULT_BRANCH,
  normalizeGitSha,
  REPOSITORY_NAME,
  REPOSITORY_OWNER,
  STAGING_BRANCH_PREFIX,
} from "./policy.js";

const repoPath = `/repos/${REPOSITORY_OWNER}/${REPOSITORY_NAME}`;

const requireObject = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GitHubApiError(`${label} response is invalid.`, { code: "INVALID_GITHUB_RESPONSE" });
  }
  return value;
};

const readSha = (value, label) => normalizeGitSha(value, label);

export const createGitDatabase = (client) => {
  if (typeof client?.request !== "function") {
    throw new GitHubApiError("GitHub database client is unavailable.", { code: "INVALID_CLIENT" });
  }

  const getMainReference = async () => {
    const data = requireObject(
      await client.request(`${repoPath}/git/ref/heads/${DEFAULT_BRANCH}`),
      "Git reference",
    );
    return Object.freeze({ sha: readSha(data.object?.sha, "Main reference SHA") });
  };

  const getCommit = async (sha) => {
    const commitSha = normalizeGitSha(sha, "Commit SHA");
    const data = requireObject(
      await client.request(`${repoPath}/git/commits/${commitSha}`),
      "Git commit",
    );
    return Object.freeze({
      sha: readSha(data.sha, "Commit SHA"),
      treeSha: readSha(data.tree?.sha, "Commit tree SHA"),
    });
  };

  const createBlob = async ({ content, encoding }) => {
    const data = requireObject(
      await client.request(`${repoPath}/git/blobs`, {
        method: "POST",
        body: { content, encoding },
      }),
      "Git blob",
    );
    return Object.freeze({ sha: readSha(data.sha, "Blob SHA") });
  };

  const createTree = async ({ baseTreeSha, entries }) => {
    const baseTree = normalizeGitSha(baseTreeSha, "Base tree SHA");
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new GitHubApiError("Git tree entries are required.", { code: "INVALID_TREE" });
    }

    const tree = entries.map((entry) => ({
      path: entry.path,
      mode: "100644",
      type: "blob",
      sha: normalizeGitSha(entry.sha, "Blob SHA"),
    }));

    const data = requireObject(
      await client.request(`${repoPath}/git/trees`, {
        method: "POST",
        body: { base_tree: baseTree, tree },
      }),
      "Git tree",
    );
    return Object.freeze({ sha: readSha(data.sha, "Tree SHA") });
  };

  const createCommit = async ({ message, treeSha, parentSha }) => {
    if (typeof message !== "string" || message.length < 10 || message.length > 200) {
      throw new GitHubApiError("Commit message is invalid.", { code: "INVALID_COMMIT" });
    }

    const data = requireObject(
      await client.request(`${repoPath}/git/commits`, {
        method: "POST",
        body: {
          message,
          tree: normalizeGitSha(treeSha, "Tree SHA"),
          parents: [normalizeGitSha(parentSha, "Parent SHA")],
        },
      }),
      "Git commit",
    );
    return Object.freeze({ sha: readSha(data.sha, "Created commit SHA") });
  };

  const createStagingReference = async ({ publishId, commitSha }) => {
    const ref = createStagingRef(publishId);
    if (!ref.startsWith(STAGING_BRANCH_PREFIX)) {
      throw new GitHubApiError("Staging reference is invalid.", { code: "INVALID_REFERENCE" });
    }

    const expectedSha = normalizeGitSha(commitSha, "Commit SHA");
    const data = requireObject(
      await client.request(`${repoPath}/git/refs`, {
        method: "POST",
        body: { ref, sha: expectedSha },
      }),
      "Git reference",
    );
    const responseSha = readSha(data.object?.sha, "Reference SHA");
    if (data.ref !== ref || responseSha !== expectedSha) {
      throw new GitHubApiError("Created staging reference response is invalid.", {
        code: "INVALID_GITHUB_RESPONSE",
      });
    }
    return Object.freeze({ ref, sha: responseSha });
  };

  const deleteStagingReference = async (publishId) => {
    const ref = createStagingRef(publishId);
    const shortRef = ref.replace(/^refs\//u, "");
    await client.request(`${repoPath}/git/refs/${shortRef}`, { method: "DELETE" });
    return Object.freeze({ deleted: true, ref });
  };

  return Object.freeze({
    getMainReference,
    getCommit,
    createBlob,
    createTree,
    createCommit,
    createStagingReference,
    deleteStagingReference,
  });
};
