// Run only after verifying the new account belongs to the original customer.
import "dotenv/config";
import { readFileSync } from "node:fs";
import { openStore, catalog } from "./store.js";
const [file, oldId, email] = process.argv.slice(2);
if (!file || !oldId || !email)
  throw new Error(
    "Usage: node import-orders.js orders.json OLD_USER_ID VERIFIED_EMAIL",
  );
const rows = JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
const id = (value) => value?.$oid ?? value;
const db = openStore();
const user = db.prepare("SELECT id FROM users WHERE email=?").get(email.trim());
if (!user) throw new Error("Create and verify the destination account first.");
const insert = db.prepare(
  "INSERT OR IGNORE INTO orders(user_id,request_key,items,total,status,created) VALUES (?,?,?,?,?,?)",
);
db.exec("BEGIN IMMEDIATE");
let count = 0;
try {
  for (const row of rows.filter((o) => id(o.user) === oldId)) {
    const key = id(row._id);
    if (typeof key !== "string" || !key)
      throw new Error("Missing original order ID");
    const items = row.items.map((item) => ({
      id: catalog.find((i) => i.name === item.name)?.id ?? 0,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    const date = row.date ?? row.createdAt;
    const stamp = new Date(date?.$date ?? date).toISOString();
    if (
      !["PLACED", "PREPARING", "READY", "COMPLETED", "CANCELLED"].includes(
        row.status,
      ) ||
      !Number.isFinite(row.totalAmount) ||
      !items.length ||
      items.some(
        (i) =>
          !i.name ||
          !Number.isInteger(i.quantity) ||
          i.quantity < 1 ||
          !Number.isFinite(i.price),
      )
    )
      throw new Error("Invalid legacy order " + key);
    count += insert.run(
      user.id,
      "mongo-" + key,
      JSON.stringify(items),
      row.totalAmount,
      row.status,
      stamp,
    ).changes;
  }
  db.exec("COMMIT");
  console.log(count + " historical orders imported.");
} catch (err) {
  db.exec("ROLLBACK");
  throw err;
} finally {
  db.close();
}
