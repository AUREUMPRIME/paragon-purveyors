import {
  base64ToBytes,
  bytesToBase64,
} from "./auth.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const SESSION_AUDIENCE = "paragon-live-pdf-studio";
export const SESSION_SUBJECT = "paragon-admin";
export const SESSION_MAX_SECONDS = 8 * 60 * 60;

const requireCrypto = (cryptoImpl = globalThis.crypto) => {
  if (!cryptoImpl?.subtle || typeof cryptoImpl.getRandomValues !== "function") {
    throw new Error("Web Crypto is unavailable.");
  }

  return cryptoImpl;
};

const toBase64Url = (bytes) => bytesToBase64(bytes)
  .replaceAll("+", "-")
  .replaceAll("/", "_")
  .replace(/=+$/u, "");

const fromBase64Url = (value) => {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/u.test(value)) {
    throw new Error("Session token segment is invalid.");
  }

  const padded = value
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  return base64ToBytes(padded);
};

const encodeJson = (value) => toBase64Url(encoder.encode(JSON.stringify(value)));

const decodeJson = (value) => {
  const parsed = JSON.parse(decoder.decode(fromBase64Url(value)));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Session token JSON is invalid.");
  }

  return parsed;
};

const requireSessionSecret = (env) => {
  const bytes = base64ToBytes(env?.SESSION_SECRET_B64);
  if (bytes.length < 32) {
    throw new Error("SESSION_SECRET_B64 must decode to at least 32 bytes.");
  }

  return bytes;
};

const importHmacKey = async (env, cryptoImpl) => cryptoImpl.subtle.importKey(
  "raw",
  requireSessionSecret(env),
  {
    name: "HMAC",
    hash: "SHA-256",
  },
  false,
  ["sign", "verify"],
);

const normalizeTtl = (env) => {
  const parsed = Number(env?.SESSION_TTL_SECONDS ?? SESSION_MAX_SECONDS);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > SESSION_MAX_SECONDS) {
    throw new Error("SESSION_TTL_SECONDS is invalid.");
  }

  return parsed;
};

const createNonce = (cryptoImpl) => toBase64Url(
  cryptoImpl.getRandomValues(new Uint8Array(18)),
);

export const issueSessionToken = async (
  env,
  {
    nowMs = Date.now(),
    nonce,
    cryptoImpl = globalThis.crypto,
  } = {},
) => {
  const runtimeCrypto = requireCrypto(cryptoImpl);
  const nowSeconds = Math.floor(nowMs / 1000);
  const ttlSeconds = normalizeTtl(env);
  const header = Object.freeze({ alg: "HS256", typ: "JWT" });
  const claims = Object.freeze({
    sub: SESSION_SUBJECT,
    iat: nowSeconds,
    exp: nowSeconds + ttlSeconds,
    aud: env?.SESSION_AUDIENCE || SESSION_AUDIENCE,
    nonce: nonce || createNonce(runtimeCrypto),
  });
  const unsigned = `${encodeJson(header)}.${encodeJson(claims)}`;
  const key = await importHmacKey(env, runtimeCrypto);
  const signature = new Uint8Array(await runtimeCrypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(unsigned),
  ));

  return Object.freeze({
    token: `${unsigned}.${toBase64Url(signature)}`,
    claims,
  });
};

export const verifySessionToken = async (
  token,
  env,
  {
    nowMs = Date.now(),
    cryptoImpl = globalThis.crypto,
  } = {},
) => {
  try {
    if (typeof token !== "string" || token.length > 4096) {
      return null;
    }

    const segments = token.split(".");
    if (segments.length !== 3) {
      return null;
    }

    const [headerSegment, payloadSegment, signatureSegment] = segments;
    const header = decodeJson(headerSegment);
    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

    const runtimeCrypto = requireCrypto(cryptoImpl);
    const key = await importHmacKey(env, runtimeCrypto);
    const unsigned = `${headerSegment}.${payloadSegment}`;
    const suppliedSignature = fromBase64Url(signatureSegment);
    const signatureValid = await runtimeCrypto.subtle.verify(
      "HMAC",
      key,
      suppliedSignature,
      encoder.encode(unsigned),
    );

    if (!signatureValid) {
      return null;
    }

    const claims = decodeJson(payloadSegment);
    const expectedAudience = env?.SESSION_AUDIENCE || SESSION_AUDIENCE;
    const nowSeconds = Math.floor(nowMs / 1000);

    if (
      claims.sub !== SESSION_SUBJECT
      || claims.aud !== expectedAudience
      || !Number.isInteger(claims.iat)
      || !Number.isInteger(claims.exp)
      || claims.iat > nowSeconds + 60
      || claims.exp <= nowSeconds
      || claims.exp <= claims.iat
      || claims.exp - claims.iat > SESSION_MAX_SECONDS
      || typeof claims.nonce !== "string"
      || claims.nonce.length < 16
      || claims.nonce.length > 128
    ) {
      return null;
    }

    return Object.freeze({ ...claims });
  } catch {
    return null;
  }
};

export const extractBearerToken = (request) => {
  const value = request?.headers?.get?.("authorization");
  if (typeof value !== "string") {
    return null;
  }

  const match = /^Bearer ([A-Za-z0-9._-]+)$/u.exec(value);
  return match?.[1] ?? null;
};
