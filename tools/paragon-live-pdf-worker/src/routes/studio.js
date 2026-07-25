import { jsonResponse } from "../cors.js";
import { extractBearerToken, verifySessionToken } from "../session.js";
import {
  createSessionRateKey,
  PUBLISH_RATE_LIMIT,
  studioRateLimiter,
  VALIDATION_RATE_LIMIT,
} from "../rate-limit.js";
import { RequestValidationError, readJsonRequest, readPublishForm } from "../validate-upload.js";
import { StagingConflictError } from "../github/staging.js";
import { GitHubApiError } from "../github/client.js";
import { isProductionPublishingEnabled } from "../github/policy.js";
import { getBootstrap } from "../studio/bootstrap.js";
import { publishStudioRevision } from "../studio/publish.js";
import { readStudioPublishStatus } from "../studio/status.js";
import { getCurrentMainSha, StudioValidationError, validateStudioPayload } from "../studio/validate.js";

const PUBLIC_MESSAGES = Object.freeze({
  INVALID_DOCUMENT: "Document validation failed.",
  STALE_MAIN: "The live revision changed. Reload before continuing.",
  STAGING_REF_EXISTS: "This publication already exists.",
  PUBLISHING_DISABLED: "Production publishing is disabled.",
});

const errorResponse = (request, env, error) => {
  const status = error instanceof StagingConflictError
    ? 409
    : error instanceof GitHubApiError
      ? 502
      : error?.status ?? 500;
  const code = String(error?.code ?? "INTERNAL_ERROR");
  return jsonResponse(request, env, {
    error: PUBLIC_MESSAGES[code] ?? (status === 500 ? "Internal server error." : "Request could not be completed."),
    code,
  }, { status });
};

const authenticate = async (request, env, options) => {
  const token = extractBearerToken(request);
  return token ? (options.verifySessionToken ?? verifySessionToken)(token, env, options) : null;
};

const consume = (claims, operation, limiter, nowMs) => limiter.consume(
  createSessionRateKey(claims, operation),
  { ...(operation === "validate" ? VALIDATION_RATE_LIMIT : PUBLISH_RATE_LIMIT), nowMs },
);

export const handleStudioRoute = async (request, env, options = {}) => {
  const url = new URL(request.url);
  const statusMatch = /^\/v1\/studio\/publish\/([0-9a-f-]+)$/u.exec(url.pathname);
  const isStudioRoute = (request.method === "GET" && url.pathname === "/v1/studio/bootstrap")
    || (request.method === "POST" && url.pathname === "/v1/studio/validate")
    || (request.method === "POST" && url.pathname === "/v1/studio/publish")
    || (request.method === "GET" && Boolean(statusMatch));
  if (!isStudioRoute) return null;

  const claims = await authenticate(request, env, options);
  if (!claims) return jsonResponse(request, env, { error: "Authentication required." }, { status: 401 });

  const limiter = options.limiter ?? studioRateLimiter;
  const nowMs = options.nowMs ?? Date.now();

  try {
    if (request.method === "GET" && url.pathname === "/v1/studio/bootstrap") {
      return jsonResponse(request, env, await (options.getBootstrap ?? getBootstrap)(env, options));
    }

    if (request.method === "POST" && url.pathname === "/v1/studio/validate") {
      const rate = consume(claims, "validate", limiter, nowMs);
      if (!rate.allowed) return jsonResponse(request, env, { error: "Too many validation attempts." }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
      const payload = await readJsonRequest(request);
      const currentMainSha = options.currentMainSha
        ?? await (options.getCurrentMainSha ?? getCurrentMainSha)(env, options);
      const result = (options.validateStudioPayload ?? validateStudioPayload)(payload, { currentMainSha });
      return jsonResponse(request, env, { valid: true, currentMainSha: result.baseMainSha, errors: [], warnings: [], limits: result.limits });
    }

    if (request.method === "POST" && url.pathname === "/v1/studio/publish") {
      const enabled = (options.isProductionPublishingEnabled ?? isProductionPublishingEnabled)(
        env,
        options.productionPublishingEnabled,
      );
      if (!enabled) {
        return jsonResponse(request, env, {
          error: PUBLIC_MESSAGES.PUBLISHING_DISABLED,
          code: "PUBLISHING_DISABLED",
        }, { status: 503 });
      }
      const rate = consume(claims, "publish", limiter, nowMs);
      if (!rate.allowed) return jsonResponse(request, env, { error: "Too many publication attempts." }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
      const payload = await readPublishForm(request, options.limits);
      return jsonResponse(request, env, await (options.publishStudioRevision ?? publishStudioRevision)(payload, env, options), { status: 202 });
    }

    if (request.method === "GET" && statusMatch) {
      const result = await (options.readStudioPublishStatus ?? readStudioPublishStatus)(statusMatch[1], env, options);
      if (!result) return jsonResponse(request, env, { error: "Publication not found." }, { status: 404 });
      return jsonResponse(request, env, result);
    }

    return null;
  } catch (error) {
    if (error instanceof RequestValidationError || error instanceof StudioValidationError || error instanceof StagingConflictError || error instanceof GitHubApiError) {
      return errorResponse(request, env, error);
    }
    return jsonResponse(request, env, { error: "Internal server error." }, { status: 500 });
  }
};
