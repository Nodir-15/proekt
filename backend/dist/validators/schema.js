"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(80),
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(8).max(100),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(8),
});
exports.productSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(160),
    description: zod_1.z.string().min(10).max(4000),
    price: zod_1.z.number().nonnegative(),
    transactionType: zod_1.z.enum(["rent", "sale"]),
    category: zod_1.z.enum(["house", "apartment", "townhouse", "commercial"]),
    area: zod_1.z.number().positive(),
    bedrooms: zod_1.z.number().int().nonnegative().default(0),
    bathrooms: zod_1.z.number().int().nonnegative().default(0),
    location: zod_1.z.object({
        city: zod_1.z.string().min(1),
        address: zod_1.z.string().min(1),
        lat: zod_1.z.number().optional(),
        lng: zod_1.z.number().optional(),
    }),
    images: zod_1.z.array(zod_1.z.string().url()).default([]),
    amenities: zod_1.z.array(zod_1.z.string()).default([]),
    status: zod_1.z.enum(["available", "booked", "sold"]).default("available"),
});
