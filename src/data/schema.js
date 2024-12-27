// src/data/schema.js

export const SCHEMA = {
  users: `
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    lastLoginAt INTEGER,
    status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    verifiedAt INTEGER,
    failedLoginAttempts INTEGER DEFAULT 0,
    lastFailedLoginAt INTEGER,
    passwordResetToken TEXT,
    passwordResetExpiresAt INTEGER,
    preferences TEXT,
    timestamp INTEGER NOT NULL,
    _deleted INTEGER DEFAULT 0,
    CONSTRAINT email_format CHECK (email LIKE '%_@__%.__%'),
    CONSTRAINT username_format CHECK (length(username) >= 3)
  `,

  user_sessions: `
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    refreshToken TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    expiresAt INTEGER NOT NULL,
    lastUsedAt INTEGER NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    isValid INTEGER DEFAULT 1,
    timestamp INTEGER NOT NULL,
    _deleted INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  `,

  auth_logs: `
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    eventType TEXT NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt INTEGER NOT NULL,
    details TEXT, /* JSON string for additional details */
    timestamp INTEGER NOT NULL,
    _deleted INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  `,

  invalidated_tokens: `
    token TEXT PRIMARY KEY,
    invalidatedAt INTEGER NOT NULL,
    expiresAt INTEGER NOT NULL,
    userId TEXT NOT NULL,
    reason TEXT,
    timestamp INTEGER NOT NULL,
    _deleted INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  `,

  // Keep existing schemas
  items: `
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    _deleted INTEGER DEFAULT 0
  `,

  files: `
    id TEXT PRIMARY KEY,
    data BYTEA,
    timestamp INTEGER NOT NULL,
    _deleted INTEGER DEFAULT 0
  `,

  sync_metadata: `
    peer_id TEXT PRIMARY KEY,
    last_sync_timestamp INTEGER NOT NULL
  `
};

export async function initializeTables(dbManager) {
  // Create indexes for better query performance
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

  for (const indexSQL of indexes) {
    await dbManager.db.run(indexSQL);
  }
}

// Helper function to initialize tables with translation support
export async function initializeTranslationTables(dbManager) {
  const translationSchema = {
    user_profile_translations: `
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      languageCode TEXT NOT NULL, /* ISO 639-1 language code */
      bio TEXT,
      location TEXT,
      customFields TEXT, /* JSON string for additional translated fields */
      timestamp INTEGER NOT NULL,
      _deleted INTEGER DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(userId, languageCode)
    `
  };

  for (const [tableName, schema] of Object.entries(translationSchema)) {
    await dbManager.createTableIfNotExists(tableName, schema);
  }

  // Create indexes for translation tables
  const translationIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_user_profile_translations_userId ON user_profile_translations(userId)',
    'CREATE INDEX IF NOT EXISTS idx_user_profile_translations_languageCode ON user_profile_translations(languageCode)'
  ];

  for (const indexSQL of translationIndexes) {
    await dbManager.db.run(indexSQL);
  }
}
