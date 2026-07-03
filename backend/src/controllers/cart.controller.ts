import { Response } from "express";
import { Cart } from "../models/cart";
import { asyncHandler } from "../utils/asycnHandler";

export const getCart = asyncHandler(async (req, res: Response) => {
  let cart = await Cart.findOne({ user: req.user!.id }).populate("items");
  if (!cart) cart = await Cart.create({ user: req.user!.id, items: [] });
  res.json(cart);
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const cart = await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { $addToSet: { items: productId } },
    { new: true, upsert: true }
  ).populate("items");
  res.json(cart);
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { $pull: { items: req.params.productId } },
    { new: true }
  ).populate("items");
  res.json(cart);
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { items: [] },
    { new: true }
  );
  res.json(cart);
});
