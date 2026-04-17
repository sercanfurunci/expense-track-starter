function Summary({ transactions }) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
      {/* Income */}
      <div className="bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 rounded-2xl p-3 sm:p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">Income</p>
        </div>
        <p className="text-base sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">${totalIncome.toLocaleString()}</p>
      </div>

      {/* Expenses */}
      <div className="bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 rounded-2xl p-3 sm:p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">Expenses</p>
        </div>
        <p className="text-base sm:text-2xl font-bold text-rose-600 dark:text-rose-400 truncate">${totalExpenses.toLocaleString()}</p>
      </div>

      {/* Balance */}
      <div className="bg-white border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 rounded-2xl p-3 sm:p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">Balance</p>
        </div>
        <p className={`text-base sm:text-2xl font-bold truncate ${balance >= 0 ? "text-violet-600 dark:text-violet-400" : "text-rose-600 dark:text-rose-400"}`}>
          ${balance.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default Summary;
