import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { AppError } from "./errors.js";

export type JwtPayload = {
  sub: string;
  role: Role;
  email: string;
};

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("Server authentication is not configured", 500);
  }
  return secret;
}

export function signToken(payload: JwtPayload) {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn,
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  if (typeof decoded === "string" || !decoded.sub || !decoded.role || !decoded.email) {
    throw new AppError("Invalid token", 401);
  }
  return decoded as JwtPayload;
}
