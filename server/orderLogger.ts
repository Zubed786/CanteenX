// server/orderLogger.ts
import fs from "fs";
import path from "path";

const filesDir = path.join(__dirname, "files");
const ordersFile = path.join(filesDir, "orders.csv");

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
 * Log an order to server/files/orders.csv
 * Header: OrderID,Email,Name,Details,Date
 *
 * - orderId: unique id for the order (string)
 * - email: email of the user who placed the order
 * - name: name of the user who placed the order
 * - details: a text/JSON string describing items/amount/etc.
 */
export function logOrder(orderId: string, email: string, name: string, details: string): void {
  ensureCsv(ordersFile, "OrderID,Email,Name,Details,Date\n");

  const now = new Date().toISOString();
  const record = [
    escapeCsv(orderId),
    escapeCsv(email),
    escapeCsv(name),
    escapeCsv(details),
    escapeCsv(now),
  ].join(",") + "\n";

  try {
    fs.appendFileSync(ordersFile, record, "utf8");
    console.log(`✅ Order logged: ${orderId} by ${email}`);
  } catch (err) {
    console.error("❌ Error logging order:", err);
  }
}
