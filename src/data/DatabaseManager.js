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
    const { _deleted, ...recordWithoutDeleted } = record;
    const timestamp = record.timestamp || Date.now();
    const finalRecord = { ...recordWithoutDeleted, timestamp };
    
    const columns = Object.keys(finalRecord).join(', ');
    const placeholders = Object.keys(finalRecord).map(() => '?').join(', ');
    const values = Object.values(finalRecord);

    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    await this.db.run(query, values);
  }

  async read(table, id) {
    const query = `SELECT * FROM ${table} WHERE id = ? AND (_deleted IS NULL OR _deleted = 0)`;
    const result = await this.db.get(query, [id]);
    return result || null;
  }

  async update(table, id, record) {
    const { _deleted, ...recordWithoutDeleted } = record;
    const timestamp = record.timestamp || Date.now();
    const finalRecord = { ...recordWithoutDeleted, timestamp };
    
    const setClause = Object.keys(finalRecord).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(finalRecord), id];

    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    await this.db.run(query, values);
  }

  async getChanges(table, since) {
    // Include deleted records in changes
    const query = `SELECT * FROM ${table} WHERE timestamp > ?`;
    return await this.db.all(query, [since]);
  }

  async deleteAll(table) {
    const query = `DELETE FROM ${table}`;
    await this.db.run(query);
  }

  async delete(table, id) {
    const timestamp = Date.now();
    const query = `UPDATE ${table} SET _deleted = 1, timestamp = ? WHERE id = ?`;
    await this.db.run(query, [timestamp, id]);
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
    const query = `SELECT * FROM ${table} WHERE _deleted IS NULL OR _deleted = 0`;
    return await this.db.all(query);
  }

  // Helper method to create tables if they don't exist
  async createTableIfNotExists(table, schema) {
    const query = `CREATE TABLE IF NOT EXISTS ${table} (${schema})`;
    await this.db.run(query);
  }

  async applyChanges(changes) {
    for (const [table, tableChanges] of Object.entries(changes)) {
      for (const record of tableChanges) {
        const existingRecord = await this.read(table, record.id);
        
        if (record._deleted) {
          // If record is marked as deleted and is newer, delete it
          if (!existingRecord || record.timestamp > (existingRecord.timestamp || 0)) {
            await this.delete(table, record.id);
          }
          continue;
        }

        // Handle regular records
        if (!existingRecord || record.timestamp > (existingRecord.timestamp || 0)) {
          if (existingRecord) {
            await this.update(table, record.id, record);
          } else {
            await this.create(table, record);
          }
        }
      }
    }
  }
}

export default DatabaseManager;
