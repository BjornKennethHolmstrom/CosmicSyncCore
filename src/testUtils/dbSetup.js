// src/testUtils/dbSetup.js
import DatabaseManager from '../data/DatabaseManager.js';

export async function setupTestDatabase() {
  const dbManager = new DatabaseManager(':memory:');
  await dbManager.initialize();
  await dbManager.initializeTables();
  return dbManager;
}
