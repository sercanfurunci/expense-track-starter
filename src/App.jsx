import { useState, useEffect } from "react";
import "./App.css";
import Summary from "./Summary";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? saved === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    fetch("http://localhost:3000/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.log(err));
  }, []);

  const handleAdd = async (transaction) => {
    try {
      const res = await fetch("http://localhost:3000/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      const data = await res.json();
      setTransactions((prev) => [...prev, data]);
    } catch (err) {
      console.log("POST error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/transactions/${id}`, {
        method: "DELETE",
      });
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.log("DELETE error:", err);
    }
  };

  const handleEdit = async (id, updated) => {
    try {
      const res = await fetch(`http://localhost:3000/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch (err) {
      console.log("PUT error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                $
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Finance Tracker
              </h1>
            </div>
            <button
              onClick={() => setIsDark((d) => !d)}
              className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700/60 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-400 ml-12 text-sm">
            Keep tabs on your income and expenses
          </p>
        </div>

        <Summary transactions={transactions} />
        <TransactionForm onAdd={handleAdd} />
        <TransactionList
          transactions={transactions}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}

export default App;
