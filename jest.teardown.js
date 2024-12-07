import { jest } from '@jest/globals';

let dbManager;

beforeAll(async () => {
  // Reset mocks before each test suite
  jest.clearAllMocks();
});

beforeEach(async () => {
  // Reset timers before each test
  jest.useFakeTimers();
});

afterEach(async () => {
  // Clear any timers after each test
  jest.clearAllTimers();
  
  // Clean up database connections
  if (dbManager) {
    await dbManager.close();
    dbManager = null;
  }
});

afterAll(async () => {
  // Cleanup resources
  await new Promise(resolve => setTimeout(resolve, 500)); // Allow any pending operations to complete
  jest.useRealTimers();
});

// Export for use in tests
export function setDbManager(manager) {
  dbManager = manager;
}
