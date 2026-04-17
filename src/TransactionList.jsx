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
  "block w-full appearance-none bg-white border border-slate-300 text-slate-800 dark:bg-slate-700/70 dark:border-slate-600/60 dark:text-white rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition";
const cellSelect =
  "block w-full appearance-none bg-white border border-slate-300 text-slate-800 dark:bg-slate-700/70 dark:border-slate-600/60 dark:text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition cursor-pointer";

function DeleteModal({ transaction, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-rose-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-slate-900 dark:text-white font-semibold text-center text-base mb-1">Delete Transaction</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-1">Are you sure you want to delete</p>
        <p className="text-slate-800 dark:text-white font-medium text-sm text-center mb-6">"{transaction.description}"?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 dark:bg-slate-700/60 dark:hover:bg-slate-700 dark:border-slate-600/50 dark:text-slate-300 rounded-xl py-2.5 text-sm font-medium transition cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl py-2.5 text-sm font-semibold transition shadow-lg shadow-rose-900/30 cursor-pointer">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600/60 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center justify-center transition cursor-pointer"
        title="Edit"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.94l-3.414 1.136 1.136-3.414A4 4 0 019 13z" />
        </svg>
      </button>
      <button
        onClick={onDelete}
        className="w-8 h-8 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/15 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition cursor-pointer"
        title="Delete"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

function TransactionList({ transactions, onDelete, onEdit }) {
  const { t } = useLang();
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  let filtered = transactions;
  if (filterType !== "all") filtered = filtered.filter((tx) => tx.type === filterType);
  if (filterCategory !== "all") filtered = filtered.filter((tx) => tx.category === filterCategory);

  const startEdit = (tx) => {
    setEditingId(tx.id);
    setEditValues({ description: tx.description, amount: tx.amount, type: tx.type, category: tx.category });
  };
  const saveEdit = (id) => {
    if (!editValues.description || !editValues.amount) return;
    onEdit(id, editValues);
    setEditingId(null);
  };
  const cancelEdit = () => setEditingId(null);

  const filterSelectClass =
    "block w-full appearance-none bg-white border border-slate-300 text-slate-600 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition cursor-pointer";

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          transaction={deleteTarget}
          onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 rounded-2xl shadow-sm dark:shadow-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-700/50">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t("transactions")}</h2>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 sm:ml-auto">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={filterSelectClass}>
              <option value="all">{t("allTypes")}</option>
              <option value="income">{t("incomeOption")}</option>
              <option value="expense">{t("expenseOption")}</option>
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={filterSelectClass}>
              <option value="all">{t("allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{t(cat)}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
            {t("noTransactions")}
          </div>
        ) : (
          <>
            {/* Mobile card list — visible below sm */}
            <div className="sm:hidden divide-y divide-slate-200 dark:divide-slate-700/50">
              {filtered.map((tx) => {
                const isEditing = editingId === tx.id;

                if (isEditing) {
                  return (
                    <div key={tx.id} className="p-4 bg-slate-50 dark:bg-slate-700/40 space-y-2">
                      <input
                        type="text"
                        value={editValues.description}
                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                        className={cellInput}
                        autoFocus
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={editValues.amount}
                          onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
                          className={cellInput}
                        />
                        <select
                          value={editValues.type}
                          onChange={(e) => setEditValues({ ...editValues, type: e.target.value })}
                          className={cellSelect}
                        >
                          <option value="income">+ {t("incomeOption")}</option>
                          <option value="expense">− {t("expenseOption")}</option>
                        </select>
                      </div>
                      <select
                        value={editValues.category}
                        onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                        className={cellSelect}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{t(cat)}</option>
                        ))}
                      </select>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => saveEdit(tx.id)}
                          className="flex-1 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium transition cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 py-2 rounded-lg bg-slate-200 dark:bg-slate-600/50 text-slate-600 dark:text-slate-300 text-sm font-medium transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                    {/* Left: description + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(tx.date).toLocaleDateString()}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${categoryColors[tx.category] ?? categoryColors.other}`}>
                          {t(tx.category)}
                        </span>
                      </div>
                    </div>
                    {/* Right: amount + actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {tx.type === "income" ? "+" : "−"}${parseFloat(tx.amount).toLocaleString()}
                      </span>
                      <ActionButtons onEdit={() => startEdit(tx)} onDelete={() => setDeleteTarget(tx)} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table — hidden below sm */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{t("date")}</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t("description")}</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t("category")}</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t("amount")}</th>
                    <th className="px-4 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, i) => {
                    const isEditing = editingId === tx.id;
                    const isLast = i === filtered.length - 1;

                    if (isEditing) {
                      return (
                        <tr key={tx.id} className={`bg-slate-50 dark:bg-slate-700/40 border-b border-violet-500/30 ${isLast ? "border-b-0" : ""}`}>
                          <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-3">
                            <input type="text" value={editValues.description} onChange={(e) => setEditValues({ ...editValues, description: e.target.value })} className={cellInput} autoFocus />
                          </td>
                          <td className="px-3 py-3">
                            <select value={editValues.category} onChange={(e) => setEditValues({ ...editValues, category: e.target.value })} className={cellSelect}>
                              {categories.map((cat) => <option key={cat} value={cat}>{t(cat)}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2 justify-end">
                              <select value={editValues.type} onChange={(e) => setEditValues({ ...editValues, type: e.target.value })} className={`${cellSelect} w-auto`}>
                                <option value="income">+ {t("incomeOption")}</option>
                                <option value="expense">− {t("expenseOption")}</option>
                              </select>
                              <input type="number" value={editValues.amount} onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })} className={`${cellInput} w-24 text-right`} />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <button onClick={() => saveEdit(tx.id)} className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition cursor-pointer">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              </button>
                              <button onClick={cancelEdit} className="w-7 h-7 rounded-lg bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-600/40 dark:hover:bg-slate-600/70 text-slate-500 flex items-center justify-center transition cursor-pointer">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={tx.id} className={`group border-b border-slate-200/70 dark:border-slate-700/30 transition hover:bg-slate-50 dark:hover:bg-slate-700/30 ${isLast ? "border-b-0" : ""}`}>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800 dark:text-white font-medium">{tx.description}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${categoryColors[tx.category] ?? categoryColors.other}`}>
                            {t(tx.category)}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {tx.type === "income" ? "+" : "−"}${parseFloat(tx.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition">
                            <ActionButtons onEdit={() => startEdit(tx)} onDelete={() => setDeleteTarget(tx)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default TransactionList;
