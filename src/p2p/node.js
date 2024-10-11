import Libp2p from 'libp2p';
import TCP from 'libp2p-tcp';
import Mplex from 'libp2p-mplex';
import { NOISE } from 'libp2p-noise';
import Gossipsub from 'libp2p-gossipsub';
import Bootstrap from 'libp2p-bootstrap';
import EventEmitter from '../core/eventEmitter.js';
import cryptoManager from '../core/cryptoManager.js';

class P2PNode extends EventEmitter {
  constructor() {
    super()
    this.node = null
    this.topic = 'cosmicsynccore'
    this.keyId = 'p2p_communication_key' // We'll use a single key for simplicity
  }

  async start() {
    // Generate and store a key for P2P communication if it doesn't exist
    if (!(await cryptoManager.getKey(this.keyId))) {
      const key = await cryptoManager.generateKey();
      await cryptoManager.storeKey(this.keyId, key);
    }

    this.node = await Libp2p.create({
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0']
      },
      modules: {
        transport: [TCP],
        streamMuxer: [Mplex],
        connEncryption: [NOISE],
        pubsub: Gossipsub,
        peerDiscovery: [Bootstrap]
      },
      config: {
        pubsub: {
          enabled: true,
          emitSelf: false
        },
        peerDiscovery: {
          bootstrap: {
            list: [
              // Add bootstrap nodes here
            ]
          }
        }
      }
    })

    await this.node.start()
    console.log('P2P node started')

    this.node.pubsub.subscribe(this.topic)
    this.node.pubsub.on(this.topic, async (message) => {
      const decryptedMessage = await this.decryptMessage(message.data.toString());
      console.log(`Received message: ${decryptedMessage}`)
      this.emit('message', decryptedMessage)
    })

    this.node.connectionManager.on('peer:connect', (connection) => {
      console.log(`Connected to: ${connection.remotePeer.toB58String()}`)
    })
  }

  async publishMessage(message) {
    const encryptedMessage = await this.encryptMessage(message);
    await this.node.pubsub.publish(this.topic, Buffer.from(encryptedMessage))
    console.log(`Published encrypted message`)
  }

  async encryptMessage(message) {
    const { iv, encryptedData, authTag } = await cryptoManager.encrypt(message, this.keyId);
    return JSON.stringify({ iv, encryptedData, authTag });
  }

  async decryptMessage(encryptedMessage) {
    const { iv, encryptedData, authTag } = JSON.parse(encryptedMessage);
    return await cryptoManager.decrypt(encryptedData, this.keyId, iv, authTag);
  }

  async signMessage(message) {
    return await cryptoManager.sign(message, this.keyId);
  }

  async verifyMessage(message, signature) {
    return await cryptoManager.verify(message, signature, this.keyId);
  }

  async stop() {
    await this.node.stop()
    console.log('P2P node stopped')
  }
}

export default new P2PNode();
