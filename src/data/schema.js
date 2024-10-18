export const SCHEMA = {
  users: `
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  `,
  items: `
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    timestamp INTEGER NOT NULL
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
