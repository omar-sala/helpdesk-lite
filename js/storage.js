const TicketStore = (() => {
  const STORAGE_KEY = "helpdesk-lite-tickets";
  const SEED_URL = "data/tickets.json";

  const FALLBACK_TICKETS = [
    {
      id: "HD-1001",
      title: "VPN connection drops during peak hours",
      description:
        "Several employees in the London office lose VPN connectivity between 09:00 and 11:00. The client shows a TLS handshake timeout.",
      category: "Technical",
      priority: "HIGH",
      status: "IN_PROGRESS",
      requesterEmail: "priya.nair@northwind.io",
      assignedTo: "Support Agent",
      createdAt: "2026-08-12T08:14:00.000Z",
      updatedAt: "2026-08-18T15:22:00.000Z",
    },
  ];

  const STATUSES = new Set(["TO_DO", "IN_PROGRESS", "IN_REVIEW", "DONE"]);
  const PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);
  const CATEGORIES = new Set(["Technical", "HR", "Billing", "General"]);

  function isTicket(value) {
    if (!value || typeof value !== "object") return false;
    return (
      typeof value.id === "string" &&
      typeof value.title === "string" &&
      typeof value.description === "string" &&
      CATEGORIES.has(value.category) &&
      PRIORITIES.has(value.priority) &&
      STATUSES.has(value.status) &&
      typeof value.requesterEmail === "string" &&
      (value.assignedTo === null || typeof value.assignedTo === "string") &&
      typeof value.createdAt === "string" &&
      typeof value.updatedAt === "string"
    );
  }

  function sanitize(list) {
    if (!Array.isArray(list)) return [];
    return list.filter(isTicket);
  }

  function readRaw() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return sanitize(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  function saveTickets(tickets) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
      return true;
    } catch {
      HelpDesk.toast("Could not save tickets on this device.", "error");
      return false;
    }
  }

  function getTickets() {
    return readRaw() || [];
  }

  async function loadSeed() {
    try {
      const response = await fetch(SEED_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("seed-unavailable");
      const data = await response.json();
      const tickets = sanitize(data);
      if (!tickets.length) throw new Error("invalid-seed");
      return tickets;
    } catch {
      HelpDesk.toast(
        "Could not load tickets.json. Using a local fallback. Serve the folder over HTTP if this persists.",
        "error"
      );
      return FALLBACK_TICKETS;
    }
  }

  async function init() {
    const existing = readRaw();
    if (existing) return existing;
    const seed = await loadSeed();
    saveTickets(seed);
    return seed;
  }

  function addTicket(ticket) {
    const tickets = getTickets();
    tickets.push(ticket);
    saveTickets(tickets);
    return ticket;
  }

  function updateTicket(id, updates) {
    const tickets = getTickets();
    const index = tickets.findIndex((item) => item.id === id);
    if (index === -1) return null;
    tickets[index] = {
      ...tickets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveTickets(tickets);
    return tickets[index];
  }

  function removeTicket(id) {
    const tickets = getTickets().filter((item) => item.id !== id);
    saveTickets(tickets);
  }

  function nextId() {
    const tickets = getTickets();
    const numbers = tickets.map((ticket) => {
      const match = /^HD-(\d+)$/.exec(ticket.id);
      return match ? Number(match[1]) : 1000;
    });
    const next = (numbers.length ? Math.max(...numbers) : 1000) + 1;
    return `HD-${String(next).padStart(4, "0")}`;
  }

  return {
    init,
    getTickets,
    saveTickets,
    addTicket,
    updateTicket,
    removeTicket,
    nextId,
    isTicket,
  };
})();
