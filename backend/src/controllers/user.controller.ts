import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { updateUserSchema } from "../validators/index.js";
import { listAgents, listUsers, updateUser } from "../services/user.service.js";

export const list = asyncHandler(async (_req, res: Response) => {
  const data = await listUsers();
  res.json({ success: true, data });
});

export const agents = asyncHandler(async (_req, res: Response) => {
  const data = await listAgents();
  res.json({ success: true, data });
});

export const update = asyncHandler(async (req, res: Response) => {
  const body = updateUserSchema.parse(req.body);
  const data = await updateUser((req as AuthedRequest).user, String(req.params.id), body);
  res.json({ success: true, data });
});
