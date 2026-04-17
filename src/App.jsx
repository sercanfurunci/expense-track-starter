import { useState, useEffect } from "react";
import "./App.css";
import Summary from "./Summary";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";
import { useLang } from "./i18n.jsx";

function App() {
  const { t, lang, toggleLang } = useLang();
  const [transactions, setTransactions] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
  });
  const [resetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("reset_token") || null;
  });
  const [page, setPage] = useState(() =>
    new URLSearchParams(window.location.search).get("reset_token") ? "reset-password" : "login"
  );
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? saved === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:3000/transactions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setTransactions(data))
      .catch((err) => console.log(err));
  }, [token]);

  const handleAuthSuccess = (newToken, user) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setCurrentUser(null);
    setTransactions([]);
    setPage("login");
  };

  const handleAdd = async (transaction) => {
    try {
      const res = await fetch("http://localhost:3000/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch (err) {
      console.log("PUT error:", err);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        {page === "reset-password" ? (
          <ResetPasswordPage
            resetToken={resetToken}
            onBack={() => setPage("login")}
          />
        ) : page === "forgot-password" ? (
          <ForgotPasswordPage
            onBack={() => setPage("login")}
          />
        ) : page === "login" ? (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onSwitch={() => setPage("register")}
            onForgotPassword={() => setPage("forgot-password")}
          />
        ) : (
          <RegisterPage
            onSwitch={() => setPage("login")}
          />
        )}
      </div>
    );
  }

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
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("appName")}
                </h1>
                {currentUser?.email && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentUser.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700/60 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300"
                title="Switch language"
              >
                {lang === "en" ? "TR" : "EN"}
              </button>
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
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700/60 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
                title={t("signOut")}
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 ml-12 text-sm">
            {t("appSubtitle")}
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
