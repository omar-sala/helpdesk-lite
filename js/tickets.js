(() => {
  const VIEW_KEY = "helpdesk-lite-view";
  let currentView = localStorage.getItem(VIEW_KEY) || "kanban";
  let initialized = false;

  const state = {
    query: "",
    status: "ALL",
    priority: "ALL",
    category: "ALL",
    assignment: "ALL",
    sort: "newest",
  };

  function priorityRank(priority) {
    return HelpDesk.PRIORITY_ORDER.indexOf(priority);
  }

  function matches(ticket) {
    const haystack = [ticket.title, ticket.description, ticket.requesterEmail, ticket.id]
      .join(" ")
      .toLowerCase();
    const query = state.query.trim().toLowerCase();
    if (query && !haystack.includes(query)) return false;
    if (state.status !== "ALL" && ticket.status !== state.status) return false;
    if (state.priority !== "ALL" && ticket.priority !== state.priority) return false;
    if (state.category !== "ALL" && ticket.category !== state.category) return false;
    if (state.assignment === "ASSIGNED" && !ticket.assignedTo) return false;
    if (state.assignment === "UNASSIGNED" && ticket.assignedTo) return false;
    return true;
  }

  function sortTickets(tickets) {
    const copy = [...tickets];
    copy.sort((a, b) => {
      if (state.sort === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (state.sort === "highest") {
        return priorityRank(b.priority) - priorityRank(a.priority) || new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (state.sort === "lowest") {
        return priorityRank(a.priority) - priorityRank(b.priority) || new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return copy;
  }

  function filteredTickets() {
    return sortTickets(TicketStore.getTickets().filter(matches));
  }

  function emptyHtml(allCount) {
    if (!allCount) {
      return `<div class="empty card card-pad">
        <h3>No tickets yet</h3>
        <p>Create your first support ticket to get started.</p>
        <p><a href="index.html">Submit a ticket</a></p>
      </div>`;
    }
    return `<div class="empty card card-pad">
      <h3>No tickets found</h3>
      <p>Try changing your filters or search query.</p>
    </div>`;
  }

  function cardHtml(ticket) {
    return `
      <article class="ticket-card" data-open-ticket="${HelpDesk.escapeHtml(ticket.id)}" tabindex="0" role="button">
        <h4>${HelpDesk.escapeHtml(ticket.title)}</h4>
        <p>${HelpDesk.escapeHtml(HelpDesk.truncate(ticket.description))}</p>
        <div class="meta-row">
          <span class="badge cat-badge">${HelpDesk.escapeHtml(ticket.category)}</span>
          <span class="badge priority-${ticket.priority}">${HelpDesk.PRIORITY_LABELS[ticket.priority]}</span>
          <span class="badge status-${ticket.status}">${HelpDesk.STATUS_LABELS[ticket.status]}</span>
        </div>
        <div class="tiny">${HelpDesk.escapeHtml(ticket.requesterEmail)}</div>
        <div class="tiny">${ticket.assignedTo ? HelpDesk.escapeHtml(ticket.assignedTo) : "Unassigned"} · ${HelpDesk.formatDate(ticket.createdAt)}</div>
        <div class="card-actions" data-stop>
          ${HelpDesk.statusSelect(ticket)}
          ${HelpDesk.assignButton(ticket)}
        </div>
      </article>`;
  }

  function renderKanban(tickets, allCount) {
    const board = document.getElementById("kanban");
    if (!tickets.length) {
      board.innerHTML = emptyHtml(allCount);
      return;
    }
    board.innerHTML = HelpDesk.STATUS_ORDER.map((status) => {
      const column = tickets.filter((ticket) => ticket.status === status);
      return `
        <section class="kanban-col" aria-label="${HelpDesk.STATUS_LABELS[status]}">
          <div class="kanban-head">
            <h3>${HelpDesk.STATUS_LABELS[status]}</h3>
            <span class="count-pill">${column.length}</span>
          </div>
          <div class="kanban-body">
            ${
              column.length
                ? column.map(cardHtml).join("")
                : `<div class="empty" style="padding:24px 8px"><p>No tickets in this column.</p></div>`
            }
          </div>
        </section>`;
    }).join("");
  }

  function renderList(tickets, allCount) {
    const tableWrap = document.getElementById("list-table");
    const mobile = document.getElementById("list-mobile");
    if (!tickets.length) {
      const empty = emptyHtml(allCount);
      tableWrap.innerHTML = empty;
      mobile.innerHTML = "";
      return;
    }

    tableWrap.innerHTML = `
      <div class="table-wrap desktop-table">
        <table class="data">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Requester</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${tickets
              .map(
                (ticket) => `
              <tr>
                <td class="id-cell">${HelpDesk.escapeHtml(ticket.id)}</td>
                <td><button type="button" class="btn btn-ghost btn-sm" data-open-ticket="${HelpDesk.escapeHtml(ticket.id)}">${HelpDesk.escapeHtml(ticket.title)}</button></td>
                <td>${HelpDesk.escapeHtml(ticket.category)}</td>
                <td><span class="badge priority-${ticket.priority}">${HelpDesk.PRIORITY_LABELS[ticket.priority]}</span></td>
                <td><span class="badge status-${ticket.status}">${HelpDesk.STATUS_LABELS[ticket.status]}</span></td>
                <td>${HelpDesk.escapeHtml(ticket.assignedTo || "Unassigned")}</td>
                <td>${HelpDesk.escapeHtml(ticket.requesterEmail)}</td>
                <td>${HelpDesk.formatDate(ticket.createdAt)}</td>
                <td>
                  <div class="card-actions">
                    ${HelpDesk.statusSelect(ticket)}
                    ${HelpDesk.assignButton(ticket)}
                  </div>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;

    mobile.innerHTML = tickets.map(cardHtml).join("");
  }

  function setView(view) {
    currentView = view;
    localStorage.setItem(VIEW_KEY, view);
    document.getElementById("view-kanban").classList.toggle("is-active", view === "kanban");
    document.getElementById("view-list").classList.toggle("is-active", view === "list");
    document.getElementById("kanban-wrap").hidden = view !== "kanban";
    document.getElementById("list-wrap").hidden = view !== "list";
    document.getElementById("view-kanban").setAttribute("aria-pressed", String(view === "kanban"));
    document.getElementById("view-list").setAttribute("aria-pressed", String(view === "list"));
  }

  function render() {
    const all = TicketStore.getTickets();
    const tickets = filteredTickets();
    document.getElementById("result-count").textContent = `${tickets.length} of ${all.length} tickets`;
    renderKanban(tickets, all.length);
    renderList(tickets, all.length);
    HelpDesk.renderNotifications();
  }

  function bind() {
    document.getElementById("search").addEventListener("input", (event) => {
      state.query = event.target.value;
      render();
    });
    document.getElementById("filter-status").addEventListener("change", (event) => {
      state.status = event.target.value;
      render();
    });
    document.getElementById("filter-priority").addEventListener("change", (event) => {
      state.priority = event.target.value;
      render();
    });
    document.getElementById("filter-category").addEventListener("change", (event) => {
      state.category = event.target.value;
      render();
    });
    document.getElementById("filter-assignment").addEventListener("change", (event) => {
      state.assignment = event.target.value;
      render();
    });
    document.getElementById("sort").addEventListener("change", (event) => {
      state.sort = event.target.value;
      render();
    });
    document.getElementById("view-kanban").addEventListener("click", () => {
      setView("kanban");
    });
    document.getElementById("view-list").addEventListener("click", () => {
      setView("list");
    });
    window.addEventListener("tickets:changed", render);
  }

  async function start() {
    HelpDesk.initLayout({
      page: "tickets",
      title: "Tickets",
      description: "Search, filter, assign, and move tickets through the queue.",
    });
    document.getElementById("skeleton").hidden = false;
    try {
      await TicketStore.init();
    } catch {
      HelpDesk.toast("Tickets could not be loaded.", "error");
    }
    document.getElementById("skeleton").hidden = true;
    setView(currentView);
    render();
    if (!initialized) {
      bind();
      initialized = true;
    }
  }

  document.addEventListener("DOMContentLoaded", start);
})();
