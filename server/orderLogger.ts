// server/orderLogger.ts
import fs from "fs";
import path from "path";

const filesDir = path.join(__dirname, "files");
const ordersFile = path.join(filesDir, "orders.csv");
const ORDERS_HEADER = "OrderID,Email,Name,Details,Date\n";

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
      await fs.promises.writeFile(this.filePath, this.header, "utf8");
    }
  }

  private escape(value: string): string {
    return `"${String(value).replace(/"/g, '""')}"`;
  }

  append(fields: string[]): Promise<void> {
    this.queue = this.queue.then(async () => {
      await this.ensureFile();
      const line = fields.map((f) => this.escape(f)).join(",") + "\n";
      await fs.promises.appendFile(this.filePath, line, "utf8");
    });
    return this.queue;
  }
}

const orderAppender = new CsvAppender(ordersFile, ORDERS_HEADER);

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Log an order to server/files/orders.csv
 * - orderId: string (should be unique per order)
 * - email: user's email (the person who placed the order)
 * - name: person's display/name who placed the order
 * - details: text (JSON-serialized items or a free-form description — it will be escaped)
 *
 * Returns a Promise that resolves when the write completes or rejects on error.
 */
export async function logOrder(
  orderId: string,
  email: string,
  name: string,
  details: string
): Promise<void> {
  if (!orderId || typeof orderId !== "string") {
    throw new TypeError("orderId must be a non-empty string");
  }
  if (!email || typeof email !== "string" || !validateEmail(email)) {
    throw new Error("invalid email");
  }
  if (typeof name !== "string") {
    throw new TypeError("name must be a string");
  }
  if (typeof details !== "string") {
    throw new TypeError("details must be a string (serialize objects to JSON first)");
  }

  const now = new Date().toISOString();
  await orderAppender.append([orderId, email, name, details, now]);
}
