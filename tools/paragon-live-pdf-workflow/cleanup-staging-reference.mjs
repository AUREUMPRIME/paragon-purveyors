import path from "node:path";
import { fileURLToPath } from "node:url";

import { createWorkflowGitHubClient, WorkflowGitHubError } from "./github-api.mjs";
import { validatePublishId } from "./validate-dispatch-inputs.mjs";

export const cleanupStagingReference = async ({ publishId, client } = {}) => {
  const normalized = validatePublishId(publishId);
  if (typeof client?.request !== "function") throw new TypeError("A GitHub client is required.");
  const ref = `heads/studio-publish/${normalized}`;
  try {
    await client.request(`/git/refs/${ref}`, { method: "DELETE" });
    return Object.freeze({ publishId: normalized, deleted: true, alreadyMissing: false });
  } catch (error) {
    if (error instanceof WorkflowGitHubError && error.status === 404) {
      return Object.freeze({ publishId: normalized, deleted: false, alreadyMissing: true });
    }
    throw error;
  }
};

const currentPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentPath) {
  try {
    const index = process.argv.indexOf("--publish-id");
    if (index < 0 || !process.argv[index + 1]) throw new Error("Missing --publish-id.");
    const client = createWorkflowGitHubClient({ token: process.env.GITHUB_TOKEN, repository: process.env.GITHUB_REPOSITORY });
    const result = await cleanupStagingReference({ publishId: process.argv[index + 1], client });
    console.log(`[STAGING CLEANUP PASS] ${result.publishId}`);
  } catch (error) {
    console.error(`[${error?.code ?? "STAGING_CLEANUP_FAILED"}] ${error?.message ?? "Staging cleanup failed."}`);
    process.exitCode = 1;
  }
}
