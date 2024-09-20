const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Mplex = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const Gossipsub = require('libp2p-gossipsub')
const Bootstrap = require('libp2p-bootstrap')
const EventEmitter = require('../core/eventEmitter')

class P2PNode extends EventEmitter {
  constructor() {
    super()
    this.node = null
    this.topic = 'cosmicsynccore'
  }

  async start() {
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
    this.node.pubsub.on(this.topic, (message) => {
      console.log(`Received message: ${message.data.toString()}`)
      this.emit('message', message.data.toString())
    })

    this.node.connectionManager.on('peer:connect', (connection) => {
      console.log(`Connected to: ${connection.remotePeer.toB58String()}`)
    })
  }

  async publishMessage(message) {
    await this.node.pubsub.publish(this.topic, Buffer.from(message))
    console.log(`Published message: ${message}`)
  }

  async stop() {
    await this.node.stop()
    console.log('P2P node stopped')
  }
}

module.exports = P2PNode
