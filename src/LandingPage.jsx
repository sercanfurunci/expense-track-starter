import { useEffect, useRef, useState } from "react";

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

const MOCK_TX = [
  { desc: "Monthly salary",    amt: "+3,500.00", color: "var(--green)",         dot: "#10B981" },
  { desc: "Grocery run",       amt: "−124.50",   color: "var(--red)",           dot: "#F97316" },
  { desc: "Netflix",           amt: "−15.99",    color: "var(--red)",           dot: "#EC4899" },
  { desc: "Electricity bill",  amt: "−89.20",    color: "var(--red)",           dot: "#EAB308" },
];

const FEATURES = [
  {
    accent: "var(--brand)",
    bg: "var(--brand-dim)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Track Every Transaction",
    desc: "Log income and expenses in seconds. Organize by category and see exactly where your money flows.",
  },
  {
    accent: "var(--green)",
    bg: "rgba(16,185,129,0.10)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "Visualize with Analytics",
    desc: "30-day bar charts, category breakdowns, and key stats deliver the full picture at a glance.",
  },
  {
    accent: "var(--gold)",
    bg: "rgba(180,83,9,0.10)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Multi-Currency Support",
    desc: "Work in USD, EUR, GBP, ₺, ¥ and more. Your currency preference syncs across every screen.",
  },
];

