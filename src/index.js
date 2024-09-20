require('dotenv').config();
const config = require('config');
const { createHelia } = require('helia');
const GunManager = require('./storage/gunManager');
const P2PNode = require('./p2p/node');
const DatabaseManager = require('./db/manager');
const SyncManager = require('./core/syncManager');
const CryptoManager = require('./core/cryptoManager');
const APIManager = require('./api/apiManager');
const eventBus = require('./core/eventBus');

class CosmicSyncCore {
  constructor(config) {
    this.config = config;
    this.helia = null;
    this.eventBus = eventBus;
    this.gunManager = new GunManager(config.gun, this.eventBus);
    this.p2pNode = new P2PNode(config.p2p, this.eventBus);
    this.dbManager = new DatabaseManager(config.database, this.eventBus);
    this.syncManager = new SyncManager(this.p2pNode, this.dbManager, this.gunManager, this.eventBus);
    this.cryptoManager = new CryptoManager(this.eventBus);
    this.apiManager = new APIManager(this.p2pNode, this.dbManager, this.syncManager, this.cryptoManager, this.gunManager, this.eventBus);

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventBus.on('core:initialized', () => {
      console.log('CosmicSyncCore has been initialized');
    });

    this.eventBus.on('data:synced', (data) => {
      console.log('Data has been synced:', data);
    });

    // Add more global event listeners as needed
  }

  async start() {
    try {
      this.helia = await createHelia();
      await this.p2pNode.start();
      this.eventBus.emit('core:initialized');

      console.log('P2P node started successfully');

      this.p2pNode.on('message', this.handleIncomingMessage.bind(this));

      // Example: Sync data every 30 seconds
      setInterval(() => this.syncManager.syncData(), 30000);

      // Handle application shutdown
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      console.error('Error starting the application:', error);
      process.exit(1);
    }
  }

  async handleIncomingMessage(message) {
    const parsedMessage = JSON.parse(message);
    switch (parsedMessage.type) {
      case 'NEW_MESSAGE':
        await this.dbManager.addMessage(parsedMessage.data.content, parsedMessage.data.userId);
        break;
      case 'SYNC_REQUEST':
        await this.syncManager.handleIncomingSync(message);
        break;
      default:
        console.log('Received unknown message type:', parsedMessage.type);
    }
  }

  async shutdown() {
    console.log('Shutting down...');
    await this.p2pNode.stop();
    await this.dbManager.close();
    process.exit(0);
  }
}

const cosmicSyncCore = new CosmicSyncCore(config);
cosmicSyncCore.start();

module.exports = CosmicSyncCore;
