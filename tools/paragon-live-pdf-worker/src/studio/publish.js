import { dispatchPublishWorkflow } from "../github/actions.js";
import { cleanupStagingBranch, stagePublication } from "../github/staging.js";
import { buildPublicationChanges, validateStudioPayload } from "./validate.js";

export class PublicationDispatchError extends Error {
  constructor() {
    super("Publication workflow dispatch failed after safe staging cleanup.");
    this.name = "PublicationDispatchError";
    this.code = "WORKFLOW_DISPATCH_FAILED";
    this.status = 502;
  }
}

export const publishStudioRevision = async (payload, env, options = {}) => {
  const currentMainSha = options.currentMainSha ?? payload.baseMainSha;
  const validated = validateStudioPayload(payload, { currentMainSha });
  const changes = await buildPublicationChanges({ ...payload, ...validated });
  const stage = await (options.stagePublication ?? stagePublication)({
    publishId: payload.publishId,
    baseMainSha: validated.baseMainSha,
    changes,
  }, env, options);

  try {
    await (options.dispatchPublishWorkflow ?? dispatchPublishWorkflow)(stage, env, options);
  } catch {
    await (options.cleanupStagingBranch ?? cleanupStagingBranch)(stage.publishId, env, options);
    throw new PublicationDispatchError();
  }

  return Object.freeze({
    accepted: true,
    publishId: stage.publishId,
    draftBranch: stage.branch,
    draftCommit: stage.commit,
    status: "queued",
  });
};
