// scripts/setupDatabase.js
import pkg from 'pg';
const { Client } = pkg;
import { config } from 'dotenv';
import logger from '../src/core/logger.js';
import { SCHEMA } from '../src/data/schema.js';

config(); // Load environment variables

const defaultConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cosmicsynccore',
  user: process.env.DB_USER || 'cosmicsynccore',
  password: process.env.DB_PASSWORD,
};

async function setupDatabase(config = defaultConfig) {
  const client = new Client(config);
  
  try {
    await client.connect();
    logger.info('Connected to PostgreSQL database');

    // Create tables
    for (const [tableName, schema] of Object.entries(SCHEMA)) {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          ${schema}
        );
      `;
      
      try {
        await client.query(createTableQuery);
        logger.info(`Created table: ${tableName}`);
      } catch (error) {
        logger.error(`Error creating table ${tableName}:`, error);
        throw error;
      }
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_userId ON user_sessions(userId)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_refreshToken ON user_sessions(refreshToken)',
      'CREATE INDEX IF NOT EXISTS idx_auth_logs_userId ON auth_logs(userId)',
      'CREATE INDEX IF NOT EXISTS idx_auth_logs_createdAt ON auth_logs(createdAt)',
      'CREATE INDEX IF NOT EXISTS idx_invalidated_tokens_userId ON invalidated_tokens(userId)',
      'CREATE INDEX IF NOT EXISTS idx_invalidated_tokens_expiresAt ON invalidated_tokens(expiresAt)'
    ];

    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
        logger.info(`Created index: ${indexQuery}`);
      } catch (error) {
        logger.error(`Error creating index:`, error);
        throw error;
      }
    }

    logger.info('Database setup completed successfully');

  } catch (error) {
    logger.error('Database setup failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Add a function to drop all tables (useful for testing)
async function dropAllTables(config = defaultConfig) {
  const client = new Client(config);
  
  try {
    await client.connect();
    logger.info('Connected to PostgreSQL database for cleanup');

    // Get all tables
    const tableQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `;
    
    const { rows } = await client.query(tableQuery);
    
    // Drop each table
    for (const row of rows) {
      const dropQuery = `DROP TABLE IF EXISTS ${row.tablename} CASCADE;`;
      await client.query(dropQuery);
      logger.info(`Dropped table: ${row.tablename}`);
    }

    logger.info('All tables dropped successfully');

  } catch (error) {
    logger.error('Error dropping tables:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// CLI handling
const args = process.argv.slice(2);
if (args.includes('--drop')) {
  dropAllTables()
    .then(() => setupDatabase())
    .catch(error => {
      logger.error('Failed to reset database:', error);
      process.exit(1);
    });
} else {
  setupDatabase()
    .catch(error => {
      logger.error('Failed to setup database:', error);
      process.exit(1);
    });
}

export { setupDatabase, dropAllTables };
