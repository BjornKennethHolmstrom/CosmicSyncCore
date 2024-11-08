// tests/helpers/testEnvironment.js
import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { DatabaseManager } from '../../src/data/DatabaseManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TestEnvironment {
  constructor() {
    this.dbManager = null;
    this.testData = {
      users: [],
      sessions: [],
      testFiles: []
    };
  }

  async setup() {
    // Setup test database
    this.dbManager = new DatabaseManager(':memory:');
    await this.dbManager.initialize();
    
    // Setup test data
    await this.setupTestData();
    
    return this;
  }

  async setupTestData() {
    // Create test users
    this.testData.users = [
      {
        id: 'test-user-1',
        email: 'test1@example.com',
        username: 'testuser1',
        password: 'hashedpass1',
        timestamp: Date.now()
      },
      {
        id: 'test-user-2',
        email: 'test2@example.com',
        username: 'testuser2',
        password: 'hashedpass2',
        timestamp: Date.now()
      }
    ];

    // Insert test data
    for (const user of this.testData.users) {
      await this.dbManager.createUser(user);
    }
  }

  async cleanup() {
    if (this.dbManager) {
      // Clean up test data
      for (const user of this.testData.users) {
        try {
          await this.dbManager.delete('users', user.id);
        } catch (error) {
          console.warn(`Failed to delete test user ${user.id}:`, error);
        }
      }
      
      // Close database connection
      await this.dbManager.close();
    }
  }

  // Helper methods for tests
  async createTestUser(userData) {
    const user = {
      id: `test-user-${Date.now()}`,
      timestamp: Date.now(),
      ...userData
    };
    await this.dbManager.createUser(user);
    this.testData.users.push(user);
    return user;
  }

  async createTestSession(userId) {
    const session = {
      id: `test-session-${Date.now()}`,
      userId,
      timestamp: Date.now(),
      expiresAt: Date.now() + 3600000 // 1 hour
    };
    await this.dbManager.createSession(session);
    this.testData.sessions.push(session);
    return session;
  }
}

// Create helper functions for common test setup patterns
export async function setupTestEnvironment() {
  const env = new TestEnvironment();
  await env.setup();
  return env;
}

export async function withTestEnvironment(testFn) {
  const env = await setupTestEnvironment();
  try {
    await testFn(env);
  } finally {
    await env.cleanup();
  }
}
