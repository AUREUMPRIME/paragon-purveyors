import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createResponseHeaders,
  getAllowedOrigins,
  handlePreflight,
  hasRejectedOrigin,
  jsonResponse,
  resolveAllowedOrigin,
} from "../src/cors.js";
import {
  FixedWindowRateLimiter,
  getClientIp,
  LOGIN_RATE_LIMIT,
} from "../src/rate-limit.js";
import { handleRequest } from "../src/index.js";

const env = Object.freeze({
  ALLOWED_ORIGIN: "https://paragonpurveyors.com",
  LOCAL_ALLOWED_ORIGIN: "http://127.0.0.1:5190",
});

test("CORS allows only the exact configured production and local origins", () => {
  assert.deepEqual(getAllowedOrigins(env), [
    "https://paragonpurveyors.com",
    "http://127.0.0.1:5190",
  ]);
  assert.equal(
    resolveAllowedOrigin(new Request("https://worker.test", {
      headers: { origin: "https://paragonpurveyors.com" },
    }), env),
    "https://paragonpurveyors.com",
  );
  assert.equal(
    resolveAllowedOrigin(new Request("https://worker.test", {
      headers: { origin: "http://127.0.0.1:5190" },
    }), env),
    "http://127.0.0.1:5190",
  );
});

test("Wildcard, subdomain, path, and near-match origins are rejected", () => {
  assert.deepEqual(getAllowedOrigins({ ALLOWED_ORIGIN: "*" }), []);
  for (const origin of [
    "https://admin.paragonpurveyors.com",
    "https://paragonpurveyors.com.evil.example",
    "http://paragonpurveyors.com",
    "https://paragonpurveyors.com:443",
  ]) {
    const request = new Request("https://worker.test", { headers: { origin } });
    assert.equal(resolveAllowedOrigin(request, env), null);
    assert.equal(hasRejectedOrigin(request, env), true);
  }
});

test("Allowed preflight responses expose the locked methods and headers", () => {
  const request = new Request("https://worker.test/v1/auth/login", {
    method: "OPTIONS",
    headers: { origin: env.ALLOWED_ORIGIN },
  });
  const response = handlePreflight(request, env);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), env.ALLOWED_ORIGIN);
  assert.equal(response.headers.get("access-control-allow-methods"), "GET, POST, OPTIONS");
  assert.equal(response.headers.get("access-control-allow-headers"), "Authorization, Content-Type");
  assert.match(response.headers.get("vary"), /Origin/u);
});

test("Preflight rejects missing and unapproved origins", async () => {
  const missing = handlePreflight(
    new Request("https://worker.test", { method: "OPTIONS" }),
    env,
  );
  const rejected = handlePreflight(
    new Request("https://worker.test", {
      method: "OPTIONS",
      headers: { origin: "https://evil.example" },
    }),
    env,
  );
  assert.equal(missing.status, 403);
  assert.equal(rejected.status, 403);
  assert.equal((await rejected.json()).error, "Origin not allowed.");
});

test("JSON responses always carry no-store and hardened security headers", async () => {
  const request = new Request("https://worker.test", {
    headers: { origin: env.ALLOWED_ORIGIN },
  });
  const response = jsonResponse(request, env, { ok: true });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("content-security-policy"), /default-src 'none'/u);
  assert.equal(response.headers.get("access-control-allow-origin"), env.ALLOWED_ORIGIN);
  assert.deepEqual(await response.json(), { ok: true });

  const bare = createResponseHeaders(new Request("https://worker.test"), env);
  assert.equal(bare.has("access-control-allow-origin"), false);
});

test("Login fixed-window rate limiting permits five attempts, blocks the sixth, and resets", () => {
  const limiter = new FixedWindowRateLimiter();
  const nowMs = 1_000_000;
  for (let attempt = 1; attempt <= LOGIN_RATE_LIMIT.limit; attempt += 1) {
    const result = limiter.consume("login:203.0.113.10", {
      ...LOGIN_RATE_LIMIT,
      nowMs,
    });
    assert.equal(result.allowed, true);
  }

  const blocked = limiter.consume("login:203.0.113.10", {
    ...LOGIN_RATE_LIMIT,
    nowMs,
  });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.equal(blocked.retryAfterSeconds, 900);

  const reset = limiter.consume("login:203.0.113.10", {
    ...LOGIN_RATE_LIMIT,
    nowMs: nowMs + LOGIN_RATE_LIMIT.windowMs,
  });
  assert.equal(reset.allowed, true);
  assert.equal(reset.remaining, 4);
});

test("Client IP extraction prefers Cloudflare and safely falls back", () => {
  assert.equal(
    getClientIp(new Request("https://worker.test", {
      headers: {
        "cf-connecting-ip": "198.51.100.5",
        "x-forwarded-for": "198.51.100.6, 198.51.100.7",
      },
    })),
    "198.51.100.5",
  );
  assert.equal(
    getClientIp(new Request("https://worker.test", {
      headers: { "x-forwarded-for": "198.51.100.6, 198.51.100.7" },
    })),
    "198.51.100.6",
  );
  assert.equal(getClientIp(new Request("https://worker.test")), "unknown");
});

