// pages/auth/RegistrationPage.jsx
import { useState } from "react";
import AuthService from "../../services/AuthService";

export default function RegistrationPage({ onRegisterSuccess }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "USER" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await AuthService.register(form.username, form.email, form.password, form.role);
      setSuccess("Account created! You can now log in.");
      onRegisterSuccess && onRegisterSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roleColors = { USER: "#2563eb", ADVISOR: "#7c3aed", ADMIN: "#dc2626" };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logo}>💰 FinTrack</div>
        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>Join FinTrack to manage your finances</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input name="username" value={form.username} onChange={handleChange}
            placeholder="Choose a username" required style={styles.input} />

          <label style={styles.label}>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="your@email.com" required style={styles.input} />

          <label style={styles.label}>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange}
            placeholder="Create a password" required style={styles.input} />

          <label style={styles.label}>Role</label>
          <div style={styles.roleGroup}>
            {["USER", "ADVISOR", "ADMIN"].map((role) => (
              <label key={role} style={{
                ...styles.roleOption,
                background: form.role === role ? roleColors[role] : "#f1f5f9",
                color: form.role === role ? "#fff" : "#374151",
                border: `2px solid ${form.role === role ? roleColors[role] : "#e2e8f0"}`,
              }}>
                <input type="radio" name="role" value={role}
                  checked={form.role === role} onChange={handleChange}
                  style={{ display: "none" }} />
                {role === "USER" ? "👤" : role === "ADVISOR" ? "📈" : "🛠️"} {role}
              </label>
            ))}
          </div>

          <button type="submit" disabled={loading} style={{
            ...styles.button, background: `linear-gradient(135deg, #1e3a5f, ${roleColors[form.role]})`,
          }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <a href="/login" style={styles.link}>Sign in</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#ffffff", borderRadius: "16px", padding: "48px 40px",
    width: "100%", maxWidth: "440px", boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
  },
  logo: { fontSize: "28px", fontWeight: "800", color: "#1e3a5f", marginBottom: "8px" },
  title: { margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: "700" },
  subtitle: { margin: "0 0 28px", color: "#64748b", fontSize: "14px" },
  error: {
    background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
    borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "14px",
  },
  success: {
    background: "#f0fdf4", border: "1px solid #86efac", color: "#16a34a",
    borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "14px",
  },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "-8px" },
  input: {
    padding: "12px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px",
    fontSize: "15px", outline: "none",
  },
  roleGroup: { display: "flex", gap: "10px" },
  roleOption: {
    flex: 1, textAlign: "center", padding: "10px 6px", borderRadius: "8px",
    cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s",
  },
  button: {
    marginTop: "8px", padding: "13px", color: "#fff", border: "none",
    borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer",
  },
  switchText: { marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#64748b" },
  link: { color: "#2563eb", fontWeight: "600", textDecoration: "none" },
};
