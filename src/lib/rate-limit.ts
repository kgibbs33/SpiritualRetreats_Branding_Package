/**
 * Simple in-memory fixed-window rate limiter per route + client IP.
 * Not distributed — each Node process has its own counters (document for multi-replica hosts).
 */

const buckets = new Map<string, number[]>();

// Sweep stale keys every 5 minutes so the Map doesn't grow unbounded on busy servers.
setInterval(() => {
  const windowMs = Math.max(10_000, Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000));
  const now = Date.now();
  for (const key of buckets.keys()) {
    const fresh = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}, 5 * 60 * 1000).unref();

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

function prune(key: string, windowMs: number, now: number): number[] {
  const arr = buckets.get(key) ?? [];
  const recent = arr.filter((t) => now - t < windowMs);
  buckets.set(key, recent);
  return recent;
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

/**
 * @param routeKey — stable id e.g. `api:contact`
 */
export function checkRateLimit(
  request: Request,
  routeKey: string
): RateLimitResult {
  const windowMs = Math.max(
    10_000,
    Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000)
  );
  const max = Math.max(
    1,
    Math.min(500, Number(process.env.RATE_LIMIT_MAX ?? 30))
  );

  const ip = getClientIp(request);
  const key = `${routeKey}:${ip}`;
  const now = Date.now();
  const recent = prune(key, windowMs, now);

  if (recent.length >= max) {
    const oldest = recent[0] ?? now;
    const retryAfterMs = windowMs - (now - oldest);
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { ok: true };
}
