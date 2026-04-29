import { useState } from "react";
import { useLang } from "./i18n.jsx";
import StatementImportModal from "./StatementImportModal.jsx";

const categories = ["food", "housing", "utilities", "transport", "entertainment", "salary", "other"];

function TransactionForm({ onAdd, onRefresh }) {
  const { t } = useLang();
  const [showImport, setShowImport] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("food");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    onAdd({
      description,
      amount,
      type,
      category,
      date: new Date().toISOString().split("T")[0],
    });
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("food");
  };

  return (
    <>
    {showImport && (
      <StatementImportModal
        onClose={() => setShowImport(false)}
        onImported={() => { setShowImport(false); onRefresh?.(); }}
      />
    )}
    <div className="fin-card rounded-2xl p-4 sm:p-6 mb-4 sm:mb-5 anim-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="fin-label">{t("addTransaction")}</h2>
        <button
          type="button"
          onClick={() => setShowImport(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "9px",
            border: "1px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--text-2)",
            fontSize: "12px",
            fontWeight: "500",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background-color 0.13s, color 0.13s, border-color 0.13s",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.borderColor = "var(--border-2)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {t("importStatement")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Row 1: Description + Amount */}
        <div className="flex gap-2.5">
          <input
            type="text"
            placeholder={t("descriptionPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="fin-input flex-[2] min-w-0"
          />
          <input
            type="number"
            placeholder={t("amountPlaceholder")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="fin-input fin-mono flex-1 min-w-0 text-right"
            style={{ minWidth: "90px" }}
          />
        </div>

        {/* Row 2: Type toggle + Category + Add */}
        <div className="flex gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Income / Expense toggle */}
          <div className="type-toggle shrink-0">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`type-btn ${type === "income" ? "active-income" : ""}`}
            >
              + {t("incomeOption")}
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`type-btn ${type === "expense" ? "active-expense" : ""}`}
            >
              − {t("expenseOption")}
            </button>
          </div>

          {/* Category */}
          <div className="flex-1 min-w-[110px] relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="fin-select w-full"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{t(cat)}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button type="submit" className="fin-btn-primary shrink-0">
            {t("addBtn")}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}

export default TransactionForm;
