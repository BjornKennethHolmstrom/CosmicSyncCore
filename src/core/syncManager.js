// src/core/syncManager.js
const EventEmitter = require('./eventEmitter');

class SyncManager extends EventEmitter {
  constructor(p2pNode, dbManager) {
    super();
    this.p2pNode = p2pNode;
    this.dbManager = dbManager;
  }

  async syncData() {
    try {
      const localData = await this.dbManager.getRecentMessages(100);
      await this.p2pNode.publishMessage(JSON.stringify({
        type: 'SYNC_REQUEST',
        data: localData
      }));
      this.emit('syncStarted');
    } catch (error) {
      console.error('Error during data sync:', error);
      this.emit('syncError', error);
    }
  }

  async handleIncomingSync(syncData) {
    try {
      const incomingData = JSON.parse(syncData);
      // Implement logic to merge incoming data with local data
      // This is a simplified version and should be expanded based on your specific needs
      for (const item of incomingData.data) {
        await this.dbManager.addMessage(item.content, item.user_id);
      }
      this.emit('syncCompleted');
    } catch (error) {
      console.error('Error handling incoming sync:', error);
      this.emit('syncError', error);
    }
  }
}

module.exports = SyncManager;
