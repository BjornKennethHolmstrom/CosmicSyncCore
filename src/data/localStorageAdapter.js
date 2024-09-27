import { Level } from 'level';

class LocalStorageAdapter {
  constructor() {
    this.db = new Level('./local-storage', { valueEncoding: 'json' });
  }

  async get(key) {
    try {
      return await this.db.get(key);
    } catch (error) {
      if (error.notFound) return null;
      throw error;
    }
  }

  async set(key, value) {
    await this.db.put(key, value);
  }
}

export default new LocalStorageAdapter();

