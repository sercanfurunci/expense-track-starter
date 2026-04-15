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

React 19 app built with Vite. No routing, no backend — all state is in-memory and resets on refresh.

### Component tree

```
App                         # holds transactions state, passes it down
├── Summary                 # receives transactions, computes totals/balance internally
├── TransactionForm         # owns its own form state; calls onAdd(transaction) prop
└── TransactionList         # receives transactions; owns filter state internally
```

- **`App.jsx`** — only owns `transactions` state and a `handleAdd` callback.
- **`Summary.jsx`** — derives `totalIncome`, `totalExpenses`, and `balance` from the `transactions` prop.
- **`TransactionForm.jsx`** — self-contained form; notifies parent via `onAdd` prop.
- **`TransactionList.jsx`** — handles filtering (`filterType`, `filterCategory`) locally; renders the transactions table.

There is no shared state management library — all state flows via props.
