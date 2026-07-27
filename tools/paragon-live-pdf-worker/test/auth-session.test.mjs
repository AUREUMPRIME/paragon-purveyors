import test from "node:test";
import assert from "node:assert/strict";

import {
  bytesToBase64,
  constantTimeEqual,
  createPasswordVerifierRecord,
  verifyPassword,
} from "../src/auth.js";
import {
  extractBearerToken,
  issueSessionToken,
  SESSION_MAX_SECONDS,
  verifySessionToken,
} from "../src/session.js";
import { handleLogin, handleSession } from "../src/routes/auth.js";
import { FixedWindowRateLimiter } from "../src/rate-limit.js";

const PASSWORD = "Paragon Phase 4B Test Password";
const NOW_MS = Date.UTC(2026, 6, 24, 12, 0, 0);

const createEnv = async () => {
  const record = await createPasswordVerifierRecord(PASSWORD);
  return {
    PASSWORD_SALT_B64: record.saltBase64,
    PASSWORD_HASH_B64: record.hashBase64,
    PASSWORD_PBKDF2_ITERATIONS: String(record.iterations),
    SESSION_SECRET_B64: bytesToBase64(
      crypto.getRandomValues(new Uint8Array(32)),
    ),
    SESSION_TTL_SECONDS: String(SESSION_MAX_SECONDS),
    SESSION_AUDIENCE: "paragon-live-pdf-studio",
    ALLOWED_ORIGIN: "https://paragonpurveyors.com",
    LOCAL_ALLOWED_ORIGIN: "http://127.0.0.1:5190",
  };
};

test("PBKDF2 verifier records contain salt and hash only and validate the password", async () => {
  const record = await createPasswordVerifierRecord(PASSWORD);
  assert.equal(record.iterations, 100_000);
  assert.notEqual(record.saltBase64, PASSWORD);
  assert.notEqual(record.hashBase64, PASSWORD);
  assert.equal(Object.hasOwn(record, "password"), false);

  const env = {
    PASSWORD_SALT_B64: record.saltBase64,
    PASSWORD_HASH_B64: record.hashBase64,
    PASSWORD_PBKDF2_ITERATIONS: String(record.iterations),
  };
  assert.equal(await verifyPassword(PASSWORD, env), true);
});

test("PBKDF2 iterations are locked to the Cloudflare runtime ceiling", async () => {
  await assert.rejects(
    () => createPasswordVerifierRecord(PASSWORD, {
      iterations: 100_001,
    }),
    /PBKDF2 iteration count is invalid/u,
  );
});

test("Password verification rejects incorrect and oversized credentials", async () => {
  const env = await createEnv();
  assert.equal(await verifyPassword("incorrect", env), false);
  assert.equal(await verifyPassword("x".repeat(513), env), false);
  assert.equal(await verifyPassword("", env), false);
});

test("Constant-time byte comparison handles equal, different, and unequal lengths", () => {
  assert.equal(
    constantTimeEqual(Uint8Array.of(1, 2, 3), Uint8Array.of(1, 2, 3)),
    true,
  );
  assert.equal(
    constantTimeEqual(Uint8Array.of(1, 2, 3), Uint8Array.of(1, 2, 4)),
    false,
  );
  assert.equal(
    constantTimeEqual(Uint8Array.of(1, 2), Uint8Array.of(1, 2, 0)),
    false,
  );
});

test("Session issuance locks subject, audience, nonce, and eight-hour maximum", async () => {
  const env = await createEnv();
  const session = await issueSessionToken(env, {
    nowMs: NOW_MS,
    nonce: "fixed-nonce-1234567890",
  });
  assert.equal(session.token.split(".").length, 3);
  assert.equal(session.claims.sub, "paragon-admin");
  assert.equal(session.claims.aud, "paragon-live-pdf-studio");
  assert.equal(session.claims.nonce, "fixed-nonce-1234567890");
  assert.equal(session.claims.exp - session.claims.iat, SESSION_MAX_SECONDS);
  assert.equal(session.token.includes(env.SESSION_SECRET_B64), false);
});

