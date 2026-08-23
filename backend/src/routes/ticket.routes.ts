import { Router } from "express";
import * as ticketController from "../controllers/ticket.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const ticketRouter = Router();

ticketRouter.use(requireAuth);
ticketRouter.get("/", ticketController.list);
ticketRouter.get("/summary", ticketController.summary);
ticketRouter.post("/", ticketController.create);
ticketRouter.get("/:id", ticketController.getOne);
ticketRouter.patch("/:id", ticketController.update);
ticketRouter.post("/:id/assign-self", requireRole("AGENT"), ticketController.assignToSelf);
ticketRouter.post("/:id/assign", requireRole("MANAGER"), ticketController.assignToAgent);
ticketRouter.get("/:id/activities", ticketController.activities);
ticketRouter.post("/:id/activities", ticketController.comment);
