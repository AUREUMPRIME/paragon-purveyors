import { bytesToBase64 } from "../auth.js";
import { createGitHubClient, GitHubApiError } from "./client.js";
import { REPOSITORY_NAME } from "./policy.js";

const encoder = new TextEncoder();
const APP_JWT_MAX_SECONDS = 10 * 60;
const APP_JWT_LIFETIME_SECONDS = 9 * 60;
const APP_JWT_CLOCK_DRIFT_SECONDS = 60;
const INSTALLATION_TOKEN_MAX_SECONDS = 60 * 60;
const INSTALLATION_TOKEN_REFRESH_SECONDS = 5 * 60;

const toBase64Url = (bytes) => bytesToBase64(bytes)
  .replaceAll("+", "-")
  .replaceAll("/", "_")
  .replace(/=+$/u, "");

const encodeJson = (value) => toBase64Url(encoder.encode(JSON.stringify(value)));

const requireCrypto = (cryptoImpl = globalThis.crypto) => {
  if (!cryptoImpl?.subtle) {
    throw new Error("Web Crypto is unavailable.");
  }
  return cryptoImpl;
};

const requireDigits = (value, label) => {
  const normalized = String(value ?? "");
  if (!/^\d+$/u.test(normalized) || normalized.length > 32) {
    throw new Error(`${label} is invalid.`);
  }
  return normalized;
};

const requirePrivateKeyPem = (value) => {
  if (typeof value !== "string" || value.length < 100 || value.length > 20_000) {
    throw new Error("GitHub App private key is invalid.");
  }

  const match = /^-----BEGIN PRIVATE KEY-----\s+([A-Za-z0-9+/=\s]+)\s+-----END PRIVATE KEY-----$/u.exec(value.trim());
  if (!match) {
    throw new Error("GitHub App private key must be PKCS#8 PEM.");
  }

  const base64 = match[1].replace(/\s+/gu, "");
  try {
    return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  } catch {
    throw new Error("GitHub App private key is invalid.");
  }
};

const importPrivateKey = async (env, cryptoImpl) => cryptoImpl.subtle.importKey(
  "pkcs8",
  requirePrivateKeyPem(env?.GITHUB_APP_PRIVATE_KEY_PKCS8_PEM),
  { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
  false,
  ["sign"],
);

export const createGitHubAppJwt = async (
  env,
  { nowMs = Date.now(), cryptoImpl = globalThis.crypto } = {},
) => {
  const runtimeCrypto = requireCrypto(cryptoImpl);
  const clientId = requireDigits(env?.GITHUB_APP_CLIENT_ID, "GITHUB_APP_CLIENT_ID");
  const nowSeconds = Math.floor(nowMs / 1000);
  const issuedAt = nowSeconds - APP_JWT_CLOCK_DRIFT_SECONDS;
  const expiresAt = nowSeconds + APP_JWT_LIFETIME_SECONDS;
  if (expiresAt - issuedAt > APP_JWT_MAX_SECONDS) {
    throw new Error("GitHub App JWT lifetime exceeds the maximum.");
  }

  const header = Object.freeze({ alg: "RS256", typ: "JWT" });
  const claims = Object.freeze({ iat: issuedAt, exp: expiresAt, iss: clientId });
  const unsigned = `${encodeJson(header)}.${encodeJson(claims)}`;
  const key = await importPrivateKey(env, runtimeCrypto);
  const signature = new Uint8Array(await runtimeCrypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    encoder.encode(unsigned),
  ));

  return Object.freeze({
    token: `${unsigned}.${toBase64Url(signature)}`,
    claims,
  });
};

const validateInstallationResponse = (data, nowMs) => {
  if (typeof data?.token !== "string" || data.token.length < 20 || data.token.length > 4096) {
    throw new GitHubApiError("GitHub installation token response is invalid.", { code: "INVALID_INSTALLATION_TOKEN" });
  }

  const expiresAtMs = Date.parse(data.expires_at);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= nowMs) {
    throw new GitHubApiError("GitHub installation token expiry is invalid.", { code: "INVALID_INSTALLATION_EXPIRY" });
  }

  if (expiresAtMs - nowMs > INSTALLATION_TOKEN_MAX_SECONDS * 1000 + 5_000) {
    throw new GitHubApiError("GitHub installation token exceeds the one-hour maximum.", { code: "INVALID_INSTALLATION_EXPIRY" });
  }

  return Object.freeze({ token: data.token, expiresAtMs });
};

export const requestInstallationToken = async (
  env,
  {
    nowMs = Date.now(),
    cryptoImpl = globalThis.crypto,
    fetchImpl = globalThis.fetch,
  } = {},
) => {
  const installationId = requireDigits(
    env?.GITHUB_APP_INSTALLATION_ID,
    "GITHUB_APP_INSTALLATION_ID",
  );
  const appJwt = await createGitHubAppJwt(env, { nowMs, cryptoImpl });
  const client = createGitHubClient({
    token: appJwt.token,
    fetchImpl,
    authScheme: "Bearer",
  });

  const data = await client.request(
    `/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      body: {
        repositories: [REPOSITORY_NAME],
        permissions: { contents: "write", actions: "write" },
      },
    },
  );

  return validateInstallationResponse(data, nowMs);
};

export class InstallationTokenProvider {
  #cached = null;
  #pending = null;
  #acquire;

  constructor({ acquire = requestInstallationToken } = {}) {
    if (typeof acquire !== "function") {
      throw new Error("Installation token acquisition is unavailable.");
    }
    this.#acquire = acquire;
  }

  async getToken(env, options = {}) {
    const nowMs = options.nowMs ?? Date.now();
    if (
      this.#cached
      && this.#cached.expiresAtMs - nowMs > INSTALLATION_TOKEN_REFRESH_SECONDS * 1000
    ) {
      return this.#cached.token;
    }

    if (!this.#pending) {
      this.#pending = Promise.resolve(this.#acquire(env, options))
        .then((result) => {
          this.#cached = validateInstallationResponse({
            token: result?.token,
            expires_at: new Date(result?.expiresAtMs).toISOString(),
          }, nowMs);
          return this.#cached;
        })
        .finally(() => {
          this.#pending = null;
        });
    }

    return (await this.#pending).token;
  }

  clear() {
    this.#cached = null;
    this.#pending = null;
  }
}

export const installationTokenProvider = new InstallationTokenProvider();
