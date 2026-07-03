export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type TransactionType = "rent" | "sale";
export type Category = "house" | "apartment" | "townhouse" | "commercial";
export type Status = "available" | "booked" | "sold";

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  transactionType: TransactionType;
  category: Category;
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: { city: string; address: string; lat?: number; lng?: number };
  images: string[];
  amenities: string[];
  status: Status;
  owner: string | User;
}

export interface Cart {
  _id: string;
  user: string;
  items: Property[];
}

export interface Order {
  _id: string;
  user: string;
  items: Property[];
  totalAmount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
