const { Pool } = require('pg');
const config = require('config');

class DatabaseManager {
  constructor(config, eventBus) {
    this.eventBus = eventBus;
    this.pool = new Pool(config.get('database'));
    this.eventBus.emit('database:initialized');
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      this.eventBus.emit('database:queryExecuted', { duration, rows: res.rowCount });
      return res;
    } catch (error) {
      this.eventBus.emit('error:database', error);
      throw error;
    }
  }

  async addMessage(message, userId) {
    const text = 'INSERT INTO messages(content, user_id) VALUES($1, $2) RETURNING *';
    const values = [message, userId];
    try {
      const res = await this.query(text, values);
      this.eventBus.emit('database:messageAdded', res.rows[0]);
      return res.rows[0];
    } catch (error) {
      this.eventBus.emit('error:database', error);
      throw error;
    }
  }

  async getRecentMessages(limit = 100) {
    const text = 'SELECT * FROM messages ORDER BY created_at DESC LIMIT $1';
    const values = [limit];
    try {
      const res = await this.query(text, values);
      this.eventBus.emit('database:recentMessagesRetrieved', { count: res.rows.length });
      return res.rows;
    } catch (error) {
      this.eventBus.emit('error:database', error);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
    this.eventBus.emit('database:closed');
  }
}

module.exports = DatabaseManager;
