// server/utils/userLogger.ts
import fs from "fs";
import path from "path";

const userFilePath = path.join(__dirname, "../data/users.csv");

// Ensure CSV header exists
function ensureUserCSV() {
  if (!fs.existsSync(userFilePath)) {
    fs.writeFileSync(userFilePath, "Email,Date\n", "utf-8");
  }
}

// Append new user signup to CSV
export function logUserSignup(email: string): void {
  ensureUserCSV();

  const now = new Date().toLocaleString();
  const record = `${email},${now}\n`;

  fs.appendFile(userFilePath, record, (err) => {
    if (err) console.error("❌ Error logging user:", err);
    else console.log("✅ User signup logged:", email);
  });
}
