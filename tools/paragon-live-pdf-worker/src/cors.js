const DEFAULT_ALLOWED_METHODS = "GET, POST, OPTIONS";
const DEFAULT_ALLOWED_HEADERS = "Authorization, Content-Type";

export const SECURITY_HEADERS = Object.freeze({
  "cache-control": "no-store",
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  "permissions-policy": "camera=(), geolocation=(), microphone=()",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
});

const normalizeProductionOrigin = (value) => (
  value === "https://paragonpurveyors.com" ? value : null
);

const normalizeLocalOrigin = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);
    if (
      url.origin !== value
      || url.protocol !== "http:"
      || url.hostname !== "127.0.0.1"
      || !/^\d{2,5}$/u.test(url.port)
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
};

export const getAllowedOrigins = (env) => {
  const origins = [
    normalizeProductionOrigin(env?.ALLOWED_ORIGIN),
    normalizeLocalOrigin(env?.LOCAL_ALLOWED_ORIGIN),
  ].filter(Boolean);

  return Object.freeze([...new Set(origins)]);
};

export const resolveAllowedOrigin = (request, env) => {
  const origin = request?.headers?.get?.("origin");
  if (!origin) {
    return null;
  }

  return getAllowedOrigins(env).includes(origin) ? origin : null;
};

export const hasRejectedOrigin = (request, env) => {
  const origin = request?.headers?.get?.("origin");
  return Boolean(origin && !resolveAllowedOrigin(request, env));
};

export const createResponseHeaders = (
  request,
  env,
  headers = {},
) => {
  const output = new Headers(SECURITY_HEADERS);

  for (const [name, value] of Object.entries(headers)) {
    output.set(name, value);
  }

  const allowedOrigin = resolveAllowedOrigin(request, env);
  if (allowedOrigin) {
    output.set("access-control-allow-origin", allowedOrigin);
    output.set("access-control-allow-methods", DEFAULT_ALLOWED_METHODS);
    output.set("access-control-allow-headers", DEFAULT_ALLOWED_HEADERS);
    output.set("access-control-max-age", "600");
    output.append("vary", "Origin");
  }

  return output;
};

export const jsonResponse = (
  request,
  env,
  body,
  {
    status = 200,
    headers = {},
  } = {},
) => new Response(JSON.stringify(body), {
  status,
  headers: createResponseHeaders(request, env, {
    "content-type": "application/json; charset=utf-8",
    ...headers,
  }),
});

export const handlePreflight = (request, env) => {
  if (request.method !== "OPTIONS") {
    return null;
  }

  if (hasRejectedOrigin(request, env)) {
    return jsonResponse(request, env, { error: "Origin not allowed." }, { status: 403 });
  }

  if (!resolveAllowedOrigin(request, env)) {
    return jsonResponse(request, env, { error: "Origin is required." }, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: createResponseHeaders(request, env),
  });
};
