# HelpDesk Lite

HelpDesk Lite is a full-stack support-ticket application for handling internal help-desk requests. It provides separate, protected workflows for employees who submit requests, support agents who work tickets, and managers who oversee operations and user access.

The project consists of a React single-page application and an Express API backed by PostgreSQL through Prisma ORM.

## Features

- JWT-based authentication with role-based access control for `EMPLOYEE`, `AGENT`, and `MANAGER` users.
- Ticket creation, listing, detail views, field/status updates, assignment, and agent self-assignment.
- Ticket priorities, categories, and statuses: `OPEN`, `IN_PROGRESS`, `PENDING`, `RESOLVED`, and `CLOSED`.
- Ticket activity history for creation, comments, assignments, status changes, and priority changes.
- Role-scoped ticket visibility and manager-only user administration.
- Manager analytics for ticket totals, status and priority distributions, and agent workloads.
- Backend request validation with Zod, password hashing with bcryptjs, rate limiting on authentication endpoints, Helmet security headers, and CORS configuration.

## Role-based workflows

### Employee

- Register through the API; self-registration always creates an `EMPLOYEE` account.
- Create support tickets with a title, description, category, and priority.
- View and comment on only their own tickets.
- Cannot assign tickets or change ticket fields or statuses.

### Support agent

- View unassigned tickets and tickets assigned to them.
- Claim an unassigned ticket; claiming an open ticket changes it to `IN_PROGRESS`.
- Comment on tickets visible to them.
- Update fields and status only on tickets assigned to them.
- Follow the agent status workflow: `OPEN → IN_PROGRESS`; `IN_PROGRESS → PENDING` or `RESOLVED`; `PENDING → IN_PROGRESS` or `RESOLVED`; and `RESOLVED → CLOSED` or `IN_PROGRESS`.

### Manager

- View and comment on all tickets.
- Assign tickets to active support agents and update any ticket field or status.
- View operational counts, distributions, and agent workload metrics.
- List users, change another user's role, and activate or deactivate another user's account. Managers cannot deactivate themselves or change their own role.

## Authentication and authorization

The API issues a signed JWT after registration or login. The frontend stores the token and user profile in browser local storage, and Axios sends the token as a `Bearer` authorization header for API requests. Protected frontend routes direct users to their role-specific areas, while the API independently enforces authentication and authorization for every protected endpoint.

Passwords are hashed with bcryptjs. Inactive accounts cannot authenticate or use protected API routes. Login and registration are limited to 20 requests per 15-minute window. The logout endpoint confirms sign-out, but JWTs are not revoked server-side; the frontend logout flow removes local session data.

## Tech stack

### Frontend

- React 19 and TypeScript
- Vite
- React Router
- React Context for session state
- Axios
- Tailwind CSS and Lucide React icons

### Backend

- Node.js, Express 5, and TypeScript
- PostgreSQL
- Prisma ORM
- JSON Web Tokens and bcryptjs
- Zod
- Helmet, CORS, and express-rate-limit
- Vitest and Supertest

## Architecture

The React client uses role-protected routes and an `AuthContext` for session state. Its centralized Axios instance adds the stored bearer token and clears local session data after a `401` response.

The Express API is organized into routes, controllers, services, middleware, and validators. Controllers validate input and delegate to service-layer Prisma queries. Authentication middleware verifies tokens and reloads the user to enforce account activity and current roles. Role and ticket-level access rules are centralized in the RBAC service.

The API supports ticket pagination and filters for search, status, priority, category, and assignee. The current frontend ticket list loads up to 50 role-visible tickets; it does not provide UI controls for those filters or pagination.

## API overview

All API endpoints are prefixed with `/api`.

