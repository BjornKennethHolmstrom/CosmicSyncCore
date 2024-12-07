export default {
  testEnvironment: 'node',
  transform: {},  // No transform needed for native ESM
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.teardown.js'],
  testTimeout: 10000,
  transformIgnorePatterns: [],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'json', 'node'],
  testEnvironmentOptions: {
    url: "http://localhost"
  },
  resolver: undefined,
  moduleDirectories: ['node_modules']
};
