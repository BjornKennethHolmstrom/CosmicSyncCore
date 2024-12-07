// src/p2p/natTraversal.js
import { createLibp2p } from 'libp2p'
import { TCP } from '@libp2p/tcp'
import { Mplex } from '@libp2p/mplex'
import { Noise } from '@libp2p/noise'
import { Bootstrap } from '@libp2p/bootstrap'
import { EventEmitter } from 'events'
import logger from '../core/logger.js'

class NATTraversal {
  constructor() {
    this.node = null;
    this.eventEmitter = new EventEmitter();
  }

  async createNode() {
    try {
      const node = await createLibp2p({
        modules: {
          transport: [TCP],
          streamMuxer: [Mplex],
          connEncryption: [Noise],
          peerDiscovery: [Bootstrap]
        },
        config: {
          transport: {
            TCP: {
              listenerOptions: {
                ip: '0.0.0.0',
                port: 0
              }
            }
          },
          peerDiscovery: {
            bootstrap: {
              list: [
                '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
                '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa'
              ]
            }
          }
        }
      });

      await node.start();
      this.node = node;

      this.node.connectionManager.on('peer:connect', (connection) => {
        const peerInfo = connection.remotePeer.toB58String();
        logger.info('Connected to peer:', peerInfo);
        this.eventEmitter.emit('peerConnected', peerInfo);
      });

      logger.info('NAT traversal node started');
      this.eventEmitter.emit('nodeStarted');
    } catch (error) {
      logger.error('Failed to start NAT traversal node:', error);
      throw error;
    }
  }

  async stop() {
    if (this.node) {
      try {
        await this.node.stop();
        this.node = null;
        logger.info('NAT traversal node stopped');
        this.eventEmitter.emit('nodeStopped');
      } catch (error) {
        logger.error('Error stopping NAT traversal node:', error);
        throw error;
      }
    }
  }

  isStarted() {
    return this.node !== null;
  }

  on(event, listener) {
    this.eventEmitter.on(event, listener);
  }

  off(event, listener) {
    this.eventEmitter.off(event, listener);
  }
}

export default new NATTraversal();
