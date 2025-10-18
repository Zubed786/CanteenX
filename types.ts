
export enum UserRole {
  STUDENT = 'student',
  STAFF = 'staff',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export enum FoodType {
  VEG = 'veg',
  NON_VEG = 'non-veg',
}

export enum FoodCategory {
  MAIN_COURSE = "Main Course",
  SALAD = "Salads",
  SIDES = "Sides",
  SANDWICH = "Sandwiches",
  BEVERAGE = "Beverages",
  SPECIAL = "Today's Special",
  POPULAR = "Popular",
}

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  type: FoodType;
  category: FoodCategory[];
  rating: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
  };
  inStock: boolean;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export enum OrderStatus {
  PLACED = 'Order Placed',
  PREPARING = 'Preparing',
  READY = 'Ready for Pickup',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  date: string;
  userDetails: {
    name: string;
    email: string;
  }
}

export interface SmartCart {
  id: string;
  name: string;
  items: CartItem[];
}
