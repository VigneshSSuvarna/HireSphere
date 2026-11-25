# HireSphere

Full-stack campus placement and career readiness platform built with React 19, Vite, Tailwind CSS v4, Express 5, Drizzle ORM, and Neon PostgreSQL.

## Overview

HireSphere streamlines campus recruitment across three roles:
- **Students**: Browse eligible placement drives, apply with automatic CGPA/department checks, track applications on a Kanban board, scan PDF resumes with a deterministic ATS scorer, and log DSA practice with daily streaks.
- **Placement Coordinators**: Create and manage placement drives, review applicants and update round statuses, filter the student database, and export student lists to CSV.
- **Administrators / Deans**: Monitor platform health & DB latency, view department-level placement rates, manage user roles and account activation, maintain the master event schedule, and inspect audit logs.

## Architecture

Monorepo managed via **npm workspaces**:
- `apps/web` — React 19 + TypeScript + Vite + Tailwind v4 (`dark` class theme) + React Router v7 + Zustand
- `apps/server` — Express 5 (ESM) + Drizzle ORM (`drizzle-orm/neon-http`) + Zod + Helmet + Rate Limiting + Multer + `pdf-parse`
- `packages/shared` (`@hiresphere/shared`) — Shared Zod validation schemas and TypeScript types imported by both apps

## Environment Variables

### `apps/server/.env` (see `apps/server/.env.example`)
| Variable | Description |
| --- | --- |
| `PORT` | Server port (default `5000`) |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs (server fails fast if missing) |
| `FRONTEND_URL` | Allowed CORS origin (e.g. `http://localhost:5173` or Vercel URL) |
| `ADMIN_SEED_EMAIL` | Initial admin email used by `npm run db:seed` |
| `ADMIN_SEED_PASSWORD` | Initial admin password used by `npm run db:seed` |

### `apps/web/.env` (see `apps/web/.env.example`)
| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the backend API (e.g. `http://localhost:5000`) |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure env files
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

# 3. Build shared package, push schema, and seed data
npm run build --workspace=@hiresphere/shared
npm run db:push
npm run db:seed

# 4. Start both dev servers
npm run dev
```

## Root Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Run Express server and Vite dev server concurrently |
| `npm run build` | Build `@hiresphere/shared`, `server`, and `web` |
| `npm run typecheck` | Run TypeScript typechecking across all workspaces |
| `npm run lint` | Run ESLint on `apps/web` |
| `npm run test` | Run Vitest unit/controller tests in `apps/server` |
| `npm run db:push` | Push Drizzle schema to Neon PostgreSQL |
| `npm run db:seed` | Seed admin, coordinators, students, companies, drives, applications, events |

## Role Matrix

| Capability | STUDENT | COORDINATOR | ADMIN |
| --- | :---: | :---: | :---: |
| Public registration (`POST /api/auth/register`) | Yes (forced) | — | — |
| Workspace, Drives Eligibility & Apply | Yes | — | — |
| Job Application Kanban & Resume ATS Scanner | Yes | — | — |
| DSA Practice Tracker & Streak | Yes | — | — |
| Manage Drives & Update Applicant Status | — | Yes | Yes |
| Student Database Search, Filter & CSV Export | — | Yes | Yes |
| Master Schedule Events CRUD | — | Yes | Yes |
| User Role / Activation & System Audit Logs | — | — | Yes |

## API Reference

| Method & Path | Auth / Role | Purpose |
| --- | --- | --- |
| `GET /api/health` | Public | Server & Neon DB latency check |
| `POST /api/auth/register` | Public (rate-limited) | Register a `STUDENT` account |
| `POST /api/auth/login` | Public (rate-limited) | Authenticate & issue JWT |
| `GET /api/auth/me` | Authenticated | Get current user |
| `GET/PUT /api/profile` | Authenticated | Read/update student profile |
| `GET /api/drives` | Authenticated | Open eligible drives (Student) or all drives (Coord/Admin) |
| `POST/PUT/DELETE /api/drives` | `COORDINATOR`, `ADMIN` | Manage placement drives |
| `GET/POST /api/companies` | Auth / `COORDINATOR`, `ADMIN` | List or create companies |
| `POST /api/drives/:id/apply` | `STUDENT` | Apply to an open eligible drive |
| `GET /api/applications/mine` | `STUDENT` | List own applications |
| `GET /api/drives/:id/applications` | `COORDINATOR`, `ADMIN` | List applicants for a drive |
| `PATCH /api/applications/:id` | `COORDINATOR`, `ADMIN` | Update application status (audited) |
| `GET /api/students` | `COORDINATOR`, `ADMIN` | Search, filter, paginate students |
| `GET /api/students/export.csv` | `COORDINATOR`, `ADMIN` | Export filtered students CSV |
| `POST /api/resume/scan` | Authenticated | Upload PDF (max 5MB) + optional JD for ATS score |
| `GET /api/resume/scans` | Authenticated | List past ATS scans |
| `GET/POST/PUT/DELETE /api/dsa` | Authenticated | DSA problem logs & streak |
| `GET /api/stats/{student,coordinator,admin}` | Role-scoped | Role-specific dashboard metrics |
| `GET/POST/PUT/DELETE /api/events` | Auth / `COORDINATOR`, `ADMIN` | Placement schedule events |
| `GET /api/admin/users` | `ADMIN` | List all users |
| `PATCH /api/admin/users/:id/role` | `ADMIN` | Change user role (audited) |
| `PATCH /api/admin/users/:id/active` | `ADMIN` | Activate/deactivate user (audited) |
| `GET /api/admin/logs` | `ADMIN` | Paginated audit logs |

## Screenshots

- _Student Workspace & Drives Board_ (placeholder)
- _ATS Resume Scanner & Breakdown_ (placeholder)
- _Coordinator Drives & Student Database_ (placeholder)
- _Dean & Admin Portal_ (placeholder)

## Deployment Notes

- **Database**: Host PostgreSQL on **Neon** (`DATABASE_URL`).
- **Backend (`apps/server`)**: Deploy to **Render** or **Railway** with root/build command `npm run build --workspace=@hiresphere/shared && npm run build --workspace=server` and start command `npm run start --workspace=server`. Set `FRONTEND_URL` to your exact Vercel URL so CORS is restricted to the frontend origin, and set a strong `JWT_SECRET`.
- **Frontend (`apps/web`)**: Deploy to **Vercel** with build command `npm run build --workspace=@hiresphere/shared && npm run build --workspace=web`, output directory `apps/web/dist`, and `VITE_API_URL` pointing to your Render/Railway backend URL.
