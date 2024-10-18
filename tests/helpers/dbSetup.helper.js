import DatabaseManager from '../../src/data/DatabaseManager.js';

export async function setupTestDatabase() {
  const dbManager = new DatabaseManager(':memory:');
  await dbManager.initialize();
  await dbManager.initializeTables();
  return dbManager;
}
