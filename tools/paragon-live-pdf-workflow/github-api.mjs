const SHA_PATTERN = /^[0-9a-f]{40}$/u;
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u;

export class WorkflowGitHubError extends Error {
  constructor(message, { code = "GITHUB_API_ERROR", status = 0 } = {}) {
    super(message);
    this.name = "WorkflowGitHubError";
    this.code = code;
    this.status = status;
  }
}

const requireToken = (value) => {
  if (typeof value !== "string" || value.length < 20 || value.length > 4096) {
    throw new WorkflowGitHubError("GitHub workflow token is unavailable.", {
      code: "INVALID_TOKEN",
    });
  }
  return value;
};

const requireRepository = (value) => {
  if (typeof value !== "string" || !REPOSITORY_PATTERN.test(value)) {
    throw new WorkflowGitHubError("GitHub repository must use owner/name form.", {
      code: "INVALID_REPOSITORY",
    });
  }
  return value;
};

const normalizeEndpoint = (value) => {
  if (
    typeof value !== "string"
    || !value.startsWith("/")
    || value.startsWith("//")
    || value.includes("\\")
    || value.includes("..")
  ) {
    throw new WorkflowGitHubError("GitHub API endpoint is invalid.", {
      code: "INVALID_ENDPOINT",
    });
  }
  return value;
};

export const requireGitSha = (value, label = "Git SHA") => {
  if (typeof value !== "string" || !SHA_PATTERN.test(value)) {
    throw new WorkflowGitHubError(`${label} must be a lowercase forty-character Git SHA.`, {
      code: "INVALID_GIT_SHA",
    });
  }
  return value;
};

export const createWorkflowGitHubClient = ({
  token,
  repository,
  fetchImpl = globalThis.fetch,
} = {}) => {
  const credential = requireToken(token);
  const repositoryName = requireRepository(repository);
  if (typeof fetchImpl !== "function") {
    throw new WorkflowGitHubError("GitHub network client is unavailable.", {
      code: "INVALID_FETCH",
    });
  }

  const request = async (endpoint, { method = "GET", body } = {}) => {
    const path = normalizeEndpoint(endpoint);
    const normalizedMethod = String(method).toUpperCase();
    if (!new Set(["GET", "POST", "PATCH", "DELETE"]).has(normalizedMethod)) {
      throw new WorkflowGitHubError("GitHub HTTP method is not allowed.", {
        code: "INVALID_METHOD",
      });
    }

    const headers = new Headers({
      accept: "application/vnd.github+json",
      authorization: `Bearer ${credential}`,
      "user-agent": "Paragon-Live-PDF-Studio-Workflow",
      "x-github-api-version": "2026-03-10",
    });
    let payload;
    if (body !== undefined) {
      headers.set("content-type", "application/json; charset=utf-8");
      payload = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetchImpl(`https://api.github.com/repos/${repositoryName}${path}`, {
        method: normalizedMethod,
        headers,
        body: payload,
      });
    } catch {
      throw new WorkflowGitHubError("GitHub request could not be completed.", {
        code: "NETWORK_ERROR",
      });
    }

    if (!response.ok) {
      throw new WorkflowGitHubError(`GitHub request failed with HTTP ${response.status}.`, {
        status: response.status,
        code: response.status === 409 || response.status === 422
          ? "GITHUB_CONFLICT"
          : "GITHUB_HTTP_ERROR",
      });
    }

    if (response.status === 204) return null;
    try {
      return await response.json();
    } catch {
      throw new WorkflowGitHubError("GitHub returned invalid JSON.", {
        status: response.status,
        code: "INVALID_GITHUB_RESPONSE",
      });
    }
  };

  return Object.freeze({ request, repository: repositoryName });
};
