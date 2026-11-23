import "dotenv/config";
import { openStore } from "./store.js";
const email = process.argv[2]?.trim();
if (!email)
  throw new Error(
    "Supply the email of a verified, existing canteen operator account.",
  );
const db = openStore();
const result = db
  .prepare("UPDATE users SET role='staff' WHERE email=?")
  .run(email);
db.close();
if (!result.changes)
  throw new Error("Account not found. Create the account first.");
console.log("Kitchen access enabled for " + email);
