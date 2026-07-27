const encoder = new TextEncoder();

export const DEFAULT_PBKDF2_ITERATIONS = 100_000;
export const PASSWORD_MAX_LENGTH = 512;
export const PASSWORD_SALT_BYTES = 16;
export const PASSWORD_HASH_BYTES = 32;

const requireCrypto = (cryptoImpl = globalThis.crypto) => {
  if (!cryptoImpl?.subtle || typeof cryptoImpl.getRandomValues !== "function") {
    throw new Error("Web Crypto is unavailable.");
  }

  return cryptoImpl;
};

const requireText = (value, label) => {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} is required.`);
  }

  return value;
};

const normalizePassword = (password) => {
  if (typeof password !== "string" || password.length === 0) {
    return null;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return null;
  }

  return password;
};

export const bytesToBase64 = (bytes) => {
  if (typeof btoa !== "function") {
    throw new Error("Base64 encoding is unavailable.");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
};

export const base64ToBytes = (value) => {
  if (typeof atob !== "function") {
    throw new Error("Base64 decoding is unavailable.");
  }

  const input = requireText(value, "Base64 value");
  let binary;

  try {
    binary = atob(input);
  } catch {
    throw new Error("Base64 value is invalid.");
  }

  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytes.length === 0) {
    throw new Error("Base64 value is empty.");
  }

  return bytes;
};

export const constantTimeEqual = (left, right) => {
  if (!(left instanceof Uint8Array) || !(right instanceof Uint8Array)) {
    return false;
  }

  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }

  return difference === 0;
};

export const timingSafeEqual = (
  left,
  right,
  {
    cryptoImpl = globalThis.crypto,
  } = {},
) => {
  if (!(left instanceof Uint8Array) || !(right instanceof Uint8Array)) {
    return false;
  }

  if (left.length !== right.length) {
    return false;
  }

  const nativeTimingSafeEqual = cryptoImpl?.subtle?.timingSafeEqual;
  if (typeof nativeTimingSafeEqual === "function") {
    return nativeTimingSafeEqual.call(cryptoImpl.subtle, left, right);
  }

  return constantTimeEqual(left, right);
};

const normalizeIterations = (value) => {
  const parsed = Number(value ?? DEFAULT_PBKDF2_ITERATIONS);
  if (!Number.isInteger(parsed) || parsed !== DEFAULT_PBKDF2_ITERATIONS) {
    throw new Error("PBKDF2 iteration count is invalid.");
  }

  return parsed;
};

export const derivePasswordHash = async (
  password,
  salt,
  {
    iterations = DEFAULT_PBKDF2_ITERATIONS,
    cryptoImpl = globalThis.crypto,
  } = {},
) => {
  const normalized = normalizePassword(password);
  if (!normalized) {
    throw new Error("Password is invalid.");
  }

  if (!(salt instanceof Uint8Array) || salt.length < PASSWORD_SALT_BYTES) {
    throw new Error("Password salt is invalid.");
  }

  const runtimeCrypto = requireCrypto(cryptoImpl);
  const key = await runtimeCrypto.subtle.importKey(
    "raw",
    encoder.encode(normalized),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await runtimeCrypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: normalizeIterations(iterations),
    },
    key,
    PASSWORD_HASH_BYTES * 8,
  );

  return new Uint8Array(bits);
};

export const createPasswordVerifierRecord = async (
  password,
  {
    iterations = DEFAULT_PBKDF2_ITERATIONS,
    cryptoImpl = globalThis.crypto,
  } = {},
) => {
  const runtimeCrypto = requireCrypto(cryptoImpl);
  const salt = runtimeCrypto.getRandomValues(new Uint8Array(PASSWORD_SALT_BYTES));
  const hash = await derivePasswordHash(password, salt, {
    iterations,
    cryptoImpl: runtimeCrypto,
  });

  return Object.freeze({
    saltBase64: bytesToBase64(salt),
    hashBase64: bytesToBase64(hash),
    iterations: normalizeIterations(iterations),
  });
};

export const verifyPassword = async (
  password,
  env,
  {
    cryptoImpl = globalThis.crypto,
  } = {},
) => {
  const normalized = normalizePassword(password);
  if (!normalized) {
    return false;
  }

  const salt = base64ToBytes(requireText(env?.PASSWORD_SALT_B64, "PASSWORD_SALT_B64"));
  const expected = base64ToBytes(requireText(env?.PASSWORD_HASH_B64, "PASSWORD_HASH_B64"));

  if (salt.length < PASSWORD_SALT_BYTES || expected.length !== PASSWORD_HASH_BYTES) {
    throw new Error("Password verifier configuration is invalid.");
  }

  const actual = await derivePasswordHash(normalized, salt, {
    iterations: env?.PASSWORD_PBKDF2_ITERATIONS,
    cryptoImpl,
  });

  return timingSafeEqual(actual, expected, { cryptoImpl });
};
