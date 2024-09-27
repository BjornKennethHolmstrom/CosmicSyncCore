import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { yamux } from '@chainsafe/libp2p-yamux';
import { noise } from '@chainsafe/libp2p-noise';
import { bootstrap } from '@libp2p/bootstrap';
import { kadDHT } from '@libp2p/kad-dht';
import { EventEmitter } from 'events';

class NATTraversal {
  constructor() {
    this.node = null;
    this.eventEmitter = new EventEmitter();
  }

  async createNode() {
    this.node = await createLibp2p({
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0']
      },
      transports: [tcp()],
      streamMuxers: [yamux()],
      connectionEncryption: [noise()],
      peerDiscovery: [
        bootstrap({
          list: [
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
          ]
        })
      ],
      dht: kadDHT(),
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: true
        }
      }
    });

    this.node.addEventListener('peer:connect', (event) => {
      this.eventEmitter.emit('peerConnected', event.detail.remotePeer.toString());
    });

    await this.node.start();
    this.eventEmitter.emit('nodeStarted');
  }

  async stop() {
    if (this.node) {
      await this.node.stop();
      this.eventEmitter.emit('nodeStopped');
    }
  }
}

export default new NATTraversal();
