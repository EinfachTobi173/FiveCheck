type CacheEntry<T> = { data: T; expiresAt: number };

export class TTLCache<T = unknown> {
  private store = new Map<string, CacheEntry<T>>();
  constructor(private defaultTtlMs = 30_000) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T, ttlMs = this.defaultTtlMs) {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }
}

export class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();
  constructor(private windowMs = 60_000, private max = 20) {}

  hit(key: string): { allowed: boolean; remaining: number; resetInMs: number } {
    const now = Date.now();
    const cur = this.hits.get(key);
    if (!cur || now > cur.resetAt) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.max - 1, resetInMs: this.windowMs };
    }
    if (cur.count >= this.max) {
      return { allowed: false, remaining: 0, resetInMs: cur.resetAt - now };
    }
    cur.count += 1;
    this.hits.set(key, cur);
    return { allowed: true, remaining: this.max - cur.count, resetInMs: cur.resetAt - now };
  }
}