import type { Role, Ticket, TicketStatus } from "@prisma/client";
import { forbidden } from "../utils/errors.js";

export type AuthUser = {
  id: string;
  role: Role;
  email: string;
};

export const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["PENDING", "RESOLVED"],
  PENDING: ["IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
};

export function canViewTicket(user: AuthUser, ticket: Pick<Ticket, "requesterId" | "assigneeId">) {
  if (user.role === "MANAGER") return true;
  if (user.role === "EMPLOYEE") return ticket.requesterId === user.id;
  return ticket.assigneeId === user.id || ticket.assigneeId === null;
}

export function assertCanViewTicket(user: AuthUser, ticket: Pick<Ticket, "requesterId" | "assigneeId">) {
  if (!canViewTicket(user, ticket)) {
    throw forbidden("You are not authorized to view this ticket");
  }
}

export function canAssignSelf(user: AuthUser, ticket: Pick<Ticket, "assigneeId">) {
  if (user.role !== "AGENT") return false;
  return ticket.assigneeId === null || ticket.assigneeId === user.id;
}

export function canUpdateTicketFields(user: AuthUser, ticket: Pick<Ticket, "assigneeId" | "requesterId">) {
  if (user.role === "MANAGER") return true;
  if (user.role === "AGENT") return ticket.assigneeId === user.id;
  return false;
}

export function canComment(user: AuthUser, ticket: Pick<Ticket, "requesterId" | "assigneeId">) {
  return canViewTicket(user, ticket);
}

export function isAllowedStatusChange(role: Role, from: TicketStatus, to: TicketStatus) {
  if (from === to) return true;
  if (role === "MANAGER") return true;
  if (role === "EMPLOYEE") return false;
  return STATUS_TRANSITIONS[from].includes(to);
}

export function ticketListFilter(user: AuthUser) {
  if (user.role === "MANAGER") return {};
  if (user.role === "EMPLOYEE") return { requesterId: user.id };
  return {
    OR: [{ assigneeId: user.id }, { assigneeId: null }],
  };
}
