// tests/integration/backup.test.js
import { jest } from '@jest/globals';
import { setupTestDatabase } from '../helpers/dbSetup.helper.js';
import BackupManager from '../../src/core/backupManager.js';
import path from 'path';
import fs from 'fs/promises';

describe('BackupManager', () => {
  let dbManager;
  let backupManager;
  const testBackupDir = path.join(process.cwd(), 'test-backups');

  beforeAll(async () => {
    dbManager = await setupTestDatabase();
    backupManager = new BackupManager({ backupDir: testBackupDir });
    backupManager.setDatabaseManager(dbManager);
    await backupManager.initialize();
  });

  afterAll(async () => {
    await dbManager.close();
    await fs.rm(testBackupDir, { recursive: true, force: true }).catch(() => {});
  });

  beforeEach(async () => {
    await dbManager.deleteAll('users');
    await fs.readdir(testBackupDir)
      .then(files => Promise.all(
        files.map(file => 
          fs.rm(path.join(testBackupDir, file), { recursive: true })
        )
      ))
      .catch(() => {});
  });

  it('should create a full backup', async () => {
    const testUser = {
      id: 'test1',
      email: 'test1@example.com',
      username: 'testuser1',
      password: 'hashedpassword',
      timestamp: Date.now()
    };
    
    await dbManager.createUser(testUser);

    const backupName = await backupManager.createBackup('full');
    expect(backupName).toMatch(/backup-full-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);

    const backupPath = path.join(testBackupDir, backupName);
    const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
    expect(backupExists).toBe(true);
  });

  it('should restore from backup', async () => {
    const testUser = {
      id: 'test2',
      email: 'test2@example.com',
      username: 'testuser2',
      password: 'hashedpassword',
      timestamp: Date.now()
    };

    await dbManager.createUser(testUser);
    const backupName = await backupManager.createBackup('full');

    await dbManager.deleteAll('users');
    await backupManager.restoreBackup(backupName);

    const restoredUser = await dbManager.getUserById(testUser.id);
    expect(restoredUser).toBeDefined();
    expect(restoredUser.email).toBe(testUser.email);
  });

  it('should validate backup integrity', async () => {
    const testUser = {
      id: 'test3',
      email: 'test3@example.com',
      username: 'testuser3',
      password: 'hashedpassword',
      timestamp: Date.now()
    };
    await dbManager.createUser(testUser);
    
    const backupName = await backupManager.createBackup('full');
    const isValid = await backupManager.validateBackup(backupName);
    expect(isValid).toBe(true);
  });

  it('should prune old backups', async () => {
    const backups = [];
    // Create a fixed number of backups synchronously
    for (let i = 0; i < 7; i++) {
      const testUser = {
        id: `test-user-${i}`,
        email: `test${i}@example.com`,
        username: `testuser${i}`,
        password: 'hashedpassword',
        timestamp: Date.now() + i * 1000 // Ensure different timestamps
      };
      await dbManager.createUser(testUser);
      const backupName = await backupManager.createBackup('full');
      backups.push(backupName);
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const remainingBackups = await backupManager.listBackups();
    expect(remainingBackups.length).toBeLessThanOrEqual(backupManager.maxBackups);
    // Clean up test backups
    for (const backup of backups) {
      await backupManager.deleteBackup(backup).catch(() => {});
    }
  });

  it('should handle backup deletion', async () => {
    const testUser = {
      id: 'test5',
      email: 'test5@example.com',
      username: 'testuser5',
      password: 'hashedpassword',
      timestamp: Date.now()
    };
    await dbManager.createUser(testUser);
    
    const backupName = await backupManager.createBackup('full');
    await backupManager.deleteBackup(backupName);
    
    const backups = await backupManager.listBackups();
    expect(backups.find(b => b.name === backupName)).toBeUndefined();
  });
});