function LandingPage({ onGetStarted, onSignIn }) {
  const balance = useCounter(12847.50, 1800);
  const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const [txVisible, setTxVisible] = useState([]);
  useEffect(() => {
    MOCK_TX.forEach((_, i) => {
      setTimeout(() => setTxVisible((prev) => [...prev, i]), 1200 + i * 220);
    });
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)", overflowX: "hidden" }}>

      {/* ── Background glow ── */}
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 70% 50% at 50% -10%, var(--brand-dim) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(251,191,36,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Nav ── */}
      <header
        className="relative z-10 max-w-5xl mx-auto px-6 py-5 flex items-center justify-between anim-1"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: "linear-gradient(135deg, var(--brand) 0%, #9B8FF8 100%)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <span className="fin-serif text-lg" style={{ color: "var(--text-1)" }}>Finance Tracker</span>
        </div>

        <button
          onClick={onSignIn}
          className="fin-icon-btn text-sm font-medium"
          style={{ width: "auto", paddingLeft: 16, paddingRight: 16 }}
        >
          Sign in
        </button>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pt-14 pb-4 text-center">
        <p className="fin-label mb-5 anim-1" style={{ letterSpacing: "0.2em" }}>
          Personal Finance · Reimagined
        </p>

        <h1
          className="fin-serif anim-2"
          style={{
            color: "var(--text-1)",
            fontSize: "clamp(2.6rem, 8vw, 5.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Your money,
          <br />
          <span style={{ color: "var(--brand)" }}>clearly.</span>
        </h1>

        <p
          className="anim-3 mt-6 mx-auto"
          style={{
            color: "var(--text-2)",
            fontSize: "1.05rem",
            lineHeight: 1.7,
            maxWidth: 420,
          }}
        >
          Track income, visualize expenses, and understand your financial health — beautifully.
        </p>

        <div className="flex items-center justify-center flex-wrap gap-3 mt-9 anim-4">
          <button
            onClick={onGetStarted}
            className="fin-btn-primary"
            style={{ padding: "11px 28px", fontSize: 14 }}
          >
            Get started — it's free
          </button>
          <button
            onClick={onSignIn}
            className="text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: "var(--text-2)", background: "none", border: "none", padding: "11px 8px" }}
          >
            Sign in
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        {/* ── Mock card ── */}
        <div
          className="anim-5 mx-auto mt-14"
          style={{
            maxWidth: 340,
            animation: "fadeUp 0.45s 0.28s cubic-bezier(0.16,1,0.3,1) both, floatCard 6s 1s ease-in-out infinite",
          }}
        >
          <div
            className="fin-card rounded-2xl p-5 text-left"
            style={{
              boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 1px 0 var(--border) inset",
            }}
          >
            {/* Balance row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="fin-label mb-1.5">Net Balance</p>
                <p
                  className="fin-serif fin-mono font-bold"
                  style={{ color: "var(--gold)", fontSize: "2rem", letterSpacing: "-0.03em" }}
                >
                  ${fmt(balance)}
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ background: "linear-gradient(135deg, var(--brand) 0%, #9B8FF8 100%)", marginTop: 2 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>

            {/* Mini income/expense chips */}
            <div className="flex gap-2 mb-4">
              <div
                className="flex-1 rounded-xl px-3 py-2"
                style={{ backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}
              >
                <p className="fin-label mb-0.5" style={{ color: "var(--green)", fontSize: 9 }}>Income</p>
                <p className="fin-mono text-sm font-bold" style={{ color: "var(--green)" }}>+$3,500</p>
              </div>
              <div
                className="flex-1 rounded-xl px-3 py-2"
                style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.18)" }}
              >
                <p className="fin-label mb-0.5" style={{ color: "var(--red)", fontSize: 9 }}>Expenses</p>
                <p className="fin-mono text-sm font-bold" style={{ color: "var(--red)" }}>−$652</p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid var(--border)", marginBottom: 12 }} />

            {/* Transaction rows */}
            <div className="space-y-2.5">
              {MOCK_TX.map((tx, i) => (
                <div
                  key={tx.desc}
                  className="flex items-center gap-2.5"
                  style={{
                    opacity: txVisible.includes(i) ? 1 : 0,
                    transform: txVisible.includes(i) ? "none" : "translateX(-8px)",
                    transition: "opacity 0.35s ease, transform 0.35s ease",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tx.dot }} />
                  <span className="text-xs flex-1 truncate" style={{ color: "var(--text-2)" }}>{tx.desc}</span>
                  <span className="fin-mono text-xs font-semibold" style={{ color: tx.color }}>
                    {tx.amt.startsWith("+") ? "" : ""}{tx.amt}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card shadow layer */}
          <div
            aria-hidden
            style={{
              height: 24,
              margin: "0 20px",
              borderRadius: "0 0 16px 16px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderTop: "none",
              opacity: 0.5,
            }}
          />
          <div
            aria-hidden
            style={{
              height: 16,
              margin: "0 36px",
              borderRadius: "0 0 12px 12px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderTop: "none",
              opacity: 0.25,
            }}
          />
        </div>
      </section>

      {/* ── Features ── */}
      <section
        className="relative z-10 mt-16"
        style={{
          backgroundColor: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="fin-label mb-3">What you get</p>
            <h2
              className="fin-serif"
              style={{
                color: "var(--text-1)",
                fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Everything you need,<br/>nothing you don't.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="fin-card rounded-2xl p-6 transition-all duration-200 cursor-default"
                style={{ "--hover-border": f.accent }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = f.accent;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.1)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: f.bg }}
                >
                  <span style={{ color: f.accent }}>{f.icon}</span>
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-1)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="fin-label mb-4">Start today</p>
        <h2
          className="fin-serif mb-6"
          style={{
            color: "var(--text-1)",
            fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
            letterSpacing: "-0.02em",
          }}
        >
          Take control of your finances.
        </h2>
        <button
          onClick={onGetStarted}
          className="fin-btn-primary"
          style={{ padding: "13px 36px", fontSize: 15 }}
        >
          Create a free account
        </button>
        <p className="text-xs mt-4" style={{ color: "var(--text-3)" }}>
          No credit card required · Free forever
        </p>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          backgroundColor: "var(--surface)",
        }}
      >
        <div
          className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, var(--brand) 0%, #9B8FF8 100%)" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <span className="fin-serif text-sm" style={{ color: "var(--text-2)" }}>Finance Tracker</span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            © {new Date().getFullYear()} Finance Tracker. Built with care.
          </p>
        </div>
      </footer>

      {/* ── Float animation keyframe ── */}
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
