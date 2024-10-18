import { jest } from '@jest/globals';
import DatabaseManager from '../../src/data/DatabaseManager.js';
import SyncManager from '../../src/core/syncManager.js';
import { setupTestDatabase } from '../helpers/dbSetup.helper.js';

describe('Data Synchronization', () => {
  let dbManager1, dbManager2, syncManager1, syncManager2;

  beforeAll(async () => {
    dbManager1 = await setupTestDatabase();
    dbManager2 = await setupTestDatabase();
    syncManager1 = new SyncManager(dbManager1);
    syncManager2 = new SyncManager(dbManager2);
  });

  afterAll(async () => {
    await dbManager1.close();
    await dbManager2.close();
  });

  beforeEach(async () => {
    // Clear data before each test
    await dbManager1.deleteAll('users');
    await dbManager2.deleteAll('users');
  });

  test('should sync new data from peer1 to peer2', async () => {
    const user = { id: '1', name: 'Alice', email: 'alice@example.com' };
    await dbManager1.create('users', user);
    await syncManager1.syncWith(syncManager2);

    const syncedUser = await dbManager2.read('users', '1');
    expect(syncedUser).toEqual(user);
  });

  test('should sync updated data from peer2 to peer1', async () => {
    const user = { id: '1', name: 'Bob', email: 'bob@example.com' };
    await dbManager1.create('users', user);
    await syncManager1.syncWith(syncManager2);

    const updatedUser = { ...user, name: 'Bobby' };
    await dbManager2.update('users', '1', updatedUser);
    await syncManager2.syncWith(syncManager1);

    const syncedUser = await dbManager1.read('users', '1');
    expect(syncedUser).toEqual(updatedUser);
  });

  test('should resolve conflicts using last-write-wins strategy', async () => {
    const originalUser = { id: '1', name: 'Charlie', email: 'charlie@example.com' };
    await dbManager1.create('users', originalUser);
    await syncManager1.syncWith(syncManager2);

    const updatedUser1 = { ...originalUser, name: 'Charles' };
    const updatedUser2 = { ...originalUser, name: 'Chuck' };

    await dbManager1.update('users', '1', updatedUser1);
    await dbManager2.update('users', '1', updatedUser2);

    // Simulate a delay to ensure updatedUser2 is the last write
    await new Promise(resolve => setTimeout(resolve, 10));

    await syncManager1.syncWith(syncManager2);

    const finalUser1 = await dbManager1.read('users', '1');
    const finalUser2 = await dbManager2.read('users', '1');

    expect(finalUser1).toEqual(updatedUser2);
    expect(finalUser2).toEqual(updatedUser2);
  });

  test('should handle syncing deleted data', async () => {
    const user = { id: '1', name: 'David', email: 'david@example.com' };
    await dbManager1.create('users', user);
    await syncManager1.syncWith(syncManager2);

    await dbManager1.delete('users', '1');
    await syncManager1.syncWith(syncManager2);

    const deletedUser = await dbManager2.read('users', '1');
    expect(deletedUser).toBeNull();
  });
});
