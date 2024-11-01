// tests/integration/cache.test.js

import cacheManager from '../../src/core/cacheManager.js';
import eventBus from '../../src/core/eventBus.js';

describe('CacheManager', () => {
  beforeEach(() => {
    cacheManager.clear();
  });

  afterAll(() => {
    cacheManager.destroy();
  });

  test('should store and retrieve values', () => {
    cacheManager.set('test-key', 'test-value');
    expect(cacheManager.get('test-key')).toBe('test-value');
  });

  test('should handle cache misses', () => {
    expect(cacheManager.get('non-existent')).toBeUndefined();
  });

  test('should respect TTL', async () => {
    cacheManager.set('ttl-test', 'value', 100); // 100ms TTL
    expect(cacheManager.get('ttl-test')).toBe('value');
    
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(cacheManager.get('ttl-test')).toBeUndefined();
  });

  test('should evict LRU items when cache is full', () => {
    const testCache = new CacheManager({ maxSize: 2 });
    
    testCache.set('key1', 'value1');
    testCache.set('key2', 'value2');
    testCache.get('key1'); // Access key1 to make it more recently used
    testCache.set('key3', 'value3'); // Should evict key2

    expect(testCache.get('key1')).toBe('value1');
    expect(testCache.get('key2')).toBeUndefined();
    expect(testCache.get('key3')).toBe('value3');
  });

  test('should emit events on cache operations', () => {
    const events = [];
    eventBus.on('cachePut', (data) => events.push(['put', data]));
    eventBus.on('cacheHit', (data) => events.push(['hit', data]));
    eventBus.on('cacheInvalidated', (data) => events.push(['invalidated', data]));

    cacheManager.set('event-test', 'value');
    cacheManager.get('event-test');
    cacheManager.invalidate('event-test');

    expect(events).toHaveLength(3);
    expect(events[0][0]).toBe('put');
    expect(events[1][0]).toBe('hit');
    expect(events[2][0]).toBe('invalidated');
  });

  test('should clear all cached data', () => {
    cacheManager.set('key1', 'value1');
    cacheManager.set('key2', 'value2');
    
    cacheManager.clear();
    
    expect(cacheManager.get('key1')).toBeUndefined();
    expect(cacheManager.get('key2')).toBeUndefined();
  });
});
