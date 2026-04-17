import { useState } from "react";

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
    "bg-white border border-slate-300 text-slate-800 placeholder-slate-400 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white dark:placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition";
  const selectClass =
    "bg-white border border-slate-300 text-slate-800 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition cursor-pointer";

  return (
    <div className="bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 backdrop-blur rounded-2xl p-6 mb-6 shadow-sm dark:shadow-xl">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 text-xs">
          +
        </span>
        Add Transaction
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} flex-[2] min-w-[140px]`}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`${inputClass} flex-1 min-w-[100px]`}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={`${selectClass} flex-1 min-w-[110px]`}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${selectClass} flex-1 min-w-[120px]`}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold text-sm rounded-xl px-6 py-2.5 transition shadow-lg shadow-violet-900/30 cursor-pointer"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
