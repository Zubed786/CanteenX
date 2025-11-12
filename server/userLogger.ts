// server/userLogger.ts
import fs from "fs";
import path from "path";

const filesDir = path.join(__dirname, "files");
const usersFile = path.join(filesDir, "users.csv");

function ensureCsv(filePath: string, header: string) {
  try {
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, header, "utf8");
    }
  } catch (err) {
    console.error("❌ Error ensuring CSV file:", err);
  }
}

function escapeCsv(value: string): string {
  // Per CSV rules, wrap in quotes and double any internal quotes
  return `"${String(value).replace(/"/g, '""')}"`;
}

/**
 * Log a user signup (email and timestamp) to server/files/users.csv
 * Header: Email,Date
 */
export function logUserSignup(email: string): void {
  ensureCsv(usersFile, "Email,Date\n");

  const now = new Date().toISOString();
  const record = `${escapeCsv(email)},${escapeCsv(now)}\n`;

  try {
    // Using synchronous append keeps it simple and predictable for a small logger
    fs.appendFileSync(usersFile, record, "utf8");
    console.log("✅ User signup logged:", email);
  } catch (err) {
    console.error("❌ Error logging user signup:", err);
  }
}
