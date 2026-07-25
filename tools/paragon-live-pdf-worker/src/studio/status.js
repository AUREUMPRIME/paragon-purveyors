import { getPublicationStatus } from "../github/actions.js";
export const readStudioPublishStatus = (publishId, env, options = {}) => (
  (options.getPublicationStatus ?? getPublicationStatus)(publishId, env, options)
);
