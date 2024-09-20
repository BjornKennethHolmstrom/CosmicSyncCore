const { Pool } = require('pg')
const config = require('config');
const EventEmitter = require('../core/eventEmitter')

class DatabaseManager extends EventEmitter {
  constructor(config) {
    super()
    this.pool = new Pool(config.get('database'));
  }

  async query(text, params) {
    const start = Date.now()
    try {
      const res = await this.pool.query(text, params)
      const duration = Date.now() - start
      console.log('Executed query', { text, duration, rows: res.rowCount })
      return res
    } catch (error) {
      console.error('Error executing query', { text, error })
      this.emit('error', error)
      throw error
    }
  }

  async addMessage(message, userId) {
    const text = 'INSERT INTO messages(content, user_id) VALUES($1, $2) RETURNING *'
    const values = [message, userId]
    try {
      const res = await this.query(text, values)
      this.emit('messageAdded', res.rows[0])
      return res.rows[0]
    } catch (error) {
      console.error('Error adding message', error)
      throw error
    }
  }

  async getRecentMessages(limit = 100) {
    const text = 'SELECT * FROM messages ORDER BY created_at DESC LIMIT $1'
    const values = [limit]
    try {
      const res = await this.query(text, values)
      return res.rows
    } catch (error) {
      console.error('Error getting recent messages', error)
      throw error
    }
  }

  async close() {
    await this.pool.end()
    console.log('Database connection closed')
  }
}

module.exports = DatabaseManager
