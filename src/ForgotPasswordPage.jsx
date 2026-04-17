import { useState } from "react";
import { useLang } from "./i18n.jsx";

function ForgotPasswordPage({ onBack }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const inputClass =
    "block w-full appearance-none bg-white border border-slate-300 text-slate-800 placeholder-slate-400 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white dark:placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setSent(true);
    } catch {
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            $
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("appName")}
          </h1>
        </div>

        <div className="bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 backdrop-blur rounded-2xl p-5 sm:p-8 shadow-sm dark:shadow-xl">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {t("forgotPasswordTitle")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {t("forgotPasswordDesc")}
          </p>

          {sent ? (
            <div className="text-center">
              <p className="text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-3 mb-6">
                {t("resetEmailSent")}
              </p>
              <button
                onClick={onBack}
                className="text-sm text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
              >
                {t("backToSignIn")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  {t("email")}
                </label>
                <input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-rose-600 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl px-6 py-2.5 transition shadow-lg shadow-violet-900/30 cursor-pointer mt-1"
              >
                {loading ? t("sendingResetLink") : t("sendResetLink")}
              </button>

              <button
                type="button"
                onClick={onBack}
                className="text-sm text-slate-500 dark:text-slate-400 hover:underline cursor-pointer text-center"
              >
                {t("backToSignIn")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
