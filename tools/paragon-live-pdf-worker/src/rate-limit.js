export const LOGIN_RATE_LIMIT = Object.freeze({
  limit: 5,
  windowMs: 15 * 60 * 1000,
});

export class FixedWindowRateLimiter {
  #entries = new Map();

  consume(
    key,
    {
      limit,
      windowMs,
      nowMs = Date.now(),
    },
  ) {
    if (typeof key !== "string" || key.length === 0) {
      throw new Error("Rate-limit key is required.");
    }

    if (!Number.isInteger(limit) || limit <= 0) {
      throw new Error("Rate-limit maximum is invalid.");
    }

    if (!Number.isInteger(windowMs) || windowMs <= 0) {
      throw new Error("Rate-limit window is invalid.");
    }

    const current = this.#entries.get(key);
    const entry = !current || nowMs >= current.resetAt
      ? { count: 0, resetAt: nowMs + windowMs }
      : current;

    entry.count += 1;
    this.#entries.set(key, entry);

    const allowed = entry.count <= limit;
    return Object.freeze({
      allowed,
      remaining: Math.max(0, limit - entry.count),
      resetAt: entry.resetAt,
      retryAfterSeconds: allowed
        ? 0
        : Math.max(1, Math.ceil((entry.resetAt - nowMs) / 1000)),
    });
  }

  clear() {
    this.#entries.clear();
  }
}

export const getClientIp = (request) => {
  const cloudflareIp = request?.headers?.get?.("cf-connecting-ip")?.trim();
  if (cloudflareIp) {
    return cloudflareIp;
  }

  const forwarded = request?.headers?.get?.("x-forwarded-for");
  const first = forwarded?.split(",", 1)?.[0]?.trim();
  return first || "unknown";
};

export const loginRateLimiter = new FixedWindowRateLimiter();
