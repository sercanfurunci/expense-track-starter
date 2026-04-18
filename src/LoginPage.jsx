import { useState } from "react";
import { useLang } from "./i18n.jsx";

function EyeIcon({ open }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function LoginPage({ onSuccess, onSwitch, onForgotPassword }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      onSuccess(data.token, data.user);
    } catch {
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm anim-1">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4"
            style={{ background: "linear-gradient(135deg, var(--brand) 0%, #9B8FF8 100%)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="fin-serif text-2xl" style={{ color: "var(--text-1)" }}>
            {t("appName")}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
            {t("appSubtitle")}
          </p>
        </div>

        {/* Card */}
        <div className="fin-card rounded-2xl p-6 sm:p-8">
          <h2 className="font-semibold text-base mb-6" style={{ color: "var(--text-1)" }}>
            {t("signInTitle")}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="fin-label block mb-1.5">{t("email")}</label>
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="fin-input"
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="fin-label">{t("password")}</label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs font-medium cursor-pointer hover:underline"
                  style={{ color: "var(--brand)" }}
                >
                  {t("forgotPassword")}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="fin-input"
                  style={{ paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-60"
                  style={{ color: "var(--text-3)" }}
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {error && (
              <div
                className="text-sm rounded-xl px-4 py-2.5"
                style={{
                  color: "var(--red)",
                  backgroundColor: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.2)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="fin-btn-primary w-full mt-1 disabled:opacity-50"
            >
              {loading ? t("signingIn") : t("signInBtn")}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-2)" }}>
            {t("noAccount")}{" "}
            <button
              onClick={onSwitch}
              className="font-medium cursor-pointer hover:underline"
              style={{ color: "var(--brand)" }}
            >
              {t("registerLink")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
