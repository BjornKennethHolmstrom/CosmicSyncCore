// src/middleware/rateLimiter.js

import { RateLimiterMemory } from 'rate-limiter-flexible';
import { TooManyRequestsError } from '../core/errors.js';
import logger from '../core/logger.js';

// Create different rate limiters for different endpoints
const authLimiter = new RateLimiterMemory({
  points: 5, // Number of attempts
  duration: 60, // Per 60 seconds
  blockDuration: 300, // Block for 5 minutes after exhausting points
});

const generalLimiter = new RateLimiterMemory({
  points: 30, // Number of requests
  duration: 60, // Per 60 seconds
});

// Higher limits for authenticated routes
const authenticatedLimiter = new RateLimiterMemory({
  points: 60, // Number of requests
  duration: 60, // Per 60 seconds
});

export function createRateLimiter(limiterType = 'general') {
  return async (req, res, next) => {
    const limiter = {
      auth: authLimiter,
      general: generalLimiter,
      authenticated: authenticatedLimiter,
    }[limiterType] || generalLimiter;

    const key = req.ip;

    try {
      const rateLimiterRes = await limiter.consume(key);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': limiter.points,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
      });
      
      next();
    } catch (error) {
      if (error instanceof Error) {
        next(error);
        return;
      }

      // Rate limit exceeded
      const timeLeft = Math.ceil(error.msBeforeNext / 1000);
      logger.warn(`Rate limit exceeded for IP: ${key}`);
      
      res.set({
        'X-RateLimit-Limit': limiter.points,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(Date.now() + error.msBeforeNext),
        'Retry-After': timeLeft,
      });

      next(new TooManyRequestsError(`Too many requests. Please try again in ${timeLeft} seconds`));
    }
  };
}

// Apply rate limiters to specific routes
export function applyRateLimiters(router) {
  // Auth routes
  router.use('/auth/login', createRateLimiter('auth'));
  router.use('/auth/register', createRateLimiter('auth'));
  router.use('/auth/forgot-password', createRateLimiter('auth'));
  
  // Protected routes
  router.use('/api/*', createRateLimiter('authenticated'));
  
  // All other routes
  router.use('*', createRateLimiter('general'));
}
