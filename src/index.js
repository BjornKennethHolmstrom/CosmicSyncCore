import http from 'http';
import restApi from './api/restApi.js';
import WebSocketApi from './api/websocketApi.js';
import discovery from './p2p/discovery.js';
import dataAccessLayer from './data/dataAccessLayer.js';
import syncManager from './core/syncManager.js';
import eventBus from './core/eventBus.js';

async function start() {
  const server = http.createServer(restApi);
  const webSocketApi = new WebSocketApi(server);

  await discovery.start();

  eventBus.on('peerConnected', (peerId) => {
    console.log('Peer connected:', peerId);
  });

  eventBus.on('nodeStarted', () => {
    console.log('P2P node started');
  });

  server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}

start().catch(console.error);
