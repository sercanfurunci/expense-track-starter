# Finance Tracker

A full-stack personal finance app to track income and expenses, visualize spending, and manage your financial health — with multi-currency support, analytics, and a clean bilingual UI.

**Live app → [expense-track-starter.vercel.app](https://expense-track-starter.vercel.app)**

---

## Features

- **Dashboard** — balance overview, expense donut chart by category, recent activity
- **Transactions** — add, edit, delete income & expenses with category tagging
- **Analytics** — 30-day bar chart, average expense, busiest day, category breakdown
- **Multi-currency** — USD, EUR, GBP, TRY, JPY, CAD, AUD, CHF — syncs across devices
- **Profile** — set display name and preferred currency
- **Auth** — email verification, JWT sessions, forgot/reset password
- **Dark / Light mode** — persisted per device
- **Bilingual** — English and Turkish (TR) throughout every page

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts |
| Backend | Node.js, Express |
| Database | PostgreSQL (Neon) |
| Auth | JWT, bcrypt, Nodemailer (Gmail SMTP) |
| Hosting | Vercel (frontend) + Render (backend) |

## Local Development

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A Gmail account for sending verification/reset emails

### Frontend

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev       # http://localhost:5173
npm run build     # production build
npm run lint      # ESLint
```

### Backend

```bash
cd src/backend
npm install
```

Create `src/backend/.env`:

```env
JWT_SECRET=your_jwt_secret
ADMIN_SECRET=your_admin_secret
MAIL_USER=your@gmail.com
MAIL_PASS=your_gmail_app_password
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
DB_HOST=your_neon_host
DB_USER=your_db_user
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

```bash
node server.js    # http://localhost:3000
```

### Database Setup

Run these in the Neon SQL editor (or any PostgreSQL client):

```sql
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

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  description TEXT,
  amount NUMERIC,
  type TEXT,
  category TEXT,
  date TIMESTAMP DEFAULT NOW(),
  user_id INTEGER REFERENCES users(id)
);
```

## Project Structure

```
src/
├── backend/
│   └── server.js          # Express API (auth + transactions)
├── App.jsx                # Root — auth state, tab navigation, theme
├── LandingPage.jsx        # Marketing page with animated mock card
├── Dashboard.jsx          # Donut chart + recent activity
├── Analytics.jsx          # Bar chart + stats + category breakdown
├── TransactionForm.jsx    # Add transaction form
├── TransactionList.jsx    # Filterable list with edit/delete
├── Summary.jsx            # Balance + income/expense cards
├── ProfileModal.jsx       # Display name + currency picker
├── currency.jsx           # Currency context + 8 supported currencies
├── i18n.jsx               # EN/TR translations context
└── App.css                # Design tokens + custom utility classes
```

## API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | — | Register + send verification email |
| GET | `/auth/verify` | — | Verify email token |
| POST | `/auth/login` | — | Login → JWT + user |
| POST | `/auth/forgot-password` | — | Send password reset email |
| POST | `/auth/reset-password` | — | Set new password |
| GET | `/auth/me` | JWT | Get current user profile |
| PUT | `/auth/profile` | JWT | Update username / currency |
| GET | `/transactions` | JWT | List transactions |
| POST | `/transactions` | JWT | Create transaction |
| PUT | `/transactions/:id` | JWT | Update transaction |
| DELETE | `/transactions/:id` | JWT | Delete transaction |
