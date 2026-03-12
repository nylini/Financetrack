// pages/user/MonthlySummaryPage.jsx
import { useState, useEffect } from "react";
import HttpService from "../../services/HttpService";
import AuthService from "../../services/AuthService";

export default function MonthlySummaryPage() {
  const [summary, setSummary] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const fetchSummary = async () => {
    setLoading(true); setError("");
    try {
      const data = await HttpService.get("/api/finance/summary", { userId: AuthService.getUserId(), month, year });
      setSummary(data);
    } catch { setError("Failed to load summary."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSummary(); }, [month, year]);

  const pct = (actual, limit) => Math.min((actual / limit) * 100, 100);

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>📊 Monthly Summary</h2>

      <div style={styles.controls}>
        <select value={month} onChange={e => setMonth(+e.target.value)} style={styles.select}>
          {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <input type="number" value={year} onChange={e => setYear(+e.target.value)}
          min="2020" max="2099" style={{ ...styles.select, width: "90px" }} />
      </div>

      {loading && <p style={styles.empty}>Loading summary...</p>}
      {error && <div style={styles.error}>{error}</div>}

      {summary && (
        <>
          <div style={styles.statsRow}>
            <div style={{ ...styles.stat, borderTop: "4px solid #16a34a" }}>
              <span style={styles.statLabel}>Total Income</span>
              <span style={{ ...styles.statVal, color: "#16a34a" }}>₹{summary.totalIncome?.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.stat, borderTop: "4px solid #dc2626" }}>
              <span style={styles.statLabel}>Total Expenses</span>
              <span style={{ ...styles.statVal, color: "#dc2626" }}>₹{summary.totalExpenses?.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.stat, borderTop: "4px solid #2563eb" }}>
              <span style={styles.statLabel}>Net Balance</span>
              <span style={{ ...styles.statVal, color: "#2563eb" }}>₹{summary.netBalance?.toFixed(2)}</span>
            </div>
          </div>

          <h3 style={styles.subhead}>Budget vs. Actual by Category</h3>
          <div style={styles.catList}>
            {summary.categoryBreakdown?.length === 0 && <p style={styles.empty}>No data available.</p>}
            {summary.categoryBreakdown?.map((cat) => {
              const over = cat.actualSpent > cat.limitAmount;
              const p = pct(cat.actualSpent, cat.limitAmount);
              return (
                <div key={cat.categoryName} style={{ ...styles.catCard, border: over ? "1.5px solid #fecaca" : "1.5px solid #e2e8f0" }}>
                  <div style={styles.catHeader}>
                    <span style={styles.catName}>{cat.categoryName}</span>
                    {over && <span style={styles.overBadge}>⚠️ Over Budget</span>}
                  </div>
                  <div style={styles.catAmounts}>
                    <span style={{ color: "#dc2626" }}>Spent: ₹{cat.actualSpent?.toFixed(2)}</span>
                    <span style={{ color: "#64748b" }}>Limit: ₹{cat.limitAmount?.toFixed(2)}</span>
                  </div>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: `${p}%`, background: over ? "#dc2626" : "#2563eb" }} />
                  </div>
                  <div style={styles.barPct}>{p.toFixed(0)}% used</div>
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
  heading: { fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" },
  controls: { display: "flex", gap: "12px", marginBottom: "20px" },
  select: { padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" },
  statsRow: { display: "flex", gap: "16px", marginBottom: "28px" },
  stat: { flex: 1, background: "#fff", borderRadius: "10px", padding: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "6px" },
  statLabel: { fontSize: "12px", color: "#64748b", fontWeight: "600" },
  statVal: { fontSize: "22px", fontWeight: "700" },
  subhead: { fontSize: "16px", fontWeight: "700", color: "#1e3a5f", marginBottom: "14px" },
  catList: { display: "flex", flexDirection: "column", gap: "14px" },
  catCard: { background: "#fff", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  catHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  catName: { fontWeight: "700", fontSize: "15px", color: "#0f172a" },
  overBadge: { background: "#fef2f2", color: "#dc2626", fontSize: "12px", fontWeight: "600", padding: "3px 8px", borderRadius: "6px" },
  catAmounts: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "10px", fontWeight: "600" },
  barBg: { height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "4px", transition: "width 0.5s ease" },
  barPct: { fontSize: "11px", color: "#94a3b8", marginTop: "5px", textAlign: "right" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "14px" },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: "30px" },
};
