import { installationTokenProvider } from "../github/app-auth.js";
import { getLatestPublicationSummary } from "../github/actions.js";
import { createGitHubClient } from "../github/client.js";
import { createGitDatabase } from "../github/git-database.js";
import {
  CANONICAL_SOURCE_PATH,
  MAX_MULTIPART_BYTES,
  MAX_UPLOAD_COUNT,
  MAX_UPLOAD_FILE_BYTES,
  MAX_VALIDATION_BODY_BYTES,
  REPOSITORY_NAME,
  REPOSITORY_OWNER,
  isProductionPublishingEnabled,
} from "../github/policy.js";
import { PUBLISH_RATE_LIMIT, VALIDATION_RATE_LIMIT } from "../rate-limit.js";

const repoPath = `/repos/${REPOSITORY_OWNER}/${REPOSITORY_NAME}`;
const decode = (value) => JSON.parse(atob(String(value).replace(/\s+/gu, "")));

export const getBootstrap = async (env, options = {}) => {
  const tokenProvider = options.tokenProvider ?? installationTokenProvider;
  const token = await tokenProvider.getToken(env, options);
  const client = (options.createClient ?? createGitHubClient)({ token, fetchImpl: options.fetchImpl ?? globalThis.fetch, authScheme: "Bearer" });
  const database = (options.createDatabase ?? createGitDatabase)(client);
  const main = await database.getMainReference();
  const source = await client.request(`${repoPath}/contents/${CANONICAL_SOURCE_PATH}?ref=${main.sha}`);
  const document = decode(source?.content);
  const publication = await (options.getLatestPublicationSummary ?? getLatestPublicationSummary)(env, { ...options, tokenProvider: { getToken: async () => token }, createClient: options.createClient });
  return Object.freeze({
    currentMainSha: main.sha,
    document: Object.freeze(document),
    assetCatalog: Object.freeze(structuredClone(document.assetLibrary ?? {})),
    revision: document.revision ?? null,
    schemaVersion: document.schemaVersion,
    productionPublishingEnabled: isProductionPublishingEnabled(
      env,
      options.productionPublishingEnabled,
    ),
    publication,
    limits: Object.freeze({
      validationPerHour: VALIDATION_RATE_LIMIT.limit,
      publishPerHour: PUBLISH_RATE_LIMIT.limit,
      maxValidationBodyBytes: MAX_VALIDATION_BODY_BYTES,
      maxUploadCount: MAX_UPLOAD_COUNT,
      maxUploadFileBytes: MAX_UPLOAD_FILE_BYTES,
      maxMultipartBytes: MAX_MULTIPART_BYTES,
    }),
  });
};
