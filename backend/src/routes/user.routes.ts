import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get("/agents", requireRole("MANAGER", "AGENT"), userController.agents);
userRouter.get("/", requireRole("MANAGER"), userController.list);
userRouter.patch("/:id", requireRole("MANAGER"), userController.update);
