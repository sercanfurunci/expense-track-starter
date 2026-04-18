import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useLang } from "./i18n.jsx";

const catColors = {
  food:          "#F97316",
  housing:       "#3B82F6",
  utilities:     "#EAB308",
  transport:     "#06B6D4",
  entertainment: "#EC4899",
  salary:        "#10B981",
  other:         "#94A3B8",
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const fmt = (n) =>
  parseFloat(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function StatCard({ label, value, sub }) {
  return (
    <div className="fin-card rounded-xl p-4">
      <p className="fin-label">{label}</p>
      <p
        className="fin-mono text-xl font-bold mt-2"
        style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1 truncate" style={{ color: "var(--text-3)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="fin-card rounded-xl px-3 py-2 text-xs shadow-lg space-y-1">
      <p className="font-medium mb-1" style={{ color: "var(--text-2)" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.fill }} />
          <span style={{ color: "var(--text-1)" }} className="fin-mono font-semibold">
            ${fmt(p.value)}
          </span>
          <span style={{ color: "var(--text-3)" }}>{p.dataKey === "expenses" ? "Expenses" : "Income"}</span>
        </div>
      ))}
    </div>
  );
}

function Analytics({ transactions }) {
  const { t } = useLang();

  if (transactions.length === 0) {
    return (
      <div className="fin-card rounded-2xl py-16 text-center anim-1">
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Add transactions to see analytics
        </p>
      </div>
    );
  }

  const txDate = (date) => (date ? date.split("T")[0] : "");

  const expenses = transactions.filter((tx) => tx.type === "expense");
  const income = transactions.filter((tx) => tx.type === "income");
  const totalExpenses = expenses.reduce((s, tx) => s + parseFloat(tx.amount), 0);
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  const dayCount = [0, 0, 0, 0, 0, 0, 0];
  transactions.forEach((tx) => { dayCount[new Date(txDate(tx.date)).getDay()]++; });
  const busiestDayIdx = dayCount.indexOf(Math.max(...dayCount));
  const busiestDay = DAYS[busiestDayIdx];

  const biggestExpense = expenses.length > 0
    ? Math.max(...expenses.map((tx) => parseFloat(tx.amount)))
    : 0;

  // Last 30 days bar chart data
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split("T")[0];
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      expenses: expenses
        .filter((tx) => txDate(tx.date) === key)
        .reduce((s, tx) => s + parseFloat(tx.amount), 0),
      income: income
        .filter((tx) => txDate(tx.date) === key)
        .reduce((s, tx) => s + parseFloat(tx.amount), 0),
    };
  });

  // Category breakdown
  const catData = Object.entries(
    expenses.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + parseFloat(tx.amount);
      return acc;
    }, {})
  )
    .map(([cat, value]) => ({
      cat,
      value,
      pct: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-4 anim-1">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Avg Expense"
          value={`$${fmt(avgExpense)}`}
          sub={`${expenses.length} expenses total`}
        />
        <StatCard
          label="Busiest Day"
          value={busiestDay.slice(0, 3)}
          sub={busiestDay}
        />
        <StatCard
          label="Transactions"
          value={transactions.length}
          sub={`${income.length} income · ${expenses.length} expenses`}
        />
        <StatCard
          label="Biggest Expense"
          value={`$${fmt(biggestExpense)}`}
          sub={expenses.find((tx) => parseFloat(tx.amount) === biggestExpense)?.description}
        />
      </div>

      {/* Bar chart: last 30 days */}
      <div className="fin-card rounded-2xl p-5">
        <p className="fin-label mb-4">Last 30 Days</p>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last30} barGap={1} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "var(--text-3)", fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--text-3)", fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v === 0 ? "" : `$${v}`)}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "var(--surface-2)", radius: 4 }} />
              <Bar dataKey="income"   fill="var(--green)" radius={[3, 3, 0, 0]} opacity={0.75} />
              <Bar dataKey="expenses" fill="var(--red)"   radius={[3, 3, 0, 0]} opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-5 mt-3 justify-center">
          {[["var(--green)", "Income"], ["var(--red)", "Expenses"]].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color, opacity: 0.75 }} />
              <span className="text-xs" style={{ color: "var(--text-2)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      {catData.length > 0 && (
        <div className="fin-card rounded-2xl p-5">
          <p className="fin-label mb-4">By Category</p>
          <div className="space-y-4">
            {catData.map(({ cat, value, pct }) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: catColors[cat] || catColors.other }}
                    />
                    <span className="text-sm capitalize" style={{ color: "var(--text-2)" }}>
                      {t(cat)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: "var(--text-3)" }}>
                      {pct.toFixed(1)}%
                    </span>
                    <span
                      className="fin-mono text-sm font-semibold"
                      style={{ color: "var(--text-1)", minWidth: 64, textAlign: "right" }}
                    >
                      ${fmt(value)}
                    </span>
                  </div>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--surface-2)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: catColors[cat] || catColors.other,
                      transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
