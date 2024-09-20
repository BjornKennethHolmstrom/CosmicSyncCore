// src/api/apiManager.js
const EventEmitter = require('../core/eventEmitter');

class APIManager extends EventEmitter {
  constructor(p2pNode, dbManager, syncManager, cryptoManager) {
    super();
    this.p2pNode = p2pNode;
    this.dbManager = dbManager;
    this.syncManager = syncManager;
    this.cryptoManager = cryptoManager;
  }

  async sendMessage(content, userId) {
    try {
      const encryptedContent = this.cryptoManager.encrypt(content);
      await this.dbManager.addMessage(JSON.stringify(encryptedContent), userId);
      await this.p2pNode.publishMessage(JSON.stringify({
        type: 'NEW_MESSAGE',
        data: { content: encryptedContent, userId }
      }));
      this.emit('messageSent', { content, userId });
    } catch (error) {
      console.error('Error sending message:', error);
      this.emit('error', error);
    }
  }

  async getRecentMessages(limit = 100) {
    try {
      const messages = await this.dbManager.getRecentMessages(limit);
      return messages.map(msg => ({
        ...msg,
        content: this.cryptoManager.decrypt(JSON.parse(msg.content))
      }));
    } catch (error) {
      console.error('Error getting recent messages:', error);
      this.emit('error', error);
      return [];
    }
  }

  async syncData() {
    await this.syncManager.syncData();
  }
}

module.exports = APIManager;
