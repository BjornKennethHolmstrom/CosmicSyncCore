// src/core/auth.js

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';
import { BadRequestError, UnauthorizedError } from './errors.js';
import eventBus from './eventBus.js';
import logger from './logger.js';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

class Auth {
  constructor() {
    // Generate different keys for access and refresh tokens
    this.accessTokenKey = crypto.randomBytes(64).toString('hex');
    this.refreshTokenKey = crypto.randomBytes(64).toString('hex');
    
    // Keep track of invalidated tokens
    this.invalidatedTokens = new Set();
    
    // Promisify jwt functions
    this.sign = promisify(jwt.sign);
    this.verify = promisify(jwt.verify);
  }

  /**
   * Hash a password using PBKDF2
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    if (!password || password.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters long');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await promisify(crypto.pbkdf2)(
      password,
      salt,
      100000, // iterations
      64,     // key length
      'sha512'
    );

    return `${salt}:${hash.toString('hex')}`;
  }

  /**
   * Verify a password against its hash
   * @param {string} password - Plain text password to verify
   * @param {string} hashedPassword - Stored hash to check against
   * @returns {Promise<boolean>} Whether the password matches
   */
  async verifyPassword(password, hashedPassword) {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = await promisify(crypto.pbkdf2)(
      password,
      salt,
      100000,
      64,
      'sha512'
    );

    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      verifyHash
    );
  }

  /**
   * Generate access and refresh tokens for a user
   * @param {string} userId - User ID to generate tokens for
   * @returns {Promise<Object>} Object containing access and refresh tokens
   */
  async generateTokens(userId) {
    try {
      logger.debug('Starting token generation for:', userId);
      
      // Create the tokens without promisify
      const accessToken = jwt.sign(
        { userId, type: 'access' },
        this.accessTokenKey,
        { expiresIn: TOKEN_EXPIRY }
      );

      const refreshToken = jwt.sign(
        { userId, type: 'refresh' },
        this.refreshTokenKey,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
      );

      logger.debug('Tokens generated successfully');

      return {
        accessToken,
        refreshToken,
        expiresIn: TOKEN_EXPIRY
      };
    } catch (error) {
      logger.error('Token generation failed:', error);
      throw error;
    }
  }

  /**
   * Verify and decode a token
   * @param {string} token - Token to verify
   * @param {string} type - Token type ('access' or 'refresh')
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyToken(token, type = 'access') {
    if (this.invalidatedTokens.has(token)) {
      throw new UnauthorizedError('Token has been invalidated');
    }

    try {
      const key = type === 'access' ? this.accessTokenKey : this.refreshTokenKey;
      const decoded = await this.verify(token, key);

      if (decoded.type !== type) {
        throw new UnauthorizedError('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired');
      }
      throw new UnauthorizedError('Invalid token');
    }
  }

  /**
   * Refresh an access token using a refresh token
   * @param {string} refreshToken - Refresh token to use
   * @returns {Promise<Object>} New access token and expiry
   */
  async refreshAccessToken(refreshToken) {
    const decoded = await this.verifyToken(refreshToken, 'refresh');
    const accessToken = await this.sign(
      { userId: decoded.userId, type: 'access' },
      this.accessTokenKey,
      { expiresIn: TOKEN_EXPIRY }
    );

    return {
      accessToken,
      expiresIn: TOKEN_EXPIRY
    };
  }

  /**
   * Invalidate a token (for logout)
   * @param {string} token - Token to invalidate
   */
  invalidateToken(token) {
    this.invalidatedTokens.add(token);
    // Clean up old invalidated tokens periodically
    if (this.invalidatedTokens.size > 1000) {
      this.cleanupInvalidatedTokens();
    }
  }

  /**
   * Clean up expired tokens from invalidatedTokens set
   */
  async cleanupInvalidatedTokens() {
    for (const token of this.invalidatedTokens) {
      try {
        await this.verify(token, this.accessTokenKey);
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          this.invalidatedTokens.delete(token);
        }
      }
    }
  }

  /**
   * Express middleware for authentication
   */
  middleware() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = await this.verifyToken(token, 'access');
        req.userId = decoded.userId;
        next();
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          res.status(401).json({ error: error.message });
        } else {
          logger.error('Authentication error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    };
  }
}

export default new Auth();
