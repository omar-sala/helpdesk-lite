import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth, requireRole("MANAGER"));
analyticsRouter.get("/overview", analyticsController.getOverview);
analyticsRouter.get("/status", analyticsController.getStatus);
analyticsRouter.get("/priority", analyticsController.getPriority);
analyticsRouter.get("/agents", analyticsController.getAgents);
