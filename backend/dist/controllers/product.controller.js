"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.listProducts = void 0;
const products_1 = require("../models/products");
const asycnHandler_1 = require("../utils/asycnHandler");
exports.listProducts = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const { q, transactionType, category, city, minPrice, maxPrice, minArea, maxArea, bedrooms, sort = "-createdAt", page = "1", limit = "12", } = req.query;
    const filter = {};
    if (transactionType)
        filter.transactionType = transactionType;
    if (category)
        filter.category = category;
    if (city)
        filter["location.city"] = new RegExp(`^${city}$`, "i");
    if (bedrooms)
        filter.bedrooms = { $gte: Number(bedrooms) };
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice)
            filter.price.$gte = Number(minPrice);
        if (maxPrice)
            filter.price.$lte = Number(maxPrice);
    }
    if (minArea || maxArea) {
        filter.area = {};
        if (minArea)
            filter.area.$gte = Number(minArea);
        if (maxArea)
            filter.area.$lte = Number(maxArea);
    }
    if (q)
        filter.$text = { $search: q };
    const pageN = Math.max(Number(page), 1);
    const limitN = Math.min(Number(limit), 50);
    const [items, total] = await Promise.all([
        products_1.Product.find(filter)
            .sort(sort)
            .skip((pageN - 1) * limitN)
            .limit(limitN),
        products_1.Product.countDocuments(filter),
    ]);
    res.json({ items, total, page: pageN, pages: Math.ceil(total / limitN) });
});
exports.getProduct = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const p = await products_1.Product.findById(req.params.id).populate("owner", "name email");
    if (!p)
        return res.status(404).json({ message: "Not found" });
    res.json(p);
});
exports.createProduct = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const p = await products_1.Product.create({ ...req.body, owner: req.user.id });
    res.status(201).json(p);
});
exports.updateProduct = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const p = await products_1.Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p)
        return res.status(404).json({ message: "Not found" });
    res.json(p);
});
exports.deleteProduct = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const p = await products_1.Product.findByIdAndDelete(req.params.id);
    if (!p)
        return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
});
