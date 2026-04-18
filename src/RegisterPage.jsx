import { useState } from "react";
import { useLang } from "./i18n.jsx";

function EyeIcon({ open }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function RegisterPage({ onSwitch }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError(t("passwordMismatch")); return; }
    if (password.length < 6) { setError(t("passwordTooShort")); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      setSent(true);
    } catch {
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm anim-1">
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4"
              style={{ background: "linear-gradient(135deg, var(--brand) 0%, #9B8FF8 100%)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="fin-serif text-2xl" style={{ color: "var(--text-1)" }}>{t("appName")}</h1>
          </div>
          <div className="fin-card rounded-2xl p-8 text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(16,185,129,0.12)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--green)" }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 className="font-semibold text-base mb-2" style={{ color: "var(--text-1)" }}>{t("checkYourEmail")}</h2>
            <p className="text-sm mb-1" style={{ color: "var(--text-2)" }}>{t("verificationSent")}</p>
            <p className="text-sm font-medium mb-6" style={{ color: "var(--text-1)" }}>{email}</p>
            <button onClick={onSwitch} className="text-sm font-medium cursor-pointer hover:underline" style={{ color: "var(--brand)" }}>
              {t("backToSignIn")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm anim-1">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4"
            style={{ background: "linear-gradient(135deg, var(--brand) 0%, #9B8FF8 100%)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="fin-serif text-2xl" style={{ color: "var(--text-1)" }}>{t("appName")}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>{t("appSubtitle")}</p>
        </div>

        <div className="fin-card rounded-2xl p-6 sm:p-8">
          <h2 className="font-semibold text-base mb-6" style={{ color: "var(--text-1)" }}>{t("createAccountTitle")}</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="fin-label block mb-1.5">{t("email")}</label>
              <input type="email" placeholder={t("emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} className="fin-input" required autoFocus />
            </div>

            <div>
              <label className="fin-label block mb-1.5">{t("password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="fin-input"
                  style={{ paddingRight: "40px" }}
                  required
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-60" style={{ color: "var(--text-3)" }} tabIndex={-1}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div>
              <label className="fin-label block mb-1.5">{t("confirmPassword")}</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="fin-input"
                  style={{ paddingRight: "40px" }}
                  required
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-60" style={{ color: "var(--text-3)" }} tabIndex={-1}>
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm rounded-xl px-4 py-2.5" style={{ color: "var(--red)", backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="fin-btn-primary w-full mt-1 disabled:opacity-50">
              {loading ? t("creatingAccount") : t("createAccountBtn")}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-2)" }}>
            {t("alreadyHaveAccount")}{" "}
            <button onClick={onSwitch} className="font-medium cursor-pointer hover:underline" style={{ color: "var(--brand)" }}>
              {t("signInLink")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
