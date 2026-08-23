import { describe, expect, it } from "vitest";
import {
  canAssignSelf,
  canComment,
  canUpdateTicketFields,
  canViewTicket,
  isAllowedStatusChange,
  ticketListFilter,
  type AuthUser,
} from "./rbac.js";

const employee: AuthUser = { id: "e1", role: "EMPLOYEE", email: "e@test.com" };
const otherEmployee: AuthUser = { id: "e2", role: "EMPLOYEE", email: "e2@test.com" };
const agent: AuthUser = { id: "a1", role: "AGENT", email: "a@test.com" };
const otherAgent: AuthUser = { id: "a2", role: "AGENT", email: "a2@test.com" };
const manager: AuthUser = { id: "m1", role: "MANAGER", email: "m@test.com" };

const ownTicket = { requesterId: "e1", assigneeId: null };
const assignedTicket = { requesterId: "e1", assigneeId: "a1" };
const otherAssigned = { requesterId: "e2", assigneeId: "a2" };

describe("ticket visibility", () => {
  it("lets employees see only their own tickets", () => {
    expect(canViewTicket(employee, ownTicket)).toBe(true);
    expect(canViewTicket(employee, otherAssigned)).toBe(false);
    expect(ticketListFilter(employee)).toEqual({ requesterId: "e1" });
  });

  it("lets agents see unassigned tickets and their own queue", () => {
    expect(canViewTicket(agent, ownTicket)).toBe(true);
    expect(canViewTicket(agent, assignedTicket)).toBe(true);
    expect(canViewTicket(agent, otherAssigned)).toBe(false);
  });

  it("lets managers see every ticket", () => {
    expect(canViewTicket(manager, otherAssigned)).toBe(true);
    expect(ticketListFilter(manager)).toEqual({});
  });
});

describe("assignment and updates", () => {
  it("allows an agent to claim an unassigned ticket", () => {
    expect(canAssignSelf(agent, ownTicket)).toBe(true);
    expect(canAssignSelf(agent, otherAssigned)).toBe(false);
    expect(canAssignSelf(employee, ownTicket)).toBe(false);
  });

  it("allows agents to update only tickets assigned to them", () => {
    expect(canUpdateTicketFields(agent, assignedTicket)).toBe(true);
    expect(canUpdateTicketFields(agent, ownTicket)).toBe(false);
    expect(canUpdateTicketFields(otherAgent, assignedTicket)).toBe(false);
    expect(canUpdateTicketFields(employee, ownTicket)).toBe(false);
    expect(canUpdateTicketFields(manager, otherAssigned)).toBe(true);
  });

  it("allows comments from anyone who can view the ticket", () => {
    expect(canComment(employee, ownTicket)).toBe(true);
    expect(canComment(otherEmployee, ownTicket)).toBe(false);
    expect(canComment(agent, ownTicket)).toBe(true);
  });
});

describe("status workflow", () => {
  it("blocks employees from changing status", () => {
    expect(isAllowedStatusChange("EMPLOYEE", "OPEN", "IN_PROGRESS")).toBe(false);
  });

  it("enforces agent transitions", () => {
    expect(isAllowedStatusChange("AGENT", "OPEN", "IN_PROGRESS")).toBe(true);
    expect(isAllowedStatusChange("AGENT", "OPEN", "CLOSED")).toBe(false);
    expect(isAllowedStatusChange("AGENT", "IN_PROGRESS", "RESOLVED")).toBe(true);
    expect(isAllowedStatusChange("AGENT", "CLOSED", "OPEN")).toBe(false);
  });

  it("lets managers override status", () => {
    expect(isAllowedStatusChange("MANAGER", "CLOSED", "OPEN")).toBe(true);
    expect(isAllowedStatusChange("MANAGER", "OPEN", "RESOLVED")).toBe(true);
  });
});
