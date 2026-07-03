import { Schema, model, Document, Types } from "mongoose";

export interface ICart extends Document {
  user: Types.ObjectId;
  items: Types.ObjectId[];
}

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export const Cart = model<ICart>("Cart", cartSchema);