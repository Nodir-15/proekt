import { Router } from "express";
import * as c from "../controllers/order.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const r = Router();
r.use(requireAuth);
r.post("/", c.createOrder);
r.get("/mine", c.myOrders);
r.get("/", requireAdmin, c.allOrders);
r.patch("/:id", requireAdmin, c.updateOrderStatus);
export default r;