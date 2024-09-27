import eventBus from '../core/eventBus.js';
import natTraversal from './natTraversal.js';

class Discovery {
  constructor() {
    this.natTraversal = natTraversal;
  }

  async start() {
    await this.natTraversal.createNode();
    eventBus.emit('discoveryStarted');
  }

  async stop() {
    await this.natTraversal.stop();
    eventBus.emit('discoveryStopped');
  }

  onPeerDiscovered(callback) {
    eventBus.on('peerConnected', callback);
  }
}

export default new Discovery();
