import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { AuthedRequest } from "../middleware/auth.js";
import {
  assignSchema,
  commentSchema,
  createTicketSchema,
  ticketQuerySchema,
  updateTicketSchema,
} from "../validators/index.js";
import {
  addComment,
  assignAgent,
  assignSelf,
  createTicket,
  getTicket,
  listActivities,
  listTickets,
  ticketCountsForDashboard,
  updateTicket,
} from "../services/ticket.service.js";

export const list = asyncHandler(async (req, res: Response) => {
  const user = (req as AuthedRequest).user;
  const query = ticketQuerySchema.parse(req.query);
  const result = await listTickets(user, query);
  res.json({ success: true, ...result });
});

export const summary = asyncHandler(async (req, res: Response) => {
  const data = await ticketCountsForDashboard((req as AuthedRequest).user);
  res.json({ success: true, data });
});

export const getOne = asyncHandler(async (req, res: Response) => {
  const ticket = await getTicket((req as AuthedRequest).user, req.params.id);
  res.json({ success: true, data: ticket });
});

export const create = asyncHandler(async (req, res: Response) => {
  const body = createTicketSchema.parse(req.body);
  const ticket = await createTicket((req as AuthedRequest).user, body);
  res.status(201).json({ success: true, data: ticket });
});

export const update = asyncHandler(async (req, res: Response) => {
  const body = updateTicketSchema.parse(req.body);
  const ticket = await updateTicket((req as AuthedRequest).user, req.params.id, body);
  res.json({ success: true, data: ticket });
});

export const assignToSelf = asyncHandler(async (req, res: Response) => {
  const ticket = await assignSelf((req as AuthedRequest).user, req.params.id);
  res.json({ success: true, data: ticket });
});

export const assignToAgent = asyncHandler(async (req, res: Response) => {
  const body = assignSchema.parse(req.body);
  const ticket = await assignAgent((req as AuthedRequest).user, req.params.id, body.assigneeId);
  res.json({ success: true, data: ticket });
});

export const activities = asyncHandler(async (req, res: Response) => {
  const data = await listActivities((req as AuthedRequest).user, req.params.id);
  res.json({ success: true, data });
});

export const comment = asyncHandler(async (req, res: Response) => {
  const body = commentSchema.parse(req.body);
  const data = await addComment((req as AuthedRequest).user, req.params.id, body.message);
  res.status(201).json({ success: true, data });
});
