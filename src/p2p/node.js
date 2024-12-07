// src/p2p/node.js
import { createLibp2p } from 'libp2p'
import { TCP } from '@libp2p/tcp'
import { Mplex } from '@libp2p/mplex'
import { Noise } from '@libp2p/noise'
import { Bootstrap } from '@libp2p/bootstrap'
import EventEmitter from 'events'
import logger from '../core/logger.js'
import cryptoManager from '../core/cryptoManager.js'

class P2PNode extends EventEmitter {
  constructor() {
    super();
    this.node = null;
    this.keyId = 'p2p_communication_key';
  }

  async start() {
    try {
      // Ensure we have an encryption key
      const hasKey = await cryptoManager.hasKey(this.keyId);
      if (!hasKey) {
        const key = await cryptoManager.generateKey();
        await cryptoManager.storeKey(this.keyId, key);
      }

      this.node = await createLibp2p({
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

      await this.node.start();
      logger.info('P2P node started');

      this.node.connectionManager.on('peer:connect', (connection) => {
        const peerInfo = connection.remotePeer.toB58String();
        logger.info('Connected to peer:', peerInfo);
        this.emit('peerConnected', peerInfo);
      });

    } catch (error) {
      logger.error('Failed to start P2P node:', error);
      throw error;
    }
  }

  async stop() {
    if (this.node) {
      try {
        await this.node.stop();
        this.node = null;
        logger.info('P2P node stopped');
      } catch (error) {
        logger.error('Error stopping P2P node:', error);
        throw error;
      }
    }
  }

  async sendMessage(peerId, message) {
    try {
      const connection = await this.node.dial(peerId);
      const stream = await connection.newStream('/chat/1.0.0');
      await stream.sink([message]);
      logger.info('Message sent successfully');
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  getConnectedPeers() {
    return this.node ? Array.from(this.node.connectionManager.connections.keys()) : [];
  }

  isStarted() {
    return this.node !== null;
  }
}

export default new P2PNode();
