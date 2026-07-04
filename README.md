# Project Management System (PMS)

Full-stack Project Management System with Admin & User dashboards and a Community feed.

**Stack:** React (Vite) + Tailwind CSS · Node.js + Express · SQLite (built-in `node:sqlite`, Node 22+) · JWT Auth

> **Requires Node.js v22.5+** (uses the built-in `node:sqlite` module — no native/compiled dependencies, so no Visual Studio Build Tools or Python needed on Windows). You'll see a one-line "SQLite is experimental" warning on server start — that's expected and harmless.

## Features
- JWT-based auth (register/login) with `admin` / `user` roles
- Admin dashboard: overview stats, all projects, manage users/roles
- User dashboard: personal stats, assigned tasks
- Projects: full CRUD, members
- Tasks: full CRUD, kanban-style columns (To Do / In Progress / Done), priority, assignment, due date
- Community: posts + comments feed

## Folder Structure
```
pms/
├── backend/          # Express API + SQLite
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   └── server.js
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```

## Setup

### 1. Backend
```bash
cd backend
npm install
npm run dev      # starts on http://localhost:5000
```
This auto-creates `db/pms.db` (SQLite) with all tables on first run.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:3000
```
Vite is configured to proxy `/api` requests to `http://localhost:5000`.

### 3. Try it out
1. Open http://localhost:3000/register
2. Create an account — pick role "Admin" to see the admin dashboard, or "User" for the regular dashboard.
3. Create projects, add tasks, post in the community feed.

## Environment Variables (backend/.env)
```
PORT=5000
JWT_SECRET=change_this_secret_key_in_production
```

## Notes
- This is a skeleton — refine styling, add file uploads, notifications, etc. as needed.
- To deploy: swap SQLite for Postgres if you need multi-instance scaling, and set a strong `JWT_SECRET`.
