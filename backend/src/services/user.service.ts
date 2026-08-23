import { prisma } from "../lib/prisma.js";
import { AppError, notFound } from "../utils/errors.js";
import type { AuthUser } from "./rbac.js";

const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

export async function listUsers() {
  return prisma.user.findMany({
    select: publicUser,
    orderBy: { createdAt: "desc" },
  });
}

export async function listAgents() {
  return prisma.user.findMany({
    where: { role: "AGENT", isActive: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
}

export async function updateUser(
  actor: AuthUser,
  id: string,
  input: { role?: "EMPLOYEE" | "AGENT" | "MANAGER"; isActive?: boolean },
) {
  if (actor.id === id && input.isActive === false) {
    throw new AppError("You cannot deactivate your own account", 400);
  }
  if (actor.id === id && input.role && input.role !== actor.role) {
    throw new AppError("You cannot change your own role", 400);
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw notFound("User not found");

  return prisma.user.update({
    where: { id },
    data: input,
    select: publicUser,
  });
}
