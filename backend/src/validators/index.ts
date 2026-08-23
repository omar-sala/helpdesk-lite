import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export const createTicketSchema = z.object({
  title: z.string().trim().min(5).max(140),
  description: z.string().trim().min(10).max(5000),
  category: z.enum([
    "TECHNICAL_ISSUE",
    "ACCOUNT_ACCESS",
    "BILLING",
    "SOFTWARE",
    "HARDWARE",
    "NETWORK",
    "GENERAL_INQUIRY",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

export const updateTicketSchema = z
  .object({
    title: z.string().trim().min(5).max(140).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    category: z.enum([
      "TECHNICAL_ISSUE",
      "ACCOUNT_ACCESS",
      "BILLING",
      "SOFTWARE",
      "HARDWARE",
      "NETWORK",
      "GENERAL_INQUIRY",
    ]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No updates provided" });

export const assignTicketSchema = z.object({
  assigneeId: z.string().uuid(),
});

export const commentSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const updateUserSchema = z
  .object({
    role: z.enum(["EMPLOYEE", "AGENT", "MANAGER"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No updates provided" });

export const ticketQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  category: z.enum([
    "TECHNICAL_ISSUE",
    "ACCOUNT_ACCESS",
    "BILLING",
    "SOFTWARE",
    "HARDWARE",
    "NETWORK",
    "GENERAL_INQUIRY",
  ]).optional(),
  assigneeId: z.string().optional(),
});
