"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const user_1 = require("../models/user");
const jwt_1 = require("../utils/jwt");
const asycnHandler_1 = require("../utils/asycnHandler");
exports.register = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password } = req.body;
    const exists = await user_1.User.findOne({ email });
    if (exists)
        return res.status(409).json({ message: "Email already in use" });
    const user = await user_1.User.create({ name, email, password });
    const access = (0, jwt_1.signAccess)({ id: user.id, role: user.role });
    const refresh = (0, jwt_1.signRefresh)({ id: user.id, role: user.role });
    user.refreshTokens.push(refresh);
    await user.save();
    res.status(201).json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        access,
        refresh,
    });
});
exports.login = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await user_1.User.findOne({ email }).select("+password +refreshTokens");
    if (!user || !(await user.comparePassword(password)))
        return res.status(401).json({ message: "Invalid credentials" });
    const access = (0, jwt_1.signAccess)({ id: user.id, role: user.role });
    const refresh = (0, jwt_1.signRefresh)({ id: user.id, role: user.role });
    user.refreshTokens.push(refresh);
    await user.save();
    res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        access,
        refresh,
    });
});
exports.refresh = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const { refresh: token } = req.body;
    if (!token)
        return res.status(400).json({ message: "No refresh token" });
    let payload;
    try {
        payload = (0, jwt_1.verifyRefresh)(token);
    }
    catch {
        return res.status(401).json({ message: "Invalid refresh" });
    }
    const user = await user_1.User.findById(payload.id).select("+refreshTokens");
    if (!user || !user.refreshTokens.includes(token))
        return res.status(401).json({ message: "Refresh revoked" });
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const access = (0, jwt_1.signAccess)({ id: user.id, role: user.role });
    const newRefresh = (0, jwt_1.signRefresh)({ id: user.id, role: user.role });
    user.refreshTokens.push(newRefresh);
    await user.save();
    res.json({ access, refresh: newRefresh });
});
exports.logout = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const { refresh: token } = req.body;
    if (!token || !req.user)
        return res.json({ ok: true });
    const user = await user_1.User.findById(req.user.id).select("+refreshTokens");
    if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
        await user.save();
    }
    res.json({ ok: true });
});
exports.me = (0, asycnHandler_1.asyncHandler)(async (req, res) => {
    const user = await user_1.User.findById(req.user.id);
    res.json({ user });
});
