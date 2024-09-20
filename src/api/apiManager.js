const HeliaFileStorageManager = require('../storage/HeliaFileStorageManager');

class APIManager {
  constructor(p2pNode, dbManager, syncManager, cryptoManager, gunManager, eventBus) {
    this.p2pNode = p2pNode;
    this.dbManager = dbManager;
    this.syncManager = syncManager;
    this.cryptoManager = cryptoManager;
    this.gunManager = gunManager;
    this.eventBus = eventBus;
    this.fileStorageManager = new HeliaFileStorageManager(eventBus);
    this.eventBus.emit('api:initialized');
  }

  async sendMessage(content, userId) {
    try {
      const encryptedContent = this.cryptoManager.encrypt(content);
      const message = await this.dbManager.addMessage(JSON.stringify(encryptedContent), userId);
      await this.p2pNode.publishMessage(JSON.stringify({
        type: 'NEW_MESSAGE',
        data: { content: encryptedContent, userId }
      }));
      await this.gunManager.put(`messages/${message.id}`, message);
      this.eventBus.emit('api:messageSent', { userId });
    } catch (error) {
      this.eventBus.emit('error:api', error);
      throw error;
    }
  }

  async getRecentMessages(limit = 100) {
    try {
      const messages = await this.dbManager.getRecentMessages(limit);
      const decryptedMessages = messages.map(msg => ({
        ...msg,
        content: this.cryptoManager.decrypt(JSON.parse(msg.content))
      }));
      this.eventBus.emit('api:recentMessagesRetrieved', { count: decryptedMessages.length });
      return decryptedMessages;
    } catch (error) {
      this.eventBus.emit('error:api', error);
      return [];
    }
  }

  async syncData() {
    await this.syncManager.syncData();
    this.eventBus.emit('api:dataSynced');
  }

  async uploadFile(file, path) {
    try {
      const { cid, path: filePath } = await this.fileStorageManager.uploadFile(file, path);
      await this.gunManager.put(`files/${filePath}`, { cid, path: filePath });
      this.eventBus.emit('api:fileUploaded', { path: filePath });
      return cid;
    } catch (error) {
      this.eventBus.emit('error:api', error);
      throw error;
    }
  }

  async getFile(path) {
    try {
      const gunData = await this.gunManager.get(`files/${path}`);
      if (gunData && gunData.cid) {
        const file = await this.fileStorageManager.getFile(gunData.cid);
        this.eventBus.emit('api:fileRetrieved', { path });
        return file;
      }
      throw new Error('File not found');
    } catch (error) {
      this.eventBus.emit('error:api', error);
      throw error;
    }
  }
}

module.exports = APIManager;
