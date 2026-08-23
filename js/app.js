const HelpDesk = (() => {
  const AGENT_NAME = "Support Agent";
  const AGENT_INITIALS = "SA";

  const STATUS_ORDER = ["TO_DO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
  const PRIORITY_ORDER = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  const STATUS_LABELS = {
    TO_DO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    DONE: "Done",
  };

  const PRIORITY_LABELS = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
  };

  const CATEGORIES = ["Technical", "HR", "Billing", "General"];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  function formatDateTime(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function truncate(text, max = 90) {
    const value = String(text || "").trim();
    if (value.length <= max) return value;
    return `${value.slice(0, max - 1)}…`;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  function toast(message, type = "success") {
    const stack = document.getElementById("toast-stack");
    if (!stack) return;
    const item = document.createElement("div");
    item.className = `toast ${type}`;
    item.setAttribute("role", "status");
    item.textContent = message;
    stack.appendChild(item);
    window.setTimeout(() => {
      item.remove();
    }, 3200);
  }

  function setFieldError(field, message) {
    const wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("is-invalid", Boolean(message));
    const error = wrap.querySelector(".error-text");
    if (error) error.textContent = message || "";
  }

  function clearFieldErrors(form) {
    form.querySelectorAll(".field").forEach((field) => {
      field.classList.remove("is-invalid");
      const error = field.querySelector(".error-text");
      if (error) error.textContent = "";
    });
  }

  function svg(name) {
    const icons = {
      dashboard:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 13h7V4H4v9Zm9 7h7V4h-7v16ZM4 20h7v-5H4v5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
      tickets:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V8Z" stroke="currentColor" stroke-width="1.7"/><path d="M9 8v10M15 8v10" stroke="currentColor" stroke-width="1.7"/></svg>',
      submit:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      bell:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" stroke="currentColor" stroke-width="1.7"/><path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      menu:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    };
    return icons[name] || "";
  }

  function statusSelect(ticket) {
    const options = STATUS_ORDER.map(
      (status) =>
        `<option value="${status}" ${status === ticket.status ? "selected" : ""}>${STATUS_LABELS[status]}</option>`
    ).join("");
    return `<select class="status-select" data-ticket-id="${escapeHtml(ticket.id)}" aria-label="Change status for ${escapeHtml(ticket.id)}">${options}</select>`;
  }

  function assignButton(ticket) {
    const assigned = ticket.assignedTo === AGENT_NAME;
    if (assigned) {
      return `<button type="button" class="btn btn-sm btn-ghost unassign-btn" data-id="${escapeHtml(ticket.id)}" aria-label="Unassign ticket">Assigned to Me</button>`;
    }
    return `<button type="button" class="btn btn-sm btn-primary assign-btn" data-id="${escapeHtml(ticket.id)}">Assign to Me</button>`;
  }

  function initLayout({ page, title, description }) {
    document.documentElement.classList.add("js");
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const toggle = document.getElementById("menu-toggle");

    document.querySelectorAll(".nav-link").forEach((link) => {
      if (link.dataset.page === page) link.classList.add("is-active");
    });

    const titleEl = document.getElementById("page-title");
    const descEl = document.getElementById("page-desc");
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = description;

    const closeSidebar = () => {
      sidebar?.classList.remove("is-open");
      backdrop?.classList.remove("is-open");
    };

    toggle?.addEventListener("click", () => {
      sidebar?.classList.toggle("is-open");
      backdrop?.classList.toggle("is-open");
    });
    backdrop?.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSidebar();
        closeModal();
        document.getElementById("notice-panel")?.classList.remove("is-open");
      }
    });

    renderNotifications();
    const bell = document.getElementById("notice-btn");
    const panel = document.getElementById("notice-panel");
    bell?.addEventListener("click", (event) => {
      event.stopPropagation();
      panel?.classList.toggle("is-open");
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".notice-wrap")) {
        panel?.classList.remove("is-open");
      }
    });
  }

  function alertTickets() {
    return TicketStore.getTickets().filter(
      (ticket) =>
        (ticket.priority === "HIGH" || ticket.priority === "URGENT") &&
        ticket.status !== "DONE"
    );
  }

  function renderNotifications() {
    const alerts = alertTickets();
    const count = document.getElementById("notice-count");
    const panel = document.getElementById("notice-panel");
    if (count) {
      count.hidden = alerts.length === 0;
      count.textContent = String(alerts.length);
    }
    if (!panel) return;
    if (!alerts.length) {
      panel.innerHTML = `<div class="empty" style="padding:20px"><strong>No priority alerts</strong><p class="muted">High and urgent open tickets will appear here.</p></div>`;
      return;
    }
    panel.innerHTML = alerts
      .slice(0, 6)
      .map(
        (ticket) => `
        <button type="button" class="notice-item" data-open-ticket="${escapeHtml(ticket.id)}">
          <strong>${escapeHtml(ticket.title)}</strong>
          <div class="tiny">${escapeHtml(ticket.id)} · ${PRIORITY_LABELS[ticket.priority]} · ${STATUS_LABELS[ticket.status]}</div>
        </button>`
      )
      .join("");
  }

  function openModal(html) {
    const overlay = document.getElementById("modal-overlay");
    const modal = document.getElementById("modal");
    if (!overlay || !modal) return;
    modal.innerHTML = html;
    overlay.classList.add("is-open");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    const closeBtn = modal.querySelector("[data-close-modal]");
    closeBtn?.focus();
  }

  function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    const modal = document.getElementById("modal");
    overlay?.classList.remove("is-open");
    modal?.classList.remove("is-open");
    modal?.setAttribute("aria-hidden", "true");
  }

  function bindModalChrome() {
    document.getElementById("modal-overlay")?.addEventListener("click", closeModal);
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-modal]")) closeModal();
    });
  }

  function initSubmitForm() {
    const form = document.getElementById("ticket-form");
    if (!form || typeof TicketStore === "undefined") return;

    TicketStore.init()
      .then(() => renderNotifications())
      .catch(() => toast("Existing tickets could not be loaded.", "error"));

    const PRIORITY_MAP = {
      Low: "LOW",
      Medium: "MEDIUM",
      High: "HIGH",
      Urgent: "URGENT",
    };

    const titleCount = document.getElementById("title-count");
    const descCount = document.getElementById("desc-count");

    function updateCounters() {
      if (titleCount) titleCount.textContent = `${form.title.value.length}/100`;
      if (descCount) descCount.textContent = `${form.description.value.length}/2000`;
    }

    function validate() {
      clearFieldErrors(form);
      let valid = true;
      const title = form.title.value.trim();
      const description = form.description.value.trim();
      const category = form.category.value;
      const priority = form.priority.value;
      const email = form.email.value.trim();

      if (title.length < 5 || title.length > 100) {
        setFieldError(form.title, "Title must be between 5 and 100 characters.");
        valid = false;
      }
      if (description.length < 10 || description.length > 2000) {
        setFieldError(form.description, "Description must be between 10 and 2000 characters.");
        valid = false;
      }
      if (!CATEGORIES.includes(category)) {
        setFieldError(form.category, "Choose a category.");
        valid = false;
      }
      if (!PRIORITY_MAP[priority]) {
        setFieldError(form.priority, "Choose a priority.");
        valid = false;
      }
      if (!isValidEmail(email)) {
        setFieldError(form.email, "Enter a valid email address.");
        valid = false;
      }
      return valid;
    }

    updateCounters();
    form.title.addEventListener("input", updateCounters);
    form.description.addEventListener("input", updateCounters);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validate()) {
        toast("Please correct the highlighted fields.", "error");
        return;
      }

      const now = new Date().toISOString();
      const ticket = {
        id: TicketStore.nextId(),
        title: form.title.value.trim(),
        description: form.description.value.trim(),
        category: form.category.value,
        priority: PRIORITY_MAP[form.priority.value],
        status: "TO_DO",
        requesterEmail: form.email.value.trim(),
        assignedTo: null,
        createdAt: now,
        updatedAt: now,
      };

      if (!TicketStore.isTicket(ticket)) {
        toast("The ticket could not be created.", "error");
        return;
      }

      TicketStore.addTicket(ticket);
      toast(`Ticket ${ticket.id} created.`);
      form.reset();
      updateCounters();
      renderNotifications();
    });
  }

  function ticketDetailHtml(ticket) {
    return `
      <div class="modal-head">
        <div>
          <p class="tiny id-cell" style="margin:0">${escapeHtml(ticket.id)}</p>
          <h2 class="page-title" style="font-size:18px">${escapeHtml(ticket.title)}</h2>
        </div>
        <button type="button" class="icon-btn" data-close-modal aria-label="Close dialog">×</button>
      </div>
      <div class="modal-body">
        <div class="meta-row">
          <span class="badge status-${ticket.status}">${STATUS_LABELS[ticket.status]}</span>
          <span class="badge priority-${ticket.priority}">${PRIORITY_LABELS[ticket.priority]}</span>
          <span class="badge cat-badge">${escapeHtml(ticket.category)}</span>
        </div>
        <p>${escapeHtml(ticket.description)}</p>
        <p class="tiny">Requester: ${escapeHtml(ticket.requesterEmail)}</p>
        <p class="tiny">Assigned: ${escapeHtml(ticket.assignedTo || "Unassigned")}</p>
        <p class="tiny">Created ${formatDateTime(ticket.createdAt)} · Updated ${formatDateTime(ticket.updatedAt)}</p>
        <div class="card-actions" style="margin-top:16px">
          ${statusSelect(ticket)}
          ${assignButton(ticket)}
          <button type="button" class="btn btn-sm btn-danger delete-btn" data-id="${escapeHtml(ticket.id)}">Delete</button>
        </div>
      </div>
    `;
  }

  function findTicket(id) {
    if (typeof TicketStore === "undefined") return null;
    return TicketStore.getTickets().find((item) => item.id === id) || null;
  }

  function emitTicketsChanged(ticketId) {
    renderNotifications();
    window.dispatchEvent(new CustomEvent("tickets:changed", { detail: { ticketId } }));
  }

  function refreshOpenModal(ticketId) {
    const modal = document.getElementById("modal");
    if (!modal?.classList.contains("is-open") || !ticketId) return;
    const ticket = findTicket(ticketId);
    if (ticket) openModal(ticketDetailHtml(ticket));
  }

  function bindTicketActions() {
    document.body.addEventListener("change", (event) => {
      const select = event.target.closest(".status-select");
      if (!select?.dataset.ticketId || typeof TicketStore === "undefined") return;
      const updated = TicketStore.updateTicket(select.dataset.ticketId, { status: select.value });
      if (!updated) {
        toast("Could not update the ticket status.", "error");
        return;
      }
      toast("Ticket status updated.");
      emitTicketsChanged(updated.id);
      refreshOpenModal(updated.id);
    });

    document.body.addEventListener("click", (event) => {
      const assign = event.target.closest(".assign-btn");
      const unassign = event.target.closest(".unassign-btn");
      const del = event.target.closest(".delete-btn");

      if (assign || unassign) {
        const id = (assign || unassign).dataset.id;
        const updated = TicketStore.updateTicket(id, {
          assignedTo: assign ? AGENT_NAME : null,
        });
        if (!updated) {
          toast("Could not update assignment.", "error");
          return;
        }
        toast(assign ? "Ticket assigned to you." : "Ticket unassigned.");
        emitTicketsChanged(id);
        refreshOpenModal(id);
        return;
      }

      if (del) {
        TicketStore.removeTicket(del.dataset.id);
        closeModal();
        toast("Ticket deleted.");
        emitTicketsChanged(del.dataset.id);
        return;
      }

      if (event.target.closest("[data-stop]")) return;

      const open = event.target.closest("[data-open-ticket]");
      if (!open) return;
      const ticket = findTicket(open.dataset.openTicket);
      if (!ticket) {
        toast("That ticket could not be found.", "error");
        return;
      }
      openModal(ticketDetailHtml(ticket));
      document.getElementById("notice-panel")?.classList.remove("is-open");
    });

    document.body.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const card = event.target.closest(".ticket-card[data-open-ticket]");
      if (!card) return;
      event.preventDefault();
      const ticket = findTicket(card.dataset.openTicket);
      if (ticket) openModal(ticketDetailHtml(ticket));
    });
  }

  window.addEventListener("unhandledrejection", () => {
    toast("Something went wrong. Please try again.", "error");
  });

  document.addEventListener("DOMContentLoaded", () => {
    bindModalChrome();
    bindTicketActions();
    initSubmitForm();
  });

  return {
    AGENT_NAME,
    AGENT_INITIALS,
    STATUS_ORDER,
    PRIORITY_ORDER,
    STATUS_LABELS,
    PRIORITY_LABELS,
    CATEGORIES,
    escapeHtml,
    formatDate,
    formatDateTime,
    truncate,
    isValidEmail,
    toast,
    setFieldError,
    clearFieldErrors,
    svg,
    statusSelect,
    assignButton,
    initLayout,
    renderNotifications,
    openModal,
    closeModal,
    ticketDetailHtml,
    alertTickets,
  };
})();
