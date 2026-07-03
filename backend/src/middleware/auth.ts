import { Request, Response, NextFunction } from "express";
import { verifyAccess, JwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });
  try {
    req.user = verifyAccess(hdr.slice(7));
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
};