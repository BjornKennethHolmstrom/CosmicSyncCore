// tests/helpers/dbSetup.helper.js
import DatabaseManager from '../../src/data/DatabaseManager.js';
import { SCHEMA } from '../../src/data/schema.js';
import logger from '../../src/core/logger.js';

export async function setupTestDatabase() {
  try {
    process.env.NODE_ENV = 'test';
    const dbManager = new DatabaseManager(':memory:');
    
    // Explicitly wait for initialization
    await dbManager.initialize();

    // Verify tables were created
    const tables = await dbManager.db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    logger.info(`Created tables: ${tables.map(t => t.name).join(', ')}`);

    // Create test user after ensuring tables exist
    await dbManager.createUser({
      id: 'testUser123',
      email: 'test@example.com',
      username: 'testuser',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEF', // Pre-hashed test password
      timestamp: Date.now()
    });

    return dbManager;
  } catch (error) {
    logger.error('Test database setup failed:', error.stack);
    throw error;
  }
}

export async function cleanupDatabase(dbManager) {
  if (!dbManager) return;
  
  try {
    if (dbManager.initialized) {
      for (const table of Object.keys(SCHEMA)) {
        await dbManager.deleteAll(table);
      }
      await dbManager.close();
    }
  } catch (error) {
    logger.error('Database cleanup failed:', error);
    throw error;
  }
}
