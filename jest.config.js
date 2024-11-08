// jest.config.js

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  // Remove extensionsToTreatAsEsm since .js is already treated as ESM
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.teardown.js'],
  testTimeout: 10000,
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-transform)/)'
  ],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'json', 'node'],
  // Add these for better ES Module support
  resolver: undefined,
  moduleDirectories: ['node_modules']
};
