import { setupTestDatabase } from '../helpers/dbSetup.helper.js';
import { SCHEMA } from '../../src/data/schema.js';

describe('Database Schema', () => {
  let dbManager;

  beforeAll(async () => {
    dbManager = await setupTestDatabase();
  });

  afterAll(async () => {
    await dbManager.close();
  });

  test.each(Object.keys(SCHEMA))('Table %s should be created', async (tableName) => {
    const query = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
    const result = await dbManager.db.get(query, [tableName]);
    expect(result).toBeTruthy();
    expect(result.name).toBe(tableName);
  });
});