test("Worker routing exposes health and returns hardened JSON for unknown routes", async () => {
  const health = await handleRequest(
    new Request("https://worker.test/v1/health", {
      headers: { origin: env.ALLOWED_ORIGIN },
    }),
    env,
  );
  const healthBody = await health.json();
  assert.equal(health.status, 200);
  assert.equal(healthBody.ok, true);
  assert.equal(healthBody.service, "paragon-live-pdf-worker");
  assert.equal(healthBody.phase, "4B");

  const missing = await handleRequest(
    new Request("https://worker.test/v1/unknown"),
    env,
  );
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: "Not found." });
  assert.equal(missing.headers.get("cache-control"), "no-store");
});

test("Worker rejects unapproved origins and enables workers.dev without publication routes", async () => {
  const rejected = await handleRequest(
    new Request("https://worker.test/v1/health", {
      headers: { origin: "https://evil.example" },
    }),
    env,
  );
  assert.equal(rejected.status, 403);

  for (const routePath of [
    "/v1/bootstrap",
    "/v1/validate",
    "/v1/publish",
    "/v1/publish/test-id",
    "/v1/github/token",
  ]) {
    const response = await handleRequest(
      new Request(`https://worker.test${routePath}`, {
        method: routePath === "/v1/publish" ? "POST" : "GET",
      }),
      env,
    );
    assert.equal(response.status, 404);
  }

  const workerRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const repositoryRoot = path.resolve(workerRoot, "..", "..");
  const [workerPackageText, wranglerText, exampleText, rootPackageText, gitIgnore] = await Promise.all([
    readFile(path.join(workerRoot, "package.json"), "utf8"),
    readFile(path.join(workerRoot, "wrangler.jsonc"), "utf8"),
    readFile(path.join(workerRoot, ".dev.vars.example"), "utf8"),
    readFile(path.join(repositoryRoot, "package.json"), "utf8"),
    readFile(path.join(repositoryRoot, ".gitignore"), "utf8"),
  ]);
  const workerPackage = JSON.parse(workerPackageText);
  const wrangler = JSON.parse(wranglerText);
  const rootPackage = JSON.parse(rootPackageText);

  assert.match(workerPackage.devDependencies.wrangler, /^\^4\.36\.0$/u);
  assert.equal(wrangler.workers_dev, true);
  assert.deepEqual(wrangler.vars, {
    PASSWORD_PBKDF2_ITERATIONS: "210000",
    SESSION_TTL_SECONDS: "28800",
    SESSION_AUDIENCE: "paragon-live-pdf-studio",
    PUBLISH_WORKFLOW_ID: "publish-live-pdf-studio.yml",
    PUBLISH_WORKFLOW_REF: "main",
    VALIDATION_RATE_LIMIT: "60",
    PUBLISH_RATE_LIMIT: "10",
    RATE_LIMIT_WINDOW_SECONDS: "3600",
    MAX_UPLOAD_COUNT: "32",
    MAX_UPLOAD_FILE_BYTES: "8388608",
    MAX_MULTIPART_BYTES: "67108864",
    PRODUCTION_PUBLISHING_ENABLED: "false",
  });
  assert.deepEqual(wrangler.secrets.required, [
    "PASSWORD_SALT_B64",
    "PASSWORD_HASH_B64",
    "SESSION_SECRET_B64",
    "ALLOWED_ORIGIN",
    "LOCAL_ALLOWED_ORIGIN",
    "GITHUB_APP_CLIENT_ID",
    "GITHUB_APP_INSTALLATION_ID",
    "GITHUB_APP_PRIVATE_KEY_PKCS8_PEM",
  ]);
  assert.match(exampleText, /REPLACE_WITH_BASE64_16_BYTE_SALT/u);
  assert.doesNotMatch(exampleText, /ghp_|github_pat_|PRIVATE KEY/u);
  assert.match(rootPackage.scripts["test:specials:contracts"], /auth-session\.test\.mjs/u);
  assert.match(rootPackage.scripts["test:specials:contracts"], /cors-rate-limit\.test\.mjs/u);
  assert.equal(
    rootPackage.scripts["studio:worker:test"],
    "node --test tools/paragon-live-pdf-worker/test/auth-session.test.mjs tools/paragon-live-pdf-worker/test/cors-rate-limit.test.mjs",
  );
  assert.match(gitIgnore, /tools\/paragon-live-pdf-worker\/\.dev\.vars/u);
  assert.match(gitIgnore, /!tools\/paragon-live-pdf-worker\/\.dev\.vars\.example/u);
});
