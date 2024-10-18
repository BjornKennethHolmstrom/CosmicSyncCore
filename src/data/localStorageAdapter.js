// src/data/localStorageAdapter.js
import { Level } from 'level';
import { v4 as uuidv4 } from 'uuid';

class LocalStorageAdapter {
  constructor() {
    this.db = null;
    this.dbPath = `./local-storage-${uuidv4()}`;
  }

  async init() {
    if (!this.db) {
      this.db = new Level(this.dbPath, { valueEncoding: 'json' });
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
