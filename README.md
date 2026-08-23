# HelpDesk Lite

HelpDesk Lite is a frontend-only help desk workspace. Agents can submit tickets, manage a Kanban or list queue, assign work, and review live dashboard statistics. It is built to feel like a small SaaS product without a backend, frameworks, or a build step.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- JSON seed data
- Browser `localStorage`

No npm, Node.js, databases, or UI libraries are used.

## Project structure

```text
helpdesk-lite/
├── index.html          Submit a ticket
├── tickets.html        Kanban and list management
├── dashboard.html      Manager dashboard
├── css/style.css       Design system and layout
├── js/app.js           Shared UI, toasts, submit form
├── js/storage.js       Seed load and localStorage persistence
├── js/tickets.js       Search, filters, views, assignment
├── js/dashboard.js     Dynamic statistics
├── data/tickets.json   Initial ticket dataset
└── README.md
```

## How to run

Do not use npm. Open the files through a simple static server so the browser can load `data/tickets.json`.

From this folder:

```bash
python3 -m http.server
```

Then visit:

- http://localhost:8000/index.html
- http://localhost:8000/tickets.html
- http://localhost:8000/dashboard.html

Opening the HTML files directly (`file://`) often blocks `fetch` for JSON. If that happens, use the command above.

To start over, clear site data for localhost or remove the `helpdesk-lite-tickets` key from Application → Local Storage.

## How the JSON data works

`data/tickets.json` is the initial dataset only. It contains 18 realistic tickets across Technical, HR, Billing, and General, covering every priority and status.

The browser cannot write back to that file. After first load, the JSON file is not the source of truth.

## How localStorage persistence works

```text
tickets.json  →  JavaScript  →  localStorage  →  UI
```

1. On first visit, the app fetches `tickets.json` and saves the array to `localStorage`.
2. Later visits read from `localStorage`.
3. Creating, assigning, unassigning, changing status, or deleting a ticket updates `localStorage` immediately.

Refresh the page: your changes remain.

## Pages

| Page | File | Purpose |
| --- | --- | --- |
| Submit Ticket | `index.html` | Create a new request |
| Tickets | `tickets.html` | Search, filter, sort, Kanban, list |
| Dashboard | `dashboard.html` | KPIs and analytics from current data |

## Main features

- Validated ticket form (title, description, category, priority, email)
- Unique ticket IDs, `TO_DO` status, unassigned on create
- Kanban columns: To Do, In Progress, In Review, Done
- List/table view with a mobile card layout
- Live search across title, description, email, and ID
- Combined filters for status, priority, category, and assignment
- Sort by newest, oldest, highest priority, lowest priority
- Assign to the current agent (`Support Agent`) and unassign
- Status updates without a page reload
- Toast notifications instead of `alert()`
- Dashboard KPIs and breakdowns calculated from stored tickets
- High/Urgent alerts for open tickets
- Empty states, loading skeletons, and user-friendly error messages
- Responsive sidebar and layouts for desktop, tablet, and mobile
