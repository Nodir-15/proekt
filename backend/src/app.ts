import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
// @ts-ignore - no types
import xss from "xss-clean";
import hpp from "hpp";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api/auth", rateLimit({ windowMs: 15 * 60_000, max: 50 }));
app.use("/api", rateLimit({ windowMs: 15 * 60_000, max: 500 }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use(errorHandler);