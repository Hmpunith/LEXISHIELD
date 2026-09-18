import { describe, it, expect, beforeEach } from 'vitest';
import { CacheService } from '../../server/services/cacheService';

describe('Tiered CacheService & Telemetry Tests', () => {
  beforeEach(() => {
    CacheService.flush();
  });

  it('should store and retrieve cached values correctly', () => {
    CacheService.set('key-1', { score: 95 });
    const cached = CacheService.get<{ score: number }>('key-1');
    expect(cached).toEqual({ score: 95 });
  });

  it('should return null for expired items', async () => {
    CacheService.set('key-expired', 'val', -100);
    const result = CacheService.get('key-expired');
    expect(result).toBeNull();
  });

  it('should execute computeFn only once on cache miss via getOrCompute', async () => {
    let callCount = 0;
    const compute = async () => {
      callCount++;
      return { data: 'processed' };
    };

    const first = await CacheService.getOrCompute('compute-key', compute);
    const second = await CacheService.getOrCompute('compute-key', compute);

    expect(first).toEqual({ data: 'processed' });
    expect(second).toEqual({ data: 'processed' });
    expect(callCount).toBe(1);
  });

  it('should accurately track hit ratio telemetry', () => {
    CacheService.set('telemetry-key', 'active');
    CacheService.get('telemetry-key'); // hit 1
    CacheService.get('telemetry-key'); // hit 2
    CacheService.get('non-existent');  // miss 1

    const telemetry = CacheService.getTelemetry();
    expect(telemetry.hits).toBeGreaterThanOrEqual(2);
    expect(telemetry.misses).toBeGreaterThanOrEqual(1);
    expect(telemetry.hitRatio).toBeGreaterThan(0.5);
  });
});
