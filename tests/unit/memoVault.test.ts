import { describe, it, expect } from 'vitest';
import { MemoVault } from '../../server/services/memoVault';

describe('MemoVault Caching and Hashing Tests', () => {
  it('should generate consistent SHA-256 hashes for content', () => {
    const content = 'Legal contract content for hash testing';
    const hash1 = MemoVault.hashContent(content);
    const hash2 = MemoVault.hashContent(content);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('should store and retrieve cached objects', () => {
    MemoVault.set('test-key', { status: 'cached-legal-data' });
    const cached = MemoVault.get<{ status: string }>('test-key');
    expect(cached).toBeDefined();
    expect(cached?.status).toBe('cached-legal-data');
  });

  it('should return null for expired items', () => {
    MemoVault.set('quick-expire', { temp: true }, -100);
    expect(MemoVault.get('quick-expire')).toBeNull();
  });
});
