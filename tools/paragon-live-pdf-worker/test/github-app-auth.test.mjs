import assert from "node:assert/strict";
import test from "node:test";
import { webcrypto } from "node:crypto";

import {
  createGitHubAppJwt,
  InstallationTokenProvider,
  requestInstallationToken,
} from "../src/github/app-auth.js";

const encoder = new TextEncoder();

const toPem = (bytes) => {
  const base64 = Buffer.from(bytes).toString("base64");
  const lines = base64.match(/.{1,64}/gu) ?? [];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join("\n")}\n-----END PRIVATE KEY-----`;
};

const decodeBase64Url = (value) => Buffer.from(
  value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "="),
  "base64",
);

const decodeJwt = (token) => {
  const [header, payload, signature] = token.split(".");
  return {
    header: JSON.parse(decodeBase64Url(header).toString("utf8")),
    claims: JSON.parse(decodeBase64Url(payload).toString("utf8")),
    signature: new Uint8Array(decodeBase64Url(signature)),
    unsigned: `${header}.${payload}`,
  };
};

let keyFixturePromise;
const getKeyFixture = async () => {
  if (!keyFixturePromise) {
    keyFixturePromise = (async () => {
      const keys = await webcrypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["sign", "verify"],
      );
      const pkcs8 = new Uint8Array(await webcrypto.subtle.exportKey("pkcs8", keys.privateKey));
      return {
        env: {
          GITHUB_APP_CLIENT_ID: "123456789",
          GITHUB_APP_INSTALLATION_ID: "987654321",
          GITHUB_APP_PRIVATE_KEY_PKCS8_PEM: toPem(pkcs8),
        },
        publicKey: keys.publicKey,
      };
    })();
  }
  return keyFixturePromise;
};

const tokenResponse = (nowMs, overrides = {}) => new Response(JSON.stringify({
  token: "ghs_installation_token_value_1234567890",
  expires_at: new Date(nowMs + 60 * 60 * 1000).toISOString(),
  ...overrides,
}), {
  status: 201,
  headers: { "content-type": "application/json" },
});

test("GitHub App JWT locks RS256 header, client ID issuer, drift, and lifetime", async () => {
  const { env } = await getKeyFixture();
  const nowMs = Date.UTC(2026, 6, 24, 12, 0, 0);
  const result = await createGitHubAppJwt(env, { nowMs, cryptoImpl: webcrypto });
  const decoded = decodeJwt(result.token);

  assert.deepEqual(decoded.header, { alg: "RS256", typ: "JWT" });
  assert.deepEqual(decoded.claims, {
    iat: Math.floor(nowMs / 1000) - 60,
    exp: Math.floor(nowMs / 1000) + 540,
    iss: env.GITHUB_APP_CLIENT_ID,
  });
  assert.deepEqual(result.claims, decoded.claims);
  assert.equal(decoded.claims.exp - decoded.claims.iat, 600);
});

test("GitHub App JWT signature verifies with the synthetic RSA public key", async () => {
  const { env, publicKey } = await getKeyFixture();
  const result = await createGitHubAppJwt(env, { cryptoImpl: webcrypto });
  const decoded = decodeJwt(result.token);

  assert.equal(await webcrypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    decoded.signature,
    encoder.encode(decoded.unsigned),
  ), true);
});

test("GitHub App JWT rejects missing identity and non-PKCS8 private keys", async () => {
  const { env } = await getKeyFixture();

  await assert.rejects(
    createGitHubAppJwt({ ...env, GITHUB_APP_CLIENT_ID: "client-id" }, { cryptoImpl: webcrypto }),
    /GITHUB_APP_CLIENT_ID is invalid/u,
  );
  await assert.rejects(
    createGitHubAppJwt({ ...env, GITHUB_APP_PRIVATE_KEY_PKCS8_PEM: "-----BEGIN RSA PRIVATE KEY-----\nAA==\n-----END RSA PRIVATE KEY-----" }, { cryptoImpl: webcrypto }),
    /private key/u,
  );
});

test("Installation token request uses the exact endpoint and GitHub headers", async () => {
  const { env } = await getKeyFixture();
  const nowMs = Date.UTC(2026, 6, 24, 12, 0, 0);
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return tokenResponse(nowMs);
  };

  await requestInstallationToken(env, { nowMs, cryptoImpl: webcrypto, fetchImpl });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.github.com/app/installations/987654321/access_tokens");
  assert.equal(calls[0].init.method, "POST");
  assert.match(calls[0].init.headers.get("authorization"), /^Bearer [A-Za-z0-9._-]+$/u);
  assert.equal(calls[0].init.headers.get("accept"), "application/vnd.github+json");
  assert.equal(calls[0].init.headers.get("x-github-api-version"), "2026-03-10");
  assert.equal(calls[0].init.headers.get("user-agent"), "Paragon-Live-PDF-Studio-Worker");
});

test("Installation token request scopes repository and permissions exactly", async () => {
  const { env } = await getKeyFixture();
  const nowMs = Date.UTC(2026, 6, 24, 12, 0, 0);
  let body;
  const fetchImpl = async (_url, init) => {
    body = JSON.parse(init.body);
    return tokenResponse(nowMs);
  };

  await requestInstallationToken(env, { nowMs, cryptoImpl: webcrypto, fetchImpl });
  assert.deepEqual(body, {
    repositories: ["paragon-purveyors"],
    permissions: { contents: "write", actions: "write" },
  });
});

test("Installation token result exposes only token and validated expiry", async () => {
  const { env } = await getKeyFixture();
  const nowMs = Date.UTC(2026, 6, 24, 12, 0, 0);
  const result = await requestInstallationToken(env, {
    nowMs,
    cryptoImpl: webcrypto,
    fetchImpl: async () => tokenResponse(nowMs),
  });

  assert.deepEqual(Object.keys(result).sort(), ["expiresAtMs", "token"]);
  assert.equal(result.token, "ghs_installation_token_value_1234567890");
  assert.equal(result.expiresAtMs, nowMs + 60 * 60 * 1000);
  assert.equal(Object.isFrozen(result), true);
});

test("Installation token validation rejects malformed, expired, and overlong responses", async () => {
  const { env } = await getKeyFixture();
  const nowMs = Date.UTC(2026, 6, 24, 12, 0, 0);

  for (const response of [
    tokenResponse(nowMs, { token: "short" }),
    tokenResponse(nowMs, { expires_at: new Date(nowMs - 1).toISOString() }),
    tokenResponse(nowMs, { expires_at: new Date(nowMs + 61 * 60 * 1000).toISOString() }),
  ]) {
    await assert.rejects(
      requestInstallationToken(env, {
        nowMs,
        cryptoImpl: webcrypto,
        fetchImpl: async () => response.clone(),
      }),
      /installation token|expiry|one-hour/u,
    );
  }
});

test("Installation token provider reuses a token outside the refresh window", async () => {
  let calls = 0;
  const nowMs = Date.UTC(2026, 6, 24, 12, 0, 0);
  const provider = new InstallationTokenProvider({
    acquire: async () => {
      calls += 1;
      return { token: `token-value-${calls}-abcdefghijklmnop`, expiresAtMs: nowMs + 60 * 60 * 1000 };
    },
  });

  assert.equal(await provider.getToken({}, { nowMs }), "token-value-1-abcdefghijklmnop");
  assert.equal(await provider.getToken({}, { nowMs: nowMs + 30 * 60 * 1000 }), "token-value-1-abcdefghijklmnop");
  assert.equal(calls, 1);
});

test("Installation token provider refreshes within five minutes of expiry", async () => {
  let calls = 0;
  const nowMs = Date.UTC(2026, 6, 24, 12, 0, 0);
  const provider = new InstallationTokenProvider({
    acquire: async (_env, options) => {
      calls += 1;
      return {
        token: `token-value-${calls}-abcdefghijklmnop`,
        expiresAtMs: options.nowMs + 60 * 60 * 1000,
      };
    },
  });

  await provider.getToken({}, { nowMs });
  assert.equal(await provider.getToken({}, { nowMs: nowMs + 56 * 60 * 1000 }), "token-value-2-abcdefghijklmnop");
  assert.equal(calls, 2);
});

test("Installation token provider coalesces concurrent acquisition", async () => {
  let calls = 0;
  const nowMs = Date.UTC(2026, 6, 24, 12, 0, 0);
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const provider = new InstallationTokenProvider({
    acquire: async () => {
      calls += 1;
      await gate;
      return { token: "coalesced-token-value-abcdefghijklmnop", expiresAtMs: nowMs + 60 * 60 * 1000 };
    },
  });

  const first = provider.getToken({}, { nowMs });
  const second = provider.getToken({}, { nowMs });
  release();
  assert.deepEqual(await Promise.all([first, second]), [
    "coalesced-token-value-abcdefghijklmnop",
    "coalesced-token-value-abcdefghijklmnop",
  ]);
  assert.equal(calls, 1);
});

test("Installation token provider clear removes only the memory cache", async () => {
  let calls = 0;
  const nowMs = Date.UTC(2026, 6, 24, 12, 0, 0);
  const provider = new InstallationTokenProvider({
    acquire: async () => ({
      token: `clear-token-${++calls}-abcdefghijklmnop`,
      expiresAtMs: nowMs + 60 * 60 * 1000,
    }),
  });

  await provider.getToken({}, { nowMs });
  provider.clear();
  assert.equal(await provider.getToken({}, { nowMs }), "clear-token-2-abcdefghijklmnop");
  assert.equal(calls, 2);
});

test("GitHub authentication failures redact private key, App JWT, and installation token", async () => {
  const { env } = await getKeyFixture();
  const nowMs = Date.UTC(2026, 6, 24, 12, 0, 0);
  let authorization;
  await assert.rejects(
    requestInstallationToken(env, {
      nowMs,
      cryptoImpl: webcrypto,
      fetchImpl: async (_url, init) => {
        authorization = init.headers.get("authorization");
        return new Response(JSON.stringify({
          message: `do not leak ${env.GITHUB_APP_PRIVATE_KEY_PKCS8_PEM} ${authorization} ghs_secret_installation_token`,
        }), { status: 500, headers: { "content-type": "application/json" } });
      },
    }),
    (error) => {
      assert.equal(error.message, "GitHub request failed with HTTP 500.");
      assert.equal(error.message.includes("PRIVATE KEY"), false);
      assert.equal(error.message.includes("ghs_secret"), false);
      assert.equal(error.message.includes(authorization), false);
      return true;
    },
  );
});
