// tests/integration/auth-extended.test.js

import request from 'supertest';
import app from '../../src/api/restApi.js';
import { setupTestDatabase } from '../helpers/dbSetup.helper.js';
import DatabaseManager from '../../src/data/DatabaseManager.js';
import { jest, describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';

describe('Extended Authentication Tests', () => {
  let dbManager;
  let testUser;

  beforeAll(async () => {
    dbManager = await setupTestDatabase();
  });

  afterAll(async () => {
    await dbManager.close();
  });

  beforeEach(async () => {
    // Clear any existing test data
    await dbManager.deleteAll('users');
    await dbManager.deleteAll('user_sessions');
    await dbManager.deleteAll('auth_logs');
    await dbManager.deleteAll('invalidated_tokens');

    // Create test user
    testUser = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'SecurePass123!'
    };
  });

  describe('Registration Validation', () => {
    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/invalid email format/i);
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/password must/i);
    });

    it('should validate username format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          username: 'u$er!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/username may only contain/i);
    });
  });

  describe('Login Security', () => {
    beforeEach(async () => {
      // Register test user
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
    });

    it('should lock account after 5 failed attempts', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          });
      }

      // Try sixth login attempt
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/account is temporarily locked/i);
    });

    it('should reset failed attempts after successful login', async () => {
      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          });
      }

      // Successful login
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      // Check that failed attempts were reset
      const user = await dbManager.getUserByEmail(testUser.email);
      expect(user.failedLoginAttempts).toBe(0);
    });
  });

  describe('Session Management', () => {
    let accessToken;
    let refreshToken;

    beforeEach(async () => {
      // Register and login test user
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      accessToken = loginResponse.body.accessToken;
      refreshToken = loginResponse.body.refreshToken;
    });

    it('should create new session on login', async () => {
      const sessions = await dbManager.getSessionsByUserId(testUser.id);
      expect(sessions.length).toBe(1);
      expect(sessions[0].isValid).toBe(1);
    });

    it('should invalidate session on logout', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(response.status).toBe(200);

      const sessions = await dbManager.getSessionsByUserId(testUser.id);
      expect(sessions.length).toBe(0);
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.accessToken).not.toBe(accessToken);
    });

    it('should not refresh token if session is invalid', async () => {
      // Logout to invalidate session
      await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      // Try to refresh token
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply stricter limits to auth endpoints', async () => {
      const attempts = [];
      for (let i = 0; i < 6; i++) {
        attempts.push(
          request(app)
            .post('/api/v1/auth/login')
            .send({
              email: 'test@example.com',
              password: 'password123'
            })
        );
      }

      const responses = await Promise.all(attempts);
      const lastResponse = responses[responses.length - 1];

      expect(lastResponse.status).toBe(429);
      expect(lastResponse.headers).toHaveProperty('retry-after');
    });

    it('should apply different limits to authenticated endpoints', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const token = loginResponse.body.accessToken;

      // Make many requests to an authenticated endpoint
      const requests = [];
      for (let i = 0; i < 61; i++) {
        requests.push(
          request(app)
            .get('/api/v1/users/me')
            .set('Authorization', `Bearer ${token}`)
        );
      }

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];

      expect(lastResponse.status).toBe(429);
      expect(lastResponse.headers['x-ratelimit-remaining']).toBe('0');
    });

    it('should include proper rate limit headers', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  describe('Password Reset', () => {
    beforeEach(async () => {
      // Register test user
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
    });

    it('should generate password reset token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email });

      expect(response.status).toBe(200);
      
      const user = await dbManager.getUserByEmail(testUser.email);
      expect(user.passwordResetToken).toBeTruthy();
      expect(user.passwordResetExpiresAt).toBeGreaterThan(Date.now());
    });

    it('should not reveal email existence', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('If an account exists, a password reset email will be sent');
    });
  });
});
