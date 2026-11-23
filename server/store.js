import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const catalog = JSON.parse(
  readFileSync(new URL("./menu.json", import.meta.url), "utf8"),
);
export function openStore(
  path = process.env.DATABASE_PATH ||
    fileURLToPath(new URL("./data/canteen.sqlite", import.meta.url)),
) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, email TEXT UNIQUE COLLATE NOCASE, name TEXT NOT NULL,
      password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student'
    );
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS stock (id INTEGER PRIMARY KEY, available INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users, request_key TEXT NOT NULL,
      items TEXT NOT NULL, total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'PLACED',
      created TEXT NOT NULL, UNIQUE(user_id, request_key)
    );
    CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users, message TEXT NOT NULL);
  `);
  const insert = db.prepare("INSERT OR IGNORE INTO stock VALUES (?, ?)");
  for (const item of catalog) insert.run(item.id, Number(item.inStock));
  return db;
}
