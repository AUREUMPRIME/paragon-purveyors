const STUDIO_API_ROUTES = Object.freeze({
  login: "/v1/auth/login",
  session: "/v1/auth/session",
  bootstrap: "/v1/studio/bootstrap",
  validate: "/v1/studio/validate",
  publish: "/v1/studio/publish",
});

const normalizeBaseUrl = (value) => String(value ?? "").replace(/\/+$/u, "");

const resolveRequestUrl = (baseUrl, route) =>
  `${normalizeBaseUrl(baseUrl)}${route}`;

const parseRetryAfterSeconds = (response) => {
  const value = Number(response.headers.get("retry-after"));
  return Number.isFinite(value) && value >= 0 ? value : null;
};

const readJsonResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
};

export class StudioApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      code = "REQUEST_FAILED",
      retryAfterSeconds = null,
      payload = null,
      cause,
    } = {},
  ) {
    super(message, cause ? { cause } : undefined);
    this.name = "StudioApiError";
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.payload = payload;
  }
}

export const createStudioApiClient = ({
  baseUrl = "",
  fetchImpl = globalThis.fetch,
  onUnauthorized = () => {},
} = {}) => {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("A fetch implementation is required.");
  }

  let unauthorizedHandler = onUnauthorized;

  const request = async (
    route,
    {
      method = "GET",
      body,
      bodyType = "json",
      accessToken = null,
    } = {},
  ) => {
    const headers = new Headers({
      Accept: "application/json",
    });

    if (body !== undefined && bodyType === "json") {
      headers.set("Content-Type", "application/json");
    }

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let response;

    try {
      response = await fetchImpl(resolveRequestUrl(baseUrl, route), {
        method,
        headers,
        body,
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
      });
    } catch (cause) {
      throw new StudioApiError("Unable to reach the Studio service.", {
        code: "NETWORK_ERROR",
        cause,
      });
    }

    const payload = await readJsonResponse(response);

    if (!response.ok) {
      const error = new StudioApiError(
        payload?.error || `Studio request failed with HTTP ${response.status}.`,
        {
          status: response.status,
          code: payload?.code || `HTTP_${response.status}`,
          retryAfterSeconds: parseRetryAfterSeconds(response),
          payload,
        },
      );

      if (response.status === 401) {
        await unauthorizedHandler(error);
      }

      throw error;
    }

    return payload;
  };

  return Object.freeze({
    login(password) {
      if (typeof password !== "string" || password.length === 0) {
        throw new TypeError("A password is required.");
      }

      return request(STUDIO_API_ROUTES.login, {
        method: "POST",
        body: JSON.stringify({ password }),
      });
    },
    session(accessToken) {
      return request(STUDIO_API_ROUTES.session, { accessToken });
    },
    bootstrap(accessToken) {
      return request(STUDIO_API_ROUTES.bootstrap, { accessToken });
    },
    validate(accessToken, payload) {
      if (!payload || typeof payload !== "object") {
        throw new TypeError("A validation payload is required.");
      }
      return request(STUDIO_API_ROUTES.validate, {
        method: "POST",
        body: JSON.stringify(payload),
        accessToken,
      });
    },
    publish(accessToken, formData) {
      if (!formData || typeof formData.append !== "function") {
        throw new TypeError("Publication FormData is required.");
      }
      return request(STUDIO_API_ROUTES.publish, {
        method: "POST",
        body: formData,
        bodyType: "form",
        accessToken,
      });
    },
    publicationStatus(accessToken, publishId) {
      if (typeof publishId !== "string" || publishId.length === 0) {
        throw new TypeError("A publication ID is required.");
      }
      return request(
        `${STUDIO_API_ROUTES.publish}/${encodeURIComponent(publishId)}`,
        { accessToken },
      );
    },
    setUnauthorizedHandler(handler) {
      unauthorizedHandler = typeof handler === "function" ? handler : () => {};
    },
  });
};
