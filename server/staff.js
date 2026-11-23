import "dotenv/config";
import { openStore } from "./store.js";
const email = process.argv[2]?.trim();
const role = process.argv[3] || "staff";
if (!["staff", "admin"].includes(role)) throw new Error("Use staff or admin.");
if (!email)
  throw new Error(
    "Supply the email of a verified, existing canteen operator account.",
  );
const db = openStore();
const result = db
  .prepare("UPDATE users SET role=? WHERE email=?")
  .run(role, email);
db.close();
if (!result.changes)
  throw new Error("Account not found. Create the account first.");
console.log("Kitchen access enabled for " + email);
