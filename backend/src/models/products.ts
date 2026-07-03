import { Schema, model, Document, Types } from "mongoose";

export type TransactionType = "rent" | "sale";
export type Category = "house" | "apartment" | "townhouse" | "commercial";
export type Status = "available" | "booked" | "sold";

export interface IProduct extends Document {
  _id: Types.ObjectId;
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
  owner: Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
  {
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
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", "location.city": "text" });

export const Product = model<IProduct>("Product", productSchema);