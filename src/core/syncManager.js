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
        if (!existingRecord || existingRecord.timestamp < record.timestamp) {
          if (existingRecord) {
            await this.dbManager.update(table, record.id, record);
          } else {
            await this.dbManager.create(table, record);
          }
        }
      }
    }
  }

  // Keep existing methods for backward compatibility
  async syncData(key, value) {
    try {
      await this.dbManager.create('items', { id: key, name: value });
      eventBus.emit('dataSynced', { key, value });
    } catch (error) {
      eventBus.emit('syncError', { type: 'data', key, error });
    }
  }

  async syncFile(fileData, adapter) {
    try {
      // Implement file syncing logic if needed
      // For now, just emit an event
      eventBus.emit('fileSynced', { fileData, adapter });
    } catch (error) {
      eventBus.emit('syncError', { type: 'file', error });
    }
  }

  setDefaultFileAdapter(adapter) {
    // Implement if needed
  }
}

export default SyncManager;

