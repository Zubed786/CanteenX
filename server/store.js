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
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, email TEXT UNIQUE COLLATE NOCASE, name TEXT NOT NULL,
      password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student'
    );
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS stock (id INTEGER PRIMARY KEY, available INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS menu_items (id INTEGER PRIMARY KEY, details TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS kitchen_settings (
      id INTEGER PRIMARY KEY CHECK(id=1), accepting_orders INTEGER NOT NULL CHECK(accepting_orders IN (0,1))
    );
    INSERT OR IGNORE INTO kitchen_settings VALUES (1,1);
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users, request_key TEXT NOT NULL,
      items TEXT NOT NULL, total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'PLACED',
      created TEXT NOT NULL, UNIQUE(user_id, request_key)
    );
    CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users, message TEXT NOT NULL);
    CREATE TRIGGER IF NOT EXISTS validate_order_status_insert BEFORE INSERT ON orders
      WHEN NEW.status NOT IN ('PLACED','PREPARING','READY','COMPLETED','CANCELLED')
      BEGIN SELECT RAISE(ABORT,'Invalid order status'); END;
    CREATE TRIGGER IF NOT EXISTS validate_order_status_update BEFORE UPDATE OF status ON orders
      WHEN NEW.status NOT IN ('PLACED','PREPARING','READY','COMPLETED','CANCELLED')
      BEGIN SELECT RAISE(ABORT,'Invalid order status'); END;
  `);
  const columns = db.prepare("PRAGMA table_info(orders)").all();
  if (!columns.some((column) => column.name === "instructions"))
    db.exec(
      "ALTER TABLE orders ADD COLUMN instructions TEXT NOT NULL DEFAULT ''",
    );
  if (!columns.some((column) => column.name === "pickup_at"))
    db.exec("ALTER TABLE orders ADD COLUMN pickup_at TEXT");
  if (!columns.some((column) => column.name === "ready_at"))
    db.exec("ALTER TABLE orders ADD COLUMN ready_at TEXT");
  const insert = db.prepare("INSERT OR IGNORE INTO stock VALUES (?, ?)");
  const seed = db.prepare("INSERT OR IGNORE INTO menu_items VALUES (?, ?)");
  for (const { id, inStock, ...details } of catalog) {
    seed.run(id, JSON.stringify(details));
    insert.run(id, Number(inStock));
  }
  return db;
}
