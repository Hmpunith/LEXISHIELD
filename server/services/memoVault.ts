import crypto from 'crypto';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

export class MemoVault {
  private static store = new Map<string, CacheItem<unknown>>();
  private static readonly DEFAULT_TTL_MS = 1000 * 60 * 60; // 1 hour

  public static hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  public static set<T>(key: string, data: T, ttlMs: number = this.DEFAULT_TTL_MS): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public static get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) {return null;}
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.data as T;
  }

  public static clear(): void {
    this.store.clear();
  }
}
