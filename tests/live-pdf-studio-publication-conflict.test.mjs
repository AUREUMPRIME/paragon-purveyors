import assert from "node:assert/strict";
import test from "node:test";

import {
  PublicationWorkflowError,
  readDispatchInputsFromCli,
  validateDispatchInputs,
  validateGitSha,
  validatePublishId,
} from "../tools/paragon-live-pdf-workflow/validate-dispatch-inputs.mjs";
import {
  validateConflictState,
} from "../tools/paragon-live-pdf-workflow/validate-conflict-state.mjs";

const publishId = "123e4567-e89b-42d3-a456-426614174000";
const base = "1".repeat(40);
const draft = "2".repeat(40);
const input = () => ({
  publish_id: publishId,
  draft_branch: `studio-publish/${publishId}`,
  draft_commit: draft,
  base_main_sha: base,
});
const state = (overrides = {}) => ({
  inputs: input(),
  currentMainSha: base,
  draftRefSha: draft,
  draftCommitSha: draft,
  draftParentShas: [base],
  changedPaths: [
    "src/data/paragon-live-pdf-studio.json",
    "public/assets/specials/library/product-photography/ribeye-123456789abc.webp",
  ],
  ...overrides,
});
const errorCode = (callback, expected) => {
  assert.throws(callback, (error) => {
    assert.equal(error instanceof PublicationWorkflowError, true);
    assert.equal(error.code, expected);
    return true;
  });
};

test("dispatch inputs accept the exact immutable publication tuple", () => {
  const result = validateDispatchInputs(input());
  assert.deepEqual(result, {
    publishId,
    draftBranch: `studio-publish/${publishId}`,
    draftCommit: draft,
    baseMainSha: base,
  });
  assert.equal(Object.isFrozen(result), true);
});

test("dispatch inputs reject missing and unknown fields", () => {
  errorCode(() => validateDispatchInputs({}), "INVALID_INPUT");
  errorCode(() => validateDispatchInputs({ ...input(), extra: true }), "INVALID_INPUT");
});

test("publish IDs reject uppercase malformed and whitespace variants", () => {
  errorCode(() => validatePublishId(publishId.toUpperCase()), "INVALID_INPUT");
  errorCode(() => validatePublishId("not-a-uuid"), "INVALID_INPUT");
  errorCode(() => validatePublishId(` ${publishId}`), "INVALID_INPUT");
});

test("Git SHAs reject uppercase malformed and whitespace variants", () => {
  errorCode(() => validateGitSha("A".repeat(40), "sha"), "INVALID_INPUT");
  errorCode(() => validateGitSha("1".repeat(39), "sha"), "INVALID_INPUT");
  errorCode(() => validateGitSha(`${base} `, "sha"), "INVALID_INPUT");
});

test("draft branch must exactly match the publication UUID", () => {
  errorCode(
    () => validateDispatchInputs({ ...input(), draft_branch: "studio-publish/other" }),
    "INVALID_INPUT",
  );
});

test("CLI dispatch parsing rejects duplicates and preserves exact inputs", () => {
  const args = [
    "--publish-id", publishId,
    "--draft-branch", `studio-publish/${publishId}`,
    "--draft-commit", draft,
    "--base-main-sha", base,
  ];
  assert.equal(readDispatchInputsFromCli(args).draftCommit, draft);
  errorCode(() => readDispatchInputsFromCli([...args, "--publish-id", publishId]), "INVALID_INPUT");
});

test("valid pre-build conflict state is immutable and path sorted", () => {
  const result = validateConflictState(state());
  assert.equal(result.phase, "pre-build");
  assert.equal(result.draftParentSha, base);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.changedPaths), true);
  assert.deepEqual(result.changedPaths, [...result.changedPaths].sort());
});

test("stale main fails before build with the stable conflict code", () => {
  errorCode(
    () => validateConflictState(state({ currentMainSha: "3".repeat(40) })),
    "STALE_MAIN",
  );
});

test("missing draft refs fail with a stable conflict code", () => {
  errorCode(
    () => validateConflictState(state({ draftRefSha: null })),
    "DRAFT_REF_MISSING",
  );
});

test("moved draft refs or commits fail before build", () => {
  errorCode(
    () => validateConflictState(state({ draftRefSha: "4".repeat(40) })),
    "DRAFT_REF_MOVED",
  );
  errorCode(
    () => validateConflictState(state({ draftCommitSha: "4".repeat(40) })),
    "DRAFT_REF_MOVED",
  );
});

test("merge commits and parent mismatches are rejected", () => {
  errorCode(
    () => validateConflictState(state({ draftParentShas: [base, "3".repeat(40)] })),
    "DRAFT_PARENT_MISMATCH",
  );
  errorCode(
    () => validateConflictState(state({ draftParentShas: ["3".repeat(40)] })),
    "DRAFT_PARENT_MISMATCH",
  );
});

test("only canonical source and content-addressed library paths are accepted", () => {
  const result = validateConflictState(state());
  assert.equal(result.changedPaths.length, 2);
  for (const badPath of [
    "public/specials/monthly-specials.pdf",
    ".github/workflows/deploy.yml",
    "tools/build-monthly-specials-v2.mjs",
    "../escape.webp",
  ]) {
    errorCode(
      () => validateConflictState(state({ changedPaths: [badPath] })),
      "UNAPPROVED_PATH",
    );
  }
});

test("empty and duplicate changed path sets are rejected", () => {
  errorCode(() => validateConflictState(state({ changedPaths: [] })), "UNAPPROVED_PATH");
  const path = "src/data/paragon-live-pdf-studio.json";
  errorCode(
    () => validateConflictState(state({ changedPaths: [path, path] })),
    "UNAPPROVED_PATH",
  );
});

test("post-build rechecks expose distinct stale-main and moved-ref codes", () => {
  errorCode(
    () => validateConflictState(state({ phase: "post-build", currentMainSha: "3".repeat(40) })),
    "STALE_MAIN_AFTER_BUILD",
  );
  errorCode(
    () => validateConflictState(state({ phase: "post-build", draftRefSha: "3".repeat(40) })),
    "DRAFT_REF_MOVED_AFTER_BUILD",
  );
});
