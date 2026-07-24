import { jsonResponse } from "../cors.js";
import { verifyPassword } from "../auth.js";
import {
  extractBearerToken,
  issueSessionToken,
  verifySessionToken,
} from "../session.js";
import {
  getClientIp,
  LOGIN_RATE_LIMIT,
  loginRateLimiter,
} from "../rate-limit.js";

const MAX_LOGIN_BODY_BYTES = 4096;

const readLoginPassword = async (request) => {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return null;
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_LOGIN_BODY_BYTES) {
    return null;
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_LOGIN_BODY_BYTES) {
    return null;
  }

  try {
    const value = JSON.parse(text);
    return typeof value?.password === "string" ? value.password : null;
  } catch {
    return null;
  }
};

export const handleLogin = async (
  request,
  env,
  {
    nowMs = Date.now(),
    limiter = loginRateLimiter,
    cryptoImpl = globalThis.crypto,
  } = {},
) => {
  const rate = limiter.consume(`login:${getClientIp(request)}`, {
    ...LOGIN_RATE_LIMIT,
    nowMs,
  });

  if (!rate.allowed) {
    return jsonResponse(
      request,
      env,
      { error: "Too many login attempts." },
      {
        status: 429,
        headers: {
          "retry-after": String(rate.retryAfterSeconds),
        },
      },
    );
  }

  const password = await readLoginPassword(request);
  if (!password) {
    return jsonResponse(request, env, { error: "Invalid credentials." }, { status: 401 });
  }

  let valid = false;
  try {
    valid = await verifyPassword(password, env, { cryptoImpl });
  } catch {
    return jsonResponse(request, env, { error: "Authentication is unavailable." }, { status: 503 });
  }

  if (!valid) {
    return jsonResponse(request, env, { error: "Invalid credentials." }, { status: 401 });
  }

  const session = await issueSessionToken(env, { nowMs, cryptoImpl });
  return jsonResponse(request, env, {
    authenticated: true,
    tokenType: "Bearer",
    accessToken: session.token,
    expiresAt: new Date(session.claims.exp * 1000).toISOString(),
  });
};

export const handleSession = async (
  request,
  env,
  {
    nowMs = Date.now(),
    cryptoImpl = globalThis.crypto,
  } = {},
) => {
  const token = extractBearerToken(request);
  const claims = token
    ? await verifySessionToken(token, env, { nowMs, cryptoImpl })
    : null;

  if (!claims) {
    return jsonResponse(request, env, { authenticated: false }, { status: 401 });
  }

  return jsonResponse(request, env, {
    authenticated: true,
    subject: claims.sub,
    expiresAt: new Date(claims.exp * 1000).toISOString(),
  });
};
