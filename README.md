# 🎧 HelpDesk Lite

A modern, full-stack ticketing and issue management platform built with **React**, **TypeScript**, **Express**, and **Prisma ORM**. Features complete role-based workflows for **Employees**, **Support Agents**, and **Managers**.

---

## 🚀 Key Features

- **Role-Based Authentication:** Dynamic routing and state persistence using JWT and AuthContext (`EMPLOYEE`, `AGENT`, `MANAGER`).
- **Ticket Lifecycle Management:** Full CRUD operations and state progression (`OPEN`, `IN_PROGRESS`, `PENDING`, `RESOLVED`, `CLOSED`).
- **Audit Logging:** Automatic history logging for ticket actions (creations, assignments, status updates).
- **Interactive Dashboards:** Custom views and metrics filtered dynamically per user role.
- **Form Validation & Safety:** Zod schema validation on backend endpoints and full type safety with TypeScript.

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** React.js with TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **Routing & State:** React Router DOM & React Context API
- **HTTP Client:** Axios (Centralized API instance with Interceptors)

### Backend

- **Runtime:** Node.js & Express.js
- **Database & ORM:** PostgreSQL / SQLite with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens) & `bcryptjs`
- **Validation:** Zod

---

## 📁 Project Structure

```text
helpdesk-lite/
├── backend/
│   ├── prisma/          # Database schema & seed data
│   ├── src/
│   │   ├── controllers/ # Auth & Ticket business logic
│   │   ├── services/    # Prisma queries
│   │   ├── validators/  # Zod schemas
│   │   └── server.ts    # Express App Entrypoint
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── context/     # AuthContext & Session management
    │   ├── pages/       # Login, Employee, Agent & Manager views
    │   ├── services/    # Axios API integrations
    │   └── App.tsx      # Protected Routes & Layouts
    └── .env
```
