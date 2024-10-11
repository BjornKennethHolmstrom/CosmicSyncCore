// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: [],
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
