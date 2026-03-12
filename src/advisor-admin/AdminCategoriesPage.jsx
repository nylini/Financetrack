// pages/advisor-admin/AdminCategoriesPage.jsx
import { useState, useEffect } from "react";
import HttpService from "../../services/HttpService";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", type: "EXPENSE" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategories = () => {
    HttpService.get("/api/admin/categories").then(setCategories).catch(() => {});
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    setLoading(true);
    try {
      await HttpService.post("/api/admin/category", form);
      setSuccess(`Category "${form.name}" added!`);
      setForm({ name: "", type: "EXPENSE" });
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add category.");
    } finally { setLoading(false); }
  };

  const income = categories.filter(c => c.type === "INCOME");
  const expense = categories.filter(c => c.type === "EXPENSE");

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>🗂️ Category Management</h2>

      <div style={styles.layout}>
        <div style={styles.card}>
          <h3 style={styles.subhead}>Add New Category</h3>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Category Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Food, Transport, Salary" required style={styles.input} />

            <label style={styles.label}>Type</label>
            <div style={styles.typeRow}>
              {["INCOME", "EXPENSE"].map(t => (
                <label key={t} style={{ ...styles.typeOpt, background: form.type === t ? (t === "INCOME" ? "#16a34a" : "#dc2626") : "#f1f5f9", color: form.type === t ? "#fff" : "#374151" }}>
                  <input type="radio" name="type" value={t} checked={form.type === t}
                    onChange={e => setForm({ ...form, type: e.target.value })} style={{ display: "none" }} />
                  {t === "INCOME" ? "📈 INCOME" : "📉 EXPENSE"}
                </label>
              ))}
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h3 style={styles.subhead}>Existing Categories</h3>
          <div style={styles.section}>
            <div style={styles.sectionLabel}>📈 Income</div>
            {income.length === 0 ? <p style={styles.empty}>None yet</p> :
              income.map(c => <div key={c.id} style={{ ...styles.tag, background: "#dcfce7", color: "#15803d" }}>{c.name}</div>)}
          </div>
          <div style={styles.section}>
            <div style={styles.sectionLabel}>📉 Expense</div>
            {expense.length === 0 ? <p style={styles.empty}>None yet</p> :
              expense.map(c => <div key={c.id} style={{ ...styles.tag, background: "#fee2e2", color: "#b91c1c" }}>{c.name}</div>)}
          </div>
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
  input: { padding: "11px 13px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" },
  typeRow: { display: "flex", gap: "10px" },
  typeOpt: { flex: 1, textAlign: "center", padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" },
  button: { padding: "12px", background: "linear-gradient(135deg,#1e3a5f,#2563eb)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
  section: { marginBottom: "18px" },
  sectionLabel: { fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "10px" },
  tag: { display: "inline-block", padding: "5px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", margin: "4px" },
  empty: { color: "#94a3b8", fontSize: "13px" },
};
