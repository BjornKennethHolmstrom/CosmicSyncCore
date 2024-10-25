// jest.setup.js
import { setMaxListeners } from 'events';
setMaxListeners(20);

beforeAll(() => {
  // Any global setup
});

afterAll(async () => {
  // Clean up any remaining connections
  await new Promise(resolve => setTimeout(resolve, 500));
});
