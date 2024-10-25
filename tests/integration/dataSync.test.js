import { jest } from '@jest/globals';
import SyncManager from '../../src/core/syncManager.js';
import { setupTestDatabase } from '../../src/testUtils/dbSetup.js';

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
    await dbManager1.deleteAll('users');
    await dbManager2.deleteAll('users');
  });

  test('should sync new data from peer1 to peer2', async () => {
    const timestamp = Date.now();
    const user = { id: '1', name: 'Alice', email: 'alice@example.com', timestamp };
    await dbManager1.create('users', user);
    await syncManager1.syncWith(syncManager2);

    const syncedUser = await dbManager2.read('users', '1');
    expect(syncedUser).toMatchObject({
      id: user.id,
      name: user.name,
      email: user.email
    });
  });

  test('should sync updated data from peer2 to peer1', async () => {
    const user = { id: '1', name: 'Bob', email: 'bob@example.com' };
    await dbManager1.create('users', user);
    await syncManager1.syncWith(syncManager2);

    const updatedUser = { ...user, name: 'Bobby' };
    await dbManager2.update('users', '1', updatedUser);
    await syncManager2.syncWith(syncManager1);

    const syncedUser = await dbManager1.read('users', '1');
    expect(syncedUser).toMatchObject({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email
    });
  });

  test('should resolve conflicts using last-write-wins strategy', async () => {
    const originalUser = { 
      id: '1', 
      name: 'Charlie', 
      email: 'charlie@example.com',
      timestamp: Date.now() 
    };
    await dbManager1.create('users', originalUser);
    await syncManager1.syncWith(syncManager2);

    // Wait a bit to ensure timestamps are different
    await new Promise(resolve => setTimeout(resolve, 100));

    const updatedUser1 = { 
      ...originalUser, 
      name: 'Charles',
      timestamp: Date.now() 
    };
    await dbManager1.update('users', '1', updatedUser1);

    // Wait a bit to ensure timestamps are different
    await new Promise(resolve => setTimeout(resolve, 100));

    const updatedUser2 = { 
      ...originalUser, 
      name: 'Chuck',
      timestamp: Date.now() 
    };
    await dbManager2.update('users', '1', updatedUser2);

    await syncManager1.syncWith(syncManager2);

    const finalUser1 = await dbManager1.read('users', '1');
    const finalUser2 = await dbManager2.read('users', '1');

    // Should have Chuck's data as it was the last write
    expect(finalUser1).toMatchObject({
      id: '1',
      name: 'Chuck',
      email: 'charlie@example.com'
    });
    expect(finalUser2).toMatchObject({
      id: '1',
      name: 'Chuck',
      email: 'charlie@example.com'
    });
  });

  test('should handle syncing deleted data', async () => {
    const user = { 
      id: '1', 
      name: 'David', 
      email: 'david@example.com',
      timestamp: Date.now()
    };
    await dbManager1.create('users', user);
    await syncManager1.syncWith(syncManager2);

    await dbManager1.delete('users', '1');
    await syncManager1.syncWith(syncManager2);

    // Both databases should show null for deleted record
    const deletedUser1 = await dbManager1.read('users', '1');
    const deletedUser2 = await dbManager2.read('users', '1');
    
    expect(deletedUser1).toBeNull();
    expect(deletedUser2).toBeNull();
  });
});
