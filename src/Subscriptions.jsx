import { useState, useEffect } from "react";
import { useLang } from "./i18n.jsx";
import { useCurrency, CURRENCIES } from "./currency.jsx";

const API = import.meta.env.VITE_API_URL;

function authFetch(url, opts = {}) {
  const token = localStorage.getItem("auth_token");
  return fetch(url, {
    ...opts,
    credentials: "include",
    headers: {
      ...opts.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

const SERVICE_EMOJI = {
  chatgpt: "🤖", openai: "🤖",
  claude: "✳️", anthropic: "✳️",
  spotify: "🎵",
  netflix: "🎬",
  "apple music": "🎵", "apple tv": "🎬",
  youtube: "▶️",
  discord: "💬",
  github: "⌨️",
  notion: "📝",
  figma: "🎨",
  adobe: "🎨",
  dropbox: "☁️",
  google: "🔍",
  microsoft: "💼", office: "💼",
  zoom: "📹",
  slack: "💬",
  amazon: "📦", prime: "📦",
  hbo: "🎬", disney: "🎬", hulu: "🎬",
  icloud: "☁️",
  duolingo: "🦜",
  canva: "🖌️",
  cursor: "⌨️",
  perplexity: "🔍",
  midjourney: "🎨",
  linear: "📋",
  vercel: "▲",
};

const CATEGORY_EMOJI = {
  ai: "✨",
  entertainment: "🎬",
  music: "🎵",
  finance: "🏦",
  productivity: "⚡",
  health: "❤️",
  news: "📰",
  other: "📦",
};

function getEmoji(name, category) {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(SERVICE_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return CATEGORY_EMOJI[category] || "📦";
}

function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function monthlyEquivalent(amount, cycle) {
  if (cycle === "weekly") return (amount * 52) / 12;
  if (cycle === "yearly") return amount / 12;
  return amount;
}

function monthsActive(startedAt) {
  const start = new Date(startedAt);
  const now = new Date();
  const m = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(1, m + 1);
}

const CATEGORIES = ["ai", "entertainment", "music", "finance", "productivity", "health", "news", "other"];
const BILLING_CYCLES = ["weekly", "monthly", "yearly"];

const EMPTY_FORM = {
  name: "",
  amount: "",
  currency: "USD",
  billing_cycle: "monthly",
  next_billing_date: "",
  category: "other",
  started_at: new Date().toISOString().split("T")[0],
  is_active: true,
  notes: "",
};

// ── Delete confirmation modal ──────────────────────────────────────────────────
function DeleteConfirm({ sub, onConfirm, onCancel }) {
  const { t } = useLang();
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-sm p-5" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
        <h3 className="font-semibold mb-2" style={{ color: "var(--text-1)" }}>{t("subDeleteTitle")}</h3>
        <p className="text-sm mb-5" style={{ color: "var(--text-2)" }}>
          {t("deleteConfirmLine1")} <strong>{sub.name}</strong>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium cursor-pointer transition-all"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--text-1)", border: "1px solid var(--border)", borderRadius: 7 }}
          >
            {t("cancelBtn")}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-medium cursor-pointer"
            style={{ backgroundColor: "var(--red)", color: "white", borderRadius: 7 }}
          >
            {t("deleteBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Subscription detail modal ─────────────────────────────────────────────────
function SubDetail({ sub, onEdit, onDelete, onClose }) {
  const { t, lang } = useLang();
  const subCurrency = CURRENCIES.find(c => c.code === sub.currency) || CURRENCIES[0];
  const days = daysUntil(sub.next_billing_date);
  const months = monthsActive(sub.started_at);
  const totalSpent = parseFloat(sub.amount) * months;
  const dateLocale = lang === "tr" ? "tr-TR" : "en-US";

  const startDate = new Date(sub.started_at).toLocaleDateString(dateLocale, {
    day: "numeric", month: "short", year: "numeric",
  });

  const daysLabel =
    days === 0 ? t("subToday") :
    days < 0   ? t("subOverdue") :
    `${days} ${t("subDays")}`;

  const stats = [
    [t("subMonthsActive"), String(months)],
    [t("subTotalSpent"), `${subCurrency.symbol}${totalSpent.toLocaleString(dateLocale, { maximumFractionDigits: 2 })}`],
    [t("subStartedAt"), startDate],
    [t("subNextBilling"), daysLabel],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
        {/* Header */}
        <div className="flex items-center gap-3 p-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div
            className="w-12 h-12 flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: "var(--surface-2)", borderRadius: 10 }}
          >
            {getEmoji(sub.name, sub.category)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate" style={{ color: "var(--text-1)" }}>{sub.name}</p>
            <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
              <span
                className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                style={{ backgroundColor: sub.is_active ? "var(--green)" : "var(--text-3)" }}
              />
              {sub.is_active ? t("subStatusActive") : t("subStatusInactive")} · {subCurrency.symbol}{parseFloat(sub.amount).toLocaleString(dateLocale)}
            </p>
          </div>
          <button onClick={onClose} className="fin-icon-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px m-5 mb-0 overflow-hidden" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
          {stats.map(([label, value]) => (
            <div key={label} className="p-3" style={{ backgroundColor: "var(--surface-2)" }}>
              <p className="fin-label text-[10px] mb-1" style={{ color: "var(--text-3)" }}>{label}</p>
              <p className="font-semibold text-sm fin-mono" style={{ color: "var(--text-1)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-5">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 text-sm font-medium cursor-pointer transition-all"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--text-1)", border: "1px solid var(--border)", borderRadius: 7 }}
          >
            {t("subEdit")}
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-2.5 text-sm font-medium cursor-pointer"
            style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "var(--red)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 7 }}
          >
            {t("deleteBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit form modal ─────────────────────────────────────────────────────
function SubForm({ initial, onSave, onClose }) {
  const { t } = useLang();
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name,
          amount: String(initial.amount),
          currency: initial.currency,
          billing_cycle: initial.billing_cycle,
          next_billing_date: initial.next_billing_date?.split("T")[0] || "",
          category: initial.category,
          started_at: initial.started_at?.split("T")[0] || new Date().toISOString().split("T")[0],
          is_active: initial.is_active,
          notes: initial.notes || "",
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const ok = await onSave({ ...form, amount: parseFloat(form.amount) }, initial?.id);
    setSaving(false);
    if (ok) onClose();
    else setError(t("serverError"));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base" style={{ color: "var(--text-1)" }}>
            {initial ? t("subEdit") : t("subAdd")}
          </h2>
          <button onClick={onClose} className="fin-icon-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="fin-label mb-1 block">{t("subName")}</label>
            <input
              className="fin-input w-full"
              placeholder="Netflix, Spotify, Claude…"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="fin-label mb-1 block">{t("amount")}</label>
              <input
                className="fin-input w-full fin-mono"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="9.99"
                value={form.amount}
                onChange={e => set("amount", e.target.value)}
                required
              />
            </div>
            <div className="w-28">
              <label className="fin-label mb-1 block">{t("currencyLabel")}</label>
              <select className="fin-select w-full" value={form.currency} onChange={e => set("currency", e.target.value)}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="fin-label mb-1 block">{t("subBillingCycle")}</label>
            <select className="fin-select w-full" value={form.billing_cycle} onChange={e => set("billing_cycle", e.target.value)}>
              {BILLING_CYCLES.map(c => (
                <option key={c} value={c}>{t(`subCycle_${c}`)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="fin-label mb-1 block">{t("category")}</label>
            <select className="fin-select w-full" value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{CATEGORY_EMOJI[c]} {t(`subCat_${c}`)}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="fin-label mb-1 block">{t("subStartedAt")}</label>
              <input
                className="fin-input w-full"
                type="date"
                value={form.started_at}
                onChange={e => set("started_at", e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="fin-label mb-1 block">{t("subNextBilling")}</label>
              <input
                className="fin-input w-full"
                type="date"
                value={form.next_billing_date}
                onChange={e => set("next_billing_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="fin-label mb-1 block">{t("subNotes")}</label>
            <input
              className="fin-input w-full"
              placeholder={t("subNotesPlaceholder")}
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              maxLength={500}
            />
          </div>

          {initial && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => set("is_active", !form.is_active)}
                className="relative transition-colors shrink-0"
                style={{
                  backgroundColor: form.is_active ? "var(--brand)" : "var(--border-2)",
                  cursor: "pointer",
                  width: "2.5rem",
                  height: "1.375rem",
                  borderRadius: 99,
                }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  style={{
                    left: form.is_active ? "calc(100% - 1.125rem)" : "0.125rem",
                    backgroundColor: "white",
                  }}
                />
              </div>
              <span className="text-sm" style={{ color: "var(--text-2)" }}>
                {form.is_active ? t("subStatusActive") : t("subStatusInactive")}
              </span>
            </label>
          )}

          {error && <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>}

          <button type="submit" disabled={saving} className="fin-btn-primary w-full mt-1">
            {saving ? t("savingBtn") : t("saveBtn")}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Subscriptions component ──────────────────────────────────────────────
export default function Subscriptions() {
  const { t, lang } = useLang();
  const currency = useCurrency();

  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { loadSubs(); }, []);

  async function loadSubs() {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/subscriptions`);
      if (res.ok) setSubs(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data, id) {
    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/subscriptions/${id}` : `${API}/subscriptions`;
    const res = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return false;
    const saved = await res.json();
    setSubs(prev => {
      const list = id ? prev.map(s => s.id === id ? saved : s) : [...prev, saved];
      return list.sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date));
    });
    return true;
  }

  async function handleDelete(id) {
    await authFetch(`${API}/subscriptions/${id}`, { method: "DELETE" });
    setSubs(prev => prev.filter(s => s.id !== id));
    setDeleteTarget(null);
    setDetailTarget(null);
  }

  function openEdit(sub) {
    setDetailTarget(null);
    setEditTarget(sub);
    setShowForm(true);
  }

  const dateLocale = lang === "tr" ? "tr-TR" : "en-US";
  const activeSubs = subs.filter(s => s.is_active);
  const monthlyTotal = activeSubs.reduce(
    (sum, s) => sum + monthlyEquivalent(parseFloat(s.amount), s.billing_cycle),
    0
  );

  // Categories that actually have subscriptions
  const usedCategories = CATEGORIES.filter(cat => subs.some(s => s.category === cat));

  // Filtered + grouped list
  const filteredSubs = activeFilter === "all" ? subs : subs.filter(s => s.category === activeFilter);
  const groups = (activeFilter === "all" ? usedCategories : [activeFilter])
    .map(cat => ({ cat, items: filteredSubs.filter(s => s.category === cat) }))
    .filter(g => g.items.length > 0);

  return (
    <>
    <div className="anim-1">
      {/* Monthly total card */}
      <div className="fin-card p-5 mb-4">
        <p className="fin-label mb-1" style={{ color: "var(--text-3)" }}>
          {t("subMonthlyTotal")}
        </p>
        <div className="flex items-end justify-between gap-3">
          <p className="fin-serif text-4xl leading-none" style={{ color: "var(--text-1)" }}>
            {currency.symbol}
            {monthlyTotal.toLocaleString(dateLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs fin-mono pb-0.5" style={{ color: "var(--text-3)" }}>
            {activeSubs.length} {t("subActive")}
          </p>
        </div>
      </div>

      {/* Category filter pills */}
      {usedCategories.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveFilter("all")}
            className="shrink-0 px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
            style={{
              borderRadius: 7,
              backgroundColor: activeFilter === "all" ? "var(--text-1)" : "var(--surface)",
              color: activeFilter === "all" ? "var(--bg)" : "var(--text-2)",
              border: `1px solid ${activeFilter === "all" ? "var(--text-1)" : "var(--border)"}`,
            }}
          >
            {t("allCategories")}
          </button>
          {usedCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className="shrink-0 px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
              style={{
                borderRadius: 7,
                backgroundColor: activeFilter === cat ? "var(--text-1)" : "var(--surface)",
                color: activeFilter === cat ? "var(--bg)" : "var(--text-2)",
                border: `1px solid ${activeFilter === cat ? "var(--text-1)" : "var(--border)"}`,
              }}
            >
              {CATEGORY_EMOJI[cat]} {t(`subCat_${cat}`)}
            </button>
          ))}
        </div>
      )}

      {/* Subscription list */}
      {loading ? (
        <div className="fin-card p-10 text-center" style={{ color: "var(--text-3)" }}>…</div>
      ) : subs.length === 0 ? (
        <div className="fin-card p-10 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>{t("subEmpty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(({ cat, items }) => (
            <div key={cat}>
              <p className="fin-label mb-2 px-1" style={{ color: "var(--text-3)" }}>
                {CATEGORY_EMOJI[cat]} {t(`subCat_${cat}`)} · {items.length}
              </p>
              <div className="fin-card overflow-hidden">
                {items.map((sub, i) => {
                  const days = daysUntil(sub.next_billing_date);
                  const subCurr = CURRENCIES.find(c => c.code === sub.currency) || CURRENCIES[0];
                  const daysLabel =
                    days === 0 ? t("subToday") :
                    days < 0  ? t("subOverdue") :
                    `${days} ${t("subDays")}`;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => setDetailTarget(sub)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 transition-all cursor-pointer text-left"
                      style={{
                        borderTop: i > 0 ? "1px solid var(--border)" : "none",
                        backgroundColor: "transparent",
                        opacity: sub.is_active ? 1 : 0.5,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--surface-2)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <div
                        className="w-10 h-10 flex items-center justify-center text-xl shrink-0"
                        style={{ backgroundColor: "var(--surface-2)", borderRadius: 10 }}
                      >
                        {getEmoji(sub.name, sub.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "var(--text-1)" }}>
                          {sub.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-3)" }}>
                          {t(`subCycle_${sub.billing_cycle}`)} · {daysLabel}
                        </p>
                      </div>
                      <p className="fin-mono text-sm font-semibold shrink-0" style={{ color: "var(--text-1)" }}>
                        {subCurr.symbol}{parseFloat(sub.amount).toLocaleString(dateLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* FAB — outside anim-1 so CSS transform doesn't break fixed positioning */}
    <button
      onClick={() => { setEditTarget(null); setShowForm(true); }}
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer z-30"
      style={{ backgroundColor: "var(--text-1)", color: "var(--bg)" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    {showForm && (
      <SubForm
        initial={editTarget}
        onSave={handleSave}
        onClose={() => { setShowForm(false); setEditTarget(null); }}
      />
    )}

    {detailTarget && (
      <SubDetail
        sub={detailTarget}
        onEdit={() => openEdit(detailTarget)}
        onDelete={() => setDeleteTarget(detailTarget)}
        onClose={() => setDetailTarget(null)}
      />
    )}

    {deleteTarget && (
      <DeleteConfirm
        sub={deleteTarget}
        onConfirm={() => handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    )}
    </>
  );
}
