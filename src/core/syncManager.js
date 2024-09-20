const EventEmitter = require('./eventEmitter');

class SyncManager extends EventEmitter {
  constructor(p2pNode, dbManager, gunManager, eventBus) {
    this.p2pNode = p2pNode;
    this.dbManager = dbManager;
    this.gunManager = gunManager;
    this.eventBus = eventBus;
  }

  async syncData() {
    try {
      const localData = await this.dbManager.getRecentMessages(100);
      await this.p2pNode.publishMessage(JSON.stringify({
        type: 'SYNC_REQUEST',
        data: localData
      }));

      // Sync with Gun.js
      await this.syncWithGun(localData);

      this.eventBus.emit('data:synced', { count: localData.length });
    } catch (error) {
      console.error('Error during data sync:', error);
      this.emit('syncError', error);
    }
  }

  async handleIncomingSync(syncData) {
    try {
      const incomingData = JSON.parse(syncData);
      for (const item of incomingData.data) {
        await this.dbManager.addMessage(item.content, item.user_id);
        await this.gunManager.put(item.id, item);
      }
      this.emit('syncCompleted');
    } catch (error) {
      console.error('Error handling incoming sync:', error);
      this.emit('syncError', error);
    }
  }

  async syncWithGun(localData) {
    for (const item of localData) {
      await this.gunManager.put(item.id, item);
    }
  }
}

module.exports = SyncManager;
