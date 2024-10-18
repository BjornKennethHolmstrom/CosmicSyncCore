// src/config.js
export default {
  databasePath: process.env.NODE_ENV === 'test' ? ':memory:' : './production.db'
};
