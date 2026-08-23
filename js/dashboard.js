(() => {
  function meter(label, count, total, fillClass) {
    const percent = total ? Math.round((count / total) * 100) : 0;
    return `
      <div class="meter-row">
        <span class="meter-label">${HelpDesk.escapeHtml(label)}</span>
        <div class="meter-track" aria-hidden="true">
          <div class="meter-fill ${fillClass}" style="width:${percent}%"></div>
        </div>
        <span>${count}</span>
      </div>`;
  }

  function render() {
    const tickets = TicketStore.getTickets();
    const total = tickets.length;
    const open = tickets.filter((ticket) => ticket.status !== "DONE").length;
    const resolved = tickets.filter((ticket) => ticket.status === "DONE").length;
    const urgent = tickets.filter((ticket) => ticket.priority === "URGENT").length;

    document.getElementById("kpi-total").textContent = String(total);
    document.getElementById("kpi-open").textContent = String(open);
    document.getElementById("kpi-resolved").textContent = String(resolved);
    document.getElementById("kpi-urgent").textContent = String(urgent);

    const byStatus = Object.fromEntries(HelpDesk.STATUS_ORDER.map((status) => [status, 0]));
    const byPriority = Object.fromEntries(HelpDesk.PRIORITY_ORDER.map((priority) => [priority, 0]));
    const byCategory = Object.fromEntries(HelpDesk.CATEGORIES.map((category) => [category, 0]));

    tickets.forEach((ticket) => {
      byStatus[ticket.status] += 1;
      byPriority[ticket.priority] += 1;
      byCategory[ticket.category] += 1;
    });

    document.getElementById("status-meters").innerHTML = [
      meter("To Do", byStatus.TO_DO, total, "todo"),
      meter("In Progress", byStatus.IN_PROGRESS, total, "progress"),
      meter("In Review", byStatus.IN_REVIEW, total, "review"),
      meter("Done", byStatus.DONE, total, "done"),
    ].join("");

    document.getElementById("priority-meters").innerHTML = [
      meter("Low", byPriority.LOW, total, "low"),
      meter("Medium", byPriority.MEDIUM, total, "medium"),
      meter("High", byPriority.HIGH, total, "high"),
      meter("Urgent", byPriority.URGENT, total, "urgent"),
    ].join("");

    document.getElementById("category-meters").innerHTML = [
      meter("Technical", byCategory.Technical, total, "technical"),
      meter("HR", byCategory.HR, total, "hr"),
      meter("Billing", byCategory.Billing, total, "billing"),
      meter("General", byCategory.General, total, "general"),
    ].join("");

    const alerts = HelpDesk.alertTickets().sort(
      (a, b) => HelpDesk.PRIORITY_ORDER.indexOf(b.priority) - HelpDesk.PRIORITY_ORDER.indexOf(a.priority)
    );
    const alertsEl = document.getElementById("priority-alerts");
    if (!alerts.length) {
      alertsEl.innerHTML = `<div class="empty"><h3>No high-priority alerts</h3><p>Open High and Urgent tickets will appear here.</p></div>`;
    } else {
      alertsEl.innerHTML = alerts
        .map(
          (ticket) => `
          <button type="button" class="alert-item" data-open-ticket="${HelpDesk.escapeHtml(ticket.id)}">
            <div>
              <strong>${HelpDesk.escapeHtml(ticket.title)}</strong>
              <div class="tiny">${HelpDesk.escapeHtml(ticket.id)} · ${HelpDesk.escapeHtml(ticket.requesterEmail)}</div>
              <div class="tiny">Assigned: ${HelpDesk.escapeHtml(ticket.assignedTo || "Unassigned")}</div>
            </div>
            <div class="meta-row" style="justify-content:flex-end">
              <span class="badge priority-${ticket.priority}">${HelpDesk.PRIORITY_LABELS[ticket.priority]}</span>
              <span class="badge status-${ticket.status}">${HelpDesk.STATUS_LABELS[ticket.status]}</span>
            </div>
          </button>`
        )
        .join("");
    }

    HelpDesk.renderNotifications();
  }

  async function start() {
    HelpDesk.initLayout({
      page: "dashboard",
      title: "Dashboard",
      description: "Live queue health calculated from current ticket data.",
    });
    document.getElementById("dashboard-skeleton").hidden = false;
    try {
      await TicketStore.init();
    } catch {
      HelpDesk.toast("Dashboard data could not be loaded.", "error");
    }
    document.getElementById("dashboard-skeleton").hidden = true;
    document.getElementById("dashboard-body").hidden = false;
    render();
    window.addEventListener("tickets:changed", render);
  }

  document.addEventListener("DOMContentLoaded", start);
})();
