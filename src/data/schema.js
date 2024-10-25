export const SCHEMA = {
  users: `
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    _deleted INTEGER DEFAULT 0
  `,
  items: `
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    _deleted INTEGER DEFAULT 0
  `,
  files: `
    id TEXT PRIMARY KEY,
    data BLOB,
    timestamp INTEGER NOT NULL,
    _deleted INTEGER DEFAULT 0
  `,
  sync_metadata: `
    peer_id TEXT PRIMARY KEY,
    last_sync_timestamp INTEGER NOT NULL
  `
};

export async function initializeTables(dbManager) {
  for (const [tableName, schema] of Object.entries(SCHEMA)) {
    await dbManager.createTableIfNotExists(tableName, schema);
  }
}
