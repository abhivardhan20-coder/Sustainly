import { describe, it, expect, beforeEach } from 'vitest';
import { insightsCache, generateCacheKey } from '../server/cache/lruCache';

describe('LRU Cache', () => {
  beforeEach(() => {
    insightsCache.clear();
  });

  it('should store and retrieve values', async () => {
    const key = 'test-key';
    const value = ['tip1', 'tip2'];
    await insightsCache.set(key, value);
    expect(await insightsCache.get(key)).toEqual(value);
  });

  it('should return null for missing keys', async () => {
    expect(await insightsCache.get('nonexistent')).toBeNull();
  });

  it('should generate deterministic cache keys', () => {
    const profile = { diet: 'vegan', region: 'urban' };
    const history = [{ role: 'user', content: 'hello' }];
    const key1 = generateCacheKey(profile, history);
    const key2 = generateCacheKey(profile, history);
    expect(key1).toBe(key2);
  });

  it('should generate different keys for different inputs', () => {
    const key1 = generateCacheKey({ diet: 'vegan' }, []);
    const key2 = generateCacheKey({ diet: 'vegetarian' }, []);
    expect(key1).not.toBe(key2);
  });

  it('should handle null profile', () => {
    const key = generateCacheKey(null, []);
    expect(key).toBeTruthy();
    expect(typeof key).toBe('string');
  });

  it('should handle empty history', () => {
    const key = generateCacheKey({ diet: 'vegan' }, []);
    expect(key).toBeTruthy();
  });

  it('should sort object keys for deterministic output', () => {
    const key1 = generateCacheKey({ b: 'second', a: 'first' }, []);
    const key2 = generateCacheKey({ a: 'first', b: 'second' }, []);
    expect(key1).toBe(key2);
  });
});
