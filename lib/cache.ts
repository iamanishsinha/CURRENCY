/**
 * In-memory TTL cache.
 *
 * This is the single place a production build would swap in Redis --
 * every call site below goes through `getOrSet`, so replacing this file's
 * internals with `ioredis` calls (see database/schema.sql and the README
 * for the intended production shape) does not require touching callers.
 *
 * TTL must match the real freshness window of the underlying data
 * (Principle: "do not cache a value longer than its meaningful freshness
 * window without labeling it stale"). Each caller passes a TTL that
 * matches the provider's actual update frequency, not an arbitrary number.
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export async function getOrSet<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<{ value: T; cached: boolean }> {
  const hit = store.get(key);
  const now = Date.now();
  if (hit && hit.expiresAt > now) {
    return { value: hit.value as T, cached: true };
  }
  const value = await fetcher();
  store.set(key, { value, expiresAt: now + ttlMs });
  return { value, cached: false };
}

export function invalidate(key: string) {
  store.delete(key);
}

export const TTL = {
  FX_LATEST: 60 * 60 * 1000, // ECB updates once/day on business days; 1h is generous headroom
  FX_HISTORY: 24 * 60 * 60 * 1000, // past dates never change
  CRYPTO_LATEST: 45 * 1000, // CoinGecko free tier refreshes every couple of minutes
  CRYPTO_HISTORY: 60 * 60 * 1000
};
