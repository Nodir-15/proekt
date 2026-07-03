import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const productSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(4000),
  price: z.number().nonnegative(),
  transactionType: z.enum(["rent", "sale"]),
  category: z.enum(["house", "apartment", "townhouse", "commercial"]),
  area: z.number().positive(),
  bedrooms: z.number().int().nonnegative().default(0),
  bathrooms: z.number().int().nonnegative().default(0),
  location: z.object({
    city: z.string().min(1),
    address: z.string().min(1),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  images: z.array(z.string().url()).default([]),
  amenities: z.array(z.string()).default([]),
  status: z.enum(["available", "booked", "sold"]).default("available"),
});
