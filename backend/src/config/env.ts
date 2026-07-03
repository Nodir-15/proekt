import dotenv from "dotenv";
dotenv.config();

const required = (k: string): string => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
};

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: required("MONGODB_URI"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};