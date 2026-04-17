import { useState } from "react";
import { useLang } from "./i18n.jsx";

const categories = [
  "food",
  "housing",
  "utilities",
  "transport",
  "entertainment",
  "salary",
  "other",
];

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

  const inputClass =
    "block w-full appearance-none bg-white border border-slate-300 text-slate-800 placeholder-slate-400 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white dark:placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition";

  const selectClass =
    "block w-full appearance-none bg-white border border-slate-300 text-slate-800 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition cursor-pointer";

  return (
    <div className="bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm dark:shadow-xl">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 text-xs shrink-0">
          +
        </span>
        {t("addTransaction")}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        {/* Description — full width on all sizes */}
        <div className="col-span-2 sm:flex-[2] sm:min-w-36">
          <input
            type="text"
            placeholder={t("descriptionPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Amount */}
        <div className="col-span-1 sm:flex-1 sm:min-w-24">
          <input
            type="number"
            placeholder={t("amountPlaceholder")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Type */}
        <div className="col-span-1 sm:flex-1 sm:min-w-28">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={selectClass}
          >
            <option value="income">{t("incomeOption")}</option>
            <option value="expense">{t("expenseOption")}</option>
          </select>
        </div>

        {/* Category */}
        <div className="col-span-1 sm:flex-1 sm:min-w-28">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {t(cat)}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="col-span-1 sm:flex-none">
          <button
            type="submit"
            className="block w-full sm:w-auto bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold text-sm rounded-xl px-6 py-3 transition shadow-lg shadow-violet-900/30 cursor-pointer"
          >
            {t("addBtn")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;
