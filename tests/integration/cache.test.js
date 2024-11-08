// tests/integration/cache.test.js
import { jest } from '@jest/globals';
import { CacheManager } from '../../src/core/cacheManager.js';
import eventBus from '../../src/core/eventBus.js';

describe('CacheManager', () => {
  let testCache;

  beforeEach(() => {
    // Clear any existing event listeners
    eventBus.listeners = {};
    testCache = new CacheManager({ maxSize: 5 });
  });

  afterEach(() => {
    if (testCache) {
      testCache.destroy();
      testCache = null;
    }
  });

  it('should store and retrieve values', () => {
    testCache.set('key', 'value');
    expect(testCache.get('key')).toBe('value');
  });

  it('should handle cache misses', () => {
    expect(testCache.get('nonexistent')).toBeUndefined();
  });

  it('should respect TTL', async () => {
    jest.useFakeTimers();
    
    testCache = new CacheManager({ maxSize: 5, ttl: 100 }); // 100ms TTL
    testCache.set('key', 'value');
    
    // Value should exist initially
    expect(testCache.get('key')).toBe('value');
    
    // Advance time
    jest.advanceTimersByTime(150);
    
    // Value should be gone
    expect(testCache.get('key')).toBeUndefined();
    
    jest.useRealTimers();
  });

  it('should evict LRU items when cache is full', () => {
    // Fill the cache
    for (let i = 0; i < 5; i++) {
      testCache.set(`key${i}`, `value${i}`);
    }

    // Access key0 to make it most recently used
    testCache.get('key0');

    // Add one more item
    testCache.set('newKey', 'newValue');

    // key1 should be evicted (least recently used)
    expect(testCache.get('key1')).toBeUndefined();
    expect(testCache.get('key0')).toBe('value0');
    expect(testCache.get('newKey')).toBe('newValue');
  });

  it('should emit events on cache operations', () => {
    const onPut = jest.fn();
    const onHit = jest.fn();
    const onMiss = jest.fn();

    eventBus.on('cachePut', onPut);
    eventBus.on('cacheHit', onHit);
    eventBus.on('cacheMiss', onMiss);

    testCache.set('key', 'value');
    testCache.get('key');
    testCache.get('nonexistent');

    expect(onPut).toHaveBeenCalledWith(expect.objectContaining({ 
      key: 'key', 
      value: 'value' 
    }));
    expect(onHit).toHaveBeenCalledWith(expect.objectContaining({ 
      key: 'key' 
    }));
    expect(onMiss).toHaveBeenCalledWith(expect.objectContaining({ 
      key: 'nonexistent' 
    }));

    // Clean up event listeners
    eventBus.off('cachePut', onPut);
    eventBus.off('cacheHit', onHit);
    eventBus.off('cacheMiss', onMiss);
  });

  it('should clear all cached data', () => {
    testCache.set('key1', 'value1');
    testCache.set('key2', 'value2');

    testCache.clear();

    expect(testCache.get('key1')).toBeUndefined();
    expect(testCache.get('key2')).toBeUndefined();
  });
});
