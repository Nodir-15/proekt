"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefresh = exports.verifyAccess = exports.signRefresh = exports.signAccess = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const signAccess = (p) => jsonwebtoken_1.default.sign(p, env_1.env.jwtAccessSecret, { expiresIn: env_1.env.jwtAccessExpires });
exports.signAccess = signAccess;
const signRefresh = (p) => jsonwebtoken_1.default.sign(p, env_1.env.jwtRefreshSecret, { expiresIn: env_1.env.jwtRefreshExpires });
exports.signRefresh = signRefresh;
const verifyAccess = (t) => jsonwebtoken_1.default.verify(t, env_1.env.jwtAccessSecret);
exports.verifyAccess = verifyAccess;
const verifyRefresh = (t) => jsonwebtoken_1.default.verify(t, env_1.env.jwtRefreshSecret);
exports.verifyRefresh = verifyRefresh;
