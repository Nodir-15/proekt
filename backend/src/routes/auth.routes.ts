import { Router } from "express";
import * as c from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/schema";
import { requireAuth } from "../middleware/auth";

const r = Router();
r.post("/register", validate(registerSchema), c.register);
r.post("/login", validate(loginSchema), c.login);
r.post("/refresh", c.refresh);
r.post("/logout", requireAuth, c.logout);
r.get("/me", requireAuth, c.me);
export default r;