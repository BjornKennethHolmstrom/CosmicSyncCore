import eventBus from './eventBus.js';

class SyncManager {
  constructor(dbManager) {
    this.dbManager = dbManager;
    this.peerId = Math.random().toString(36).substr(2, 9); // Simple peer ID generation
  }

  async syncWith(otherSyncManager) {
    const lastSyncTimestamp = await this.dbManager.getLastSyncTimestamp(otherSyncManager.peerId);
    const localChanges = await this.getChanges(lastSyncTimestamp);
    
    // Send local changes to the other peer
    await otherSyncManager.applyChanges(localChanges);
    
    // Get changes from the other peer
    const remoteChanges = await otherSyncManager.getChanges(lastSyncTimestamp);
    
    // Apply remote changes locally
    await this.applyChanges(remoteChanges);
    
    // Update last sync timestamp
    const currentTimestamp = Date.now();
    await this.dbManager.updateLastSyncTimestamp(otherSyncManager.peerId, currentTimestamp);
    await otherSyncManager.dbManager.updateLastSyncTimestamp(this.peerId, currentTimestamp);
  }

  async getChanges(since) {
    const tables = ['users', 'items']; // Add all tables that need syncing
    let allChanges = {};
    for (const table of tables) {
      allChanges[table] = await this.dbManager.getChanges(table, since);
    }
    return allChanges;
  }

  async applyChanges(changes) {
    for (const [table, tableChanges] of Object.entries(changes)) {
      for (const record of tableChanges) {
        const existingRecord = await this.dbManager.read(table, record.id);
        
        // Handle deleted records
        if (record._deleted) {
          if (existingRecord) {
            await this.dbManager.delete(table, record.id);
          }
          continue;
        }

        // Handle updates and new records
        if (!existingRecord || existingRecord.timestamp < record.timestamp) {
          // Preserve the original timestamp when syncing
          const timestamp = record.timestamp;
          if (existingRecord) {
            await this.dbManager.update(table, record.id, { ...record, timestamp });
          } else {
            await this.dbManager.create(table, { ...record, timestamp });
          }
        }
      }
    }
  }

  // Keep existing methods for backward compatibility
  async syncData(key, value) {
    try {
      await this.dbManager.create('items', { 
        id: key,
        name: value,
        timestamp: Date.now()
      });
      eventBus.emit('dataSynced', { key, value });
    } catch (error) {
      eventBus.emit('syncError', { type: 'data', key, error });
    }
  }

  async syncFile(fileData, adapter) {
    try {
      // Implement basic file syncing
      const record = {
        id: fileData.filename,
        data: fileData.buffer,
        timestamp: Date.now()
      };
      await this.dbManager.create('files', record);
      eventBus.emit('fileSynced', { fileData, adapter });
      return { success: true };
    } catch (error) {
      eventBus.emit('syncError', { type: 'file', error });
      throw error;
    }
  }

  setDefaultFileAdapter(adapter) {
    // Implement if needed, placeholder for backward compatibility
  }
}

export default SyncManager;

