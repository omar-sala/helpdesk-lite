import { prisma } from "../lib/prisma.js";

export async function overview() {
  const [total, open, inProgress, pending, resolved, closed] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { status: "PENDING" } }),
    prisma.ticket.count({ where: { status: "RESOLVED" } }),
    prisma.ticket.count({ where: { status: "CLOSED" } }),
  ]);
  return { total, open, inProgress, pending, resolved, closed };
}

export async function statusDistribution() {
  const rows = await prisma.ticket.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  return rows.map((row) => ({ status: row.status, count: row._count.status }));
}

export async function priorityDistribution() {
  const rows = await prisma.ticket.groupBy({
    by: ["priority"],
    _count: { priority: true },
  });
  return rows.map((row) => ({ priority: row.priority, count: row._count.priority }));
}

export async function agentWorkload() {
  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
    select: {
      id: true,
      name: true,
      email: true,
      assignedTickets: {
        select: { status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return agents.map((agent) => {
    const tickets = agent.assignedTickets;
    return {
      agentId: agent.id,
      name: agent.name,
      email: agent.email,
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "OPEN" || ticket.status === "IN_PROGRESS" || ticket.status === "PENDING").length,
      resolved: tickets.filter((ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED").length,
    };
  });
}
