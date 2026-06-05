# FlowOps — Surgical Precision Dashboard

A full-stack web application with JWT authentication built on **FastAPI** (backend) and **React + TypeScript + Vite** (frontend).

---

## Architecture overview

```
copilot-session-1/
├── backend/          # FastAPI JWT authentication API
└── frontend/         # React + TypeScript SPA
```

### Backend

- **Framework:** FastAPI
- **Auth:** JWT (HS256) via `python-jose`
- **Password hashing:** `passlib[bcrypt]`
- **Port:** `8000`
- **Endpoints:**
  - `POST /token` — authenticate with username/password, returns a JWT valid for 300 s
  - `POST /token/refresh` — exchange a valid JWT for a new one
  - `GET /health` — health check

> Default credentials: username `admin` / password `admin123`

### Frontend

- **Framework:** React 18 + TypeScript
- **Bundler:** Vite 5
- **Routing:** React Router v6
- **Auth state:** React Context + `sessionStorage` (token lives for the browser session only)
- **Port (dev):** `5173`
- **Pages:**
  - `/login` — login form; redirects to `/welcome` on success
  - `/welcome` — protected dashboard; only accessible with a valid session
  - Any unknown route → redirected to `/login`

---

## Prerequisites

| Tool                    | Minimum version                     |
| ----------------------- | ----------------------------------- |
| Python                  | 3.11                                |
| pip                     | 23+                                 |
| Node.js                 | 18                                  |
| npm                     | 9                                   |
| Docker & Docker Compose | optional, for containerised backend |

---

## Getting started

### 1 — Start the backend

#### Option A: directly with Python

```bash
cd backend
pip install -e .           # installs FastAPI, uvicorn, passlib, python-jose, etc.
uvicorn app.main:app --reload --port 8000
```

#### Option B: Docker Compose

```bash
cd backend
docker compose up --build
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### 2 — Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

Vite is configured to proxy `/token` and `/health` requests to `http://localhost:8000`, so **no CORS issues** during local development.

---

## Usage

1. Open `http://localhost:5173` — you are automatically redirected to `/login`.
2. Enter credentials: **admin** / **admin123**.
3. On successful authentication the JWT is stored in `sessionStorage` and you are redirected to the Welcome dashboard.
4. The dashboard displays a greeting, live statistics, a recent activity feed, and quick-action buttons.
5. Click **Sign out** (top-right) to clear the session and return to the login page.
6. If you try to access `/welcome` directly without a session, you are redirected back to `/login`.

---

## Environment variables

### Backend

| Variable          | Default                                             | Description                                   |
| ----------------- | --------------------------------------------------- | --------------------------------------------- |
| `SECRET_KEY`      | `change-me-in-production-super-secret-key-32chars!` | JWT signing secret — **change in production** |
| `ALLOWED_ORIGINS` | `http://localhost:5173`                             | Comma-separated list of allowed CORS origins  |

### Frontend

| Variable       | Default   | Description                                                                                                                          |
| -------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_API_URL` | _(empty)_ | Backend base URL. Leave empty in dev (Vite proxy is used). Set to the full URL for production builds, e.g. `https://api.example.com` |

Create a `.env` file in `frontend/` based on `frontend/.env.example`.

---

## Available scripts

### Backend

```bash
uvicorn app.main:app --reload    # development server
```

### Frontend

```bash
npm run dev          # development server (http://localhost:5173)
npm run build        # production build → dist/
npm run preview      # preview production build locally
npm run typecheck    # TypeScript type-check only (no emit)
```

---

## Design system

The frontend follows the **FlowOps — Surgical Precision** design spec defined in [`DESIGN.md`](./DESIGN.md):

- **Color palette:** `#111827` primary · `#FFEDD5` secondary · `#E0E7FF` tertiary · `#FFFFFF` neutral
- **Typography:** Inter (300 / 400 / 500), 14 px base
- **Surfaces:** glass — `rgba(255,255,255,0.9)` with `backdrop-filter: blur`
- **Radius scale:** 4 px · 16 px · 32 px · 9999 px
- **Motion:** 150 ms / 300 ms, `cubic-bezier(0.4, 0, 0.2, 1)`

---

## Security notes

- JWT tokens expire after **300 seconds**. In a production setup, implement silent token refresh using `POST /token/refresh`.
- The token is stored in `sessionStorage`, which is cleared when the browser tab is closed.
- `SECRET_KEY` **must** be changed before deploying to production.
- `ALLOWED_ORIGINS` should be restricted to your production domain.
