import { asyncHandler } from "../utils/asycnHandler";
import { Cart } from "../models/cart";
import { Order } from "../models/order";
import { Product } from "../models/products";

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user!.id }).populate("items");
  
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Корзина пуста" });
  }

  const items = cart.items as any[];
  const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);

  const order = await Order.create({
    user: req.user!.id,
    items: items.map((i) => i._id),
    totalAmount,
    status: "pending", // явно указываем
  });

  // Бронируем товары
  await Product.updateMany(
    { _id: { $in: order.items } }, 
    { status: "booked" }
  );

  // Очищаем корзину
  cart.items = [];
  await cart.save();

  res.status(201).json({ 
    message: "Заказ успешно создан", 
    order 
  });
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user!.id })
    .populate("items", "title price address images") // добавь нужные поля
    .sort("-createdAt");

  res.json(orders);
});

export const allOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = status ? { status } : {};

  const orders = await Order.find(filter)
    .populate("user", "name email phone")
    .populate("items", "title price address images status")
    .sort("-createdAt");

  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  )
  .populate("user", "name email")
  .populate("items", "title price");

  if (!order) {
    return res.status(404).json({ message: "Заказ не найден" });
  }

  // Обновляем статус товаров
  if (status === "approved") {
    await Product.updateMany(
      { _id: { $in: order.items } }, 
      { status: "sold" }
    );
  }

  if (status === "rejected") {
    await Product.updateMany(
      { _id: { $in: order.items } }, 
      { status: "available" }
    );
  }

  res.json({ 
    message: "Статус заказа обновлён", 
    order 
  });
});