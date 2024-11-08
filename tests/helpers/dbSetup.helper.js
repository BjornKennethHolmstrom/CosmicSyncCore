// tests/helpers/dbSetup.helper.js
import DatabaseManager from '../../src/data/DatabaseManager.js';
import { SCHEMA } from '../../src/data/schema.js';

export async function setupTestDatabase() {
  const dbManager = new DatabaseManager(':memory:');
  await dbManager.initialize();

  // Create test user for auth tests
  await dbManager.createUser({
    id: 'testUser123',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEF', // Pre-hashed test password
    timestamp: Date.now()
  });

  return dbManager;
}

export async function cleanupDatabase(dbManager) {
  if (dbManager) {
    for (const table of Object.keys(SCHEMA)) {
      await dbManager.deleteAll(table);
    }
    await dbManager.close();
  }
}
