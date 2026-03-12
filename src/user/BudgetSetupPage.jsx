// pages/user/BudgetSetupPage.jsx
import { useState, useEffect } from "react";
import HttpService from "../../services/HttpService";
import AuthService from "../../services/AuthService";

export default function BudgetSetupPage() {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ categoryId: "", limitAmount: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = AuthService.getUserId();

  useEffect(() => {
    HttpService.get("/api/finance/categories").then((data) => setCategories(data.filter(c => c.type === "EXPENSE"))).catch(() => {});
    fetchBudgets();
  }, []);

  const fetchBudgets = () => {
    HttpService.get("/api/finance/budgets", { userId }).then(setBudgets).catch(() => {});
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    setLoading(true);
    try {
      await HttpService.post(`/api/finance/budget?userId=${userId}`, form);
      setSuccess("Budget saved successfully!");
      setForm({ categoryId: "", limitAmount: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save budget.");
    } finally { setLoading(false); }
  };

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>📋 Budget Planner</h2>

      <div style={styles.layout}>
        <div style={styles.card}>
          <h3 style={styles.subhead}>Set Monthly Budget</h3>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Category (Expense)</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required style={styles.input}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label style={styles.label}>Spending Limit (₹)</label>
            <input type="number" name="limitAmount" value={form.limitAmount} onChange={handleChange}
              placeholder="e.g. 5000" min="1" step="0.01" required style={styles.input} />

            <div style={styles.twoCol}>
              <div>
                <label style={styles.label}>Month</label>
                <select name="month" value={form.month} onChange={handleChange} style={styles.input}>
                  {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Year</label>
                <input type="number" name="year" value={form.year} onChange={handleChange}
                  min="2020" max="2099" style={styles.input} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Saving..." : "Save Budget"}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h3 style={styles.subhead}>Active Budgets</h3>
          {budgets.length === 0 ? <p style={styles.empty}>No budgets set yet.</p> : (
            <div style={styles.budgetList}>
              {budgets.map(b => (
                <div key={b.id} style={styles.budgetRow}>
                  <div>
                    <div style={styles.budgetCat}>{b.category?.name}</div>
                    <div style={styles.budgetPeriod}>{months[b.month - 1]} {b.year}</div>
                  </div>
                  <div style={styles.budgetAmt}>₹{Number(b.limitAmount).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { fontFamily: "'Segoe UI', sans-serif", maxWidth: "800px", margin: "0 auto", padding: "24px" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: "20px" },
  layout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  card: { background: "#fff", borderRadius: "14px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" },
  subhead: { margin: "0 0 18px", fontSize: "16px", fontWeight: "700", color: "#1e3a5f" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "14px" },
  success: { background: "#f0fdf4", border: "1px solid #86efac", color: "#16a34a", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "-6px" },
  input: { padding: "11px 13px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  button: { padding: "12px", background: "linear-gradient(135deg,#1e3a5f,#2563eb)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "4px" },
  budgetList: { display: "flex", flexDirection: "column", gap: "10px" },
  budgetRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" },
  budgetCat: { fontWeight: "600", color: "#0f172a", fontSize: "14px" },
  budgetPeriod: { fontSize: "12px", color: "#94a3b8" },
  budgetAmt: { fontWeight: "700", color: "#2563eb", fontSize: "16px" },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: "30px" },
};
