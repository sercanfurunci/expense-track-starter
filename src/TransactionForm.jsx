import { useState } from "react";
import { useLang } from "./i18n.jsx";

const categories = ["food", "housing", "utilities", "transport", "entertainment", "salary", "other"];

function TransactionForm({ onAdd }) {
  const { t } = useLang();
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
    <div className="fin-card rounded-2xl p-4 sm:p-6 mb-4 sm:mb-5 anim-2">
      <h2 className="fin-label mb-4">{t("addTransaction")}</h2>

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
  );
}

export default TransactionForm;
