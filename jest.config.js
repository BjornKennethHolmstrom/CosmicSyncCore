// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?js$': 'babel-jest',
  },
  globalTeardown: './jest.teardown.js',
  moduleFileExtensions: ['js', ,'mjs'],
  testMatch: ['**/tests/**/*.js', '**/?(*.)+(spec|test).js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^libp2p-gossipsub$': '<rootDir>/__mocks__/libp2p-gossipsub.mjs'
  },
  testPathIgnorePatterns: ['/node_modules/','helpers'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['./jest.setup.js'],
  injectGlobals: true, // Add this line
};
