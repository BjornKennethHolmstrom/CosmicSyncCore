import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { initializeTables } from './schema.js';

class DatabaseManager {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }

  async initializeTables() {
    await initializeTables(this);
  }

  async initialize() {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });
  }

  async close() {
    if (this.db) {
      await this.db.close();
    }
  }

  async create(table, record) {
    const timestamp = Date.now();
    record.timestamp = timestamp;
    const columns = Object.keys(record).join(', ');
    const placeholders = Object.keys(record).map(() => '?').join(', ');
    const values = Object.values(record);

    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    await this.db.run(query, values);
  }

  async read(table, id) {
    const query = `SELECT * FROM ${table} WHERE id = ?`;
    const result = await this.db.get(query, [id]);
    return result || null;
  }

  async update(table, id, record) {
    const existingRecord = await this.read(table, id);
    if (!existingRecord) {
      return this.create(table, record);
    }

    record.timestamp = Date.now();
    const setClause = Object.keys(record).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(record), id];

    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    await this.db.run(query, values);
  }

  async getChanges(table, since) {
    const query = `SELECT * FROM ${table} WHERE timestamp > ?`;
    return await this.db.all(query, [since]);
  }

  async deleteAll(table) {
    const query = `DELETE FROM ${table}`;
    await this.db.run(query);
  }

  async delete(table, id) {
    const query = `DELETE FROM ${table} WHERE id = ?`;
    await this.db.run(query, [id]);
  }

  async getLastSyncTimestamp(peerId) {
    const query = `SELECT last_sync_timestamp FROM sync_metadata WHERE peer_id = ?`;
    const result = await this.db.get(query, [peerId]);
    return result ? result.last_sync_timestamp : 0;
  }

  async updateLastSyncTimestamp(peerId, timestamp) {
    const query = `INSERT OR REPLACE INTO sync_metadata (peer_id, last_sync_timestamp) VALUES (?, ?)`;
    await this.db.run(query, [peerId, timestamp]);
  }

  async list(table) {
    const query = `SELECT * FROM ${table}`;
    return await this.db.all(query);
  }

  // Helper method to create tables if they don't exist
  async createTableIfNotExists(table, schema) {
    const query = `CREATE TABLE IF NOT EXISTS ${table} (${schema})`;
    await this.db.run(query);
  }
}

export default DatabaseManager;
