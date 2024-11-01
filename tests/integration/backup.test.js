// tests/integration/backup.test.js

import BackupManager from '../../src/core/backupManager.js';
import DatabaseManager from '../../src/data/DatabaseManager.js';
import fs from 'fs/promises';
import path from 'path';

describe('BackupManager', () => {
  let backupManager;
  let dbManager;
  const testBackupDir = './test-backups';
  const testDbPath = ':memory:';  // Use in-memory database for testing

  beforeAll(async () => {
    // Setup test environment
    dbManager = new DatabaseManager(testDbPath);
    await dbManager.initialize();
    await dbManager.initializeTables();

    backupManager = new BackupManager({ backupDir: testBackupDir });
    backupManager.setDatabaseManager(dbManager);
    await backupManager.initialize();
  });

  afterAll(async () => {
    await dbManager.close();
    await fs.rm(testBackupDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    // Clear existing data
    await dbManager.deleteAll('users');
    await dbManager.deleteAll('items');
    await dbManager.deleteAll('files');
  });

  test('should create a full backup', async () => {
    // Insert test data
    await dbManager.create('users', {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      timestamp: Date.now()
    });

    const backupName = await backupManager.createBackup('full');
    expect(backupName).toBeTruthy();

    const backups = await backupManager.listBackups();
    expect(backups).toHaveLength(1);
    expect(backups[0].type).toBe('full');
  });

  test('should restore from backup', async () => {
    // Create test data and backup
    const userData = {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      timestamp: Date.now()
    };
    await dbManager.create('users', userData);
    const backupName = await backupManager.createBackup('full');

    // Clear database
    await dbManager.deleteAll('users');
    let users = await dbManager.list('users');
    expect(users).toHaveLength(0);

    // Restore backup
    await backupManager.restoreBackup(backupName);
    users = await dbManager.list('users');
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe(userData.name);
  });

  test('should validate backup integrity', async () => {
    const backupName = await backupManager.createBackup('full');
    const isValid = await backupManager.validateBackup(backupName);
    expect(isValid).toBe(true);
  });

  test('should prune old backups', async () => {
    const maxBackups = 2;
    backupManager.maxBackups = maxBackups;

    // Create more backups than the maximum
    await backupManager.createBackup('full');
    await backupManager.createBackup('full');
    await backupManager.createBackup('full');

    const backups = await backupManager.listBackups();
    expect(backups).toHaveLength(maxBackups);
  });

  test('should handle backup deletion', async () => {
    const backupName = await backupManager.createBackup('full');
    await backupManager.deleteBackup(backupName);

    const backups = await backupManager.listBackups();
    expect(backups).toHaveLength(0);
  });
});
