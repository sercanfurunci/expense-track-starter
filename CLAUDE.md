# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install frontend dependencies
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build

# Backend (src/backend/)
node src/backend/server.js   # Run backend locally on port 3000
```

## Architecture

Full-stack personal finance app. React 19 + Vite frontend, Express + PostgreSQL (Neon) backend, deployed on Vercel (frontend) + Render (backend).

### Deployment

- **Frontend**: Vercel — auto-deploys from GitHub `main`
- **Backend**: Render — auto-deploys from GitHub `main`, runs `src/backend/server.js`
- **Database**: Neon (PostgreSQL) — connection via `DATABASE_URL` or individual `DB_*` env vars

### Frontend environment variables

```
VITE_API_URL=https://expense-track-starter.onrender.com   # backend base URL
```

### Backend environment variables (Render)

```
JWT_SECRET, ADMIN_SECRET      # auth secrets
MAIL_USER, MAIL_PASS           # Gmail SMTP for verification/reset emails
BACKEND_URL                    # public URL of this backend (for email links)
FRONTEND_URL                   # Vercel frontend URL (for CORS + email links)
DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT   # Neon PostgreSQL
```

### Database schema

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verify_token TEXT,
  verify_expires TIMESTAMP,
  reset_token TEXT,
  reset_expires TIMESTAMP,
  username TEXT,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  description TEXT,
  amount NUMERIC,
  type TEXT,         -- 'income' | 'expense'
  category TEXT,     -- 'food' | 'housing' | 'utilities' | 'transport' | 'entertainment' | 'salary' | 'other'
  date TIMESTAMP DEFAULT NOW(),
  user_id INTEGER REFERENCES users(id)
);
```

If adding new columns: `ALTER TABLE users ADD COLUMN IF NOT EXISTS ...`

### Component tree

```
App                     # auth state, transactions state, theme, token, currentUser
├── LandingPage         # marketing page shown to unauthenticated users
├── LoginPage           # email + password login form
├── RegisterPage        # registration with email verification flow
├── ForgotPasswordPage  # sends reset email
├── ResetPasswordPage   # consumes reset token, sets new password
└── (authenticated)
    ├── CurrencyProvider    # context: current user's currency symbol
    ├── Dashboard           # donut chart + recent activity (uses Summary)
    │   └── Summary         # balance hero card + income/expense totals
    ├── TransactionForm     # add income/expense form (pill type toggle)
    ├── TransactionList     # filterable list, inline edit, delete modal
    ├── Analytics           # 30-day bar chart + stat cards + category breakdown
    └── ProfileModal        # edit display name + currency picker (8 currencies)
```

### Key design decisions

- **No React Router** — navigation is `authPage` / `activeTab` state in `App.jsx`
- **No global state library** — state flows via props; `CurrencyProvider` and `LangProvider` are the only contexts
- **CSS design tokens** — all colors via CSS variables (`--bg`, `--surface`, `--brand`, `--green`, `--red`, etc.) on `:root` / `.dark`; dark mode toggled by `.dark` class on `<html>`
- **Currency** — stored per user in DB, fetched on every app load via `GET /auth/me` so changes sync across devices without re-login
- **Date normalization** — Neon returns ISO timestamps; use `date.split("T")[0]` before comparing to `YYYY-MM-DD` strings

### i18n

`src/i18n.jsx` — `LangProvider` + `useLang()` hook. Supports `en` and `tr`. All user-visible strings must go through `t("key")`. Add new keys to both `en` and `tr` objects.

### Styling

Tailwind CSS v4 + custom classes in `src/App.css`:
- `.fin-card` — surface card with border
- `.fin-label` — uppercase tracking label
- `.fin-serif` — DM Serif Display
- `.fin-mono` — JetBrains Mono (numbers/amounts)
- `.fin-btn-primary`, `.fin-icon-btn`, `.fin-input`, `.fin-select`
- `.anim-1` through `.anim-5` — staggered fade-up entrance animations
- `.tx-row` / `.tx-card-row` — transaction row with colored left accent bar

### Backend API

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | — | Register (sends verification email) |
| GET | `/auth/verify` | — | Verify email via token |
| POST | `/auth/login` | — | Login → returns JWT + user |
| POST | `/auth/forgot-password` | — | Send reset email |
| POST | `/auth/reset-password` | — | Reset password with token |
| GET | `/auth/me` | JWT | Get current user profile |
| PUT | `/auth/profile` | JWT | Update username / currency |
| GET | `/transactions` | JWT | List user's transactions |
| POST | `/transactions` | JWT | Create transaction |
| PUT | `/transactions/:id` | JWT | Update transaction |
| DELETE | `/transactions/:id` | JWT | Delete transaction |
| GET | `/admin/users` | x-admin-secret | List all users |
