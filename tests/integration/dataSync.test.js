// tests/integration/dataSync.test.js
import { jest } from '@jest/globals';
import { setupTestDatabase, cleanupDatabase } from '../helpers/dbSetup.helper.js';
import SyncManager from '../../src/core/syncManager.js';

describe('Data Synchronization', () => {
  let dbManager1;
  let dbManager2;
  let syncManager1;
  let syncManager2;

  beforeAll(async () => {
    dbManager1 = await setupTestDatabase();
    dbManager2 = await setupTestDatabase();
    syncManager1 = new SyncManager(dbManager1);
    syncManager2 = new SyncManager(dbManager2);
  });

  afterAll(async () => {
    await cleanupDatabase(dbManager1);
    await cleanupDatabase(dbManager2);
  });

  beforeEach(async () => {
    await dbManager1.deleteAll('users');
    await dbManager2.deleteAll('users');
  });

  it('should sync new data from peer1 to peer2', async () => {
    const testUser = {
      id: 'test1',
      email: 'test1@example.com',
      username: 'testuser1',
      password: 'hashedpassword',
      timestamp: Date.now()
    };

    // Create data in peer1
    await dbManager1.createUser(testUser);

    // Sync between peers
    await syncManager1.syncWith(syncManager2);

    // Verify data in peer2
    const syncedUser = await dbManager2.getUserById(testUser.id);
    expect(syncedUser).toBeDefined();
    expect(syncedUser.email).toBe(testUser.email);
  });

  it('should sync updated data from peer2 to peer1', async () => {
    const testUser = {
      id: 'test2',
      email: 'test2@example.com',
      username: 'testuser2',
      password: 'hashedpassword',
      timestamp: Date.now()
    };

    // Create initial data in both peers
    await dbManager1.createUser(testUser);
    await syncManager1.syncWith(syncManager2);

    // Update data in peer2
    const updates = {
      email: 'updated2@example.com',
      username: 'updateduser2', // Adding username to make it a valid update
      timestamp: Date.now()
    };
    
    await dbManager2.updateUser(testUser.id, updates);

    // Sync back to peer1
    await syncManager2.syncWith(syncManager1);

    // Verify update in peer1
    const syncedUser = await dbManager1.getUserById(testUser.id);
    expect(syncedUser.email).toBe(updates.email);
  });

  it('should resolve conflicts using last-write-wins strategy', async () => {
    const testUser = {
      id: 'test3',
      email: 'test3@example.com',
      username: 'testuser3',
      password: 'hashedpassword',
      timestamp: Date.now()
    };

    // Create initial data
    await dbManager1.createUser(testUser);
    await syncManager1.syncWith(syncManager2);

    // Make conflicting changes
    const timestamp1 = Date.now();
    const timestamp2 = timestamp1 + 1000;

    await dbManager1.updateUser(testUser.id, {
      email: 'peer1@example.com',
      username: 'peer1user',
      timestamp: timestamp1
    });

    await dbManager2.updateUser(testUser.id, {
      email: 'peer2@example.com',
      username: 'peer2user',
      timestamp: timestamp2
    });

    // Sync between peers
    await syncManager1.syncWith(syncManager2);

    // Verify both peers have the latest change
    const user1 = await dbManager1.getUserById(testUser.id);
    const user2 = await dbManager2.getUserById(testUser.id);
    expect(user1.email).toBe('peer2@example.com');
    expect(user2.email).toBe('peer2@example.com');
  });

  it('should handle syncing deleted data', async () => {
    const testUser = {
      id: 'test4',
      email: 'test4@example.com',
      username: 'testuser4',
      password: 'hashedpassword',
      timestamp: Date.now()
    };

    // Create initial data
    await dbManager1.createUser(testUser);
    await syncManager1.syncWith(syncManager2);

    // Delete in peer1
    await dbManager1.delete('users', testUser.id);

    // Sync deletion to peer2
    await syncManager1.syncWith(syncManager2);

    // Verify deletion in both peers
    await expect(dbManager1.getUserById(testUser.id))
      .rejects.toThrow('User not found');
    await expect(dbManager2.getUserById(testUser.id))
      .rejects.toThrow('User not found');
  });
});
