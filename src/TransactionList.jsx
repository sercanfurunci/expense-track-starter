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

const categoryColors = {
  food: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
  housing: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  utilities: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-300",
  transport: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300",
  entertainment: "bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300",
  salary: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  other: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
};

const cellInput =
  "w-full bg-white border border-slate-300 text-slate-800 dark:bg-slate-700/70 dark:border-slate-600/60 dark:text-white rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition";
const cellSelect =
  "w-full bg-white border border-slate-300 text-slate-800 dark:bg-slate-700/70 dark:border-slate-600/60 dark:text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition cursor-pointer";

function DeleteModal({ transaction, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-rose-500 dark:text-rose-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <h3 className="text-slate-900 dark:text-white font-semibold text-center text-base mb-1">
          Delete Transaction
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-1">
          Are you sure you want to delete
        </p>
        <p className="text-slate-800 dark:text-white font-medium text-sm text-center mb-6">
          "{transaction.description}"?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 hover:text-slate-800 dark:bg-slate-700/60 dark:hover:bg-slate-700 dark:border-slate-600/50 dark:text-slate-300 dark:hover:text-white rounded-xl py-2.5 text-sm font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl py-2.5 text-sm font-semibold transition shadow-lg shadow-rose-900/30 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function TransactionList({ transactions, onDelete, onEdit }) {
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  let filteredTransactions = transactions;
  if (filterType !== "all") {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.type === filterType,
    );
  }
  if (filterCategory !== "all") {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.category === filterCategory,
    );
  }

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditValues({
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
    });
  };

  const saveEdit = (id) => {
    if (!editValues.description || !editValues.amount) return;
    onEdit(id, editValues);
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const filterSelectClass =
    "bg-white border border-slate-300 text-slate-600 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition cursor-pointer";

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          transaction={deleteTarget}
          onConfirm={() => {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 backdrop-blur rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700/50">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Transactions</h2>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={filterSelectClass}
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={filterSelectClass}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
            No transactions found
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/50">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t, i) => {
                const isEditing = editingId === t.id;
                const isLast = i === filteredTransactions.length - 1;

                if (isEditing) {
                  return (
                    <tr
                      key={t.id}
                      className={`bg-slate-50 dark:bg-slate-700/40 border-b border-violet-500/30 ${isLast ? "border-b-0" : ""}`}
                    >
                      <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={editValues.description}
                          onChange={(e) =>
                            setEditValues({ ...editValues, description: e.target.value })
                          }
                          className={cellInput}
                          autoFocus
                        />
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={editValues.category}
                          onChange={(e) =>
                            setEditValues({ ...editValues, category: e.target.value })
                          }
                          className={cellSelect}
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <select
                            value={editValues.type}
                            onChange={(e) =>
                              setEditValues({ ...editValues, type: e.target.value })
                            }
                            className={`${cellSelect} w-auto`}
                          >
                            <option value="income">+ Income</option>
                            <option value="expense">− Expense</option>
                          </select>
                          <input
                            type="number"
                            value={editValues.amount}
                            onChange={(e) =>
                              setEditValues({ ...editValues, amount: e.target.value })
                            }
                            className={`${cellInput} w-24 text-right`}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => saveEdit(t.id)}
                            className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition cursor-pointer"
                            title="Save"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="w-7 h-7 rounded-lg bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-600/40 dark:hover:bg-slate-600/70 text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                            title="Cancel"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={t.id}
                    className={`group border-b border-slate-200/70 dark:border-slate-700/30 transition hover:bg-slate-50 dark:hover:bg-slate-700/30 ${isLast ? "border-b-0" : ""}`}
                  >
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800 dark:text-white font-medium">
                      {t.description}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${categoryColors[t.category] ?? categoryColors.other}`}
                      >
                        {t.category.charAt(0).toUpperCase() + t.category.slice(1)}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold text-right ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                    >
                      {t.type === "income" ? "+" : "−"}$
                      {parseFloat(t.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEdit(t)}
                          className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600/60 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center justify-center transition cursor-pointer"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.94l-3.414 1.136 1.136-3.414A4 4 0 019 13z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="w-7 h-7 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/15 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition cursor-pointer"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default TransactionList;