test("A valid signed bearer session verifies with the expected claims", async () => {
  const env = await createEnv();
  const session = await issueSessionToken(env, { nowMs: NOW_MS });
  const claims = await verifySessionToken(session.token, env, {
    nowMs: NOW_MS + 1_000,
  });
  assert.equal(claims?.sub, "paragon-admin");
  assert.equal(claims?.aud, "paragon-live-pdf-studio");
  assert.equal(typeof claims?.nonce, "string");
});

test("Tampered session payloads and signatures are rejected", async () => {
  const env = await createEnv();
  const session = await issueSessionToken(env, { nowMs: NOW_MS });
  const segments = session.token.split(".");
  const tamperedPayload = `${segments[0]}.${segments[1]}x.${segments[2]}`;
  const signatureReplacement = segments[2][0] === "A" ? "B" : "A";
  const tamperedSignature = `${segments[0]}.${segments[1]}.${signatureReplacement}${segments[2].slice(1)}`;
  assert.equal(await verifySessionToken(tamperedPayload, env, { nowMs: NOW_MS }), null);
  assert.equal(await verifySessionToken(tamperedSignature, env, { nowMs: NOW_MS }), null);
});

test("Expired sessions are rejected and session TTL cannot exceed eight hours", async () => {
  const env = await createEnv();
  const session = await issueSessionToken(env, { nowMs: NOW_MS });
  assert.equal(
    await verifySessionToken(session.token, env, {
      nowMs: NOW_MS + (SESSION_MAX_SECONDS + 1) * 1_000,
    }),
    null,
  );

  await assert.rejects(
    () => issueSessionToken(
      { ...env, SESSION_TTL_SECONDS: String(SESSION_MAX_SECONDS + 1) },
      { nowMs: NOW_MS },
    ),
    /SESSION_TTL_SECONDS/u,
  );
});

test("Bearer extraction accepts only the exact Authorization scheme", () => {
  assert.equal(
    extractBearerToken(new Request("https://worker.test", {
      headers: { authorization: "Bearer abc.def.ghi" },
    })),
    "abc.def.ghi",
  );
  assert.equal(
    extractBearerToken(new Request("https://worker.test", {
      headers: { authorization: "Basic abc" },
    })),
    null,
  );
  assert.equal(extractBearerToken(new Request("https://worker.test")), null);
});

test("Login and session routes complete an authenticated flow without returning secrets", async () => {
  const env = await createEnv();
  const limiter = new FixedWindowRateLimiter();
  const loginRequest = new Request("https://worker.test/v1/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: env.ALLOWED_ORIGIN,
      "cf-connecting-ip": "203.0.113.10",
    },
    body: JSON.stringify({ password: PASSWORD }),
  });
  const loginResponse = await handleLogin(loginRequest, env, {
    nowMs: NOW_MS,
    limiter,
  });
  const loginBody = await loginResponse.json();
  assert.equal(loginResponse.status, 200);
  assert.equal(loginBody.authenticated, true);
  assert.equal(loginBody.tokenType, "Bearer");
  assert.equal(typeof loginBody.accessToken, "string");
  assert.equal(JSON.stringify(loginBody).includes(env.SESSION_SECRET_B64), false);
  assert.equal(JSON.stringify(loginBody).includes(env.PASSWORD_HASH_B64), false);
  assert.equal(loginResponse.headers.get("cache-control"), "no-store");

  const sessionRequest = new Request("https://worker.test/v1/auth/session", {
    headers: {
      authorization: `Bearer ${loginBody.accessToken}`,
      origin: env.ALLOWED_ORIGIN,
    },
  });
  const sessionResponse = await handleSession(sessionRequest, env, {
    nowMs: NOW_MS + 1_000,
  });
  const sessionBody = await sessionResponse.json();
  assert.equal(sessionResponse.status, 200);
  assert.deepEqual(Object.keys(sessionBody).sort(), [
    "authenticated",
    "expiresAt",
    "subject",
  ]);
  assert.equal(sessionBody.subject, "paragon-admin");
});
