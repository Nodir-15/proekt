import { Schema, model, Document, Types } from "mongoose";

export type OrderStatus = "pending" | "approved" | "rejected" | "completed";

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: Types.ObjectId[];
  totalAmount: number;
  status: OrderStatus;
}

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [{ type: Schema.Types.ObjectId, ref: "Product", required: true }],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected", "completed"], 
      default: "pending" 
    },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", orderSchema);