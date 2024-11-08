// tests/integration/auth.test.js
import { jest } from '@jest/globals';
import { withTestEnvironment } from '../helpers/testEnvironment.js';

describe('Authentication Tests', () => {
  it('should create and authenticate user', async () => {
    await withTestEnvironment(async (env) => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'testpass123'
      };
      
      const user = await env.createTestUser(userData);
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      
      const session = await env.createTestSession(user.id);
      expect(session).toBeDefined();
      expect(session.userId).toBe(user.id);
    });
  });
});
