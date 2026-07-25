import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  isAllowedPublicationPath,
} from "../paragon-live-pdf-worker/src/github/policy.js";
import {
  PublicationWorkflowError,
  readDispatchInputsFromCli,
  validateDispatchInputs,
} from "./validate-dispatch-inputs.mjs";

const execFile = promisify(execFileCallback);
const freeze = (value) => Object.freeze(value);
const POST_BUILD = "post-build";

const conflictCode = (base, phase) =>
  phase === POST_BUILD ? `${base}_AFTER_BUILD` : base;

const fail = (message, code) => {
  throw new PublicationWorkflowError(message, code);
};

const requireShaOrNull = (value, label) => {
  if (value === null) return null;

  if (typeof value !== "string" || !/^[0-9a-f]{40}$/u.test(value)) {
    fail(`${label} must be null or a lowercase forty-character Git SHA.`, "INVALID_STATE");
  }

  return value;
};

const normalizeChangedPaths = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    fail("The draft commit must change at least one approved source path.", "UNAPPROVED_PATH");
  }

  const paths = value.map((item) => {
    if (
      typeof item !== "string" ||
      item.length === 0 ||
      item !== item.trim() ||
      item.includes("\\") ||
      item.includes("..") ||
      !isAllowedPublicationPath(item)
    ) {
      fail(`The draft commit contains an unapproved path: ${String(item)}`, "UNAPPROVED_PATH");
    }

    return item;
  });

  if (new Set(paths).size !== paths.length) {
    fail("The draft commit contains duplicate changed paths.", "UNAPPROVED_PATH");
  }

  return freeze([...paths].sort());
};

export const validateConflictState = ({
  inputs: inputValue,
  currentMainSha,
  draftRefSha,
  draftCommitSha,
  draftParentShas,
  changedPaths,
  phase = "pre-build",
} = {}) => {
  const inputs = validateDispatchInputs(inputValue);

  if (phase !== "pre-build" && phase !== POST_BUILD) {
    fail("Conflict validation phase is invalid.", "INVALID_STATE");
  }

  const main = requireShaOrNull(currentMainSha, "currentMainSha");
  const ref = requireShaOrNull(draftRefSha, "draftRefSha");
  const commit = requireShaOrNull(draftCommitSha, "draftCommitSha");

  if (main !== inputs.baseMainSha) {
    fail(
      "origin/main no longer matches base_main_sha.",
      conflictCode("STALE_MAIN", phase),
    );
  }

  if (ref === null) {
    fail("The requested draft branch does not exist.", "DRAFT_REF_MISSING");
  }

  if (ref !== inputs.draftCommit || commit !== inputs.draftCommit) {
    fail(
      "The draft reference no longer matches draft_commit.",
      conflictCode("DRAFT_REF_MOVED", phase),
    );
  }

  if (!Array.isArray(draftParentShas) || draftParentShas.length !== 1) {
    fail(
      "The draft commit must have exactly one parent.",
      "DRAFT_PARENT_MISMATCH",
    );
  }

  const parent = requireShaOrNull(draftParentShas[0], "draft parent");

  if (parent !== inputs.baseMainSha) {
    fail(
      "The draft commit parent must equal base_main_sha.",
      "DRAFT_PARENT_MISMATCH",
    );
  }

  return freeze({
    phase,
    inputs,
    currentMainSha: main,
    draftRefSha: ref,
    draftCommitSha: commit,
    draftParentSha: parent,
    changedPaths: normalizeChangedPaths(changedPaths),
  });
};

const runGit = async (args, options = {}) => {
  const result = await execFile("git", args, {
    cwd: options.cwd ?? process.cwd(),
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024,
  });

  return result.stdout.trim();
};

const readRemoteRefs = async (inputs, cwd) => {
  const output = await runGit([
    "ls-remote",
    "--heads",
    "origin",
    "refs/heads/main",
    `refs/heads/${inputs.draftBranch}`,
  ], { cwd });
  const refs = new Map();

  for (const line of output.split(/\r?\n/u).filter(Boolean)) {
    const [sha, ref] = line.split(/\s+/u);
    refs.set(ref, sha);
  }

  return {
    currentMainSha: refs.get("refs/heads/main") ?? null,
    draftRefSha: refs.get(`refs/heads/${inputs.draftBranch}`) ?? null,
  };
};

export const inspectRepositoryConflictState = async ({
  inputs: inputValue,
  phase = "pre-build",
  cwd = process.cwd(),
} = {}) => {
  const inputs = validateDispatchInputs(inputValue);
  const refs = await readRemoteRefs(inputs, cwd);
  const commitLine = await runGit([
    "rev-list",
    "--parents",
    "-n",
    "1",
    inputs.draftCommit,
  ], { cwd });
  const [draftCommitSha, ...draftParentShas] = commitLine.split(/\s+/u);
  const changedOutput = await runGit([
    "diff",
    "--name-only",
    `${inputs.baseMainSha}..${inputs.draftCommit}`,
  ], { cwd });
  const changedPaths = changedOutput.split(/\r?\n/u).filter(Boolean);

  return validateConflictState({
    inputs: {
      publish_id: inputs.publishId,
      draft_branch: inputs.draftBranch,
      draft_commit: inputs.draftCommit,
      base_main_sha: inputs.baseMainSha,
    },
    ...refs,
    draftCommitSha,
    draftParentShas,
    changedPaths,
    phase,
  });
};

const isCli = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  try {
    const argv = process.argv.slice(2);
    const phaseIndex = argv.indexOf("--phase");
    const phase = phaseIndex >= 0 ? argv.splice(phaseIndex, 2)[1] : "pre-build";
    const inputs = readDispatchInputsFromCli(argv);
    const result = await inspectRepositoryConflictState({
      inputs: {
        publish_id: inputs.publishId,
        draft_branch: inputs.draftBranch,
        draft_commit: inputs.draftCommit,
        base_main_sha: inputs.baseMainSha,
      },
      phase,
    });
    console.log(JSON.stringify(result));
  } catch (error) {
    const code = error?.code ?? "CONFLICT_VALIDATION_FAILED";
    console.error(`[${code}] ${error?.message ?? "Conflict validation failed."}`);
    process.exitCode = 1;
  }
}
