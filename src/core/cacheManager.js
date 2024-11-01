// src/core/cacheManager.js

import logger from './logger.js';
import eventBus from './eventBus.js';

class CacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000; // Maximum number of items in cache
    this.ttl = options.ttl || 5 * 60 * 1000; // Default TTL: 5 minutes
    this.cache = new Map();
    this.accessLog = new Map(); // For LRU tracking
    this.expiryTimes = new Map(); // For TTL tracking
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute

    // Listen for data changes
    eventBus.on('dataSet', ({ key }) => {
      this.invalidate(key);
    });
  }

  set(key, value, customTtl) {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const now = Date.now();
    this.cache.set(key, value);
    this.accessLog.set(key, now);
    this.expiryTimes.set(key, now + (customTtl || this.ttl));

    logger.debug(`Cache set for key: ${key}`);
    eventBus.emit('cachePut', { key, value });
  }

  get(key) {
    const value = this.cache.get(key);
    
    if (value === undefined) {
      logger.debug(`Cache miss for key: ${key}`);
      return undefined;
    }

    // Check if expired
    if (this.isExpired(key)) {
      this.invalidate(key);
      logger.debug(`Cache expired for key: ${key}`);
      return undefined;
    }

    // Update access time for LRU
    this.accessLog.set(key, Date.now());
    logger.debug(`Cache hit for key: ${key}`);
    eventBus.emit('cacheHit', { key });
    
    return value;
  }

  invalidate(key) {
    this.cache.delete(key);
    this.accessLog.delete(key);
    this.expiryTimes.delete(key);
    logger.debug(`Cache invalidated for key: ${key}`);
    eventBus.emit('cacheInvalidated', { key });
  }

  clear() {
    this.cache.clear();
    this.accessLog.clear();
    this.expiryTimes.clear();
    logger.debug('Cache cleared');
    eventBus.emit('cacheCleared');
  }

  isExpired(key) {
    const expiryTime = this.expiryTimes.get(key);
    return expiryTime && Date.now() > expiryTime;
  }

  evictLRU() {
    let oldestAccess = Date.now();
    let oldestKey = null;

    for (const [key, accessTime] of this.accessLog) {
      if (accessTime < oldestAccess) {
        oldestAccess = accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.invalidate(oldestKey);
      logger.debug(`LRU eviction for key: ${oldestKey}`);
      eventBus.emit('cacheEviction', { key: oldestKey, reason: 'LRU' });
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, expiryTime] of this.expiryTimes) {
      if (now > expiryTime) {
        this.invalidate(key);
        logger.debug(`TTL cleanup for key: ${key}`);
        eventBus.emit('cacheEviction', { key, reason: 'TTL' });
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      defaultTTL: this.ttl
    };
  }
}

export default new CacheManager();
