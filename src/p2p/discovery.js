import eventBus from '../core/eventBus.js';
import natTraversal from './natTraversal.js';
import p2pNode from './node.js';

class Discovery {
  constructor() {
    this.natTraversal = natTraversal;
  }

  async start() {
    await this.natTraversal.createNode();
    await p2pNode.start();
    eventBus.emit('discoveryStarted');
  }

  async stop() {
    await this.natTraversal.stop();
    await p2pNode.stop();
    eventBus.emit('discoveryStopped');
  }

  onPeerDiscovered(callback) {
    eventBus.on('peerConnected', callback);
  }

  async sendSecureMessage(message) {
    const signature = await p2pNode.signMessage(message);
    await p2pNode.publishMessage(JSON.stringify({ message, signature }));
  }

  async receiveSecureMessage(callback) {
    p2pNode.on('message', async (data) => {
      const { message, signature } = JSON.parse(data);
      const isValid = await p2pNode.verifyMessage(message, signature);
      if (isValid) {
        callback(message);
      } else {
        console.warn('Received message with invalid signature');
      }
    });
  }
}

export default new Discovery();
