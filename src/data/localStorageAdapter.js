// src/data/localStorageAdapter.js
import { Level } from 'level';

class LocalStorageAdapter {
  constructor() {
    this.db = null;
  }

  async init() {
    if (!this.db) {
      this.db = new Level('./local-storage', { valueEncoding: 'json' });
      await this.db.open();
    }
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async get(key) {
    await this.init();
    try {
      return await this.db.get(key);
    } catch (error) {
      if (error.notFound) return null;
      throw error;
    }
  }

  async set(key, value) {
    await this.init();
    await this.db.put(key, value);
  }
}

export default new LocalStorageAdapter();
