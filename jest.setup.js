// jest.setup.js
import { TextEncoder, TextDecoder } from 'util';
import { jest } from '@jest/globals';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.jest = jest;

// Mock timers
jest.useFakeTimers();

// Setup global test environment
global.testSetup = {
  timeout: 5000,
  testPort: 3001,
  testDbPath: ':memory:'
};
