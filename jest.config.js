// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: [],
  moduleFileExtensions: ['js'],
  testMatch: ['**/tests/**/*.js', '**/?(*.)+(spec|test).js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '__mocks__'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['./jest.setup.js'],
  injectGlobals: true, // Add this line
};
