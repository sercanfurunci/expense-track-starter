import { useEffect, useState } from "react";
import { useLang } from "./i18n.jsx";

function useCounter(target, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const raf = requestAnimationFrame(function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

// Sparkline bars: 7-day mock data (heights as % of max)
const SPARK_BARS = [
  { exp: 55, inc: 0  },
  { exp: 20, inc: 100},
  { exp: 38, inc: 0  },
  { exp: 72, inc: 0  },
  { exp: 15, inc: 0  },
  { exp: 90, inc: 0  },
  { exp: 45, inc: 0  },
];

const CATEGORIES = [
  { key: "food",          dot: "#F97316", pct: 38 },
  { key: "housing",       dot: "#3B82F6", pct: 28 },
  { key: "transport",     dot: "#06B6D4", pct: 18 },
  { key: "entertainment", dot: "#EC4899", pct: 10 },
  { key: "utilities",     dot: "#EAB308", pct: 6  },
];

const MOCK_TX = [
  { key: "salary",      inc: true,  dot: "#10B981", amt: "+$3,500" },
  { key: "grocery",     inc: false, dot: "#F97316", amt: "−$124"   },
  { key: "netflix",     inc: false, dot: "#EC4899", amt: "−$15.99" },
  { key: "electricity", inc: false, dot: "#EAB308", amt: "−$89"    },
];

// View 1 — Overview
function OverviewView({ t, balance, fmt }) {
  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="fin-label mb-1.5" style={{ fontSize: 9 }}>{t("landingNetBalance")}</p>
          <p className="fin-serif fin-mono font-bold"
            style={{ color: "var(--gold)", fontSize: "1.75rem", letterSpacing: "-0.03em" }}>
            ${fmt(balance)}
          </p>
        </div>
        <div className="flex gap-1.5">
          <div className="rounded-lg px-2 py-1.5 text-center" style={{ backgroundColor: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <p style={{ color: "var(--green)", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em" }}>INC</p>
            <p className="fin-mono font-bold" style={{ color: "var(--green)", fontSize: 11 }}>+$3,500</p>
          </div>
          <div className="rounded-lg px-2 py-1.5 text-center" style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
            <p style={{ color: "var(--red)", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em" }}>EXP</p>
            <p className="fin-mono font-bold" style={{ color: "var(--red)", fontSize: 11 }}>−$652</p>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", marginBottom: 10 }} />

      <div className="space-y-2">
        {MOCK_TX.map((tx) => (
          <div key={tx.key} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: tx.dot + "22" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.dot }} />
            </div>
            <span className="text-xs flex-1 truncate" style={{ color: "var(--text-2)" }}>
              {t(tx.key === "grocery" ? "landingGrocery" : tx.key === "electricity" ? "landingElectricity" : tx.key === "salary" ? "landingMonthlySalary" : "Netflix")}
            </span>
            <span className="fin-mono text-xs font-bold" style={{ color: tx.inc ? "var(--green)" : "var(--red)" }}>
              {tx.amt}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// View 2 — Analytics / sparkline
function AnalyticsView({ t }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="fin-label" style={{ fontSize: 9 }}>{t("last30Days")}</p>
        <div className="flex items-center gap-3">
          {[["var(--green)", t("income")], ["var(--red)", t("expenses")]].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: c, opacity: 0.8 }} />
              <span style={{ color: "var(--text-3)", fontSize: 9 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1 mb-3" style={{ height: 64 }}>
        {SPARK_BARS.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5" style={{ height: "100%" }}>
            <div className="w-full rounded-sm" style={{ height: `${b.inc}%`, backgroundColor: "var(--green)", opacity: 0.75, minHeight: b.inc > 0 ? 3 : 0 }} />
            <div className="w-full rounded-sm" style={{ height: `${b.exp}%`, backgroundColor: "var(--red)", opacity: 0.75, minHeight: 2 }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mb-4">
        {days.map((d, i) => (
          <div key={i} className="flex-1 text-center" style={{ color: "var(--text-3)", fontSize: 8, fontFamily: "JetBrains Mono, monospace" }}>{d}</div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--border)", marginBottom: 10 }} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: t("avgExpense"),    val: "$93.14" },
          { label: t("busiestDay"),    val: "Sat"    },
          { label: t("biggestExpense"),val: "$652"   },
        ].map(({ label, val }) => (
          <div key={label} className="rounded-xl p-2 text-center" style={{ backgroundColor: "var(--surface-2)" }}>
            <p className="fin-label mb-0.5" style={{ fontSize: 8 }}>{label}</p>
            <p className="fin-mono font-bold" style={{ color: "var(--text-1)", fontSize: 12 }}>{val}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// View 3 — Category breakdown
function CategoriesView({ t }) {
  const amts = ["$248", "$183", "$118", "$65", "$39"];
  return (
    <>
      <p className="fin-label mb-3" style={{ fontSize: 9 }}>{t("byCategory")}</p>
      <div className="space-y-2.5">
        {CATEGORIES.map(({ key, dot, pct }, i) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
                <span className="text-xs capitalize" style={{ color: "var(--text-2)" }}>{t(key)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: "var(--text-3)", fontSize: 10 }}>{pct}%</span>
                <span className="fin-mono font-semibold" style={{ color: "var(--text-1)", fontSize: 11 }}>{amts[i]}</span>
              </div>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 4, backgroundColor: "var(--surface-2)" }}>
              <div className="h-full rounded-full" style={{
                width: `${pct}%`,
                backgroundColor: dot,
                transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--border)", marginTop: 12, paddingTop: 10 }}>
        <div className="flex items-center justify-between">
          <span className="fin-label" style={{ fontSize: 9 }}>{t("expenses")} total</span>
          <span className="fin-mono font-bold" style={{ color: "var(--red)", fontSize: 13 }}>−$653</span>
        </div>
      </div>
    </>
  );
}

function LandingPage({ onGetStarted, onSignIn, isDark, toggleDark }) {
  const { t, lang, toggleLang } = useLang();
  const balance = useCounter(12847.50, 1800);
  const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Auto-rotating card view
  const VIEWS = ["overview", "analytics", "categories"];
  const VIEW_LABELS = { overview: t("balance"), analytics: t("last30Days"), categories: t("byCategory") };
  const [viewIdx, setViewIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setViewIdx((i) => (i + 1) % VIEWS.length);
        setFading(false);
      }, 300);
    }, 3800);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const features = [
    {
      accent: "var(--brand)", bg: "var(--brand-dim)",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
      title: t("landingFeature1Title"), desc: t("landingFeature1Desc"),
    },
    {
      accent: "var(--green)", bg: "rgba(16,185,129,0.10)",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      title: t("landingFeature2Title"), desc: t("landingFeature2Desc"),
    },
    {
      accent: "var(--gold)", bg: "rgba(180,83,9,0.10)",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
      title: t("landingFeature3Title"), desc: t("landingFeature3Desc"),
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)", overflowX: "hidden" }}>

      {/* Background glow */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 70% 50% at 50% -10%, var(--brand-dim) 0%, transparent 70%),
          radial-gradient(ellipse 40% 30% at 80% 80%, rgba(251,191,36,0.04) 0%, transparent 60%)
        `,
      }} />

      {/* ── Nav ── */}
      <header className="relative z-10 max-w-5xl mx-auto px-6 py-5 flex items-center justify-between anim-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: "linear-gradient(135deg, var(--brand) 0%, #9B8FF8 100%)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <span className="fin-serif text-lg" style={{ color: "var(--text-1)" }}>{t("appName")}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleLang} className="fin-icon-btn" title="Switch language">
            <span className="text-xs font-semibold">{lang === "en" ? "TR" : "EN"}</span>
          </button>
          <button onClick={toggleDark} className="fin-icon-btn" title="Toggle theme">
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button onClick={onSignIn} className="fin-icon-btn text-sm font-medium"
            style={{ width: "auto", paddingLeft: 16, paddingRight: 16 }}>
            {t("landingSignIn")}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pt-14 pb-4 text-center">
        <p className="fin-label mb-5 anim-1" style={{ letterSpacing: "0.2em" }}>{t("landingTagline")}</p>
        <h1 className="fin-serif anim-2" style={{
          color: "var(--text-1)",
          fontSize: "clamp(2.6rem, 8vw, 5.5rem)",
          lineHeight: 1.05, letterSpacing: "-0.02em",
        }}>
          {t("landingHeadline1")}<br />
          <span style={{ color: "var(--brand)" }}>{t("landingHeadline2")}</span>
        </h1>
        <p className="anim-3 mt-6 mx-auto"
          style={{ color: "var(--text-2)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 420 }}>
          {t("landingSubtitle")}
        </p>
        <div className="flex items-center justify-center flex-wrap gap-3 mt-9 anim-4">
          <button onClick={onGetStarted} className="fin-btn-primary" style={{ padding: "11px 28px", fontSize: 14 }}>
            {t("landingGetStarted")}
          </button>
          <button onClick={onSignIn}
            className="text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: "var(--text-2)", background: "none", border: "none", padding: "11px 8px" }}>
            {t("landingSignIn")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        {/* ── Mock card ── */}
        <div className="anim-5 mx-auto mt-14" style={{
          maxWidth: 320,
          animation: "fadeUp 0.45s 0.28s cubic-bezier(0.16,1,0.3,1) both, floatCard 6s 1s ease-in-out infinite",
        }}>
          <div className="fin-card rounded-2xl p-5 text-left" style={{
            boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 1px 0 var(--border) inset",
            minHeight: 220,
          }}>
            {/* View tabs */}
            <div className="flex gap-1 mb-4">
              {VIEWS.map((v, i) => (
                <button key={v} onClick={() => { setFading(true); setTimeout(() => { setViewIdx(i); setFading(false); }, 250); }}
                  className="flex-1 py-1 rounded-lg text-center cursor-pointer transition-all"
                  style={{
                    fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                    backgroundColor: viewIdx === i ? "var(--brand-dim)" : "transparent",
                    color: viewIdx === i ? "var(--brand)" : "var(--text-3)",
                    border: `1px solid ${viewIdx === i ? "var(--brand)" : "transparent"}`,
                  }}>
                  {VIEW_LABELS[v]}
                </button>
              ))}
            </div>

            {/* Animated content */}
            <div style={{ opacity: fading ? 0 : 1, transition: "opacity 0.25s ease" }}>
              {viewIdx === 0 && <OverviewView t={t} balance={balance} fmt={fmt} />}
              {viewIdx === 1 && <AnalyticsView t={t} />}
              {viewIdx === 2 && <CategoriesView t={t} />}
            </div>
          </div>

          {/* Stacked shadow layers */}
          <div aria-hidden style={{
            height: 20, margin: "0 18px", borderRadius: "0 0 14px 14px",
            backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderTop: "none", opacity: 0.5,
          }} />
          <div aria-hidden style={{
            height: 14, margin: "0 32px", borderRadius: "0 0 10px 10px",
            backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderTop: "none", opacity: 0.25,
          }} />

          {/* Auto-rotate dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {VIEWS.map((_, i) => (
              <div key={i} style={{
                width: viewIdx === i ? 16 : 5, height: 5, borderRadius: 3,
                backgroundColor: viewIdx === i ? "var(--brand)" : "var(--border)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 mt-16" style={{
        backgroundColor: "var(--surface)",
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
      }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="fin-label mb-3">{t("landingFeaturesLabel")}</p>
            <h2 className="fin-serif" style={{
              color: "var(--text-1)",
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)", letterSpacing: "-0.02em",
            }}>
              {t("landingFeaturesTitle")}<br />{t("landingFeaturesTitle2")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="fin-card rounded-2xl p-6 transition-all duration-200 cursor-default"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = f.accent;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: f.bg }}>
                  <span style={{ color: f.accent }}>{f.icon}</span>
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-1)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="fin-label mb-4">{t("landingCtaLabel")}</p>
        <h2 className="fin-serif mb-6" style={{
          color: "var(--text-1)", fontSize: "clamp(1.8rem, 5vw, 2.8rem)", letterSpacing: "-0.02em",
        }}>
          {t("landingCtaTitle")}
        </h2>
        <button onClick={onGetStarted} className="fin-btn-primary" style={{ padding: "13px 36px", fontSize: 15 }}>
          {t("landingCtaBtn")}
        </button>
        <p className="text-xs mt-4" style={{ color: "var(--text-3)" }}>{t("landingCtaSub")}</p>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, var(--brand) 0%, #9B8FF8 100%)" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <span className="fin-serif text-sm" style={{ color: "var(--text-2)" }}>{t("appName")}</span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            © {new Date().getFullYear()} {t("appName")}. {t("landingBuiltWith")}
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
