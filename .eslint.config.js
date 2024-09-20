const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      // Add any custom rules here
    },
    ignores: [
      '**/node_modules/**',
      '**/venv/**',
      '**/docs/**',
    ],
  },
  {
    files: ['**/*.js'],
    rules: {
      'prettier/prettier': 'error',
    },
    plugins: ['prettier'],
  },
];
