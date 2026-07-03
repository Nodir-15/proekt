"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.addToCart = exports.getCart = void 0;
const cart_1 = require("../models/cart");
const asycnHandler_1 = require("../utils/asycnHandler");
exports.getCart = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    let cart = await cart_1.Cart.findOne({ user: req.user.id }).populate("items");
    if (!cart)
        cart = await cart_1.Cart.create({ user: req.user.id, items: [] });
    res.json(cart);
});
exports.addToCart = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.body;
    const cart = await cart_1.Cart.findOneAndUpdate({ user: req.user.id }, { $addToSet: { items: productId } }, { new: true, upsert: true }).populate("items");
    res.json(cart);
});
exports.removeFromCart = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const cart = await cart_1.Cart.findOneAndUpdate({ user: req.user.id }, { $pull: { items: req.params.productId } }, { new: true }).populate("items");
    res.json(cart);
});
exports.clearCart = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const cart = await cart_1.Cart.findOneAndUpdate({ user: req.user.id }, { items: [] }, { new: true });
    res.json(cart);
});
