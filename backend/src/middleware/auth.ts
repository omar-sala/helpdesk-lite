import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { forbidden, unauthorized } from "../utils/errors.js";
import { verifyToken } from "../utils/jwt.js";
import type { AuthUser } from "../services/rbac.js";

export type AuthedRequest = Request & { user: AuthUser };

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw unauthorized();

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw unauthorized("Account is inactive or no longer exists");
    }

    (req as AuthedRequest).user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthedRequest).user;
    if (!user || !roles.includes(user.role)) {
      return next(forbidden());
    }
    next();
  };
}
