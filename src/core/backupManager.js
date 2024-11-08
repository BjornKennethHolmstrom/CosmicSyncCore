// src/core/backupManager.js

import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import logger from './logger.js';
import eventBus from './eventBus.js';
import { createHash } from 'crypto';
import { SCHEMA } from '../data/schema.js';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

class BackupManager {
  constructor(options = {}) {
    this.backupDir = options.backupDir || './backups';
    this.dbManager = null;
    this.maxBackups = options.maxBackups || 5;
    this.schema = SCHEMA;
  }

  setDatabaseManager(dbManager) {
    this.dbManager = dbManager;
  }

  async initialize() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info(`Backup directory initialized: ${this.backupDir}`);
    } catch (error) {
      logger.error('Failed to initialize backup directory:', error);
      throw error;
    }
  }

  async createBackup(type = 'full') {
    if (!this.dbManager) {
      throw new Error('DatabaseManager not set');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${type}-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupName);

    try {
      await fs.mkdir(backupPath, { recursive: true });
      
      const backup = {};
      for (const table of Object.keys(this.schema)) {
        if (table !== 'sync_metadata') {
          const records = await this.dbManager.list(table);
          backup[table] = records;
        }
      }

      // Create backup manifest
      const manifest = {
        timestamp: Date.now(),
        type,
        tables: Object.keys(backup),
        version: '1.0'
      };

      // Compress and save data
      const backupData = JSON.stringify(backup);
      const compressed = await gzip(backupData);
      const checksum = this.calculateChecksum(backupData);

      await fs.writeFile(path.join(backupPath, 'data.gz'), compressed);
      await fs.writeFile(
        path.join(backupPath, 'manifest.json'),
        JSON.stringify({ ...manifest, checksum })
      );

      // Maintain maximum number of backups
      await this.pruneOldBackups();

      logger.info(`Backup created successfully: ${backupName}`);
      eventBus.emit('backupCreated', { name: backupName, manifest });

      return backupName;
    } catch (error) {
      logger.error('Backup creation failed:', error);
      throw error;
    }
  }

  async restoreBackup(backupName) {
    if (!this.dbManager) {
      throw new Error('DatabaseManager not set');
    }

    const backupPath = path.join(this.backupDir, backupName);

    try {
      // Read and validate manifest
      const manifest = JSON.parse(
        await fs.readFile(path.join(backupPath, 'manifest.json'), 'utf8')
      );

      // Read and decompress data
      const compressed = await fs.readFile(path.join(backupPath, 'data.gz'));
      const decompressed = await gunzip(compressed);
      const backupData = JSON.parse(decompressed);

      // Verify checksum
      const checksum = this.calculateChecksum(decompressed);
      if (checksum !== manifest.checksum) {
        throw new Error('Backup checksum validation failed');
      }

      // Begin restore
      for (const [table, records] of Object.entries(backupData)) {
        // Clear existing table data
        await this.dbManager.deleteAll(table);
        
        // Restore records
        for (const record of records) {
          await this.dbManager.create(table, record);
        }
      }

      logger.info(`Backup restored successfully: ${backupName}`);
      eventBus.emit('backupRestored', { name: backupName, manifest });

      return true;
    } catch (error) {
      logger.error('Backup restoration failed:', error);
      throw error;
    }
  }

  async listBackups() {
    try {
      const backups = await fs.readdir(this.backupDir);
      const backupInfo = await Promise.all(
        backups.map(async (backup) => {
          try {
            const manifestPath = path.join(this.backupDir, backup, 'manifest.json');
            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
            return {
              name: backup,
              ...manifest
            };
          } catch (error) {
            logger.warn(`Failed to read manifest for backup ${backup}:`, error);
            return null;
          }
        })
      );

      return backupInfo.filter(Boolean).sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      logger.error('Failed to list backups:', error);
      throw error;
    }
  }

  async deleteBackup(backupName) {
    try {
      await fs.rm(path.join(this.backupDir, backupName), { recursive: true });
      logger.info(`Backup deleted: ${backupName}`);
      eventBus.emit('backupDeleted', { name: backupName });
    } catch (error) {
      logger.error(`Failed to delete backup ${backupName}:`, error);
      throw error;
    }
  }

  async pruneOldBackups() {
    try {
      const backups = await this.listBackups();
      if (backups.length > this.maxBackups) {
        const toDelete = backups.slice(this.maxBackups);
        await Promise.all(
          toDelete.map(backup => this.deleteBackup(backup.name))
        );
      }
    } catch (error) {
      logger.error('Failed to prune old backups:', error);
      throw error;
    }
  }

  calculateChecksum(data) {
    return createHash('sha256')
      .update(typeof data === 'string' ? data : JSON.stringify(data))
      .digest('hex');
  }

  async validateBackup(backupName) {
    try {
      const backupPath = path.join(this.backupDir, backupName);
      const manifest = JSON.parse(
        await fs.readFile(path.join(backupPath, 'manifest.json'), 'utf8')
      );

      const compressed = await fs.readFile(path.join(backupPath, 'data.gz'));
      const decompressed = await gunzip(compressed);
      
      const checksum = this.calculateChecksum(decompressed);
      return checksum === manifest.checksum;
    } catch (error) {
      logger.error(`Backup validation failed for ${backupName}:`, error);
      return false;
    }
  }
}

export default BackupManager;
