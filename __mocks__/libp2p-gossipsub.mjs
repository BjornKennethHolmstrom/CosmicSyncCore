const GossipSub = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  emit: jest.fn(),
  // Add any other methods you're using in your tests
}));

export { GossipSub };
