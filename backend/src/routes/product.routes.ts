import { Router } from "express";
import * as c from "../controllers/product.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { productSchema } from "../validators/schema";

const r = Router();
r.get("/", c.listProducts);
r.get("/:id", c.getProduct);
r.post("/", requireAuth, requireAdmin, validate(productSchema), c.createProduct);
r.put("/:id", requireAuth, requireAdmin, validate(productSchema), c.updateProduct);
r.delete("/:id", requireAuth, requireAdmin, c.deleteProduct);
export default r;