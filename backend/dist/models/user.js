"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    refreshTokens: { type: [String], default: [], select: false },
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    next();
});
userSchema.methods.comparePassword = function (plain) {
    return bcryptjs_1.default.compare(plain, this.password);
};
exports.User = (0, mongoose_1.model)("User", userSchema);
