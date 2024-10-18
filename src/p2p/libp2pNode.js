import Libp2p from 'libp2p';
import TCP from 'libp2p-tcp';
import Mplex from 'libp2p-mplex';
import { NOISE } from 'libp2p-noise';
import GossipsubModule from 'libp2p-gossipsub';
import Bootstrap from 'libp2p-bootstrap';
import KadDHT from 'libp2p-kad-dht';
import eventBus from '../core/eventBus.js';

class LibP2PNode {
  async createNode() {
    const node = await Libp2p.create({
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0']
      },
      modules: {
        transport: [TCP],
        streamMuxer: [Mplex],
        connEncryption: [NOISE],
        pubsub: GossipsubModule,
        peerDiscovery: [Bootstrap],
        dht: KadDHT
      },
      config: {
        peerDiscovery: {
          bootstrap: {
            list: ['/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ']
          }
        },
        dht: {
          enabled: true,
          randomWalk: {
            enabled: true
          }
        }
      }
    });

    node.on('peer:discovery', (peerId) => {
      eventBus.emit('peerDiscovered', peerId);
    });

    node.connectionManager.on('peer:connect', (connection) => {
      eventBus.emit('peerConnected', connection.remotePeer.toB58String());
    });

    return node;
  }
}

export default new LibP2PNode();
