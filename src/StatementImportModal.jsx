import { useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "./i18n.jsx";
import { useCurrency } from "./currency.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeader() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function StatementImportModal({ onClose, onImported }) {
  const { t } = useLang();
  const { symbol } = useCurrency();
  const [step, setStep] = useState("pick"); // pick | preview | done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importedCount, setImportedCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  const CATEGORIES = ["food","housing","utilities","transport","entertainment","salary","other"];

  function startEdit(i) {
    setEditingIdx(i);
    setEditDraft({ ...preview[i] });
  }
  function cancelEdit() { setEditingIdx(null); setEditDraft(null); }
  function saveEdit() {
    setPreview(prev => prev.map((tx, i) => i === editingIdx ? { ...editDraft, amount: Math.abs(Number(editDraft.amount)) || 0 } : tx));
    setEditingIdx(null); setEditDraft(null);
  }
  function deleteTx(i) {
    setPreview(prev => prev.filter((_, idx) => idx !== i));
    if (editingIdx === i) { setEditingIdx(null); setEditDraft(null); }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setError(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("statement", file);
      const res = await fetch(`${API}/transactions/import?preview=true`, {
        method: "POST",
        headers: authHeader(),
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse PDF");

      setPreview(data.transactions);
      setStep("preview");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("statement", selectedFile);

      const res = await fetch(`${API}/transactions/import`, {
        method: "POST",
        headers: authHeader(),
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setImportedCount(data.imported);
      setStep("done");
      onImported();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatAmount(amount, type) {
    const sign = type === "income" ? "+" : "−";
    return `${sign}${symbol}${Number(amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.7)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fin-card w-full max-w-lg rounded-2xl flex flex-col"
        style={{
          maxHeight: "90vh",
          background: "var(--surface)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px var(--border)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: 32, height: 32,
                borderRadius: 9,
                background: "var(--brand-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <span className="fin-label" style={{ color: "var(--text-1)" }}>
              {t("importStatement")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="fin-icon-btn"
            style={{ width: 28, height: 28, borderRadius: 7, fontSize: 13 }}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col gap-4 px-6 py-5 overflow-y-auto flex-1">

          {/* Step: pick file */}
          {step === "pick" && (
            <div className="flex flex-col gap-4">
              <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.55, margin: 0 }}>
                {t("importStatementDesc")}
              </p>

              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={handleFile}
                className="hidden"
                id="statement-file"
              />

              {/* Drop zone / upload button */}
              <label
                htmlFor="statement-file"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  padding: "28px 20px",
                  borderRadius: 12,
                  border: "1.5px dashed var(--border-2)",
                  background: "var(--surface-2)",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "var(--brand)";
                    e.currentTarget.style.background = "var(--brand-dim)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border-2)";
                  e.currentTarget.style.background = "var(--surface-2)";
                }}
              >
                {loading ? (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>{t("importParsing")}</span>
                  </>
                ) : (
                  <>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "var(--brand-dim)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                      </svg>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-1)", marginBottom: 2 }}>
                        {t("importChooseFile")}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>PDF, JPG, PNG, WEBP</div>
                    </div>
                  </>
                )}
              </label>

              {error && (
                <p style={{ fontSize: 13, color: "var(--red)", margin: 0 }}>{error}</p>
              )}
            </div>
          )}

          {/* Step: preview */}
          {step === "preview" && (
            <>
              <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
                {t("importPreviewDesc", { count: preview.length })}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 360, overflowY: "auto" }}>
                {preview.map((tx, i) => editingIdx === i ? (
                  /* ── edit row ── */
                  <div key={i} style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--brand)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}>
                    <input
                      className="fin-input"
                      style={{ fontSize: 13 }}
                      value={editDraft.description}
                      onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        className="fin-input fin-mono"
                        type="number"
                        style={{ flex: 1, fontSize: 13, textAlign: "right" }}
                        value={editDraft.amount}
                        onChange={e => setEditDraft(d => ({ ...d, amount: e.target.value }))}
                      />
                      <input
                        className="fin-input"
                        type="date"
                        style={{ flex: 1, fontSize: 13 }}
                        value={editDraft.date}
                        onChange={e => setEditDraft(d => ({ ...d, date: e.target.value }))}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <div className="type-toggle" style={{ flexShrink: 0 }}>
                        <button type="button" className={`type-btn ${editDraft.type === "income" ? "active-income" : ""}`}
                          onClick={() => setEditDraft(d => ({ ...d, type: "income" }))}>+ {t("incomeOption")}</button>
                        <button type="button" className={`type-btn ${editDraft.type === "expense" ? "active-expense" : ""}`}
                          onClick={() => setEditDraft(d => ({ ...d, type: "expense" }))}>− {t("expenseOption")}</button>
                      </div>
                      <select className="fin-select" style={{ flex: 1, fontSize: 13 }}
                        value={editDraft.category}
                        onChange={e => setEditDraft(d => ({ ...d, category: e.target.value }))}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{t(c)}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={() => deleteTx(i)} style={{
                        padding: "5px 12px", borderRadius: 7, border: "1px solid var(--border)",
                        background: "transparent", color: "var(--red)", fontSize: 12.5,
                        fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                      }}>{t("importDeleteTx")}</button>
                      <button onClick={cancelEdit} style={{
                        padding: "5px 12px", borderRadius: 7, border: "1px solid var(--border)",
                        background: "var(--surface)", color: "var(--text-2)", fontSize: 12.5,
                        fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                      }}>{t("cancelBtn")}</button>
                      <button onClick={saveEdit} className="fin-btn-primary" style={{ padding: "5px 14px", fontSize: 12.5 }}>
                        {t("importSave")}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── read row ── */
                  <div key={i}
                    className={`tx-row ${tx.type === "income" ? "tx-income" : "tx-expense"}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 10px 9px 14px", borderRadius: 8 }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tx.description}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                        {tx.date} · {t(tx.category)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span className="fin-mono" style={{ fontSize: 13, fontWeight: 600, color: tx.type === "income" ? "var(--green)" : "var(--red)" }}>
                        {formatAmount(tx.amount, tx.type)}
                      </span>
                      <button onClick={() => startEdit(i)} style={{
                        width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)",
                        background: "var(--surface-2)", cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <p style={{ fontSize: 13, color: "var(--red)", margin: 0 }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { setStep("pick"); setPreview([]); setError(null); setSelectedFile(null); }}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--text-2)",
                    fontSize: 13.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    flexShrink: 0,
                    transition: "background 0.13s",
                  }}
                >
                  {t("cancelBtn")}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="fin-btn-primary"
                  style={{ flex: 1, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? t("importImporting") : t("importConfirm", { count: preview.filter(Boolean).length })}
                </button>
              </div>
            </>
          )}

          {/* Step: done */}
          {step === "done" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "12px 0 8px" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(16,185,129,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", textAlign: "center", margin: 0 }}>
                {t("importSuccess", { count: importedCount })}
              </p>
              <button onClick={onClose} className="fin-btn-primary">
                {t("importDoneBtn")}
              </button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  );
}
