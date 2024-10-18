import { jest } from '@jest/globals';

const libp2pMock = {
  createLibp2p: jest.fn().mockResolvedValue({
    start: jest.fn().mockResolvedValue(),
    stop: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    pubsub: {
      subscribe: jest.fn(),
      publish: jest.fn().mockResolvedValue(),
    },
    connectionManager: {
      on: jest.fn(),
    },
  }),
};

export default libp2pMock;
