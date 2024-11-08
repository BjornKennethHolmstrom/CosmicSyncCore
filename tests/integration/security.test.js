// tests/integration/security.test.js
import { jest } from '@jest/globals';
import { setupTestDatabase, cleanupDatabase } from '../helpers/dbSetup.helper.js';
import auth from '../../src/core/auth.js';
import cryptoManager from '../../src/core/cryptoManager.js';

describe('Security Features', () => {
  let dbManager;

  beforeAll(async () => {
    dbManager = await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase(dbManager);
  });

  describe('Password Hashing', () => {
    it('should hash passwords securely', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await auth.hashPassword(password);

      // Verify hash format
      expect(hashedPassword).toContain(':'); // Should contain salt
      expect(hashedPassword.length).toBeGreaterThan(64); // Should be long enough

      // Verify password verification
      const isValid = await auth.verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should not produce the same hash for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await auth.hashPassword(password);
      const hash2 = await auth.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Should use different salts
    });
  });

  describe('Token Management', () => {
    it('should generate valid JWT tokens', async () => {
      const userId = 'testUser123';
      const tokens = await auth.generateTokens(userId);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      
      // Verify tokens
      const decodedAccess = await auth.verifyToken(tokens.accessToken, 'access');
      expect(decodedAccess.userId).toBe(userId);

      const decodedRefresh = await auth.verifyToken(tokens.refreshToken, 'refresh');
      expect(decodedRefresh.userId).toBe(userId);
    });

    it('should invalidate tokens', async () => {
      const userId = 'testUser123';
      const tokens = await auth.generateTokens(userId);

      auth.invalidateToken(tokens.accessToken);

      await expect(auth.verifyToken(tokens.accessToken))
        .rejects.toThrow('Token has been invalidated');
    });

    it('should refresh access tokens', async () => {
      const userId = 'testUser123';
      const tokens = await auth.generateTokens(userId);
      
      const newTokens = await auth.refreshAccessToken(tokens.refreshToken);
      expect(newTokens.accessToken).not.toBe(tokens.accessToken);

      const decoded = await auth.verifyToken(newTokens.accessToken, 'access');
      expect(decoded.userId).toBe(userId);
    });
  });

  describe('Encryption', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const data = 'sensitive data';
      const keyId = 'test-key';
      
      // Generate and store a key
      const key = await cryptoManager.generateKey();
      await cryptoManager.storeKey(keyId, key);

      // Encrypt data
      const encrypted = await cryptoManager.encrypt(data, keyId);
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('encryptedData');
      expect(encrypted).toHaveProperty('authTag');

      // Decrypt data
      const decrypted = await cryptoManager.decrypt(
        encrypted.encryptedData,
        keyId,
        encrypted.iv,
        encrypted.authTag
      );
      expect(decrypted).toBe(data);
    });

    it('should handle key rotation', async () => {
      const data = 'sensitive data';
      const oldKeyId = 'old-key';
      const newKeyId = 'new-key';

      // Set up old key
      const oldKey = await cryptoManager.generateKey();
      await cryptoManager.storeKey(oldKeyId, oldKey);

      // Encrypt with old key
      const encrypted = await cryptoManager.encrypt(data, oldKeyId);

      // Rotate key
      await cryptoManager.rotateKey(oldKeyId, newKeyId);

      // Try to decrypt with new key
      const decrypted = await cryptoManager.decrypt(
        encrypted.encryptedData,
        newKeyId,
        encrypted.iv,
        encrypted.authTag
      );
      expect(decrypted).toBe(data);
    });
  });

  describe('Rate Limiting', () => {
    it('should track and limit requests', async () => {
      const limiter = createRateLimiter('auth');
      const req = { ip: '127.0.0.1' };
      const res = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // Make multiple requests
      for (let i = 0; i < 5; i++) {
        await limiter(req, res, next);
      }

      // Next request should be rate limited
      await limiter(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 429
        })
      );
    });
  });
});
