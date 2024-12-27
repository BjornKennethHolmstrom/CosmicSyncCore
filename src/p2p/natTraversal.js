// src/p2p/natTraversal.js
import { createLibp2p } from 'libp2p';
import { WebRTCStar } from '@libp2p/webrtc-star';
import { TCP } from '@libp2p/tcp';
import { Mplex } from '@libp2p/mplex';
import { Noise } from '@libp2p/noise';
import { Bootstrap } from '@libp2p/bootstrap';
import { EventEmitter } from 'events';
import logger from '../core/logger.js';

const RETRY_DELAYS = [1000, 2000, 5000, 10000]; // Progressive retry delays in ms
const MAX_RETRIES = 3;

class NATTraversal {
  constructor() {
    this.node = null;
    this.eventEmitter = new EventEmitter();
    this.connectionStates = new Map(); // Track connection states for each peer
    this.retryAttempts = new Map(); // Track retry attempts for each peer
    
    // STUN/TURN configuration
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:your-turn-server.com:3478',
        username: process.env.TURN_USERNAME,
        credential: process.env.TURN_PASSWORD
      }
    ];
  }

  async createNode() {
    try {
      // Create WebRTC transport with STUN/TURN configuration
      const webRtcStar = new WebRTCStar({
        upgrader: {
          upgradeInbound: true,
          upgradeOutbound: true
        },
        rtcConfiguration: {
          iceServers: this.iceServers
        }
      });

      const node = await createLibp2p({
        addresses: {
          listen: [
            '/ip4/0.0.0.0/tcp/0',
            '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
          ]
        },
        modules: {
          transport: [TCP, webRtcStar],
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

      // Set up connection handling
      this.setupConnectionHandlers();

      logger.info('NAT traversal node started');
      this.eventEmitter.emit('nodeStarted');
      
      // Start monitoring connection states
      this.startConnectionMonitoring();

    } catch (error) {
      logger.error('Failed to start NAT traversal node:', error);
      throw error;
    }
  }

  setupConnectionHandlers() {
    this.node.connectionManager.on('peer:connect', (connection) => {
      const peerId = connection.remotePeer.toB58String();
      this.handlePeerConnect(peerId, connection);
    });

    this.node.connectionManager.on('peer:disconnect', (connection) => {
      const peerId = connection.remotePeer.toB58String();
      this.handlePeerDisconnect(peerId);
    });
  }

  async handlePeerConnect(peerId, connection) {
    try {
      this.connectionStates.set(peerId, 'connected');
      this.retryAttempts.delete(peerId); // Reset retry attempts on successful connection
      
      logger.info('Connected to peer:', peerId);
      this.eventEmitter.emit('peerConnected', {
        peerId,
        connectionType: connection.remoteAddr.toString().includes('webrtc') ? 'WebRTC' : 'TCP'
      });

    } catch (error) {
      logger.error(`Error handling peer connection for ${peerId}:`, error);
      this.handleConnectionError(peerId, error);
    }
  }

  async handlePeerDisconnect(peerId) {
    try {
      this.connectionStates.set(peerId, 'disconnected');
      logger.info('Disconnected from peer:', peerId);
      this.eventEmitter.emit('peerDisconnected', peerId);

      // Attempt reconnection if appropriate
      await this.attemptReconnection(peerId);

    } catch (error) {
      logger.error(`Error handling peer disconnection for ${peerId}:`, error);
    }
  }

  async attemptReconnection(peerId) {
    const retryCount = this.retryAttempts.get(peerId) || 0;
    
    if (retryCount >= MAX_RETRIES) {
      logger.warn(`Max retry attempts reached for peer ${peerId}`);
      this.eventEmitter.emit('peerRetryFailed', peerId);
      return;
    }

    this.retryAttempts.set(peerId, retryCount + 1);
    const delay = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)];

    logger.info(`Attempting reconnection to ${peerId} in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);

    setTimeout(async () => {
      try {
        if (this.connectionStates.get(peerId) === 'disconnected') {
          await this.node.dial(peerId);
        }
      } catch (error) {
        logger.error(`Reconnection attempt failed for ${peerId}:`, error);
        await this.attemptReconnection(peerId);
      }
    }, delay);
  }

  startConnectionMonitoring() {
    setInterval(() => {
      for (const [peerId, state] of this.connectionStates) {
        if (state === 'connected') {
          this.checkPeerConnection(peerId);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  async checkPeerConnection(peerId) {
    try {
      const connection = this.node.connectionManager.get(peerId);
      if (!connection || !connection.streams.length) {
        logger.warn(`Dead connection detected for peer ${peerId}`);
        this.handlePeerDisconnect(peerId);
      }
    } catch (error) {
      logger.error(`Error checking connection for peer ${peerId}:`, error);
    }
  }

  handleConnectionError(peerId, error) {
    logger.error(`Connection error with peer ${peerId}:`, error);
    this.eventEmitter.emit('peerError', { peerId, error });
    
    // Update connection state
    this.connectionStates.set(peerId, 'error');
    
    // Attempt reconnection if appropriate
    if (!error.permanent) {
      this.attemptReconnection(peerId);
    }
  }

  async stop() {
    if (this.node) {
      try {
        // Clean up all active connections
        for (const [peerId, state] of this.connectionStates) {
          if (state === 'connected') {
            try {
              await this.node.hangUp(peerId);
            } catch (error) {
              logger.warn(`Error disconnecting from peer ${peerId}:`, error);
            }
          }
        }

        await this.node.stop();
        this.node = null;
        this.connectionStates.clear();
        this.retryAttempts.clear();
        
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

  getActiveConnections() {
    return Array.from(this.connectionStates.entries())
      .filter(([_, state]) => state === 'connected')
      .map(([peerId]) => peerId);
  }

  on(event, listener) {
    this.eventEmitter.on(event, listener);
  }

  off(event, listener) {
    this.eventEmitter.off(event, listener);
  }
}

export default new NATTraversal();
