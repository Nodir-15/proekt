import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  id: string;
  role: "user" | "admin";
}

export const signAccess = (p: JwtPayload) =>
  jwt.sign(p, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpires } as SignOptions);

export const signRefresh = (p: JwtPayload) =>
  jwt.sign(p, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpires } as SignOptions);

export const verifyAccess = (t: string) => jwt.verify(t, env.jwtAccessSecret) as JwtPayload;
export const verifyRefresh = (t: string) => jwt.verify(t, env.jwtRefreshSecret) as JwtPayload;