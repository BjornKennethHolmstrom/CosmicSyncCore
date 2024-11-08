// jest.teardown.js
import { jest } from '@jest/globals';

beforeAll(() => {
  // Reset mocks before each test suite
  jest.clearAllMocks();
});

afterEach(() => {
  // Clear any timers after each test
  jest.clearAllTimers();
});

afterAll(async () => {
  // Cleanup resources
  const cleanup = async () => {
    try {
      // Add specific cleanup tasks here
      jest.useRealTimers();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  await cleanup();
});
