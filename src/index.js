// src/index.js
require('dotenv').config();
const config = require('config');
const P2PNode = require('./p2p/node');
const DatabaseManager = require('./db/manager');
const SyncManager = require('./core/syncManager');
const CryptoManager = require('./core/cryptoManager');
const APIManager = require('./api/apiManager');

async function main() {
  const p2pNode = new P2PNode();
  const dbManager = new DatabaseManager();
  const syncManager = new SyncManager(p2pNode, dbManager);
  const cryptoManager = new CryptoManager();
  const apiManager = new APIManager(p2pNode, dbManager, syncManager, cryptoManager);

  try {
    await p2pNode.start();
    console.log('P2P node started successfully');

    p2pNode.on('message', async (message) => {
      const parsedMessage = JSON.parse(message);
      switch (parsedMessage.type) {
        case 'NEW_MESSAGE':
          await dbManager.addMessage(parsedMessage.data.content, parsedMessage.data.userId);
          break;
        case 'SYNC_REQUEST':
          await syncManager.handleIncomingSync(message);
          break;
        default:
          console.log('Received unknown message type:', parsedMessage.type);
      }
    });

    // Example: Send a message every 5 seconds
    setInterval(async () => {
      const message = `Hello from CosmicSyncCore at ${new Date().toISOString()}`;
      await apiManager.sendMessage(message, 'system');
    }, 5000);

    // Example: Sync data every 30 seconds
    setInterval(async () => {
      await apiManager.syncData();
    }, 30000);

    // Handle application shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await p2pNode.stop();
      await dbManager.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}

main();
