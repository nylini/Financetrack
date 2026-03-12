// pages/user/TransactionsPage.jsx
import { useState, useEffect } from "react";
import HttpService from "../../services/HttpService";
import AuthService from "../../services/AuthService";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = AuthService.getUserId();
    HttpService.get(`/api/finance/transactions`, { userId })
      .then((data) => { setTransactions(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(typeFilter === "ALL" ? transactions : transactions.filter((t) => t.type === typeFilter));
  }, [typeFilter, transactions]);

  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>📜 Transaction History</h2>

      <div style={styles.statsRow}>
        <div style={{ ...styles.stat, borderTop: "4px solid #16a34a" }}>
          <span style={styles.statLabel}>Total Income</span>
          <span style={{ ...styles.statVal, color: "#16a34a" }}>₹{totalIncome.toFixed(2)}</span>
        </div>
        <div style={{ ...styles.stat, borderTop: "4px solid #dc2626" }}>
          <span style={styles.statLabel}>Total Expenses</span>
          <span style={{ ...styles.statVal, color: "#dc2626" }}>₹{totalExpense.toFixed(2)}</span>
        </div>
        <div style={{ ...styles.stat, borderTop: "4px solid #2563eb" }}>
          <span style={styles.statLabel}>Net Balance</span>
          <span style={{ ...styles.statVal, color: "#2563eb" }}>₹{(totalIncome - totalExpense).toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.filterRow}>
        {["ALL", "INCOME", "EXPENSE"].map((f) => (
          <button key={f} onClick={() => setTypeFilter(f)}
            style={{ ...styles.filterBtn, background: typeFilter === f ? "#1e3a5f" : "#f1f5f9", color: typeFilter === f ? "#fff" : "#374151" }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <p style={styles.empty}>Loading...</p> : filtered.length === 0 ? (
        <p style={styles.empty}>No transactions found.</p>
      ) : (
        <div style={styles.list}>
          {filtered.map((t) => (
            <div key={t.id} style={styles.row}>
              <div style={{ ...styles.badge, background: t.type === "INCOME" ? "#dcfce7" : "#fee2e2", color: t.type === "INCOME" ? "#16a34a" : "#dc2626" }}>
                {t.type === "INCOME" ? "📈" : "📉"} {t.type}
              </div>
              <div style={styles.rowMeta}>
                <span style={styles.desc}>{t.description}</span>
                <span style={styles.cat}>{t.category?.name} • {t.date}</span>
              </div>
              <span style={{ ...styles.amount, color: t.type === "INCOME" ? "#16a34a" : "#dc2626" }}>
                {t.type === "INCOME" ? "+" : "-"}₹{Number(t.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { fontFamily: "'Segoe UI', sans-serif", maxWidth: "720px", margin: "0 auto", padding: "24px" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: "20px" },
  statsRow: { display: "flex", gap: "16px", marginBottom: "20px" },
  stat: { flex: 1, background: "#fff", borderRadius: "10px", padding: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "6px" },
  statLabel: { fontSize: "12px", color: "#64748b", fontWeight: "600" },
  statVal: { fontSize: "20px", fontWeight: "700" },
  filterRow: { display: "flex", gap: "10px", marginBottom: "16px" },
  filterBtn: { padding: "8px 18px", border: "none", borderRadius: "20px", fontWeight: "600", fontSize: "13px", cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  row: { display: "flex", alignItems: "center", gap: "14px", background: "#fff", borderRadius: "10px", padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  badge: { padding: "5px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" },
  rowMeta: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  desc: { fontSize: "15px", fontWeight: "600", color: "#0f172a" },
  cat: { fontSize: "12px", color: "#94a3b8" },
  amount: { fontSize: "16px", fontWeight: "700", whiteSpace: "nowrap" },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: "40px" },
};
