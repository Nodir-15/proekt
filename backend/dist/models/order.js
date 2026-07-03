"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true }],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed"],
        default: "pending"
    },
}, { timestamps: true });
exports.Order = (0, mongoose_1.model)("Order", orderSchema);
