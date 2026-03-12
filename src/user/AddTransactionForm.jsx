/ pages/user/AddTransactionForm.jsx
import { useState, useEffect } from "react";
import HttpService from "../../services/HttpService";
import AuthService from "../../services/AuthService";

export default function AddTransactionForm({ onAdded }) {
  const [form, setForm] = useState({ type: "EXPENSE", amount: "", description: "", categoryId: "", date: "" });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    HttpService.get("/api/finance/categories").then(setCategories).catch(() => {});
  }, []);

  const filtered = categories.filter((c) => c.type === form.type);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await HttpService.post(`/api/finance/transaction?userId=${AuthService.getUserId()}`, form);
      setSuccess("Transaction added successfully!");
      setForm({ type: "EXPENSE", amount: "", description: "", categoryId: "", date: "" });
      onAdded && onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.heading}>➕ Log Transaction</h2>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.typeToggle}>
          {["EXPENSE", "INCOME"].map((t) => (
            <button key={t} type="button" onClick={() => setForm({ ...form, type: t, categoryId: "" })}
              style={{ ...styles.typeBtn, background: form.type === t ? (t === "INCOME" ? "#16a34a" : "#dc2626") : "#f1f5f9",
                color: form.type === t ? "#fff" : "#374151" }}>
              {t === "INCOME" ? "📈 INCOME" : "📉 EXPENSE"}
            </button>
          ))}
        </div>

        <label style={styles.label}>Category</label>
        <select name="categoryId" value={form.categoryId} onChange={handleChange} required style={styles.input}>
          <option value="">Select category</option>
          {filtered.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label style={styles.label}>Amount (₹)</label>
        <input type="number" name="amount" value={form.amount} onChange={handleChange}
          placeholder="0.00" min="0.01" step="0.01" required style={styles.input} />

        <label style={styles.label}>Description</label>
        <input name="description" value={form.description} onChange={handleChange}
          placeholder="Brief description" required style={styles.input} />

        <label style={styles.label}>Date</label>
        <input type="date" name="date" value={form.date} onChange={handleChange} required style={styles.input} />

        <button type="submit" disabled={loading} style={{
          ...styles.button, background: form.type === "INCOME"
            ? "linear-gradient(135deg,#15803d,#16a34a)" : "linear-gradient(135deg,#b91c1c,#dc2626)",
        }}>
          {loading ? "Saving..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: { background: "#fff", borderRadius: "14px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", maxWidth: "480px" },
  heading: { margin: "0 0 20px", fontSize: "18px", fontWeight: "700", color: "#0f172a" },
  typeToggle: { display: "flex", gap: "10px", marginBottom: "8px" },
  typeBtn: { flex: 1, padding: "10px", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "14px" },
  success: { background: "#f0fdf4", border: "1px solid #86efac", color: "#16a34a", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "-6px" },
  input: { padding: "11px 13px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "15px", outline: "none" },
  button: { padding: "13px", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "4px" },
};
