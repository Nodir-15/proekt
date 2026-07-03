"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const requireAuth = (req, res, next) => {
    const hdr = req.headers.authorization;
    if (!hdr?.startsWith("Bearer "))
        return res.status(401).json({ message: "No token" });
    try {
        req.user = (0, jwt_1.verifyAccess)(hdr.slice(7));
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.requireAuth = requireAuth;
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Admin only" });
    next();
};
exports.requireAdmin = requireAdmin;
