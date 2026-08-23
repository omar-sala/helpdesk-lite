import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const password = "Password123!";

async function main() {
  await prisma.ticketActivity.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(password, 12);

  const manager = await prisma.user.create({
    data: {
      name: "Nadia Hale",
      email: "manager@northwind.test",
      passwordHash,
      role: "MANAGER",
    },
  });

  const sara = await prisma.user.create({
    data: {
      name: "Sara Quinn",
      email: "agent.sara@northwind.test",
      passwordHash,
      role: "AGENT",
    },
  });

  const omar = await prisma.user.create({
    data: {
      name: "Omar Farouk",
      email: "agent.omar@northwind.test",
      passwordHash,
      role: "AGENT",
    },
  });

  const lina = await prisma.user.create({
    data: {
      name: "Lina Ortega",
      email: "employee.lina@northwind.test",
      passwordHash,
      role: "EMPLOYEE",
    },
  });

  const noah = await prisma.user.create({
    data: {
      name: "Noah Patel",
      email: "employee.noah@northwind.test",
      passwordHash,
      role: "EMPLOYEE",
    },
  });

  const tickets = [
    {
      title: "VPN disconnects during standup",
      description: "London office VPN drops every morning around 09:15. Handshake timeout on the gateway.",
      category: "NETWORK" as const,
      priority: "HIGH" as const,
      status: "IN_PROGRESS" as const,
      requesterId: lina.id,
      assigneeId: sara.id,
    },
    {
      title: "Cannot reset MFA after phone replacement",
      description: "New device cannot complete MFA. Backup codes were on the old phone.",
      category: "ACCOUNT_ACCESS" as const,
      priority: "CRITICAL" as const,
      status: "OPEN" as const,
      requesterId: noah.id,
      assigneeId: null,
    },
    {
      title: "Duplicate August invoice charge",
      description: "Account NW-88421 was billed twice for the Team plan. Please credit the duplicate.",
      category: "BILLING" as const,
      priority: "HIGH" as const,
      status: "PENDING" as const,
      requesterId: lina.id,
      assigneeId: omar.id,
    },
    {
      title: "CRM login loop after password reset",
      description: "Okta bounce loop after reset. Incognito does not help. Blocks sales quotes.",
      category: "SOFTWARE" as const,
      priority: "CRITICAL" as const,
      status: "IN_PROGRESS" as const,
      requesterId: noah.id,
      assigneeId: sara.id,
    },
    {
      title: "Laptop imaging delayed for contractor",
      description: "Asset HDW-332 is in inventory but the imaging job is still queued.",
      category: "HARDWARE" as const,
      priority: "MEDIUM" as const,
      status: "OPEN" as const,
      requesterId: lina.id,
      assigneeId: null,
    },
    {
      title: "Timesheet CSV export fails",
      description: "Export spinner runs for 20 seconds then fails in Chrome and Firefox. Needed for payroll.",
      category: "SOFTWARE" as const,
      priority: "HIGH" as const,
      status: "RESOLVED" as const,
      requesterId: noah.id,
      assigneeId: omar.id,
      resolvedAt: new Date("2026-08-20T16:00:00.000Z"),
    },
    {
      title: "Shared drive missing for contractors",
      description: "Autumn Launch folder is not visible to marketing contractors. View-only until 30 Sep.",
      category: "ACCOUNT_ACCESS" as const,
      priority: "MEDIUM" as const,
      status: "CLOSED" as const,
      requesterId: lina.id,
      assigneeId: sara.id,
      resolvedAt: new Date("2026-08-04T12:00:00.000Z"),
    },
    {
      title: "Sandbox checkout returns 500",
      description: "Payments API in sandbox returns GATEWAY_UNAVAILABLE. Production is unaffected.",
      category: "TECHNICAL_ISSUE" as const,
      priority: "CRITICAL" as const,
      status: "PENDING" as const,
      requesterId: noah.id,
      assigneeId: omar.id,
    },
    {
      title: "Meeting room panels stuck",
      description: "Rooms 4B and 4C show the welcome screen only. Reboot did not help.",
      category: "HARDWARE" as const,
      priority: "LOW" as const,
      status: "RESOLVED" as const,
      requesterId: lina.id,
      assigneeId: sara.id,
      resolvedAt: new Date("2026-08-05T09:30:00.000Z"),
    },
    {
      title: "Need copy of employment documents",
      description: "HR portal only shows the 2024 contract. Mortgage application needs the current PDF.",
      category: "GENERAL_INQUIRY" as const,
      priority: "LOW" as const,
      status: "OPEN" as const,
      requesterId: noah.id,
      assigneeId: null,
    },
  ];

  for (const item of tickets) {
    const ticket = await prisma.ticket.create({ data: item });
    await prisma.ticketActivity.create({
      data: {
        ticketId: ticket.id,
        userId: item.requesterId,
        type: "CREATED",
        message: "Ticket created",
      },
    });
    if (item.assigneeId) {
      const agent = item.assigneeId === sara.id ? sara : omar;
      await prisma.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          userId: manager.id,
          type: "ASSIGNMENT",
          message: `Ticket assigned to ${agent.name}`,
        },
      });
    }
    if (item.status !== "OPEN") {
      await prisma.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          userId: item.assigneeId ?? manager.id,
          type: "STATUS_CHANGE",
          message: `Status set to ${item.status}`,
        },
      });
    }
  }

  console.log("Seed complete. Demo password for all users: Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
