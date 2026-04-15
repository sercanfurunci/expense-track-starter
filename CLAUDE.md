# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Architecture

This is a single-component React app (Vite + React 19). All application logic lives in `src/App.jsx` — there are no sub-components, routing, or backend. State is managed entirely with `useState`; there is no persistence (data resets on refresh).

### Known intentional issues (course exercises)

- **Bug**: `amount` is stored as a string, so `reduce` concatenates instead of summing — totals are wrong.
- **Transaction #4**: "Freelance Work" is typed `"expense"` but categorized as `"salary"` — incorrect seed data.
- **UI**: Minimal styling in `src/App.css`; no delete functionality, no edit, no charts.
- **Code smell**: All logic (filtering, form handling, summary calculation) is inline in one large component.
