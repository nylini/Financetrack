// pages/auth/LoginPage.jsx
import { useState } from "react";
import AuthService from "../../services/AuthService";

export default function LoginPage({ onLoginSuccess }) {
  const [form, setForm] = useState({ username: "Thanuja", password: "1234" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await AuthService.login(form.username, form.password);
      onLoginSuccess && onLoginSuccess(res.role);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logo}>💰 FinTrack</div>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <a href="/register" style={styles.link}>
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
  },
  logo: { fontSize: "28px", fontWeight: "800", color: "#1e3a5f", marginBottom: "8px" },
  title: { margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: "700" },
  subtitle: { margin: "0 0 28px", color: "#64748b", fontSize: "14px" },
  error: {
    background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
    borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "14px",
  },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "-8px" },
  input: {
    padding: "12px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px",
    fontSize: "15px", outline: "none", transition: "border 0.2s",
  },
  button: {
    marginTop: "8px", padding: "13px", background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
    color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px",
    fontWeight: "600", cursor: "pointer",
  },
  switchText: { marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#64748b" },
  link: { color: "#2563eb", fontWeight: "600", textDecoration: "none" },
};
