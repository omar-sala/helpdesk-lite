import type { Response } from "express";
import { loginUser, registerUser, getMe } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../validators/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const register = asyncHandler(async (req, res: Response) => {
  const body = registerSchema.parse(req.body);
  const result = await registerUser(body);
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req, res: Response) => {
  const body = loginSchema.parse(req.body);
  const result = await loginUser(body);
  res.json({ success: true, data: result });
});

export const me = asyncHandler(async (req, res: Response) => {
  const user = await getMe((req as AuthedRequest).user.id);
  res.json({ success: true, data: user });
});

export const logout = asyncHandler(async (_req, res: Response) => {
  res.json({ success: true, message: "Signed out" });
});
