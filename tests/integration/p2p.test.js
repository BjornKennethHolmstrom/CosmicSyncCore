import discovery from '../../src/p2p/discovery.js';
import eventBus from '../../src/core/eventBus.js';

describe('P2P Network', () => {
  beforeAll(async () => {
    await discovery.start();
  });

  afterAll(async () => {
    await discovery.stop();
  });

  test('Node should start and emit event', (done) => {
    eventBus.on('nodeStarted', () => {
      done();
    });
  });

  test('Should discover and connect to peers', (done) => {
    let peerCount = 0;
    discovery.onPeerDiscovered(() => {
      peerCount++;
      if (peerCount >= 2) {  // Assuming we want to connect to at least 2 peers
        done();
      }
    });
  }, 30000);  // Increase timeout for peer discovery
});
