import { Request, Response } from "express";
import { Product } from "../models/products";
import { asyncHandler } from "../utils/asycnHandler";

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    transactionType,
    category,
    city,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    sort = "-createdAt",
    page = "1",
    limit = "12",
  } = req.query as Record<string, string>;

  const filter: any = {};
  if (transactionType) filter.transactionType = transactionType;
  if (category) filter.category = category;
  if (city) filter["location.city"] = new RegExp(`^${city}$`, "i");
  if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (minArea || maxArea) {
    filter.area = {};
    if (minArea) filter.area.$gte = Number(minArea);
    if (maxArea) filter.area.$lte = Number(maxArea);
  }
  if (q) filter.$text = { $search: q };

  const pageN = Math.max(Number(page), 1);
  const limitN = Math.min(Number(limit), 50);
  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip((pageN - 1) * limitN)
      .limit(limitN),
    Product.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageN, pages: Math.ceil(total / limitN) });
});

export const getProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id).populate("owner", "name email");
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
});

export const createProduct = asyncHandler(async (req, res) => {
  const p = await Product.create({ ...req.body, owner: req.user!.id });
  res.status(201).json(p);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
});
