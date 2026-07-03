import { Router } from "express";
import * as c from "../controllers/cart.controller";
import { requireAuth } from "../middleware/auth";

const r = Router();
r.use(requireAuth);
r.get("/", c.getCart);
r.post("/", c.addToCart);
r.delete("/clear", c.clearCart);
r.delete("/:productId", c.removeFromCart);
export default r;
