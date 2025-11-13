// server/userLogger.ts
import fs from "fs";
import path from "path";

const filesDir = path.join(__dirname, "files");
const usersFile = path.join(filesDir, "users.csv");
const USERS_HEADER = "Email,Date\n";

/**
 * Simple per-file append queue to serialize writes and avoid races.
 */
class CsvAppender {
  private filePath: string;
  private header: string;
  private queue: Promise<void> = Promise.resolve();

  constructor(filePath: string, header: string) {
    this.filePath = filePath;
    this.header = header;
  }

  private async ensureFile() {
    await fs.promises.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      await fs.promises.access(this.filePath, fs.constants.F_OK);
    } catch {
      // File missing — create with header
      await fs.promises.writeFile(this.filePath, this.header, "utf8");
    }
  }

  private escape(value: string): string {
    return `"${String(value).replace(/"/g, '""')}"`;
  }

  append(fields: string[]): Promise<void> {
    // Chain the append onto the queue so appends run sequentially
    this.queue = this.queue.then(async () => {
      await this.ensureFile();
      const line = fields.map((f) => this.escape(f)).join(",") + "\n";
      await fs.promises.appendFile(this.filePath, line, "utf8");
    });
    return this.queue;
  }
}

const userAppender = new CsvAppender(usersFile, USERS_HEADER);

function validateEmail(email: string): boolean {
  // Simple, permissive regex for common email formats. Replace with stronger validation if needed.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Log a user signup (email and ISO timestamp) into server/files/users.csv
 * Returns a Promise that resolves when the write is complete or rejects with an error.
 */
export async function logUserSignup(email: string): Promise<void> {
  if (!email || typeof email !== "string") {
    throw new TypeError("email must be a non-empty string");
  }
  if (!validateEmail(email)) {
    throw new Error("invalid email format");
  }

  const now = new Date().toISOString();
  await userAppender.append([email, now]);
}
