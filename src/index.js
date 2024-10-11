// src/index.js
import http from 'http';
import restApi from './api/restApi.js';
import WebSocketApi from './api/websocketApi.js';
import discovery from './p2p/discovery.js';
import dataAccessLayer from './data/dataAccessLayer.js';
import syncManager from './core/syncManager.js';
import eventBus from './core/eventBus.js';
import logger from './core/logger.js';
import monitoring from './core/monitoring.js';

async function start() {
  try {
    const server = http.createServer(restApi);
    const webSocketApi = new WebSocketApi(server);

    await discovery.start();

    eventBus.on('peerConnected', (peerId) => {
      logger.info(`Peer connected: ${peerId}`);
    });

    eventBus.on('nodeStarted', () => {
      logger.info('P2P node started');
    });

    server.listen(3000, () => {
      logger.info('Server running on http://localhost:3000');
    });

    // Periodic health check
    setInterval(async () => {
      await monitoring.updateMetrics();
      const metrics = monitoring.getMetrics();
      logger.info('Health check:', metrics);
    }, 60000); // Run every minute

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
