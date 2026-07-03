"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.allOrders = exports.myOrders = exports.createOrder = void 0;
const asycnHandler_1 = require("../utils/asycnHandler");
const cart_1 = require("../models/cart");
const order_1 = require("../models/order");
const products_1 = require("../models/products");
exports.createOrder = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const cart = await cart_1.Cart.findOne({ user: req.user.id }).populate("items");
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Корзина пуста" });
    }
    const items = cart.items;
    const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);
    const order = await order_1.Order.create({
        user: req.user.id,
        items: items.map((i) => i._id),
        totalAmount,
        status: "pending", // явно указываем
    });
    // Бронируем товары
    await products_1.Product.updateMany({ _id: { $in: order.items } }, { status: "booked" });
    // Очищаем корзину
    cart.items = [];
    await cart.save();
    res.status(201).json({
        message: "Заказ успешно создан",
        order
    });
});
exports.myOrders = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const orders = await order_1.Order.find({ user: req.user.id })
        .populate("items", "title price address images") // добавь нужные поля
        .sort("-createdAt");
    res.json(orders);
});
exports.allOrders = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await order_1.Order.find(filter)
        .populate("user", "name email phone")
        .populate("items", "title price address images status")
        .sort("-createdAt");
    res.json(orders);
});
exports.updateOrderStatus = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    const order = await order_1.Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
        .populate("user", "name email")
        .populate("items", "title price");
    if (!order) {
        return res.status(404).json({ message: "Заказ не найден" });
    }
    // Обновляем статус товаров
    if (status === "approved") {
        await products_1.Product.updateMany({ _id: { $in: order.items } }, { status: "sold" });
    }
    if (status === "rejected") {
        await products_1.Product.updateMany({ _id: { $in: order.items } }, { status: "available" });
    }
    res.json({
        message: "Статус заказа обновлён",
        order
    });
});
