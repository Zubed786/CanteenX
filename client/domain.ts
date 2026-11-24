export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
}
export const canManageKitchen = (user: User | null) =>
  user?.role === "staff" || user?.role === "admin";
export const dishCategories = [
  "Meals",
  "Snacks",
  "Sandwiches",
  "Salads",
  "Drinks",
];
export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  rating?: number;
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
  status: keyof typeof statuses;
  created: string;
  pickupAt: string | null;
  readyAt: string | null;
  instructions: string;
  total: number;
  items: (Line & { name: string; price: number })[];
}
export function readSaved<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export const money = (value: number) => "₹" + value.toLocaleString("en-IN");
export const ticketToken = (id: number) => "#A" + String(id).padStart(2, "0");
export const statuses = {
  PLACED: "Queued",
  PREPARING: "Preparing",
  READY: "Ready for pickup",
  COMPLETED: "Collected",
  CANCELLED: "Cancelled",
};
