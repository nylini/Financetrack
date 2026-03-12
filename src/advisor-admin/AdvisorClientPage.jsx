// pages/advisor-admin/AdvisorClientPage.jsx
import { useState, useEffect } from "react";
import HttpService from "../../services/HttpService";

export default function AdvisorClientPage({ client }) {
  const [summary, setSummary] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    HttpService.get(`/api/advisor/client/${client.id}/summary`, { month, year })
      .then(setSummary).catch(() => {}).finally(() => setLoading(false));
  }, [client, month, year]);

  if (!client) return <p style={{ color: "#94a3b8", textAlign: "center", marginTop: "60px" }}>← Select a client to view their summary</p>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.avatar}>{client.username?.[0]?.toUpperCase()}</div>
        <div>
          <h2 style={styles.name}>{client.username}</h2>
          <p style={styles.email}>{client.email}</p>
        </div>
      </div>

      <div style={styles.controls}>
        <select value={month} onChange={e => setMonth(+e.target.value)} style={styles.select}>
          {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <input type="number" value={year} onChange={e => setYear(+e.target.value)}
          min="2020" max="2099" style={{ ...styles.select, width: "90px" }} />
      </div>

      {loading && <p style={styles.empty}>Loading...</p>}

      {summary && (
        <>
          <div style={styles.statsRow}>
            <div style={{ ...styles.stat, borderTop: "4px solid #16a34a" }}>
              <span style={styles.statLabel}>Income</span>
              <span style={{ ...styles.statVal, color: "#16a34a" }}>₹{summary.totalIncome?.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.stat, borderTop: "4px solid #dc2626" }}>
              <span style={styles.statLabel}>Expenses</span>
              <span style={{ ...styles.statVal, color: "#dc2626" }}>₹{summary.totalExpenses?.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.stat, borderTop: "4px solid #7c3aed" }}>
              <span style={styles.statLabel}>Net Balance</span>
              <span style={{ ...styles.statVal, color: "#7c3aed" }}>₹{summary.netBalance?.toFixed(2)}</span>
            </div>
          </div>

          <h3 style={styles.subhead}>Category Breakdown</h3>
          <div style={styles.catTable}>
            <div style={styles.tableHead}>
              <span>Category</span><span>Spent</span><span>Limit</span><span>Status</span>
            </div>
            {summary.categoryBreakdown?.map(cat => {
              const over = cat.actualSpent > cat.limitAmount;
              return (
                <div key={cat.categoryName} style={styles.tableRow}>
                  <span style={styles.catName}>{cat.categoryName}</span>
                  <span style={{ color: "#dc2626", fontWeight: "600" }}>₹{cat.actualSpent?.toFixed(2)}</span>
                  <span style={{ color: "#64748b" }}>₹{cat.limitAmount?.toFixed(2)}</span>
                  <span style={{ ...styles.statusBadge, background: over ? "#fef2f2" : "#f0fdf4", color: over ? "#dc2626" : "#16a34a" }}>
                    {over ? "⚠️ Over" : "✅ OK"}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  wrapper: { fontFamily: "'Segoe UI', sans-serif", maxWidth: "720px", margin: "0 auto", padding: "24px" },
  header: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  avatar: { width: "52px", height: "52px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "22px" },
  name: { margin: 0, fontSize: "20px", fontWeight: "700", color: "#0f172a" },
  email: { margin: 0, fontSize: "14px", color: "#94a3b8" },
  controls: { display: "flex", gap: "12px", marginBottom: "20px" },
  select: { padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" },
  statsRow: { display: "flex", gap: "16px", marginBottom: "24px" },
  stat: { flex: 1, background: "#fff", borderRadius: "10px", padding: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "6px" },
  statLabel: { fontSize: "12px", color: "#64748b", fontWeight: "600" },
  statVal: { fontSize: "20px", fontWeight: "700" },
  subhead: { fontSize: "16px", fontWeight: "700", color: "#1e3a5f", marginBottom: "12px" },
  catTable: { background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" },
  tableHead: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 20px", background: "#f8fafc", fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 20px", borderTop: "1px solid #f1f5f9", alignItems: "center" },
  catName: { fontWeight: "600", color: "#0f172a", fontSize: "14px" },
  statusBadge: { display: "inline-block", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: "30px" },
};
