import { Request, Response } from "express";
import { User } from "../models/user";
import { signAccess, signRefresh, verifyRefresh } from "../utils/jwt";
import { asyncHandler } from "../utils/asycnHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use" });
  const user = await User.create({ name, email, password });
  const access = signAccess({ id: user.id, role: user.role });
  const refresh = signRefresh({ id: user.id, role: user.role });
  user.refreshTokens.push(refresh);
  await user.save();
  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    access,
    refresh,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });
  const access = signAccess({ id: user.id, role: user.role });
  const refresh = signRefresh({ id: user.id, role: user.role });
  user.refreshTokens.push(refresh);
  await user.save();
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    access,
    refresh,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refresh: token } = req.body;
  if (!token) return res.status(400).json({ message: "No refresh token" });
  let payload;
  try {
    payload = verifyRefresh(token);
  } catch {
    return res.status(401).json({ message: "Invalid refresh" });
  }
  const user = await User.findById(payload.id).select("+refreshTokens");
  if (!user || !user.refreshTokens.includes(token))
    return res.status(401).json({ message: "Refresh revoked" });
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  const access = signAccess({ id: user.id, role: user.role });
  const newRefresh = signRefresh({ id: user.id, role: user.role });
  user.refreshTokens.push(newRefresh);
  await user.save();
  res.json({ access, refresh: newRefresh });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refresh: token } = req.body;
  if (!token || !req.user) return res.json({ ok: true });
  const user = await User.findById(req.user.id).select("+refreshTokens");
  if (user) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save();
  }
  res.json({ ok: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  res.json({ user });
});