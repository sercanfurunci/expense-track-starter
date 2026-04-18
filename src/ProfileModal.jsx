import { useState } from "react";
import { CURRENCIES } from "./currency.jsx";
import { useLang } from "./i18n.jsx";

function ProfileModal({ user, token, onClose, onSave }) {
  const { t } = useLang();
  const [username, setUsername] = useState(user.username || "");
  const [currency, setCurrency] = useState(user.currency || "USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initials = (user.username || user.email || "?")
    .split(/[\s@]/)[0]
    .slice(0, 2)
    .toUpperCase();

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: username.trim() || null, currency }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Update failed"); return; }
      onSave(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fin-card rounded-2xl w-full max-w-sm p-6 anim-1"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="fin-serif text-xl" style={{ color: "var(--text-1)" }}>{t("profileTitle")}</h2>
          <button
            onClick={onClose}
            className="fin-icon-btn"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-2"
            style={{ background: "linear-gradient(135deg, var(--brand) 0%, #9B8FF8 100%)" }}
          >
            {initials}
          </div>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{user.email}</p>
        </div>

        {/* Username */}
        <div className="mb-5">
          <label className="fin-label block mb-1.5">{t("displayName")}</label>
          <input
            type="text"
            className="fin-input"
            placeholder={t("displayNamePlaceholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={40}
          />
        </div>

        {/* Currency */}
        <div className="mb-6">
          <label className="fin-label block mb-2">{t("currencyLabel")}</label>
          <div className="grid grid-cols-4 gap-2">
            {CURRENCIES.map((c) => {
              const isActive = currency === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer"
                  title={c.name}
                  style={{
                    backgroundColor: isActive ? "var(--brand-dim)" : "var(--surface-2)",
                    border: `1px solid ${isActive ? "var(--brand)" : "var(--border)"}`,
                    color: isActive ? "var(--brand)" : "var(--text-2)",
                  }}
                >
                  <span className="fin-mono text-base font-bold leading-none">{c.symbol}</span>
                  <span className="text-[10px] font-medium leading-none opacity-75">{c.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            className="text-sm rounded-xl px-4 py-2.5 mb-4"
            style={{ color: "var(--red)", backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}
          >
            {t("cancelBtn")}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 fin-btn-primary disabled:opacity-50"
          >
            {loading ? t("savingBtn") : t("saveBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
