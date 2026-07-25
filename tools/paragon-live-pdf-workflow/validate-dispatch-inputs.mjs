const REQUIRED_KEYS = Object.freeze([
  "base_main_sha",
  "draft_branch",
  "draft_commit",
  "publish_id",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const SHA_PATTERN = /^[0-9a-f]{40}$/u;

const freeze = (value) => Object.freeze(value);

export class PublicationWorkflowError extends Error {
  constructor(message, code = "INVALID_INPUT") {
    super(message);
    this.name = "PublicationWorkflowError";
    this.code = code;
  }
}

const requirePlainObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PublicationWorkflowError(
      "Workflow inputs must be a plain object.",
    );
  }

  return value;
};

const requireExactKeys = (value) => {
  const actual = Object.keys(value).sort();

  if (
    actual.length !== REQUIRED_KEYS.length ||
    actual.some((key, index) => key !== REQUIRED_KEYS[index])
  ) {
    throw new PublicationWorkflowError(
      "Workflow inputs must contain exactly publish_id, draft_branch, draft_commit, and base_main_sha.",
    );
  }
};

const requireCanonicalString = (value, label) => {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value !== value.trim()
  ) {
    throw new PublicationWorkflowError(
      `${label} must be a non-empty canonical string.`,
    );
  }

  return value;
};

export const validatePublishId = (value) => {
  const normalized = requireCanonicalString(value, "publish_id");

  if (!UUID_PATTERN.test(normalized)) {
    throw new PublicationWorkflowError(
      "publish_id must be a canonical lowercase UUID.",
    );
  }

  return normalized;
};

export const validateGitSha = (value, label) => {
  const normalized = requireCanonicalString(value, label);

  if (!SHA_PATTERN.test(normalized)) {
    throw new PublicationWorkflowError(
      `${label} must be a lowercase forty-character Git SHA.`,
    );
  }

  return normalized;
};

export const validateDispatchInputs = (value) => {
  const input = requirePlainObject(value);
  requireExactKeys(input);

  const publishId = validatePublishId(input.publish_id);
  const expectedBranch = `studio-publish/${publishId}`;
  const draftBranch = requireCanonicalString(
    input.draft_branch,
    "draft_branch",
  );

  if (draftBranch !== expectedBranch) {
    throw new PublicationWorkflowError(
      `draft_branch must equal ${expectedBranch}.`,
    );
  }

  return freeze({
    publishId,
    draftBranch,
    draftCommit: validateGitSha(input.draft_commit, "draft_commit"),
    baseMainSha: validateGitSha(input.base_main_sha, "base_main_sha"),
  });
};

const parseCliArguments = (argv) => {
  const result = {};

  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];

    if (!key?.startsWith("--") || value === undefined) {
      throw new PublicationWorkflowError("CLI arguments must be --name value pairs.");
    }

    const normalizedKey = key.slice(2).replaceAll("-", "_");

    if (Object.hasOwn(result, normalizedKey)) {
      throw new PublicationWorkflowError(`Duplicate CLI argument: ${key}`);
    }

    result[normalizedKey] = value;
  }

  return result;
};

export const readDispatchInputsFromCli = (argv = process.argv.slice(2)) =>
  validateDispatchInputs(parseCliArguments(argv));
