import { jest } from '@jest/globals';
import { setupTestDatabase } from '../helpers/dbSetup.helper.js';

describe('DatabaseManager', () => {
  let dbManager;

  beforeAll(async () => {
    dbManager = await setupTestDatabase();
  });

  afterAll(async () => {
    await dbManager.close();
  });

  test('should create a new record', async () => {
    const record = { id: '1', name: 'Test User', email: 'test@example.com' };
    await dbManager.create('users', record);
    const result = await dbManager.read('users', '1');
    expect(result).toEqual(record);
  });

  test('should read an existing record', async () => {
    const record = { id: '2', name: 'Another User', email: 'another@example.com' };
    await dbManager.create('users', record);
    const result = await dbManager.read('users', '2');
    expect(result).toEqual(record);
  });

  test('should update an existing record', async () => {
    const record = { id: '3', name: 'Update User', email: 'update@example.com' };
    await dbManager.create('users', record);
    const updatedRecord = { ...record, name: 'Updated Name' };
    await dbManager.update('users', '3', updatedRecord);
    const result = await dbManager.read('users', '3');
    expect(result).toEqual(updatedRecord);
  });

  test('should delete an existing record', async () => {
    const record = { id: '4', name: 'Delete User', email: 'delete@example.com' };
    await dbManager.create('users', record);
    await dbManager.delete('users', '4');
    const result = await dbManager.read('users', '4');
    expect(result).toBeNull();
  });

  test('should handle reading a non-existent record', async () => {
    const result = await dbManager.read('users', 'non-existent');
    expect(result).toBeNull();
  });

  test('should list all records in a table', async () => {
    await dbManager.create('items', { id: '1', name: 'Item 1' });
    await dbManager.create('items', { id: '2', name: 'Item 2' });
    const results = await dbManager.list('items');
    expect(results).toHaveLength(2);
    expect(results).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: '1', name: 'Item 1' }),
      expect.objectContaining({ id: '2', name: 'Item 2' })
    ]));
  });
});
