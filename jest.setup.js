import { TextEncoder, TextDecoder } from 'util';
import { jest } from '@jest/globals';

// Add missing globals
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.jest = jest;
global.describe = jest.describe;
global.beforeAll = jest.beforeAll;
global.afterAll = jest.afterAll;
global.beforeEach = jest.beforeEach;
global.afterEach = jest.afterEach;
global.it = jest.it;
global.expect = jest.expect;

// Mock crypto
import { webcrypto } from 'crypto';
global.crypto = webcrypto;

// Setup global test environment
global.testSetup = {
  timeout: 5000,
  testPort: 3001,
  testDbPath: ':memory:'
};

// Mock timers
jest.useFakeTimers();
