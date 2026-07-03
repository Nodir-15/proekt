"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 4000 },
    price: { type: Number, required: true, min: 0 },
    transactionType: { type: String, enum: ["rent", "sale"], required: true, index: true },
    category: {
        type: String,
        enum: ["house", "apartment", "townhouse", "commercial"],
        required: true,
        index: true,
    },
    area: { type: Number, required: true, min: 1 },
    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    location: {
        city: { type: String, required: true, index: true },
        address: { type: String, required: true },
        lat: Number,
        lng: Number,
    },
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    status: { type: String, enum: ["available", "booked", "sold"], default: "available" },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
productSchema.index({ title: "text", description: "text", "location.city": "text" });
exports.Product = (0, mongoose_1.model)("Product", productSchema);
