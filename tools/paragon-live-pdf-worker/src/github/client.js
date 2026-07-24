import {
  GITHUB_API_BASE,
  GITHUB_API_VERSION,
  GITHUB_USER_AGENT,
} from "./policy.js";

export class GitHubApiError extends Error {
  constructor(message, { status = 0, code = "GITHUB_API_ERROR" } = {}) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.code = code;
  }
}

const requireToken = (value) => {
  if (typeof value !== "string" || value.length < 20 || value.length > 4096) {
    throw new GitHubApiError("GitHub authentication is unavailable.", { code: "INVALID_TOKEN" });
  }

  return value;
};

const normalizeEndpoint = (endpoint) => {
  if (
    typeof endpoint !== "string"
    || !endpoint.startsWith("/")
    || endpoint.startsWith("//")
    || endpoint.includes("\\")
    || endpoint.includes("..")
    || /^[a-z][a-z0-9+.-]*:/iu.test(endpoint)
  ) {
    throw new GitHubApiError("GitHub endpoint is not allowed.", { code: "INVALID_ENDPOINT" });
  }

  return endpoint;
};

const safeResponseMessage = (response) => (
  `GitHub request failed with HTTP ${response.status}.`
);

export const createGitHubClient = ({
  token,
  fetchImpl = globalThis.fetch,
  authScheme = "Bearer",
} = {}) => {
  const credential = requireToken(token);
  if (typeof fetchImpl !== "function") {
    throw new GitHubApiError("GitHub network client is unavailable.", { code: "INVALID_FETCH" });
  }

  if (authScheme !== "Bearer") {
    throw new GitHubApiError("GitHub authorization scheme is invalid.", { code: "INVALID_AUTH_SCHEME" });
  }

  const request = async (endpoint, { method = "GET", body } = {}) => {
    const path = normalizeEndpoint(endpoint);
    const normalizedMethod = String(method).toUpperCase();
    if (!new Set(["GET", "POST", "DELETE"]).has(normalizedMethod)) {
      throw new GitHubApiError("GitHub HTTP method is not allowed.", { code: "INVALID_METHOD" });
    }

    const headers = new Headers({
      accept: "application/vnd.github+json",
      authorization: `${authScheme} ${credential}`,
      "user-agent": GITHUB_USER_AGENT,
      "x-github-api-version": GITHUB_API_VERSION,
    });

    let payload;
    if (body !== undefined) {
      headers.set("content-type", "application/json; charset=utf-8");
      payload = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetchImpl(`${GITHUB_API_BASE}${path}`, {
        method: normalizedMethod,
        headers,
        body: payload,
      });
    } catch {
      throw new GitHubApiError("GitHub request could not be completed.", { code: "NETWORK_ERROR" });
    }

    if (!response.ok) {
      const message = safeResponseMessage(response);
      throw new GitHubApiError(message, {
        status: response.status,
        code: response.status === 422 ? "GITHUB_CONFLICT" : "GITHUB_HTTP_ERROR",
      });
    }

    if (response.status === 204) {
      return null;
    }

    try {
      return await response.json();
    } catch {
      throw new GitHubApiError("GitHub returned invalid JSON.", {
        status: response.status,
        code: "INVALID_GITHUB_RESPONSE",
      });
    }
  };

  return Object.freeze({ request });
};
