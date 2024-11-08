// src/data/DatabaseManager.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { initializeTables, initializeTranslationTables } from './schema.js';
import { BadRequestError, NotFoundError } from '../core/errors.js';
import logger from '../core/logger.js';
import eventBus from '../core/eventBus.js';

class DatabaseManager {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }

  async initialize() {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });
    
    // Enable foreign key support
    await this.db.run('PRAGMA foreign_keys = ON');
    
    // Initialize tables
    await initializeTables(this);
    await initializeTranslationTables(this);
    
    logger.info('Database initialized successfully');
  }

  async initializeTables() {
    await initializeTables(this);
  }

  // User Management Methods

  async createUser(userData) {
    const {
      id,
      email,
      username,
      password,
      preferences = {},
      timestamp = Date.now()
    } = userData;

    try {
      // Check for existing user
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new BadRequestError('Email already registered');
      }

      const query = `
        INSERT INTO users (
          id, email, username, password, preferences,
          createdAt, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.run(query, [
        id,
        email.toLowerCase(),
        username,
        password,
        JSON.stringify(preferences),
        timestamp,
        timestamp
      ]);

      eventBus.emit('userCreated', { userId: id, timestamp });
      return id;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new BadRequestError('Username or email already exists');
      }
      throw error;
    }
  }

  async getUserById(userId) {
    const query = `
      SELECT id, email, username, createdAt, status, 
             verifiedAt, preferences, timestamp
      FROM users 
      WHERE id = ? AND (_deleted IS NULL OR _deleted = 0)
    `;
    
    const user = await this.db.get(query, [userId]);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.preferences = JSON.parse(user.preferences || '{}');
    return user;
  }

  async getUserByEmail(email) {
    const query = `
      SELECT id, email, username, password, status, 
             failedLoginAttempts, lastFailedLoginAt
      FROM users 
      WHERE LOWER(email) = LOWER(?) AND (_deleted IS NULL OR _deleted = 0)
    `;
    
    return await this.db.get(query, [email]);
  }

  async updateUser(userId, updates) {
    const allowedUpdates = [
      'username',
      'password',
      'status',
      'preferences',
      'verifiedAt',
      'failedLoginAttempts',
      'lastFailedLoginAt'
    ];

    const updateFields = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .map(key => {
        if (key === 'preferences') {
          updates[key] = JSON.stringify(updates[key]);
        }
        return `${key} = ?`;
      });

    if (updateFields.length === 0) {
      throw new BadRequestError('No valid update fields provided');
    }

    const timestamp = Date.now();
    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}, timestamp = ? 
      WHERE id = ? AND (_deleted IS NULL OR _deleted = 0)
    `;

    const values = [
      ...updateFields.map(field => updates[field.split(' ')[0]]),
      timestamp,
      userId
    ];

    const result = await this.db.run(query, values);
    if (result.changes === 0) {
      throw new NotFoundError('User not found');
    }

    eventBus.emit('userUpdated', { userId, timestamp });
    return { userId, timestamp };
  }

  // Session Management Methods

  async createSession(sessionData) {
    const {
      id,
      userId,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
      timestamp = Date.now()
    } = sessionData;

    const query = `
      INSERT INTO user_sessions (
        id, userId, refreshToken, ipAddress, userAgent,
        createdAt, expiresAt, lastUsedAt, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      id,
      userId,
      refreshToken,
      ipAddress,
      userAgent,
      timestamp,
      expiresAt,
      timestamp,
      timestamp
    ]);

    eventBus.emit('sessionCreated', { sessionId: id, userId, timestamp });
    return id;
  }

  async updateSessionUsage(sessionId) {
    const timestamp = Date.now();
    const query = `
      UPDATE user_sessions 
      SET lastUsedAt = ?, timestamp = ? 
      WHERE id = ? AND isValid = 1
    `;

    const result = await this.db.run(query, [timestamp, timestamp, sessionId]);
    return result.changes > 0;
  }

  async invalidateSession(sessionId, reason = 'logout') {
    const timestamp = Date.now();
    const query = `
      UPDATE user_sessions 
      SET isValid = 0, timestamp = ? 
      WHERE id = ?
    `;

    const result = await this.db.run(query, [timestamp, sessionId]);
    if (result.changes > 0) {
      eventBus.emit('sessionInvalidated', { sessionId, reason, timestamp });
    }
    return result.changes > 0;
  }

  // Auth Logging Methods

  async logAuthEvent(eventData) {
    const {
      userId,
      eventType,
      ipAddress,
      userAgent,
      details = {},
      timestamp = Date.now()
    } = eventData;

    const query = `
      INSERT INTO auth_logs (
        id, userId, eventType, ipAddress, userAgent,
        details, createdAt, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const id = crypto.randomUUID();
    await this.db.run(query, [
      id,
      userId,
      eventType,
      ipAddress,
      userAgent,
      JSON.stringify(details),
      timestamp,
      timestamp
    ]);

    return id;
  }

  // Token Management Methods

  async addInvalidatedToken(tokenData) {
    const {
      token,
      userId,
      reason = 'logout',
      expiresAt,
      timestamp = Date.now()
    } = tokenData;

    const query = `
      INSERT INTO invalidated_tokens (
        token, userId, reason, invalidatedAt, expiresAt, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      token,
      userId,
      reason,
      timestamp,
      expiresAt,
      timestamp
    ]);
  }

  async isTokenInvalidated(token) {
    const query = `
      SELECT 1 FROM invalidated_tokens 
      WHERE token = ? AND expiresAt > ?
    `;
    
    const result = await this.db.get(query, [token, Date.now()]);
    return !!result;
  }

  // Cleanup Methods

  async cleanupExpiredSessions() {
    const timestamp = Date.now();
    const query = `
      UPDATE user_sessions 
      SET isValid = 0, timestamp = ? 
      WHERE expiresAt < ? AND isValid = 1
    `;

    const result = await this.db.run(query, [timestamp, timestamp]);
    if (result.changes > 0) {
      logger.info(`Cleaned up ${result.changes} expired sessions`);
      eventBus.emit('sessionsCleanup', { count: result.changes, timestamp });
    }
  }

  async cleanupExpiredTokens() {
    const timestamp = Date.now();
    const query = `DELETE FROM invalidated_tokens WHERE expiresAt < ?`;
    
    const result = await this.db.run(query, [timestamp]);
    if (result.changes > 0) {
      logger.info(`Cleaned up ${result.changes} expired tokens`);
      eventBus.emit('tokensCleanup', { count: result.changes, timestamp });
    }
  }

  async getSessionByRefreshToken(refreshToken) {
    const query = `
      SELECT * FROM user_sessions 
      WHERE refreshToken = ? 
      AND isValid = 1 
      AND expiresAt > ?
      AND (_deleted IS NULL OR _deleted = 0)
    `;
    
    const session = await this.db.get(query, [refreshToken, Date.now()]);
    return session;
  }

  async getSessionsByUserId(userId) {
    const query = `
      SELECT * FROM user_sessions 
      WHERE userId = ? 
      AND isValid = 1 
      AND expiresAt > ?
      AND (_deleted IS NULL OR _deleted = 0)
      ORDER BY createdAt DESC
    `;
    
    return await this.db.all(query, [userId, Date.now()]);
  }

  async invalidateUserSessions(userId, exceptSessionId = null) {
    const timestamp = Date.now();
    let query = `
      UPDATE user_sessions 
      SET isValid = 0, timestamp = ? 
      WHERE userId = ? AND isValid = 1
    `;
    
    const params = [timestamp, userId];
    
    if (exceptSessionId) {
      query += ` AND id != ?`;
      params.push(exceptSessionId);
    }
    
    const result = await this.db.run(query, params);
    if (result.changes > 0) {
      eventBus.emit('sessionsInvalidated', {
        userId,
        count: result.changes,
        timestamp
      });
    }
    return result.changes;
  }

  async cleanupInvalidatedTokens() {
    const timestamp = Date.now();
    const query = `
      DELETE FROM invalidated_tokens 
      WHERE expiresAt < ?
    `;
    
    const result = await this.db.run(query, [timestamp]);
    if (result.changes > 0) {
      logger.info(`Cleaned up ${result.changes} invalidated tokens`);
      eventBus.emit('tokensCleanup', { count: result.changes, timestamp });
    }
    return result.changes;
  }

  async checkPasswordResetToken(token) {
    const query = `
      SELECT id, email FROM users 
      WHERE passwordResetToken = ? 
      AND passwordResetExpiresAt > ?
      AND (_deleted IS NULL OR _deleted = 0)
    `;
    
    const user = await this.db.get(query, [token, Date.now()]);
    return user;
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
    const timestamp = record.timestamp || Date.now();
    const finalRecord = { ...record, timestamp };
    const setClause = Object.keys(finalRecord)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(finalRecord), id];
    
    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    await this.db.run(query, values);
  }

  async getChanges(table, since) {
    // Get all changes including deletions
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
