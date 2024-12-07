// src/p2p/discovery.js
import eventBus from '../core/eventBus.js';
import natTraversal from './natTraversal.js';
import p2pNode from './node.js';
import logger from '../core/logger.js';

class Discovery {
  constructor() {
    this.natTraversal = natTraversal;
  }

  async start() {
    try {
      await this.natTraversal.createNode();
      await p2pNode.start();
      
      // Handle NAT traversal peer discovery
      this.natTraversal.on('peerConnected', (peerId) => {
        logger.info(`NAT traversal discovered peer: ${peerId}`);
        eventBus.emit('peerConnected', peerId);
      });

      eventBus.emit('discoveryStarted');
      logger.info('P2P discovery started successfully');
    } catch (error) {
      logger.error('Failed to start P2P discovery:', error);
      throw error;
    }
  }

  async stop() {
    try {
      await this.natTraversal.stop();
      await p2pNode.stop();
      eventBus.emit('discoveryStopped');
      logger.info('P2P discovery stopped successfully');
    } catch (error) {
      logger.error('Failed to stop P2P discovery:', error);
      throw error;
    }
  }

  onPeerDiscovered(callback) {
    eventBus.on('peerConnected', callback);
  }

  async sendSecureMessage(message) {
    try {
      const signature = await p2pNode.signMessage(message);
      await p2pNode.publishMessage(JSON.stringify({ message, signature }));
      logger.info('Secure message sent successfully');
    } catch (error) {
      logger.error('Failed to send secure message:', error);
      throw error;
    }
  }

  async receiveSecureMessage(callback) {
    p2pNode.on('message', async (data) => {
      try {
        const { message, signature } = JSON.parse(data);
        const isValid = await p2pNode.verifyMessage(message, signature);
        if (isValid) {
          callback(message);
        } else {
          logger.warn('Received message with invalid signature');
        }
      } catch (error) {
        logger.error('Error processing received message:', error);
      }
    });
  }

  // Method to get connected peers
  getConnectedPeers() {
    return this.natTraversal.getConnectedPeers();
  }

  // Method to check if discovery is ready
  isReady() {
    return this.natTraversal.isReady();
  }
}

export default new Discovery();