| Area | Endpoints | Access |
| --- | --- | --- |
| Health | `GET /health` | Public |
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` | Register/login public; `me` and logout authenticated |
| Tickets | `GET/POST /tickets`, `GET/PATCH /tickets/:id`, `GET /tickets/summary` | Authenticated; ticket access is role-scoped |
| Ticket actions | `POST /tickets/:id/assign-self`, `POST /tickets/:id/assign`, `GET/POST /tickets/:id/activities` | Agent-only self-assignment; manager-only assignment; activities follow ticket visibility rules |
| Users | `GET /users/agents`, `GET /users`, `PATCH /users/:id` | Agents/managers can list active agents; managers manage users |
| Analytics | `GET /analytics/overview`, `/status`, `/priority`, `/agents` | Manager only |

`GET /tickets` accepts `page`, `limit` (maximum 50), `search`, `status`, `priority`, `category`, and `assigneeId`. Use `assigneeId=unassigned` to return unassigned tickets when the caller's role permits access.

There is no ticket-delete endpoint.

## Database and Prisma

Prisma is configured for **PostgreSQL**. SQLite is not supported by the current schema.

The schema defines:

- `User`: profile, unique email, password hash, role, and active state.
- `Ticket`: requester, optional assignee, title, description, category, priority, status, timestamps, and optional resolution timestamp.
- `TicketActivity`: activity records linked to a ticket and user.

Prisma migrations live in `backend/prisma/migrations`. Useful backend workspace commands are:

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
npm run prisma:deploy --workspace backend
npm run prisma:seed --workspace backend
```

### Important seed warning

The seed script deletes **all** ticket activities, tickets, and users before inserting demo data. Do not run it against a database containing data you need to keep.

All seeded demo users use the password `Password123!`.

## Local development

### Prerequisites

- Node.js and npm
- A reachable PostgreSQL database

### Setup

1. Install workspace dependencies:

   ```bash
   npm install
   ```

2. Create local environment files from the provided templates:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Set `DATABASE_URL` and `JWT_SECRET` in `backend/.env`, then apply database migrations:

   ```bash
   npm run prisma:migrate --workspace backend
   ```

4. Optionally load the destructive demo seed data:

   ```bash
   npm run prisma:seed --workspace backend
   ```

5. Start the API and frontend in separate terminals:

   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

The API defaults to `http://localhost:4000`, and the Vite frontend defaults to `http://localhost:5173`.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs. Use a long, random production value. |
| `JWT_EXPIRES_IN` | No | JWT lifetime; the template uses `7d`. |
| `CLIENT_URL` | No | Allowed CORS origin(s), comma-separated. Defaults to `http://localhost:5173`. |
| `PORT` | No | API port; defaults to `4000`. |
| `NODE_ENV` | No | Runtime environment label. |

### Frontend (`frontend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | No | API base URL. It defaults to `http://localhost:4000/api`. |

## Testing

Run the current test suite from the repository root:

```bash
npm test
```

Tests are implemented for the backend with Vitest and Supertest. They cover API health/authentication guards and RBAC helper rules. The project does not currently include frontend, end-to-end, or database-integration tests.

## Build and quality commands

```bash
# Build backend and frontend
npm run build

# Run backend tests
npm test

# Lint the frontend
npm run lint --workspace frontend

# Build or preview individual workspaces
npm run build --workspace backend
npm run build --workspace frontend
npm run preview --workspace frontend
```

## Deployment requirements

- Provision a PostgreSQL database and set `DATABASE_URL` in the backend environment.
- Set a strong, unique `JWT_SECRET` and configure `CLIENT_URL` with the deployed frontend origin or origins.
- Set `VITE_API_URL` at frontend build time to the deployed API base URL, including `/api`.
- Run Prisma migrations in the target environment with `npm run prisma:deploy --workspace backend`.
- Deploy the backend to a Node.js-compatible runtime. The repository includes a Vercel API entry point and rewrite configuration under `backend/`.
- Deploy the frontend as a Vite static build. No frontend hosting configuration or deployment URL is included in this repository.

## Project structure

```text
helpdesk-lite/
├── backend/
│   ├── api/                 # Serverless API entry point
│   ├── prisma/              # PostgreSQL schema, migrations, and destructive seed script
│   ├── src/
│   │   ├── controllers/     # Auth, ticket, user, and analytics handlers
│   │   ├── middleware/      # Authentication and error handling
│   │   ├── routes/          # Express API routes
│   │   ├── services/        # Prisma queries, analytics, auth, and RBAC rules
│   │   ├── validators/      # Zod request schemas
│   │   ├── app.ts           # Express app configuration
│   │   └── server.ts        # Local API entry point
│   └── vercel.json          # Backend Vercel rewrite
├── frontend/
│   ├── src/
│   │   ├── components/      # Shared layout, route guard, and ticket UI
│   │   ├── context/         # Authentication session state
│   │   ├── pages/           # Employee, agent, manager, and shared views
│   │   ├── services/        # Axios API clients
│   │   └── App.tsx          # Application routes
│   └── vite.config.ts
├── package.json             # npm workspace scripts
└── README.md
```
