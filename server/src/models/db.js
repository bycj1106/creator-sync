import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../data.db');

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    startDate TEXT,
    endDate TEXT,
    progress TEXT DEFAULT '创意',
    platforms TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT,
    updatedAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'core',
    completed INTEGER DEFAULT 0,
    createdAt TEXT,
    updatedAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS inspirations (
    id TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    pinned INTEGER DEFAULT 0,
    createdAt TEXT,
    updatedAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

export const getDb = () => db;
