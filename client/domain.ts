export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "staff";
}
export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  type: string;
  category: string[];
  inStock: boolean;
}
export interface Line {
  id: number;
  quantity: number;
}
export interface Ticket {
  id: number;
  name: string;
  status: string;
  created: string;
  total: number;
  items: (Line & { name: string; price: number })[];
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch("/api" + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => {
    throw new Error("Cannot reach the kitchen. Try again.");
  });
  if (response.status === 401 && !path.startsWith("/users/")) {
    window.dispatchEvent(new Event("session-expired"));
  }
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}
export function readSaved<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export const money = (value: number) => "₹" + value.toLocaleString("en-IN");
export const statuses: Record<string, string> = {
  PLACED: "Queued",
  PREPARING: "Preparing",
  READY: "Ready for pickup",
  COMPLETED: "Collected",
  CANCELLED: "Cancelled",
};
