import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createWorkflowGitHubClient, requireGitSha, WorkflowGitHubError } from "./github-api.mjs";
import { PRODUCTION_METADATA_FILE, PRODUCTION_OUTPUT_PATHS } from "./prepare-production-publication.mjs";
import { validateDispatchInputs } from "./validate-dispatch-inputs.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const freeze = (value) => Object.freeze(value);

export class ProductionPromotionError extends Error {
  constructor(message, code = "PROMOTION_FAILED") {
    super(message);
    this.name = "ProductionPromotionError";
    this.code = code;
  }
}

const fail = (message, code) => { throw new ProductionPromotionError(message, code); };
const readReferenceSha = (value, label) => requireGitSha(value?.object?.sha, label);

export const readProductionPackage = async ({ outputDirectory, inputs } = {}) => {
  const validatedInputs = validateDispatchInputs(inputs);
  const metadataBytes = await fs.readFile(path.join(outputDirectory, PRODUCTION_METADATA_FILE));
  const metadata = JSON.parse(metadataBytes.toString("utf8"));
  if (
    metadata.schemaVersion !== 1
    || metadata.type !== "paragon-studio-production"
    || metadata.publishId !== validatedInputs.publishId
    || metadata.draftCommit !== validatedInputs.draftCommit
    || metadata.baseMainSha !== validatedInputs.baseMainSha
  ) fail("Production metadata does not match workflow inputs.", "INVALID_PRODUCTION_PACKAGE");

  const files = [];
  for (const [key, expectedPath] of Object.entries(PRODUCTION_OUTPUT_PATHS)) {
    const record = metadata.files?.[key];
    if (!record || record.path !== expectedPath) fail(`Production ${key} path is invalid.`, "INVALID_PRODUCTION_PACKAGE");
    const bytes = await fs.readFile(path.join(outputDirectory, expectedPath));
    if (bytes.length !== record.bytes || sha256(bytes) !== record.sha256) {
      fail(`Production ${key} bytes do not match metadata.`, "INVALID_PRODUCTION_PACKAGE");
    }
    files.push(freeze({ key, path: expectedPath, bytes, sha256: record.sha256 }));
  }
  return freeze({ inputs: validatedInputs, metadata: freeze(metadata), files: freeze(files) });
};

const requireSingleParent = (commit, baseMainSha) => {
  const parents = Array.isArray(commit?.parents) ? commit.parents : [];
  if (parents.length !== 1 || parents[0]?.sha !== baseMainSha) {
    fail("Draft commit parent no longer matches base_main_sha.", "DRAFT_PARENT_MISMATCH");
  }
};

export const promoteProductionPublication = async ({
  outputDirectory,
  inputs,
  client,
  productionEnabled = false,
} = {}) => {
  if (productionEnabled !== true) fail("Production publishing is disabled.", "PUBLISHING_DISABLED");
  if (typeof client?.request !== "function") throw new TypeError("A GitHub client is required.");
  const publication = await readProductionPackage({ outputDirectory, inputs });
  const { publishId, draftBranch, draftCommit, baseMainSha } = publication.inputs;

  const mainRef = await client.request("/git/ref/heads/main");
  if (readReferenceSha(mainRef, "Main reference SHA") !== baseMainSha) {
    fail("main changed before production promotion.", "STALE_MAIN_BEFORE_PROMOTION");
  }
  const draftRef = await client.request(`/git/ref/heads/${draftBranch}`);
  if (readReferenceSha(draftRef, "Draft reference SHA") !== draftCommit) {
    fail("Draft reference moved before production promotion.", "DRAFT_REF_MOVED_BEFORE_PROMOTION");
  }
  const draft = await client.request(`/git/commits/${draftCommit}`);
  requireSingleParent(draft, baseMainSha);
  const draftTreeSha = requireGitSha(draft?.tree?.sha, "Draft tree SHA");

  const entries = [];
  for (const file of publication.files) {
    const blob = await client.request("/git/blobs", {
      method: "POST",
      body: { content: file.bytes.toString("base64"), encoding: "base64" },
    });
    entries.push({ path: file.path, mode: "100644", type: "blob", sha: requireGitSha(blob?.sha, "Blob SHA") });
  }
  const tree = await client.request("/git/trees", {
    method: "POST",
    body: { base_tree: draftTreeSha, tree: entries },
  });
  const treeSha = requireGitSha(tree?.sha, "Production tree SHA");
  const commit = await client.request("/git/commits", {
    method: "POST",
    body: {
      message: `chore: publish Live PDF Studio ${publishId}`,
      tree: treeSha,
      parents: [baseMainSha],
    },
  });
  const finalCommit = requireGitSha(commit?.sha, "Production commit SHA");

  const [finalMainRef, finalDraftRef] = await Promise.all([
    client.request("/git/ref/heads/main"),
    client.request(`/git/ref/heads/${draftBranch}`),
  ]);
  if (readReferenceSha(finalMainRef, "Main reference SHA") !== baseMainSha) {
    fail("main changed immediately before fast-forward.", "STALE_MAIN_AT_PROMOTION");
  }
  if (readReferenceSha(finalDraftRef, "Draft reference SHA") !== draftCommit) {
    fail("Draft reference moved immediately before fast-forward.", "DRAFT_REF_MOVED_AT_PROMOTION");
  }

  const updated = await client.request("/git/refs/heads/main", {
    method: "PATCH",
    body: { sha: finalCommit, force: false },
  });
  if (readReferenceSha(updated, "Updated main SHA") !== finalCommit) {
    fail("GitHub did not confirm the production main reference.", "INVALID_PROMOTION_RESPONSE");
  }
  return freeze({ publishId, finalCommit, baseMainSha, draftCommit, files: freeze(publication.files.map(({ key, path: filePath, sha256: hash }) => freeze({ key, path: filePath, sha256: hash }))) });
};

const readArgument = (argv, name) => {
  const index = argv.indexOf(name);
  if (index < 0 || !argv[index + 1]) throw new Error(`Missing ${name}.`);
  return argv[index + 1];
};

const currentPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentPath) {
  try {
    const argv = process.argv.slice(2);
    const publishId = readArgument(argv, "--publish-id");
    const inputs = {
      publish_id: publishId,
      draft_branch: readArgument(argv, "--draft-branch"),
      draft_commit: readArgument(argv, "--draft-commit"),
      base_main_sha: readArgument(argv, "--base-main-sha"),
    };
    const client = createWorkflowGitHubClient({ token: process.env.GITHUB_TOKEN, repository: process.env.GITHUB_REPOSITORY });
    const result = await promoteProductionPublication({
      outputDirectory: path.resolve(readArgument(argv, "--output")),
      inputs,
      client,
      productionEnabled: process.env.PARAGON_STUDIO_PRODUCTION_ENABLED === "true",
    });
    if (process.env.GITHUB_OUTPUT) {
      await fs.appendFile(process.env.GITHUB_OUTPUT, `final_commit=${result.finalCommit}\n`, "utf8");
    }
    console.log(`[PRODUCTION PROMOTION PASS] ${result.finalCommit}`);
  } catch (error) {
    const code = error?.code ?? (error instanceof WorkflowGitHubError ? error.code : "PROMOTION_FAILED");
    console.error(`[${code}] ${error?.message ?? "Production promotion failed."}`);
    process.exitCode = 1;
  }
}
