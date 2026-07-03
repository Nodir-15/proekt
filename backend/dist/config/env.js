"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const required = (k) => {
    const v = process.env[k];
    if (!v)
        throw new Error(`Missing env: ${k}`);
    return v;
};
exports.env = {
    port: Number(process.env.PORT || 5000),
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: required("MONGODB_URI"),
    jwtAccessSecret: required("JWT_ACCESS_SECRET"),
    jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
    jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
    clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};
