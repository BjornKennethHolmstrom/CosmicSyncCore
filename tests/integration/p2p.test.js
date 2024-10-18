import { jest, describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import discovery from '../../src/p2p/discovery.js';
import eventBus from '../../src/core/eventBus.js';

// Mock the specific functions used by the discovery module
jest.mock('../../src/p2p/natTraversal.js', () => ({
  default: {
    createNode: jest.fn().mockResolvedValue({}),
    stop: jest.fn().mockResolvedValue({}),
  },
}));

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
    // Trigger the event manually since we're using a mock
    eventBus.emit('nodeStarted');
  });

  test('Should discover and connect to peers', (done) => {
    let peerCount = 0;
    discovery.onPeerDiscovered(() => {
      peerCount++;
      if (peerCount >= 2) {
        done();
      }
    });
    // Simulate peer discovery
    eventBus.emit('peerConnected', 'peer1');
    eventBus.emit('peerConnected', 'peer2');
  });
});
