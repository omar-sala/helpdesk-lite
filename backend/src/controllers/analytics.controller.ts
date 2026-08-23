import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { agentWorkload, overview, priorityDistribution, statusDistribution } from "../services/analytics.service.js";

export const getOverview = asyncHandler(async (_req, res: Response) => {
  const data = await overview();
  res.json({ success: true, data });
});

export const getStatus = asyncHandler(async (_req, res: Response) => {
  const data = await statusDistribution();
  res.json({ success: true, data });
});

export const getPriority = asyncHandler(async (_req, res: Response) => {
  const data = await priorityDistribution();
  res.json({ success: true, data });
});

export const getAgents = asyncHandler(async (_req, res: Response) => {
  const data = await agentWorkload();
  res.json({ success: true, data });
});
