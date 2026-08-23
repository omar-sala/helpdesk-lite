import type { Prisma, TicketStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError, forbidden, notFound } from "../utils/errors.js";
import {
  assertCanViewTicket,
  canAssignSelf,
  canComment,
  canUpdateTicketFields,
  isAllowedStatusChange,
  ticketListFilter,
  type AuthUser,
} from "./rbac.js";

const ticketInclude = {
  requester: { select: { id: true, name: true, email: true, role: true } },
  assignee: { select: { id: true, name: true, email: true, role: true } },
} as const;

function resolvedAtFor(status: TicketStatus, previous?: Date | null) {
  if (status === "RESOLVED" || status === "CLOSED") return previous ?? new Date();
  return null;
}

export async function listTickets(
  user: AuthUser,
  query: {
    page: number;
    limit: number;
    search?: string;
    status?: TicketStatus;
    priority?: Prisma.TicketWhereInput["priority"];
    category?: Prisma.TicketWhereInput["category"];
    assigneeId?: string;
  },
) {
  const where: Prisma.TicketWhereInput = {
    AND: [ticketListFilter(user)],
  };

  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.category) where.category = query.category;
  if (query.assigneeId === "unassigned") where.assigneeId = null;
  else if (query.assigneeId) where.assigneeId = query.assigneeId;

  if (query.search) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { title: { contains: query.search, mode: "insensitive" } },
          { id: { contains: query.search, mode: "insensitive" } },
        ],
      },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      include: ticketInclude,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return {
    data,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getTicket(user: AuthUser, id: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: ticketInclude,
  });
  if (!ticket) throw notFound("Ticket not found");
  assertCanViewTicket(user, ticket);
  return ticket;
}

export async function createTicket(
  user: AuthUser,
  input: {
    title: string;
    description: string;
    category: Prisma.TicketCreateInput["category"];
    priority: Prisma.TicketCreateInput["priority"];
  },
) {
  const ticket = await prisma.ticket.create({
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      requesterId: user.id,
    },
    include: ticketInclude,
  });

  await prisma.ticketActivity.create({
    data: {
      ticketId: ticket.id,
      userId: user.id,
      type: "CREATED",
      message: `${ticket.requester.name} created this ticket`,
    },
  });

  return ticket;
}

export async function updateTicket(
  user: AuthUser,
  id: string,
  input: {
    title?: string;
    description?: string;
    category?: Prisma.TicketUpdateInput["category"];
    priority?: Prisma.TicketUpdateInput["priority"];
    status?: TicketStatus;
  },
) {
  const ticket = await prisma.ticket.findUnique({ where: { id }, include: ticketInclude });
  if (!ticket) throw notFound("Ticket not found");
  assertCanViewTicket(user, ticket);

  if (!canUpdateTicketFields(user, ticket)) {
    throw forbidden("You are not authorized to update this ticket");
  }

  if (input.status && !isAllowedStatusChange(user.role, ticket.status, input.status)) {
    throw new AppError(`Status cannot change from ${ticket.status} to ${input.status}`, 400);
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      status: input.status,
      resolvedAt: input.status ? resolvedAtFor(input.status, ticket.resolvedAt) : undefined,
    },
    include: ticketInclude,
  });

  const activities = [];
  if (input.status && input.status !== ticket.status) {
    activities.push({
      ticketId: id,
      userId: user.id,
      type: "STATUS_CHANGE" as const,
      message: `Status changed from ${ticket.status} to ${input.status}`,
    });
  }
  if (input.priority && input.priority !== ticket.priority) {
    activities.push({
      ticketId: id,
      userId: user.id,
      type: "PRIORITY_CHANGE" as const,
      message: `Priority changed from ${ticket.priority} to ${input.priority}`,
    });
  }
  if (activities.length) {
    await prisma.ticketActivity.createMany({ data: activities });
  }

  return updated;
}

export async function assignSelf(user: AuthUser, id: string) {
  if (user.role !== "AGENT") throw forbidden("Only agents can claim tickets");
  const ticket = await prisma.ticket.findUnique({ where: { id }, include: ticketInclude });
  if (!ticket) throw notFound("Ticket not found");
  if (!canAssignSelf(user, ticket)) {
    throw forbidden("This ticket is already assigned");
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      assigneeId: user.id,
      status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
    },
    include: ticketInclude,
  });

  await prisma.ticketActivity.create({
    data: {
      ticketId: id,
      userId: user.id,
      type: "ASSIGNMENT",
      message: `Ticket assigned to ${updated.assignee?.name ?? "agent"}`,
    },
  });

  if (ticket.status === "OPEN") {
    await prisma.ticketActivity.create({
      data: {
        ticketId: id,
        userId: user.id,
        type: "STATUS_CHANGE",
        message: "Status changed from OPEN to IN_PROGRESS",
      },
    });
  }

  return updated;
}

export async function assignAgent(user: AuthUser, id: string, assigneeId: string) {
  if (user.role !== "MANAGER") throw forbidden("Only managers can assign tickets to agents");
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw notFound("Ticket not found");

  const agent = await prisma.user.findUnique({ where: { id: assigneeId } });
  if (!agent || agent.role !== "AGENT" || !agent.isActive) {
    throw new AppError("Assignee must be an active support agent", 400);
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      assigneeId,
      status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
    },
    include: ticketInclude,
  });

  await prisma.ticketActivity.create({
    data: {
      ticketId: id,
      userId: user.id,
      type: "ASSIGNMENT",
      message: `Ticket assigned to ${agent.name}`,
    },
  });

  return updated;
}

export async function listActivities(user: AuthUser, ticketId: string) {
  await getTicket(user, ticketId);
  return prisma.ticketActivity.findMany({
    where: { ticketId },
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function addComment(user: AuthUser, ticketId: string, message: string) {
  const ticket = await getTicket(user, ticketId);
  if (!canComment(user, ticket)) throw forbidden();
  return prisma.ticketActivity.create({
    data: {
      ticketId,
      userId: user.id,
      type: "COMMENT",
      message,
    },
    include: { user: { select: { id: true, name: true, role: true } } },
  });
}

export async function ticketCountsForDashboard(user: AuthUser) {
  const where = ticketListFilter(user);
  const [total, open, inProgress, pending, resolved, closed, unassigned, assignedToMe] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.count({ where: { AND: [where, { status: "OPEN" }] } }),
    prisma.ticket.count({ where: { AND: [where, { status: "IN_PROGRESS" }] } }),
    prisma.ticket.count({ where: { AND: [where, { status: "PENDING" }] } }),
    prisma.ticket.count({ where: { AND: [where, { status: "RESOLVED" }] } }),
    prisma.ticket.count({ where: { AND: [where, { status: "CLOSED" }] } }),
    prisma.ticket.count({ where: { AND: [where, { assigneeId: null }] } }),
    prisma.ticket.count({ where: { assigneeId: user.id } }),
  ]);
  return { total, open, inProgress, pending, resolved, closed, unassigned, assignedToMe };
}
